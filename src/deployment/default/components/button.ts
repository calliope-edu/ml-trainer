/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StyleConfig } from "@chakra-ui/theme-tools";

const Button: StyleConfig = {
  baseStyle: {
    borderRadius: "button",
    color: "brand2.500",
  },
  variants: {
    unstyled: {
      borderRadius: "unset",
    },
    link: () => ({
      borderWidth: "0",
      color: "brand.600",
      fontWeight: "normal",
      bg: "transparent",
    }),
    secondary: () => ({
      borderWidth: "2px",
      borderColor: "brand.500",
      color: "brand2.700",
      bg: "transparent",
      _hover: {
        borderColor: "brand.600",
      },
      _active: {
        bg: "brand.50",
        borderColor: "brand.700",
      },
    }),
    led: () => ({
      borderWidth: "2px",
      borderRadius: 5,
      borderColor: "brand2.500",
      color: "brand2.700",
      bg: "transparent",
      _hover: {
        cursor: "pointer",
        borderColor: "brand2.500",
      },
      _active: { bg: "brand2.500", borderColor: "brand2.500" },
    }),
    ghost: () => ({
      color: "black",
      bg: "transparent",
      _hover: {
        bg: "blackAlpha.50",
      },
      _active: {
        bg: "blackAlpha.100",
      },
    }),
    primary: () => ({
      color: "brand2.500",
      bg: "brand.500",
      _hover: {
        bg: "brand.100",
        _disabled: {
          bg: "brand.500",
        },
      },
      _active: {
        bg: "brand.700",
      },
    }),
    recordOutline: () => ({
      borderWidth: "1px",
      borderColor: "gray.500",
      color: "gray.500",
      bg: "transparent",
      _hover: {
        bg: "gray.50",
      },
      _active: {
        borderColor: "gray.600",
        color: "gray.600",
        bg: "gray.100",
      },
    }),
    record: () => ({
      color: "white",
      bg: "gray.900",
      _hover: {
        bg: "gray.700",
        _disabled: {
          bg: "gray.400",
        },
      },
      _active: {
        bg: "gray.700",
      },
    }),
    warning: () => ({
      borderWidth: "2px",
      borderColor: "red.500",
      color: "red.500",
      bg: "transparent",
      _hover: {
        borderColor: "red.600",
      },
      _active: {
        bg: "red.50",
        borderColor: "red.500",
      },
    }),
    toolbar: () => ({
      color: "brand2.500",
      bg: "brand.500",
      _hover: {
        bg: "brand.100",
        _disabled: {
          bg: "white",
        },
      },
      _active: {
        bg: "whiteAlpha.800",
      },
      _focusVisible: {
        boxShadow: "outlineDark",
      },
    }),
    language: () => ({
      borderWidth: "2px",
      borderColor: "gray.200",
      color: "brand2.500",
      _hover: {
        color: "brand2.600",
        bg: "gray.100",
      },
    }),
    "secondary-disabled": () => ({
      borderWidth: "2px",
      borderColor: "brand.500",
      color: "brand.700",
      bg: "transparent",
      opacity: "0.4",
    }),
  },
};

export default Button;
