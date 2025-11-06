/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { FormattedMessage } from "react-intl";
import { TourTrigger } from "../model";
import { createDataSamplesPageUrl, createTestingModelPageUrl } from "../urls";

interface HelpMenuItemsProps {
  onAboutDialogOpen: () => void;
  onConnectFirstDialogOpen: () => void;
  tourTrigger: TourTrigger | undefined;
}
const HelpMenuItems = ({
  onConnectFirstDialogOpen,
  tourTrigger,
}: HelpMenuItemsProps) => {
  return (
    <>
      <TourMenuItem
        onConnectFirstDialogOpen={onConnectFirstDialogOpen}
        tourTrigger={tourTrigger}
      />
      
    </>
  );
};

interface TourMenuItemProps {
  onConnectFirstDialogOpen: () => void;
  tourTrigger: TourTrigger | undefined;
}

const TourMenuItem = ({
  tourTrigger,
}: TourMenuItemProps) => {
  if (tourTrigger) {
    return (
        <FormattedMessage id="tour-action" />
    );
  }
  return null;
};

export const tourMap = {
  [createDataSamplesPageUrl()]: "Connect" as const,
  [createTestingModelPageUrl()]: "TrainModel" as const,
  // No UI to retrigger MakeCode tour
};

export default HelpMenuItems;
