/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import DefaultPageLayout from "../components/DefaultPageLayout";
import YoutubeVideoEmbed from "../components/YoutubeVideoEmbed";
import xyzGraph from "../images/xyz_calliope.png";
import { createNewPageUrl } from "../urls";

import { useSearchParams } from "react-router-dom";
import { setEditorVersionOverride } from "../editor-version";

const HomePage = () => {
  const [params] = useSearchParams();
  setEditorVersionOverride(params.get("editorVersion") || undefined);
  const navigate = useNavigate();
  const handleGetStarted = useCallback(() => {
    navigate(createNewPageUrl());
  }, [navigate]);
  const intl = useIntl();
  return (
    <DefaultPageLayout
      toolbarItemsRight={
        <Button variant="toolbar" onClick={handleGetStarted}>
          <FormattedMessage id="get-started-action" />
        </Button>
      }
    >
      <Container
        as="main"
        centerContent
        gap={20}
        p={8}
        pb={20}
        maxW="container.lg"
      >
        <HStack
          gap={5}
          flexDir={{ base: "column", lg: "row" }}
          w={{ base: "100%", lg: "unset" }}
        >
          <VStack
            flex="1"
            alignItems="flex-start"
            gap={5}
            w={{ base: "100%", lg: "unset" }}
          >
            <Heading
              as="h1"
              fontSize="5xl"
              fontWeight="bold"
              variant="marketing"
            >
              <FormattedMessage id="homepage-title" />
            </Heading>
            <Text fontSize="md" fontWeight="bold">
              <FormattedMessage id="homepage-subtitle" />
            </Text>
            <Text fontSize="md">
              <FormattedMessage id="homepage-description" />
            </Text>
            <Button
              size="lg"
              variant="primary"
              onClick={handleGetStarted}
              mt={5}
            >
              <FormattedMessage id="get-started-action" />
            </Button>
          </VStack>
          <Box
            flex="1"
            position="relative"
            role="img"
            aria-label={intl.formatMessage({ id: "homepage-alt" })}
          >
            <Image
              src={xyzGraph}
              borderRadius="lg"
              pr={1}
              alt={intl.formatMessage({ id: "homepage-alt-graph" })}
            />
          </Box>
        </HStack>
        <VStack spacing={10} w="100%" maxW="container.md">
          <Heading as="h2" textAlign="center" variant="marketing">
            <FormattedMessage id="homepage-how-it-works" />
          </Heading>
          <Box w="100%" position="relative">
            <YoutubeVideoEmbed
              youtubeId="GUdoNdTNNaU"
              alt={intl.formatMessage({ id: "homepage-video-alt" })}
            />
          </Box>
        </VStack>


      </Container>
    </DefaultPageLayout>
  );
};

export default HomePage;
