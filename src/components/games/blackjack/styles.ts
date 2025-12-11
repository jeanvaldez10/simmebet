import { TextStyle } from "pixi.js";
const dropShadowStyle = {
  color: "#00000080",
  distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
  angle: Math.atan2(1.5, 1.5),
  blur: 0,
}
// Shared UI Styles
export const UI_STYLES = {
  balance: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#ffffff",
    align: "center",
    letterSpacing: 1,
  }),
  chipLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    fill: "#000000",
    fontWeight: "bold",
    align: "center",
  }),
  ModalTitle: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 24,
    fill: "#ffffff",
    align: "center",
    letterSpacing: 0,
    fontWeight: "500",
    dropShadow: dropShadowStyle,
  }),
  xLLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 24,
    align: "center",
    fontWeight: "500",
    dropShadow: dropShadowStyle,
    fill: "#ffffff",
  }),
  baseLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 16,
    align: "center",
    fontWeight: "500",
    dropShadow: dropShadowStyle,
    fill: "#ffffff",
  }),
  smLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 14,
    align: "center",
    fontWeight: "500",
    dropShadow: dropShadowStyle,
    fill: "#ffffff",
  }),
  xsLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 12,
    align: "center",
    fontWeight: "500",
    dropShadow: dropShadowStyle,
    fill: "#ffffff",
  }),
  xxsLabel: new TextStyle({
    fontFamily: "Minecraft, monospace",
    fontSize: 10,
    align: "center",
    fontWeight: "500",
    dropShadow: dropShadowStyle,
    fill: "#ffffff",
    wordWrap: true,
    wordWrapWidth: 62,
  }),
};



