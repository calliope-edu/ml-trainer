/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  BoxProps,
  Heading,
  HStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { ReactElement, ReactNode, useCallback } from "react";

interface NewPageChoice extends BoxProps {
  children: ReactNode;
  onClick: () => void;
  icon: ReactElement;
  disabled?: boolean;
  label: string;
}

const NewPageChoice = ({
  disabled,
  children,
  onClick,
  icon,
  label,
  ...props
}: NewPageChoice) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [disabled, onClick]);
  return (
    <Box boxShadow="lg" flex="1" role="group">
      <HStack
        spacing={0}
        borderRadius="md"
        bgColor="white"
        onClick={handleClick}
        cursor="pointer"
        alignItems="stretch"
        opacity={disabled ? 0.5 : undefined}
        userSelect={disabled ? "none" : undefined}
        transitionDuration="200ms"
        transitionProperty="background-color"
        _hover={{
          bgColor: disabled ? undefined : "brand.50",
        }}
        _groupFocusWithin={{
          boxShadow: "outline",
        }}
        {...props}
      >
        <Stack as="section" py={5} px={5} minH={40} flex="1 1 auto">
          <Heading as="h3" fontSize="xl">
            {label}
          </Heading>
          {children}
        </Stack>
        <Box>
          <IconButton
            w={40}
            isDisabled={disabled}
            aria-label={label}
            bgColor="calliope.neon.500"
            color="white"
            height="100%"
            variant="unstyled"
            icon={icon}
            borderInlineEndRadius="md"
            _groupHover={{
              color: disabled ? undefined : "white",
              opacity: disabled ? undefined : 0.5,
            }}
            _focusVisible={{
              boxShadow: "none",
            }}
            _hover={{
              bgColor: "calliope.neon.500",
            }}
            _disabled={{
              opacity: 1,
            }}
          />
        </Box>
      </HStack>
    </Box>
  );
};

export default NewPageChoice;
