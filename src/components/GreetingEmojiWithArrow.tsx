/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon } from "@chakra-ui/react";

interface GreetingEmojiWithArrowProps {
  w: string;
  h: string;
  color?: string;
}

const GreetingEmojiWithArrow = ({
  w,
  h,
  color,
}: GreetingEmojiWithArrowProps) => {
  return (
    <Icon w={w} h={h} viewBox="0 0 40 31.424875" color={color}>
      <path
        d="M 105.80677,104.76545 A 12.303125,12.303125 0 0 0 90.928702,96.869948 l 0.66753,-1.30567 a 0.51964167,0.51964167 0 0 0 -0.22795,-0.70714 0.51964167,0.51964167 0 0 0 -0.707136,0.22795 l -1.235843,2.41917 a 0.51990625,0.51990625 0 0 0 0.227951,0.70713 l 2.417743,1.2359 a 0.53234167,0.53234167 0 0 0 0.70714,-0.22795 0.51990625,0.51990625 0 0 0 -0.227955,-0.70713 L 91.287,97.866588 a 11.201135,11.201135 0 0 1 13.50055,7.211022 0.54689375,0.54689375 0 0 0 0.27325,0.3067 0.6429375,0.6429375 0 0 0 0.40109,0.0441 0.48709792,0.48709792 0 0 0 0.3098,-0.2422 0.52916667,0.52916667 0 0 0 0.0347,-0.42094"
        fill="currentColor"
        clipPath="url(#clipPath1)"
        display="inline"
        transform="matrix(1.1240682,0,0,1.1240682,-100.45299,-106.55292)"
      />
    </Icon>
  );
};

export default GreetingEmojiWithArrow;
