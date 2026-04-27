/**
 * (c) 2021-2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import {
  AspectRatio,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  defaultSettings,
  graphColorSchemeOptions,
  graphLineSchemeOptions,
  graphLineWeightOptions,
  recordingDurationDefault,
  recordingDurationMax,
  recordingDurationMin,
} from "../settings";
import { useSettings } from "../store";
import { previewGraphData } from "../utils/preview-graph-data";
import { ConfirmDialog } from "./ConfirmDialog";
import RecordingGraph from "./RecordingGraph";
import SelectFormControl, { createOptions } from "./SelectFormControl";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef?: React.RefObject<HTMLButtonElement>;
}

export const SettingsDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
}: SettingsDialogProps) => {
  const [settings, setSettings] = useSettings();
  const intl = useIntl();
  const resetConfirmDialog = useDisclosure();

  const storedRecordingDuration =
    settings.recordingDuration ?? recordingDurationDefault;
  // Local mirror for smooth slider drag; the store is updated on change-end.
  const [recordingDurationDraft, setRecordingDurationDraft] =
    useState<number>(storedRecordingDuration);
  // Re-sync the slider when the store value changes externally (e.g. reset).
  useEffect(() => {
    setRecordingDurationDraft(storedRecordingDuration);
  }, [storedRecordingDuration]);
  const handleRecordingDurationChange = useCallback((value: number) => {
    setRecordingDurationDraft(value);
  }, []);
  const handleRecordingDurationChangeEnd = useCallback(
    (value: number) => {
      setSettings({ recordingDuration: value });
    },
    [setSettings]
  );
  const handleResetToDefault = useCallback(() => {
    resetConfirmDialog.onOpen();
  }, [resetConfirmDialog]);

  const confirmResetToDefault = useCallback(() => {
    setSettings({
      ...defaultSettings,
      languageId: settings.languageId,
      toursCompleted: settings.toursCompleted,
    });
    resetConfirmDialog.onClose();
  }, [
    resetConfirmDialog,
    setSettings,
    settings.languageId,
    settings.toursCompleted,
  ]);

  const options = useMemo(() => {
    return {
      graphColorScheme: createOptions(
        graphColorSchemeOptions,
        "graph-color-scheme",
        intl
      ),
      graphLineScheme: createOptions(
        graphLineSchemeOptions,
        "graph-line-scheme",
        intl
      ),
      graphLineWeight: createOptions(
        graphLineWeightOptions,
        "graph-line-weight",
        intl
      ),
    };
  }, [intl]);
  return (
    <>
      <ConfirmDialog
        heading={intl.formatMessage({
          id: "restore-defaults-confirm-heading",
        })}
        body={intl.formatMessage({
          id: "restore-defaults-confirm-body",
        })}
        isOpen={resetConfirmDialog.isOpen}
        onConfirm={confirmResetToDefault}
        confirmText={intl.formatMessage({
          id: "restore-defaults-confirm-action",
        })}
        onCancel={resetConfirmDialog.onClose}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        finalFocusRef={finalFocusRef}
      >
        <ModalOverlay>
          <ModalContent>
            <ModalHeader fontSize="lg" fontWeight="bold">
              <FormattedMessage id="settings" />
            </ModalHeader>
            <ModalBody>
              <VStack alignItems="flex-start" spacing={5}>
                <SelectFormControl
                  id="graphLineColors"
                  label={intl.formatMessage({ id: "graph-color-scheme" })}
                  options={options.graphColorScheme}
                  value={settings.graphColorScheme}
                  onChange={(graphColorScheme) =>
                    setSettings({
                      ...settings,
                      graphColorScheme,
                    })
                  }
                />
                <SelectFormControl
                  id="graphLineScheme"
                  label={intl.formatMessage({ id: "graph-line-scheme" })}
                  options={options.graphLineScheme}
                  value={settings.graphLineScheme}
                  onChange={(graphLineScheme) =>
                    setSettings({
                      ...settings,
                      graphLineScheme,
                    })
                  }
                />
                <SelectFormControl
                  id="graphLineWeight"
                  label={intl.formatMessage({ id: "graph-line-weight" })}
                  options={options.graphLineWeight}
                  value={settings.graphLineWeight}
                  onChange={(graphLineWeight) =>
                    setSettings({
                      ...settings,
                      graphLineWeight,
                    })
                  }
                />
                <VStack alignItems="flex-start" w="full">
                  <Text>
                    <FormattedMessage id="graph-preview" />
                  </Text>
                  <AspectRatio ratio={526 / 92} w="full">
                    <RecordingGraph
                      responsive
                      data={previewGraphData}
                      role="img"
                      w="full"
                      aria-label={intl.formatMessage({
                        id: "recording-graph-label",
                      })}
                    />
                  </AspectRatio>
                </VStack>
                <FormControl>
                  <HStack justifyContent="space-between" w="full">
                    <FormLabel mb={1}>
                      <FormattedMessage id="recording-duration-label" />
                    </FormLabel>
                    <Text fontSize="sm" color="gray.600">
                      {(recordingDurationDraft / 1000).toFixed(2)} s
                    </Text>
                  </HStack>
                  <Slider
                    aria-label={intl.formatMessage({
                      id: "recording-duration-label",
                    })}
                    min={recordingDurationMin}
                    max={recordingDurationMax}
                    step={10}
                    value={recordingDurationDraft}
                    onChange={handleRecordingDurationChange}
                    onChangeEnd={handleRecordingDurationChangeEnd}
                  >
                    <SliderTrack h="8px" rounded="full">
                      <SliderFilledTrack bg="gray.600" />
                    </SliderTrack>
                    <SliderThumb bg="gray.600" />
                  </Slider>
                  <FormHelperText>
                    <FormattedMessage
                      id="recording-duration-helper"
                      values={{
                        min: (recordingDurationMin / 1000).toFixed(2),
                        max: (recordingDurationMax / 1000).toFixed(2),
                      }}
                    />
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <Button variant="primary" onClick={handleResetToDefault}>
                    <FormattedMessage id="restore-defaults-action" />
                  </Button>
                  <FormHelperText>
                    <FormattedMessage id="restore-defaults-helper" />
                  </FormHelperText>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={onClose}>
                <FormattedMessage id="close-action" />
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};
