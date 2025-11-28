/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { stage } from "../environment";

// We might move these into the deployment config in future
// They'll also need to become language aware
const microbitOrgBaseUrl =
  stage === "production"
    ? "https://calliope.cc"
    : "https://stage.calliope.cc";

const langPath = (languageId: string) =>
  languageId === "en" ? "" : `${languageId.toLowerCase()}/`;

export const projectUrl = (slug: string, language: string) =>
  `${microbitOrgBaseUrl}${langPath(
    language
  )}projects/make-it-code-it/${encodeURIComponent(slug)}/`;

export const userGuideUrl = () =>
  `${microbitOrgBaseUrl}schulen/ki`;

export const landingPageUrl = (language: string) =>
  `${microbitOrgBaseUrl}${langPath(language)}schulen/ki`;
