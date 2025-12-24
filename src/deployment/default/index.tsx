/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Image, VStack } from "@chakra-ui/react";
import { ReactNode, createContext } from "react";
import { CookieConsent, DeploymentConfigFactory } from "..";
import { NullLogging } from "./logging";
import theme from "./theme";
import calliopeLogo from "../../images/Logo_KI-Training_2.png";

const stubConsentValue: CookieConsent = {
  analytics: false,
  functional: true,
};
const stubConsentContext = createContext<CookieConsent | undefined>(
  stubConsentValue
);

const defaultDeploymentFactory: DeploymentConfigFactory = () => ({
  chakraTheme: theme,
  appNameFull: "Calliope-ML",
  appNameShort: "calliope-ml",
AppLogo: (props: BoxProps) => {
  return (
    <VStack
      color="white"
      fontWeight="bold"
      justifyContent="center"
      alignItems="center"
      {...props}
    >
      <Image
        src={calliopeLogo}
        alt="Calliope Logo"
        maxH="48px"
        mb={2}
      />
      {/* <Text>Calliope Machine Learning</Text> */}
    </VStack>
  );
},
  OrgLogo: undefined,
  logging: new NullLogging(),
  compliance: {
    ConsentProvider: ({ children }: { children: ReactNode }) => (
      <stubConsentContext.Provider value={stubConsentValue}>
        {children}
      </stubConsentContext.Provider>
    ),
    consentContext: stubConsentContext,
    manageCookies: undefined,
  },
  supportLinks: {
    // Just placeholders, these need replacing in a real deployment with branded help content.
    bluetooth: "https://calliope.cc",
    main: "https://calliope.cc",
    troubleshooting: "https://calliope.cc",
    wearable: "https://calliope.cc",
  },
});

export default defaultDeploymentFactory;
