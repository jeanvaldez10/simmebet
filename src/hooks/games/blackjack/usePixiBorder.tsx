import { useCallback } from 'react';
import { Graphics } from 'pixi.js';

interface PixiPixelatedBorderProps {
  width: number;
  height: number;
  backgroundColor?: number;
  borderColor?: number;
  highlightColor?: number;
  highlightColor2?: number;
  alpha?: number;
  busted?: boolean;
}

const ORIGINAL_WIDTH = 255;
const ORIGINAL_HEIGHT = 226;

const COLOR_DARK = 0x182325;
const COLOR_GREEN = 0x428166;
const COLOR_LIGHT_GRAY = 0xc9ccdb;

export function usePixiPixelatedBorder({
  width,
  height,
  backgroundColor = COLOR_DARK,
  borderColor = COLOR_GREEN,
  highlightColor,
  highlightColor2,
  alpha = 1,
  busted = false,
}: PixiPixelatedBorderProps) {
  const drawBorder = useCallback(
    (g: Graphics) => {
      g.clear();

      const sx = width / ORIGINAL_WIDTH;
      const sy = height / ORIGINAL_HEIGHT;

      const drawRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        color: number
      ) => {
        g.rect(x * sx, y * sy, w * sx, h * sy);
        g.fill({ color, alpha });
      };

      // Main background rectangle
      drawRect(18.3824, 18.3824, 213.2356, 172.7936, backgroundColor);

      // Green border rectangles
      // Top border
      drawRect(18.3824, 14.7059, 213.2356, 3.6765, borderColor);
      drawRect(18.3824, 11.0294, 213.2356, 3.6765, backgroundColor);

      // Right border
      drawRect(231.618, 18.3824, 3.676, 172.7936, borderColor);
      drawRect(235.294, 18.3824, 3.677, 172.7936, backgroundColor);

      // Bottom border
      drawRect(18.3824, 191.176, 213.2356, 3.6765, borderColor);
      drawRect(18.3824, 194.853, 213.2356, 3.6765, backgroundColor);

      // Left border
      drawRect(14.7059, 18.3824, 3.6765, 172.7936, borderColor);
      drawRect(11.0294, 18.3824, 3.6765, 172.7936, backgroundColor);

      // Top-left corner pixelated effect
      // Yellow highlights (#FFE721)
      drawRect(14.7059, 14.7059, 3.6765, 3.6765, highlightColor ?? borderColor);
      drawRect(14.7059, 11.0294, 3.6765, 3.6765, highlightColor ?? borderColor);
      drawRect(18.3824, 14.7059, 3.676, 3.6765, highlightColor ?? borderColor);
      drawRect(14.7059, 18.3824, 3.6765, 3.676, highlightColor ?? borderColor);
      drawRect(11.0294, 14.7059, 3.6765, 3.6765, highlightColor ?? borderColor);
      // Orange-yellow highlights (#FFBE0C)
      drawRect(
        7.35294,
        14.7059,
        3.67646,
        3.6765,
        highlightColor2 ?? borderColor
      );
      drawRect(
        14.7059,
        7.35294,
        3.6765,
        3.67646,
        highlightColor2 ?? borderColor
      );
      drawRect(
        22.0588,
        14.7059,
        3.6765,
        3.6765,
        highlightColor2 ?? borderColor
      );
      drawRect(
        14.7059,
        22.0588,
        3.6765,
        3.6765,
        highlightColor2 ?? borderColor
      );
      // Green border pixels (#428166)
      drawRect(14.7059, 25.7353, 3.6765, 3.6765, borderColor);
      drawRect(25.7353, 14.7059, 3.6765, 3.6765, borderColor);
      drawRect(18.3824, 11.0294, 3.676, 3.6765, borderColor);
      drawRect(14.7059, 3.67647, 3.6765, 3.67647, borderColor);
      drawRect(11.0294, 11.0294, 3.6765, 3.6765, borderColor);
      drawRect(3.67647, 14.7059, 3.67647, 3.6765, borderColor);
      drawRect(11.0294, 18.3824, 3.6765, 3.676, borderColor);

      // Top-left corner dark pixels
      drawRect(18.3824, 18.3824, 3.676, 3.676, backgroundColor);
      drawRect(18.3824, 11.0294, 3.676, 3.6765, backgroundColor);
      drawRect(11.0294, 11.0294, 3.6765, 3.6765, backgroundColor);
      drawRect(11.0294, 18.3824, 3.6765, 3.676, backgroundColor);
      drawRect(18.3824, 22.0588, 3.676, 3.6765, backgroundColor);
      drawRect(18.3824, 25.7353, 3.676, 3.6765, backgroundColor);
      drawRect(18.3824, 29.4118, 3.676, 3.6764, backgroundColor);
      drawRect(14.7059, 29.4118, 3.6765, 3.6764, backgroundColor);
      drawRect(11.0294, 29.4118, 3.6765, 3.6764, backgroundColor);
      drawRect(11.0294, 25.7353, 3.6765, 3.6765, backgroundColor);
      drawRect(11.0294, 22.0588, 3.6765, 3.6765, backgroundColor);
      drawRect(7.35294, 18.3824, 3.67646, 3.676, backgroundColor);
      drawRect(3.67647, 18.3824, 3.67647, 3.676, backgroundColor);
      drawRect(0, 18.3824, 3.67647, 3.676, backgroundColor);
      drawRect(0, 14.7059, 3.67647, 3.6765, backgroundColor);
      drawRect(0, 11.0294, 3.67647, 3.6765, backgroundColor);
      drawRect(3.67647, 11.0294, 3.67647, 3.6765, backgroundColor);
      drawRect(7.35294, 11.0294, 3.67646, 3.6765, backgroundColor);
      drawRect(11.0294, 7.35294, 3.6765, 3.67646, backgroundColor);
      drawRect(11.0294, 3.67647, 3.6765, 3.67647, backgroundColor);
      drawRect(11.0294, 0, 3.6765, 3.67647, backgroundColor);
      drawRect(14.7059, 0, 3.6765, 3.67647, backgroundColor);
      drawRect(18.3824, 0, 3.676, 3.67647, backgroundColor);
      drawRect(18.3824, 3.67647, 3.676, 3.67647, backgroundColor);
      drawRect(18.3824, 7.35294, 3.676, 3.67646, backgroundColor);
      drawRect(22.0588, 11.0294, 3.6765, 3.6765, backgroundColor);
      drawRect(25.7353, 11.0294, 3.6765, 3.6765, backgroundColor);
      drawRect(29.4118, 11.0294, 3.6764, 3.6765, backgroundColor);
      drawRect(29.4118, 14.7059, 3.6764, 3.6765, backgroundColor);
      drawRect(29.4118, 18.3824, 3.6764, 3.676, backgroundColor);
      drawRect(25.7353, 18.3824, 3.6765, 3.676, backgroundColor);
      drawRect(22.0588, 18.3824, 3.6765, 3.676, backgroundColor);

      // Bottom-left corner pixelated effect
      // Yellow highlights (#FFE721)
      drawRect(14.7059, 191.176, 3.6765, 3.676, highlightColor ?? borderColor);
      drawRect(14.7059, 187.5, 3.6765, 3.676, highlightColor ?? borderColor);
      drawRect(18.3824, 191.176, 3.676, 3.676, highlightColor ?? borderColor);
      drawRect(14.7059, 194.853, 3.6765, 3.676, highlightColor ?? borderColor);
      drawRect(11.0294, 191.176, 3.6765, 3.676, highlightColor ?? borderColor);
      // Orange-yellow highlights (#FFBE0C)
      drawRect(
        7.35294,
        191.176,
        3.67646,
        3.676,
        highlightColor2 ?? borderColor
      );
      drawRect(14.7059, 183.824, 3.6765, 3.676, highlightColor2 ?? borderColor);
      drawRect(22.0588, 191.176, 3.6765, 3.676, highlightColor2 ?? borderColor);
      drawRect(14.7059, 198.529, 3.6765, 3.677, highlightColor2 ?? borderColor);
      // Green border pixels (#428166)
      drawRect(14.7059, 202.206, 3.6765, 3.676, borderColor);
      drawRect(25.7353, 191.176, 3.6765, 3.676, borderColor);
      drawRect(18.3824, 187.5, 3.676, 3.676, borderColor);
      drawRect(14.7059, 180.147, 3.6765, 3.677, borderColor);
      drawRect(11.0294, 187.5, 3.6765, 3.676, borderColor);
      drawRect(3.67647, 191.176, 3.67647, 3.676, borderColor);
      drawRect(11.0294, 194.853, 3.6765, 3.676, borderColor);

      // Bottom-left corner dark pixels
      drawRect(18.3824, 194.853, 3.676, 3.676, backgroundColor);
      drawRect(18.3824, 187.5, 3.676, 3.676, backgroundColor);
      drawRect(11.0294, 187.5, 3.6765, 3.676, backgroundColor);
      drawRect(11.0294, 194.853, 3.6765, 3.676, backgroundColor);
      drawRect(18.3824, 198.529, 3.676, 3.677, backgroundColor);
      drawRect(18.3824, 202.206, 3.676, 3.676, backgroundColor);
      drawRect(18.3824, 205.882, 3.676, 3.677, backgroundColor);
      drawRect(14.7059, 205.882, 3.6765, 3.677, backgroundColor);
      drawRect(11.0294, 205.882, 3.6765, 3.677, backgroundColor);
      drawRect(11.0294, 202.206, 3.6765, 3.676, backgroundColor);
      drawRect(11.0294, 198.529, 3.6765, 3.677, backgroundColor);
      drawRect(7.35294, 194.853, 3.67646, 3.676, backgroundColor);
      drawRect(3.67647, 194.853, 3.67647, 3.676, backgroundColor);
      drawRect(0, 194.853, 3.67647, 3.676, backgroundColor);
      drawRect(0, 191.176, 3.67647, 3.676, backgroundColor);
      drawRect(0, 187.5, 3.67647, 3.676, backgroundColor);
      drawRect(3.67647, 187.5, 3.67647, 3.676, backgroundColor);
      drawRect(7.35294, 187.5, 3.67646, 3.676, backgroundColor);
      drawRect(11.0294, 183.824, 3.6765, 3.676, backgroundColor);
      drawRect(11.0294, 180.147, 3.6765, 3.677, backgroundColor);
      drawRect(11.0294, 176.471, 3.6765, 3.676, backgroundColor);
      drawRect(14.7059, 176.471, 3.6765, 3.676, backgroundColor);
      drawRect(18.3824, 176.471, 3.676, 3.676, backgroundColor);
      drawRect(18.3824, 180.147, 3.676, 3.677, backgroundColor);
      drawRect(18.3824, 183.824, 3.676, 3.676, backgroundColor);
      drawRect(22.0588, 187.5, 3.6765, 3.676, backgroundColor);
      drawRect(25.7353, 187.5, 3.6765, 3.676, backgroundColor);
      drawRect(29.4118, 187.5, 3.6764, 3.676, backgroundColor);
      drawRect(29.4118, 191.176, 3.6764, 3.676, backgroundColor);
      drawRect(29.4118, 194.853, 3.6764, 3.676, backgroundColor);
      drawRect(25.7353, 194.853, 3.6765, 3.676, backgroundColor);
      drawRect(22.0588, 194.853, 3.6765, 3.676, backgroundColor);

      // Top-right corner pixelated effect
      // Yellow highlights (#FFE721)
      drawRect(231.618, 14.7059, 3.676, 3.6765, highlightColor ?? borderColor);
      drawRect(231.618, 11.0294, 3.676, 3.6765, highlightColor ?? borderColor);
      drawRect(235.294, 14.7059, 3.677, 3.6765, highlightColor ?? borderColor);
      drawRect(231.618, 18.3824, 3.676, 3.676, highlightColor ?? borderColor);
      drawRect(227.941, 14.7059, 3.677, 3.6765, highlightColor ?? borderColor);
      // Orange-yellow highlights (#FFBE0C)
      drawRect(224.265, 14.7059, 3.676, 3.6765, highlightColor2 ?? borderColor);
      drawRect(
        231.618,
        7.35294,
        3.676,
        3.67646,
        highlightColor2 ?? borderColor
      );
      drawRect(238.971, 14.7059, 3.676, 3.6765, highlightColor2 ?? borderColor);
      drawRect(231.618, 22.0588, 3.676, 3.6765, highlightColor2 ?? borderColor);
      // Green border pixels (#428166)
      drawRect(231.618, 25.7353, 3.676, 3.6765, borderColor);
      drawRect(242.647, 14.7059, 3.677, 3.6765, borderColor);
      drawRect(235.294, 11.0294, 3.677, 3.6765, borderColor);
      drawRect(231.618, 3.67647, 3.676, 3.67647, borderColor);
      drawRect(227.941, 11.0294, 3.677, 3.6765, borderColor);
      drawRect(220.588, 14.7059, 3.677, 3.6765, borderColor);
      drawRect(227.941, 18.3824, 3.677, 3.676, borderColor);

      // Top-right corner dark pixels
      drawRect(235.294, 18.3824, 3.677, 3.676, backgroundColor);
      drawRect(235.294, 11.0294, 3.677, 3.6765, backgroundColor);
      drawRect(227.941, 11.0294, 3.677, 3.6765, backgroundColor);
      drawRect(227.941, 18.3824, 3.677, 3.676, backgroundColor);
      drawRect(235.294, 22.0588, 3.677, 3.6765, backgroundColor);
      drawRect(235.294, 25.7353, 3.677, 3.6765, backgroundColor);
      drawRect(235.294, 29.4118, 3.677, 3.6764, backgroundColor);
      drawRect(231.618, 29.4118, 3.676, 3.6764, backgroundColor);
      drawRect(227.941, 29.4118, 3.677, 3.6764, backgroundColor);
      drawRect(227.941, 25.7353, 3.677, 3.6765, backgroundColor);
      drawRect(227.941, 22.0588, 3.677, 3.6765, backgroundColor);
      drawRect(224.265, 18.3824, 3.676, 3.676, backgroundColor);
      drawRect(220.588, 18.3824, 3.677, 3.676, backgroundColor);
      drawRect(216.912, 18.3824, 3.676, 3.676, backgroundColor);
      drawRect(216.912, 14.7059, 3.676, 3.6765, backgroundColor);
      drawRect(216.912, 11.0294, 3.676, 3.6765, backgroundColor);
      drawRect(220.588, 11.0294, 3.677, 3.6765, backgroundColor);
      drawRect(224.265, 11.0294, 3.676, 3.6765, backgroundColor);
      drawRect(227.941, 7.35294, 3.677, 3.67646, backgroundColor);
      drawRect(227.941, 3.67647, 3.677, 3.67647, backgroundColor);
      drawRect(227.941, 0, 3.677, 3.67647, backgroundColor);
      drawRect(231.618, 0, 3.676, 3.67647, backgroundColor);
      drawRect(235.294, 0, 3.677, 3.67647, backgroundColor);
      drawRect(235.294, 3.67647, 3.677, 3.67647, backgroundColor);
      drawRect(235.294, 7.35294, 3.677, 3.67646, backgroundColor);
      drawRect(238.971, 11.0294, 3.676, 3.6765, backgroundColor);
      drawRect(242.647, 11.0294, 3.677, 3.6765, backgroundColor);
      drawRect(246.324, 11.0294, 3.676, 3.6765, backgroundColor);
      drawRect(246.324, 14.7059, 3.676, 3.6765, backgroundColor);
      drawRect(246.324, 18.3824, 3.676, 3.676, backgroundColor);
      drawRect(242.647, 18.3824, 3.677, 3.676, backgroundColor);
      drawRect(238.971, 18.3824, 3.676, 3.676, backgroundColor);

      // Bottom-right corner pixelated effect
      // Yellow highlights (#FFE721)
      drawRect(231.618, 191.176, 3.676, 3.676, highlightColor ?? borderColor);
      drawRect(231.618, 187.5, 3.676, 3.676, highlightColor ?? borderColor);
      drawRect(235.294, 191.176, 3.677, 3.676, highlightColor ?? borderColor);
      drawRect(231.618, 194.853, 3.676, 3.676, highlightColor ?? borderColor);
      drawRect(227.941, 191.176, 3.677, 3.676, highlightColor ?? borderColor);
      // Orange-yellow highlights (#FFBE0C)
      drawRect(224.265, 191.176, 3.676, 3.676, highlightColor2 ?? borderColor);
      drawRect(231.618, 183.824, 3.676, 3.676, highlightColor2 ?? borderColor);
      drawRect(238.971, 191.176, 3.676, 3.676, highlightColor2 ?? borderColor);
      drawRect(231.618, 198.529, 3.676, 3.677, highlightColor2 ?? borderColor);
      // Green border pixels (#428166)
      drawRect(231.618, 202.206, 3.676, 3.676, borderColor);
      drawRect(242.647, 191.176, 3.677, 3.676, borderColor);
      drawRect(235.294, 187.5, 3.677, 3.676, borderColor);
      drawRect(231.618, 180.147, 3.676, 3.677, borderColor);
      drawRect(227.941, 187.5, 3.677, 3.676, borderColor);
      drawRect(220.588, 191.176, 3.677, 3.676, borderColor);
      drawRect(227.941, 194.853, 3.677, 3.676, borderColor);

      // Bottom-right corner dark pixels
      drawRect(235.294, 194.853, 3.677, 3.676, backgroundColor);
      drawRect(235.294, 187.5, 3.677, 3.676, backgroundColor);
      drawRect(227.941, 187.5, 3.677, 3.676, backgroundColor);
      drawRect(227.941, 194.853, 3.677, 3.676, backgroundColor);
      drawRect(235.294, 198.529, 3.677, 3.677, backgroundColor);
      drawRect(235.294, 202.206, 3.677, 3.676, backgroundColor);
      drawRect(235.294, 205.882, 3.677, 3.677, backgroundColor);
      drawRect(231.618, 205.882, 3.676, 3.677, backgroundColor);
      drawRect(227.941, 205.882, 3.677, 3.677, backgroundColor);
      drawRect(227.941, 202.206, 3.677, 3.676, backgroundColor);
      drawRect(227.941, 198.529, 3.677, 3.677, backgroundColor);
      drawRect(224.265, 194.853, 3.676, 3.676, backgroundColor);
      drawRect(220.588, 194.853, 3.677, 3.676, backgroundColor);
      drawRect(216.912, 194.853, 3.676, 3.676, backgroundColor);
      drawRect(216.912, 191.176, 3.676, 3.676, backgroundColor);
      drawRect(216.912, 187.5, 3.676, 3.676, backgroundColor);
      drawRect(220.588, 187.5, 3.677, 3.676, backgroundColor);
      drawRect(224.265, 187.5, 3.676, 3.676, backgroundColor);
      drawRect(227.941, 183.824, 3.677, 3.676, backgroundColor);
      drawRect(227.941, 180.147, 3.677, 3.677, backgroundColor);
      drawRect(227.941, 176.471, 3.677, 3.676, backgroundColor);
      drawRect(231.618, 176.471, 3.676, 3.676, backgroundColor);
      drawRect(235.294, 176.471, 3.677, 3.676, backgroundColor);
      drawRect(235.294, 180.147, 3.677, 3.677, backgroundColor);
      drawRect(235.294, 183.824, 3.677, 3.676, backgroundColor);
      drawRect(238.971, 187.5, 3.676, 3.676, backgroundColor);
      drawRect(242.647, 187.5, 3.677, 3.676, backgroundColor);
      drawRect(246.324, 187.5, 3.676, 3.676, backgroundColor);
      drawRect(246.324, 191.176, 3.676, 3.676, backgroundColor);
      drawRect(246.324, 194.853, 3.676, 3.676, backgroundColor);
      drawRect(242.647, 194.853, 3.677, 3.676, backgroundColor);
      drawRect(238.971, 194.853, 3.676, 3.676, backgroundColor);

      // Decorative elements (busted state) - only render when busted prop is true
      if (busted) {
        // Large center rectangle
        drawRect(29.4118, 99.2647, 44.1176, 44.1173, COLOR_DARK);

        // Light gray decorative pixels (#C9CCDB)
        drawRect(75.7918, 187.854, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(79.8925, 184.531, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 181.208, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 177.885, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 174.562, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(88.0939, 174.562, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(88.0939, 171.239, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(88.0939, 167.916, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(92.1946, 167.916, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(96.2952, 167.916, 4.1008, 3.322, COLOR_LIGHT_GRAY);
        drawRect(96.2952, 164.593, 4.1008, 3.322, COLOR_LIGHT_GRAY);
        drawRect(100.396, 161.27, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(100.396, 157.947, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(104.497, 154.624, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(104.497, 151.301, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(104.497, 147.978, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(108.597, 147.978, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(112.698, 144.655, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(112.698, 141.332, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(112.698, 138.009, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(112.698, 134.686, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(100.396, 171.239, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(104.497, 174.562, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(22.483, 184.531, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(18.3824, 187.854, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(30.6844, 181.208, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(26.5837, 184.531, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(34.7851, 181.208, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(38.8857, 177.885, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(42.9864, 174.562, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(47.0871, 171.239, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(51.1878, 167.916, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(51.1878, 164.593, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(55.2885, 161.27, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(51.1878, 157.947, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(59.3891, 161.27, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(63.4898, 157.947, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(67.5905, 157.947, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(67.5905, 154.624, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(71.6912, 151.301, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(75.7918, 147.978, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(79.8925, 144.655, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 141.332, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 138.009, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(88.0939, 134.686, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(153.705, 177.885, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(157.805, 174.562, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(157.805, 171.239, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(153.705, 167.916, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(153.705, 164.593, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(153.705, 161.27, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(149.604, 157.947, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(145.503, 161.27, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(141.403, 164.593, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(145.503, 171.239, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(141.403, 167.916, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(145.503, 154.624, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(145.503, 151.301, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(141.403, 147.978, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(141.403, 144.655, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(137.302, 141.332, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(137.302, 138.009, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(137.302, 134.686, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(215.215, 181.208, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(211.114, 177.885, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(207.014, 174.562, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(202.913, 171.239, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(198.812, 167.916, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(194.712, 164.593, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(190.611, 164.593, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(190.611, 161.27, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(186.51, 157.947, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(182.41, 157.947, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(178.309, 154.624, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(174.208, 151.301, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(170.107, 147.978, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(166.007, 147.978, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(166.007, 144.655, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(166.007, 141.332, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(161.906, 138.009, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(157.805, 134.686, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(207.014, 91.4876, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(211.114, 88.1646, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(215.215, 88.1646, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(219.316, 84.8416, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(223.416, 81.5187, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(227.517, 78.1957, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(75.7918, 91.4876, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(71.6912, 91.4876, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(67.5905, 88.1646, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(63.4898, 88.1646, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(59.3891, 91.4876, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(55.2885, 88.1646, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(55.2885, 84.8416, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(51.1878, 84.8416, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(47.0871, 84.8416, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(42.9864, 84.8416, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(38.8857, 81.5187, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(34.7851, 81.5187, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(30.6844, 81.5187, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(26.5837, 81.5187, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(22.483, 78.1957, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(18.3824, 74.8727, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(63.4898, 61.5809, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(59.3891, 58.2579, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(55.2885, 58.2579, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(55.2885, 54.935, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(51.1878, 54.935, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(47.0871, 51.612, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(42.9864, 48.289, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(38.8857, 48.289, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(34.7851, 44.9661, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(30.6844, 41.6431, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(26.5837, 38.3201, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(22.483, 34.9972, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(18.3824, 31.6742, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(112.698, 54.935, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(108.597, 54.935, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(104.497, 51.612, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(100.396, 48.289, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(100.396, 44.9661, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(100.396, 41.6431, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(96.2952, 38.3201, 4.1008, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(96.2952, 34.9972, 4.1008, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(92.1946, 31.6742, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(88.0939, 31.6742, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 28.3512, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(79.8925, 25.0283, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(75.7918, 21.7053, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(75.7918, 18.3824, 4.1006, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(137.302, 54.935, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(141.403, 51.612, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(141.403, 48.289, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(145.503, 44.9661, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(145.503, 41.6431, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(149.604, 38.3201, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(153.705, 38.3201, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(157.805, 31.6742, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(161.906, 28.3512, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(161.906, 25.0283, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(166.007, 25.0283, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(170.107, 21.7053, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(170.107, 18.3824, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(157.805, 34.9972, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(182.41, 61.5809, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(186.51, 58.2579, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(190.611, 54.935, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(194.712, 54.935, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(198.812, 51.612, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(202.913, 51.612, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(207.014, 48.289, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(211.114, 44.9661, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(215.215, 44.9661, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(219.316, 41.6431, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(219.316, 38.3201, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(223.416, 38.3201, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(227.517, 38.3201, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(47.0871, 154.624, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(42.9864, 151.301, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(38.8857, 151.301, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(34.7851, 147.978, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(198.812, 48.289, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(202.913, 44.9661, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(202.913, 41.6431, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(202.913, 38.3201, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(198.812, 34.9972, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(194.712, 31.6742, 4.1, 3.322, COLOR_LIGHT_GRAY);
        drawRect(34.7851, 51.612, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(30.6844, 51.612, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(26.5837, 54.935, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(112.698, 54.935, 4.101, 3.322, COLOR_DARK);
        drawRect(112.698, 58.2579, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(133.201, 58.2579, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(178.309, 64.9038, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(174.208, 64.9038, 4.101, 3.322, COLOR_LIGHT_GRAY);
        drawRect(202.913, 91.4876, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(198.812, 94.8105, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(202.913, 98.1335, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(207.014, 101.456, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(211.114, 101.456, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(194.712, 94.8105, 4.1, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(190.611, 94.8105, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(186.51, 98.1335, 4.101, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(79.8925, 94.8105, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(83.9932, 98.1335, 4.1007, 3.3229, COLOR_LIGHT_GRAY);
        drawRect(67.5905, 64.9038, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(71.6912, 68.2268, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(75.7918, 68.2268, 4.1006, 3.322, COLOR_LIGHT_GRAY);
        drawRect(79.8925, 71.5498, 4.1007, 3.322, COLOR_LIGHT_GRAY);
        drawRect(91.9118, 99.2647, 3.6764, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(95.5882, 99.2647, 3.6765, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(99.2647, 102.941, 3.6763, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(102.941, 99.2647, 3.6769, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(106.618, 95.5882, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(110.294, 95.5882, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(95.5882, 132.353, 3.6765, 3.676, COLOR_LIGHT_GRAY);
        drawRect(99.2647, 128.676, 3.6763, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(99.2647, 125, 3.6763, 3.676, COLOR_LIGHT_GRAY);
        drawRect(102.941, 121.324, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(106.618, 121.324, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(110.294, 117.647, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(117.647, 132.353, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(117.647, 128.676, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(113.971, 125, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(113.971, 121.324, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(139.706, 132.353, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(139.706, 128.676, 3.676, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(136.029, 125, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(132.353, 121.324, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(128.676, 121.324, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(128.676, 117.647, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(125, 117.647, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(121.324, 113.971, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(113.971, 113.971, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(117.647, 110.294, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(110.294, 99.2647, 3.6769, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(113.971, 102.941, 3.676, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(154.412, 132.353, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(150.735, 128.676, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(147.059, 125, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(143.382, 121.324, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(143.382, 117.647, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(139.706, 113.971, 3.676, 3.676, COLOR_LIGHT_GRAY);
        drawRect(136.029, 110.294, 3.6769, 3.676, COLOR_LIGHT_GRAY);
        drawRect(88.2353, 69.8529, 3.6765, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(91.9118, 73.5294, 3.6764, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(95.5882, 73.5294, 3.6765, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(99.2647, 77.2059, 3.6763, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(102.941, 80.8824, 3.6769, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(106.618, 80.8824, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(110.294, 77.2059, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(113.971, 80.8824, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(117.647, 84.5588, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(113.971, 55.1471, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(117.647, 58.8235, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(121.324, 62.5, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(125, 66.1765, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(125, 69.8529, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(121.324, 73.5294, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(121.324, 77.2059, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(121.324, 80.8824, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(128.676, 55.1471, 3.6769, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(125, 55.1471, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(125, 58.8235, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(165.441, 62.5, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(161.765, 66.1765, 3.6769, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(158.088, 69.8529, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(154.412, 69.8529, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(150.735, 73.5294, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(147.059, 73.5294, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(143.382, 77.2059, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(139.706, 80.8824, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(139.706, 84.5588, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(136.029, 88.2353, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(132.353, 88.2353, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(128.676, 84.5588, 3.6769, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(125, 80.8824, 3.676, 3.6764, COLOR_LIGHT_GRAY);
        drawRect(176.471, 99.2647, 3.676, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(172.794, 102.941, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(169.118, 102.941, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(165.441, 102.941, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(161.765, 99.2647, 3.6769, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(158.088, 99.2647, 3.676, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(154.412, 95.5882, 3.676, 3.6765, COLOR_LIGHT_GRAY);
        drawRect(150.735, 99.2647, 3.6769, 3.6763, COLOR_LIGHT_GRAY);
        drawRect(147.059, 102.941, 3.676, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(143.382, 102.941, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(139.706, 102.941, 3.676, 3.6769, COLOR_LIGHT_GRAY);
        drawRect(136.029, 102.941, 3.6769, 3.6769, COLOR_LIGHT_GRAY);
      }
    },
    [
      width,
      height,
      backgroundColor,
      borderColor,
      highlightColor,
      highlightColor2,
      alpha,
      busted,
    ]
  );

  return drawBorder;
}
