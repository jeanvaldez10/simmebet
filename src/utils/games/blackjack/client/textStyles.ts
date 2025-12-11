/**
 * Text styles for PixiJS text rendering
 * Centralized text styling for consistent appearance
 */

import { TextStyle } from "pixi.js";

export const TEXT_STYLES = {
  message: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 16,
    fill: "#ffffff",
    align: "center",
    stroke: { color: "#000000", width: 4 },
    letterSpacing: 2,
  }),
} as const;

