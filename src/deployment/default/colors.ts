/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { theme } from "@chakra-ui/theme";

const gray = {
  10: "#fcfcfc",
  25: "#f5f5f5",
  ...theme.colors.gray,
  // Brand grey
  500: "#e5e5e5",
  // windi css text color
  600: "#6b7280",
};

const brand = {
  500: "#97f500", // Calliope Neon Green
  100: "rgba(151, 245, 0, 0.5)", // Hover / Alpha
};

const brand2 = {
  500: "#1B1C1D", // calliope black
};

const colors = {
  ...theme.colors,
  gray,
  brand,
  brand2,
};

export default colors;