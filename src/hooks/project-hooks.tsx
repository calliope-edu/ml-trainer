/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useToast } from "@chakra-ui/react";
import {
  EditorWorkspaceSaveRequest,
  MakeCodeFrameDriver,
  MakeCodeFrameProps,
  MakeCodeProject,
} from "@microbit/makecode-embed/react";
import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useLogging } from "../logging/logging-hooks";
import {
  HexData,
  isDatasetUserFileFormat,
  PostImportDialogState,
  SaveStep,
} from "../model";
import { untitledProjectName as untitled } from "../project-name";
import { useStore } from "../store";
import {
  createCodePageUrl,
  createDataSamplesPageUrl,
  createTestingModelPageUrl,
} from "../urls";
import { getTotalNumSamples } from "../utils/actions";
import {
  downloadHex,
  getLowercaseFileExtension,
  readFileAsText,
} from "../utils/fs-util";
import { useDownloadActions } from "./download-hooks";

// Helper to safely log a MakeCode project. By default we truncate previews
// to avoid overwhelming the console. You can enable full dumps in two ways:
//  - Run in development mode (NODE_ENV=development)
//  - Add `?makecode_full_dump=1` to the current page URL
// When enabled we print the full contents of each file.
const logMakeCodeProject = (project: MakeCodeProject | undefined, where = "") => {
  // Use shared detection helper so callers can decide the same behaviour.
  const enableFullDump = (() => {
    try {
      return Boolean(
        (typeof process !== "undefined" && (process as any).env && (process as any).env.NODE_ENV === "development") ||
          (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("makecode_full_dump") === "1")
      );
    } catch (e) {
      return false;
    }
  })();
  const PREVIEW_LIMIT = enableFullDump ? undefined : 1000;
  console.log(`[MAKECODE] ${where} - logMakeCodeProject fullDump=${enableFullDump}`);
  try {
    if (!project) {
      console.log(`[MAKECODE] ${where} - project is undefined`);
      return;
    }
    console.log(`[MAKECODE] ${where} - project.header:`, project.header);
    // MakeCode projects produced here use the `text` map (filename -> content).
    const textFiles = (project as any).text || (project as any).files || {};
    const entries = Object.entries(textFiles || {});
    console.log(`[MAKECODE] ${where} - project contains ${entries.length} files`);
    for (const [filename, content] of entries) {
      const asString = typeof content === "string" ? content : JSON.stringify(content);
  const len = asString.length;
  const preview = PREVIEW_LIMIT ? asString.slice(0, PREVIEW_LIMIT) : asString;
      console.log(`[MAKECODE] ${where} - file='${filename}' size=${len}`);
  console.log(`[MAKECODE] ${where} - file preview for '${filename}':\n${preview}${PREVIEW_LIMIT && len > PREVIEW_LIMIT ? "\n...(truncated)" : ""}`);
    }
  } catch (e) {
    // Ensure logging never throws.
    console.error(`[MAKECODE] ${where} - failed to stringify project`, e);
  }
};

class CodeEditorError extends Error {}

/**
 * Distinguishes the different ways to trigger the load action.
 */
export type LoadType = "drop-load" | "file-upload";

interface ProjectContext {
  browserNavigationToEditor(): Promise<boolean>;
  openEditor(): Promise<void>;
  project: MakeCodeProject;
  projectEdited: boolean;
  resetProject: () => void;
  loadFile: (file: File, type: LoadType) => void;
  /**
   * Called to request a save.
   *
   * Pass a project if we already have the content to download. Otherwise it will
   * be requested from the editor.
   *
   * The save is not necessarily complete when this returns as we may be waiting
   * on MakeCode or a dialog flow. The progress will be reflected in the `save`
   * state field.
   */
  saveHex: (hex?: HexData) => Promise<void>;

  editorCallbacks: Pick<
    MakeCodeFrameProps,
    | "onDownload"
    | "onWorkspaceSave"
    | "onWorkspaceLoaded"
    | "onSave"
    | "onBack"
    | "initialProjects"
  >;
}

const ProjectContext = createContext<ProjectContext | undefined>(undefined);

export const useProject = (): ProjectContext => {
  const project = useContext(ProjectContext);
  if (!project) {
    throw new Error("Missing provider");
  }
  return project;
};

interface ProjectProviderProps {
  driverRef: RefObject<MakeCodeFrameDriver>;
  children: ReactNode;
}

export const useDefaultProjectName = (): string => {
  const intl = useIntl();
  return intl.formatMessage({ id: "default-project-name" });
};

export const useProjectIsUntitled = (): boolean => {
  const translatedUntitled = useDefaultProjectName();
  const projectName = useStore((s) => s.project.header?.name);
  return projectName === untitled || projectName === translatedUntitled;
};

export const useProjectName = (): string => {
  const isUntitled = useProjectIsUntitled();
  const translatedUntitled = useDefaultProjectName();
  const projectName = useStore((s) =>
    !s.project.header || isUntitled ? translatedUntitled : s.project.header.name
  );
  return projectName;
};

export const ProjectProvider = ({
  driverRef,
  children,
}: ProjectProviderProps) => {
  const intl = useIntl();
  const toast = useToast();
  const logging = useLogging();
  const projectEdited = useStore((s) => s.projectEdited);
  const editorStartUp = useStore((s) => s.editorStartUp);
  const getEditorStartUp = useStore((s) => s.getEditorStartUp);
  const editorReady = useStore((s) => s.editorReady);
  const editorTimedOut = useStore((s) => s.editorTimedOut);
  const openEditorTimedOutDialog = useStore(
    (s) => () => s.setIsEditorTimedOutDialogOpen(true)
  );
  const setEditorLoadingFile = useStore((s) => s.setEditorLoadingFile);
  const setEditorImportingState = useStore((s) => s.setEditorImportingState);
  const projectFlushedToEditor = useStore((s) => s.projectFlushedToEditor);
  const checkIfProjectNeedsFlush = useStore((s) => s.checkIfProjectNeedsFlush);
  const getCurrentProject = useStore((s) => s.getCurrentProject);
  const setPostImportDialogState = useStore((s) => s.setPostImportDialogState);
  const { editorReadyPromise, editorContentLoadedPromise } = useStore(
    (s) => s.editorPromises
  );
  const startUpTimestamp = useStore((s) => s.editorStartUpTimestamp);
  const langChangeFlushedToEditor = useStore(
    (s) => s.langChangeFlushedToEditor
  );
  const checkIfLangChanged = useStore((s) => s.checkIfLangChanged);
  const navigate = useNavigate();

  const project = useStore((s) => s.project);
  const initialProjects = useCallback(() => {
      logging.log(`[MakeCode] Initialising with header ID: ${project.header?.id}`);
      console.log(
        `[MAKECODE] initialProjects() called - returning project with header id=%s`,
        project.header?.id
      );
    logMakeCodeProject(project, "initialProjects");
    // This is a useful point to introduce a delay to debug MakeCode init dependencies.
    return Promise.resolve([project]);
  }, [logging, project]);

  const startUpTimeout = 90000;

  const onWorkspaceLoaded = useCallback(async () => {
    logging.log("[MakeCode] Workspace loaded");
    console.log(
      "[MAKECODE] onWorkspaceLoaded - workspace loaded event received; waiting for editorContentLoadedPromise"
    );
    await editorContentLoadedPromise.promise;
    console.log(
      "[MAKECODE] onWorkspaceLoaded - editorContentLoadedPromise resolved; checking startup state"
    );
    // Get latest start up state and only mark editor ready if editor has not timed out.
    if (getEditorStartUp() !== "timed out") {
      console.log(
        "[MAKECODE] onWorkspaceLoaded - calling store.editorReady() to mark editor as ready"
      );
      editorReady();
    } else {
      console.log(
        "[MAKECODE] onWorkspaceLoaded - editor start up already timed out; skipping editorReady()"
      );
    }
    console.log("[MAKECODE] onWorkspaceLoaded - resolving editorReadyPromise");
    editorReadyPromise.resolve();
    console.log("[MAKECODE] editorReadyPromise resolved");
  }, [
    editorContentLoadedPromise,
    editorReady,
    editorReadyPromise,
    getEditorStartUp,
    logging,
  ]);

  const onEditorContentLoaded = useCallback(() => {
    logging.log("[MakeCode] Editor content loaded");
    console.log(
      "[MAKECODE] onEditorContentLoaded - resolving editorContentLoadedPromise"
    );
    editorContentLoadedPromise.resolve();
    console.log("[MAKECODE] editorContentLoadedPromise resolved");
  }, [editorContentLoadedPromise, logging]);

  const checkIfEditorStartUpTimedOut = useCallback(
    async (promise: Promise<void> | undefined) => {
      const elapsedTimeSinceStartup = Date.now() - startUpTimestamp;
      const remainingTimeout = startUpTimeout - elapsedTimeSinceStartup;
      if (
        // Editor has already timed out.
        (editorStartUp === "in-progress" && remainingTimeout <= 0) ||
        editorStartUp === "timed out"
      ) {
        console.log(
          `[MAKECODE] checkIfEditorStartUpTimedOut - already timed out (editorStartUp=${editorStartUp}, remainingTimeout=${remainingTimeout})`
        );
        return true;
      }

      const racePromises: Promise<unknown>[] = [promise as Promise<unknown>].filter(Boolean);
      if (remainingTimeout > 0) {
        racePromises.push(
          new Promise<true>((resolve) =>
            setTimeout(() => {
              resolve(true);
            }, remainingTimeout)
          )
        );
      }

      const result = await Promise.race(racePromises);
      if (result === true) {
        console.log(
          `[MAKECODE] checkIfEditorStartUpTimedOut - startup timed out after ${startUpTimeout}ms (elapsed ${elapsedTimeSinceStartup}ms)`
        );
        return true;
      }
      return false;
    },
    [editorStartUp, startUpTimestamp]
  );

  const doAfterEditorUpdatePromise = useRef<Promise<void>>();
  const doAfterEditorUpdate = useCallback(
    async (action: () => Promise<void>) => {
      if (
        !doAfterEditorUpdatePromise.current &&
        (checkIfProjectNeedsFlush() || checkIfLangChanged())
      ) {
        doAfterEditorUpdatePromise.current = (async () => {
          // driverRef.current is not defined on first render.
          // Only an issue when navigating to code page directly.
          if (!driverRef.current) {
            throw new CodeEditorError("MakeCode iframe ref is undefined");
          } else if (checkIfProjectNeedsFlush()) {
            logging.log("[MakeCode] Importing project");
            await editorReadyPromise.promise;
            const project = getCurrentProject();
            try {
              setEditorImportingState();
              console.log(
                `[MAKECODE] doAfterEditorUpdate - importing project to MakeCode iframe headerId=%s`,
                project.header?.id
              );
              logMakeCodeProject(project, "doAfterEditorUpdate - importProject");
              await driverRef.current.importProject({ project });
              logging.log("[MakeCode] Project import succeeded");
              projectFlushedToEditor();
              langChangeFlushedToEditor();
            } catch (e) {
              logging.log("[MakeCode] Project import failed");
              throw e;
            }
          } else {
            logging.log("[MakeCode] Waiting for editor after language change");
            await editorReadyPromise.promise;
            langChangeFlushedToEditor();
          }
        })();
      }

      try {
        const hasTimedOut = await checkIfEditorStartUpTimedOut(
          doAfterEditorUpdatePromise.current
        );
        if (hasTimedOut) {
          // Previously we threw an error here. For debugging and resilience we will
          // wait a short period and then continue assuming the editor eventually
          // initialised. This avoids hard-failing flows that depend on MakeCode
          // which can be flaky in some environments.
          logging.log(
            "[MAKECODE] Load timed out (startup). Waiting 10s and continuing without throwing"
          );
          // Mark editor timed out in state for diagnostics, but do not abort.
          editorTimedOut();
          logging.event({
            type: "makecode-load-failed",
          });
          // Wait 10 seconds before continuing to give the iframe a chance to finish
          // initialization. This is a best-effort fallback only for local/dev use.
          await new Promise((resolve) => setTimeout(resolve, 10_000));
          logging.log("[MAKECODE] Continuing after 10s wait despite startup timeout");
        }
      } finally {
        doAfterEditorUpdatePromise.current = undefined;
      }
      return action();
    },
    [
      checkIfProjectNeedsFlush,
      checkIfLangChanged,
      driverRef,
      logging,
      editorReadyPromise.promise,
      getCurrentProject,
      setEditorImportingState,
      projectFlushedToEditor,
      langChangeFlushedToEditor,
      checkIfEditorStartUpTimedOut,
      editorTimedOut,
    ]
  );
  const openEditor = useCallback(async () => {
    logging.event({
      type: "edit-in-makecode",
    });
    try {
      await doAfterEditorUpdate(() => {
        navigate(createCodePageUrl());
        return Promise.resolve();
      });
    } catch (e) {
      if (e instanceof CodeEditorError) {
        openEditorTimedOutDialog();
      }
    }
  }, [doAfterEditorUpdate, logging, navigate, openEditorTimedOutDialog]);
  const browserNavigationToEditor = useCallback(async () => {
    try {
      await doAfterEditorUpdate(() => {
        return Promise.resolve();
      });
      return true;
    } catch (e) {
      if (e instanceof CodeEditorError) {
        // In this case, doAfterEditorUpdate has failed because the app has loaded
        // on the code page directly. The caller of browserNavigationToEditor redirects.
        return false;
      }
      // Unexpected error, can't handle better than the redirect.
      logging.error(e);
      return false;
    }
  }, [doAfterEditorUpdate, logging]);
  const resetProject = useStore((s) => s.resetProject);
  const loadDataset = useStore((s) => s.loadDataset);
  const loadFile = useCallback(
    async (file: File, type: LoadType): Promise<void> => {
      const fileExtension = getLowercaseFileExtension(file.name);
      logging.event({
        type,
        detail: {
          extension: fileExtension || "none",
        },
      });
      if (fileExtension === "json") {
        const actionsString = await readFileAsText(file);
        const actions = JSON.parse(actionsString) as unknown;
        if (isDatasetUserFileFormat(actions)) {
          loadDataset(actions);
          navigate(createDataSamplesPageUrl());
        } else {
          setPostImportDialogState(PostImportDialogState.Error);
        }
      } else if (fileExtension === "hex") {
        const hex = await readFileAsText(file);
        const makeCodeMagicMark = "41140E2FB82FA2BB";
        // Check if is a MakeCode hex, otherwise show error dialog.
        if (hex.includes(makeCodeMagicMark)) {
          const hasTimedOut = await checkIfEditorStartUpTimedOut(
            editorReadyPromise.promise
          );
          if (hasTimedOut) {
            openEditorTimedOutDialog();
            return;
          }
          // This triggers the code in editorChanged to update actions etc.
          setEditorLoadingFile();
          console.log(
            `[MAKECODE] loadFile - detected MakeCode hex; calling driverRef.current.importFile(${file.name}) to import into iframe`
          );
          try {
            const enableFullDump = (() => {
              try {
                return Boolean(
                  (typeof process !== "undefined" && (process as any).env && (process as any).env.NODE_ENV === "development") ||
                    (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("makecode_full_dump") === "1")
                );
              } catch (e) {
                return false;
              }
            })();
            const preview = enableFullDump ? hex : hex.slice(0, 1000);
            console.log(
              `[MAKECODE] loadFile - hex file length=%d chars; preview (truncated=%s):`,
              hex.length,
              (!enableFullDump && hex.length > 1000).toString(),
              preview
            );
          } catch (e) {
            console.log("[MAKECODE] loadFile - failed to log hex preview", e);
          }
          driverRef.current!.importFile({
            filename: file.name,
            parts: [hex],
          });
        } else {
          setPostImportDialogState(PostImportDialogState.Error);
        }
      } else {
        setPostImportDialogState(PostImportDialogState.Error);
      }
    },
    [
      checkIfEditorStartUpTimedOut,
      driverRef,
      editorReadyPromise.promise,
      loadDataset,
      logging,
      navigate,
      openEditorTimedOutDialog,
      setPostImportDialogState,
      setEditorLoadingFile,
    ]
  );

  const setSave = useStore((s) => s.setSave);
  const save = useStore((s) => s.save);
  const settings = useStore((s) => s.settings);
  const actions = useStore((s) => s.actions);
  const saveNextDownloadRef = useRef(false);
  const translatedUntitled = useDefaultProjectName();
  const saveHex = useCallback(
    async (hex?: HexData): Promise<void> => {
      const { step } = save;
      const projectName = getCurrentProject().header?.name;
      if (settings.showPreSaveHelp && step === SaveStep.None) {
        setSave({ hex, step: SaveStep.PreSaveHelp });
      } else if (
        (projectName === untitled || projectName === translatedUntitled) &&
        step === SaveStep.None
      ) {
        setSave({ hex, step: SaveStep.ProjectName });
      } else if (!hex) {
        setSave({ hex, step: SaveStep.SaveProgress });
        // This will result in a future call to saveHex with a hex.
        try {
          await doAfterEditorUpdate(async () => {
            saveNextDownloadRef.current = true;
            console.log(
              "[MAKECODE] saveHex - triggering driverRef.current.compile() to build hex for save"
            );
            await driverRef.current!.compile();
          });
        } catch (e) {
          if (e instanceof CodeEditorError) {
            setSave({ step: SaveStep.None });
            openEditorTimedOutDialog();
          }
        }
      } else {
        logging.event({
          type: "hex-save",
          detail: {
            actions: actions.length,
            samples: getTotalNumSamples(actions),
          },
        });
        downloadHex(hex);
        setSave({ step: SaveStep.None });
        toast({
          id: "save-complete",
          position: "top",
          duration: 5_000,
          title: intl.formatMessage({ id: "saving-toast-title" }),
          status: "info",
        });
      }
    },
    [
      save,
      getCurrentProject,
      settings.showPreSaveHelp,
      translatedUntitled,
      setSave,
      doAfterEditorUpdate,
      driverRef,
      openEditorTimedOutDialog,
      logging,
      actions,
      toast,
      intl,
    ]
  );

  // These are event handlers for MakeCode

  const editorChange = useStore((s) => s.editorChange);
  const onWorkspaceSave = useCallback(
    (event: EditorWorkspaceSaveRequest) => {
      console.log(`[MAKECODE] onWorkspaceSave - event received`);
      logMakeCodeProject(event.project, "onWorkspaceSave");
      if (!checkIfLangChanged()) {
        // We don't want to handle these events until MakeCode has been
        // reinitialised after a language change.
        // We should reinitialise with the latest project.
        editorChange(event.project);
      }
    },
    [checkIfLangChanged, editorChange]
  );

  const onBack = useCallback(() => {
    navigate(createTestingModelPageUrl());
  }, [navigate]);
  const onSave = saveHex;
  const downloadActions = useDownloadActions();
  const onDownload = useCallback(
    (download: HexData) => {
      try {
        const len = download?.hex?.length ?? 0;
        const enableFullDump = (() => {
          try {
            return Boolean(
              (typeof process !== "undefined" && (process as any).env && (process as any).env.NODE_ENV === "development") ||
                (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("makecode_full_dump") === "1")
            );
          } catch (e) {
            return false;
          }
        })();
        const preview = enableFullDump ? download?.hex ?? "" : (download?.hex ?? "").slice(0, 1000);
        console.log(
          `[MAKECODE] onDownload - hex length=%d; preview (truncated=%s):`,
          len,
          (!enableFullDump && len > 1000).toString(),
          preview
        );
      } catch (e) {
        console.log(`[MAKECODE] onDownload - could not stringify download`, e);
      }
      if (saveNextDownloadRef.current) {
        saveNextDownloadRef.current = false;
        void saveHex(download);
      } else {
        void downloadActions.start(download);
      }
    },
    [downloadActions, saveHex]
  );

  const value = useMemo(
    () => ({
      loadFile,
      openEditor,
      browserNavigationToEditor,
      project,
      projectEdited,
      resetProject,
      saveHex,
      editorCallbacks: {
        initialProjects,
        onSave,
        onWorkspaceSave,
        onDownload,
        onBack,
        onEditorContentLoaded,
        onWorkspaceLoaded,
      },
    }),
    [
      loadFile,
      openEditor,
      browserNavigationToEditor,
      project,
      projectEdited,
      resetProject,
      saveHex,
      initialProjects,
      onSave,
      onWorkspaceSave,
      onDownload,
      onBack,
      onEditorContentLoaded,
      onWorkspaceLoaded,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
