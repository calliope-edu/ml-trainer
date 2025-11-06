/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import microbitConnectedImage from "../images/stylised-microbit-connected.svg";
import ConnectContainerDialog, {
  ConnectContainerDialogProps,
} from "./ConnectContainerDialog";

export interface ConnectBatteryDialogProps
  extends Omit<ConnectContainerDialogProps, "children" | "headingId"> {}

const ConnectBatteryDialog = ({ ...props }: ConnectBatteryDialogProps) => {
  return (
    <ConnectContainerDialog headingId="connect-battery-heading" {...props}>
      <VStack gap={5} width="100%">
        <Text alignSelf="left" width="100%">
          <FormattedMessage id="connect-battery-subtitle" />
          <FormattedMessage id="connect-battery-link" />
        </Text>
        <Image
          height="229px"
          width="16rem"
          src={microbitConnectedImage}
          alt=""
        />
      </VStack>
    </ConnectContainerDialog>
  );
};

export default ConnectBatteryDialog;
