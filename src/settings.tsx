/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 * Modifications (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { DataSamplesView, TourTriggerName } from "./model";

type Translation = "preview" | boolean;

export interface Language {
  id: string;
  name: string;
  enName: string;
  // Language supported in Classroom UI.
  ui: Translation;
  // Language supported in Microsoft MakeCode editor.
  makeCode: boolean;
}

// Tag new languages with `preview: true` to enable for beta only.
export const allLanguages: Language[] = [
  {
    id: "en",
    name: "English",
    enName: "English",
    ui: true,
    makeCode: true,
  },
  {
    id: "ar",
    name: "العربية",
    enName: "Arabic",
    ui: false,
    makeCode: true,
  },
  {
    id: "bg",
    name: "български",
    enName: "Bulgarian",
    ui: false,
    makeCode: true,
  },
  {
    id: "ca",
    name: "Català",
    enName: "Catalan",
    ui: true,
    makeCode: true,
  },
  {
    id: "cs",
    name: "Čeština",
    enName: "Czech",
    ui: false,
    makeCode: true,
  },
  {
    id: "cy",
    name: "Cymraeg",
    enName: "Welsh",
    ui: false,
    makeCode: true,
  },
  {
    id: "da",
    name: "Dansk",
    enName: "Danish",
    ui: false,
    makeCode: true,
  },
  {
    id: "de",
    name: "Deutsch",
    enName: "German",
    ui: true,
    makeCode: true,
  },
  {
    id: "el",
    name: "Ελληνικά",
    enName: "Greek",
    ui: true,
    makeCode: true,
  },
  {
    id: "es-ES",
    name: "Español",
    enName: "Spanish",
    ui: true,
    makeCode: true,
  },
  {
    id: "fi",
    name: "Suomi",
    enName: "Finnish",
    ui: false,
    makeCode: true,
  },
  {
    id: "fr",
    name: "Français",
    enName: "French",
    ui: true,
    makeCode: true,
  },
  {
    id: "gn",
    name: "Avañe'ẽ",
    enName: "Guarani",
    ui: false,
    makeCode: true,
  },
  {
    id: "he",
    name: "עברית",
    enName: "Hebrew",
    ui: false,
    makeCode: true,
  },
  {
    id: "hu",
    name: "Magyar",
    enName: "Hungarian",
    ui: false,
    makeCode: true,
  },
  {
    id: "is",
    name: "Íslenska",
    enName: "Icelandic",
    ui: false,
    makeCode: true,
  },
  {
    id: "it",
    name: "Italiano",
    enName: "Italian",
    ui: false,
    makeCode: true,
  },
  {
    id: "ja",
    name: "日本語",
    enName: "Japanese",
    ui: true,
    makeCode: true,
  },
  {
    id: "ko",
    name: "한국어",
    enName: "Korean",
    ui: true,
    makeCode: true,
  },
  {
    id: "nl",
    name: "Nederlands",
    enName: "Dutch",
    ui: true,
    makeCode: true,
  },
  {
    id: "nb",
    name: "Norsk bokmål",
    enName: "Norwegian Bokmal",
    ui: false,
    makeCode: true,
  },
  {
    id: "nn-NO",
    name: "Norsk nynorsk",
    enName: "Norwegian Nynorsk",
    ui: false,
    makeCode: true,
  },
  {
    id: "pl",
    name: "Polski",
    enName: "Polish",
    ui: true,
    makeCode: true,
  },
  {
    id: "pt-BR",
    name: "Português (Brasil)",
    enName: "Portuguese (Brazil)",
    ui: true,
    makeCode: true,
  },
  {
    id: "pt-PT",
    name: "Português (Portugal)",
    enName: "Portuguese (Portugal)",
    ui: false,
    makeCode: true,
  },
  {
    id: "ru",
    name: "Русский",
    enName: "Russian",
    ui: false,
    makeCode: true,
  },
  {
    id: "si-LK",
    name: "සිංහල",
    enName: "Sinhala",
    ui: false,
    makeCode: true,
  },
  {
    id: "sk",
    name: "Slovenčina",
    enName: "Slovak",
    ui: false,
    makeCode: true,
  },
  {
    id: "sr",
    name: "Srpski",
    enName: "Serbian (Latin)",
    ui: false,
    makeCode: true,
  },
  {
    id: "sv-SE",
    name: "Svenska",
    enName: "Swedish",
    ui: false,
    makeCode: true,
  },
  {
    id: "tr",
    name: "Türkçe",
    enName: "Turkish",
    ui: false,
    makeCode: true,
  },
  {
    id: "uk",
    name: "Українська",
    enName: "Ukrainian",
    ui: false,
    makeCode: true,
  },
  {
    id: "vi",
    name: "Tiếng việt",
    enName: "Vietnamese",
    ui: false,
    makeCode: true,
  },
  {
    id: "zh-CN",
    name: "简体中文",
    enName: "Chinese (Simplified)",
    ui: false,
    makeCode: true,
  },
  {
    id: "zh-TW",
    name: "繁體中文",
    enName: "Chinese (Traditional)",
    ui: true,
    makeCode: true,
  },
];

export const getMakeCodeLang = (languageId: string): string =>
  allLanguages.find((l) => l.id === languageId)?.makeCode ? languageId : "en";

/**
 * Returns the id of a language with full UI support (`ui: true`) that best
 * matches `tag` (a BCP-47 locale string such as "el", "el-GR", "pt-BR"…).
 * Tries an exact match (case-insensitive) first, then a primary-subtag match
 * (e.g. "en-US" → "en"). Returns `undefined` if no match is found.
 *
 * Note: only languages with `ui === true` are considered — preview locales
 * are not auto-selected so users don't get half-translated UIs by default.
 */
const findSupportedLanguage = (tag: string | null | undefined) => {
  if (!tag) return undefined;
  const lower = tag.toLowerCase();
  const supported = allLanguages.filter((l) => l.ui === true);
  const exact = supported.find((l) => l.id.toLowerCase() === lower);
  if (exact) return exact;
  const primary = lower.split("-")[0];
  return supported.find(
    (l) => l.id.toLowerCase().split("-")[0] === primary
  );
};

/**
 * Picks the initial language for the app:
 *   1. `?l=` URL parameter (if it points to a known language — preview or full).
 *   2. The user's preferred browser languages (`navigator.languages`),
 *      restricted to languages with full UI support.
 *   3. English as the ultimate fallback.
 */
export const getLanguageFromQuery = (): string => {
  // 1. Explicit override via the URL.
  const searchParams = new URLSearchParams(window.location.search);
  const l = searchParams.get("l");
  if (l) {
    const queryLang = allLanguages.find((x) => x.id === l);
    if (queryLang) return queryLang.id;
  }

  // 2. Browser language preferences (most-preferred first).
  const browserLangs: readonly string[] =
    typeof navigator !== "undefined"
      ? navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
        ? [navigator.language]
        : []
      : [];
  for (const tag of browserLangs) {
    const match = findSupportedLanguage(tag);
    if (match) return match.id;
  }

  // 3. Fallback — English (which is allLanguages[0]).
  return allLanguages[0].id;
};

// Recording length (in milliseconds) bounds shown in the settings UI.
export const recordingDurationMin = 750;
export const recordingDurationMax = 2500;
export const recordingDurationDefault = 990;

export const defaultSettings: Settings = {
  languageId: getLanguageFromQuery(),
  showPreSaveHelp: true,
  showPreTrainHelp: true,
  showPreDownloadHelp: true,
  toursCompleted: [],
  dataSamplesView: DataSamplesView.Graph,
  showGraphs: true,
  graphColorScheme: "default",
  graphLineScheme: "solid",
  graphLineWeight: "default",
  recordingDuration: recordingDurationDefault,
};

export type GraphColorScheme = "default" | "color-blind-1" | "color-blind-2";
export const graphColorSchemeOptions: GraphColorScheme[] = [
  "default",
  "color-blind-1",
  "color-blind-2",
];

export type GraphLineScheme = "solid" | "accessible";
export const graphLineSchemeOptions: GraphLineScheme[] = [
  "solid",
  "accessible",
];

export type GraphLineWeight = "default" | "thick";
export const graphLineWeightOptions: GraphLineWeight[] = ["default", "thick"];

export interface Settings {
  languageId: string;
  showPreSaveHelp: boolean;
  showPreTrainHelp: boolean;
  showPreDownloadHelp: boolean;
  toursCompleted: TourTriggerName[];
  dataSamplesView: DataSamplesView;
  showGraphs: boolean;
  graphColorScheme: GraphColorScheme;
  graphLineScheme: GraphLineScheme;
  graphLineWeight: GraphLineWeight;
  /**
   * User-configurable gesture recording length, in milliseconds.
   * Used to derive the active DataWindow for new sessions.
   */
  recordingDuration: number;
}
