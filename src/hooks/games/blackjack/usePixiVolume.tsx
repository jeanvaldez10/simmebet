import { useCallback } from "react";
import { Graphics } from "pixi.js";

interface PixiVolumeProps {
    width: number;
    height: number;
    colors?: {
        normal: number;
        hover: number;
        disabled: number;
        shadow: number;
    };
    opacity?: number;
    shadowColor?: number;
    disabled?: boolean;
    currentColor?: number;
}

export function usePixiVolume({
    width,
    height,
    opacity,
    disabled,
    shadowColor,
    colors,
    currentColor
}: PixiVolumeProps) {
    const drawVolume = useCallback(
        (g: Graphics) => {
            g.clear();
            const ORIGINAL_WIDTH = 304;
            const ORIGINAL_HEIGHT = 46;

            const sx = width / ORIGINAL_WIDTH;
            const sy = height / ORIGINAL_HEIGHT;

            const ox = -width / 2;
            const oy = -height / 2;

            const defaultGray = 0x9698a3;
            const frameColor = disabled ? colors?.disabled : (shadowColor ?? defaultGray);
            const fillColor = currentColor ?? 0xffffff;

            //
            // === Path 1: Right section outer frame (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P1 = [
                [297.647, 5.41177],
                [300.353, 5.41177],
                [300.353, 8.11765],
                [303.059, 8.11765],
                [303.059, 40.5882],
                [300.353, 40.5882],
                [300.353, 43.2941],
                [297.647, 43.2941],
                [297.647, 46],
                [265.176, 46],
                [265.176, 43.2941],
                [262.471, 43.2941],
                [262.471, 40.5882],
                [259.765, 40.5882],
                [259.765, 8.11765],
                [262.471, 8.11765],
                [262.471, 5.41177],
                [265.176, 5.41177],
                [265.176, 2.70588],
                [297.647, 2.70588],
                [297.647, 5.41177],
            ];

            g.moveTo(ox + P1[0][0] * sx, oy + P1[0][1] * sy);
            for (let i = 1; i < P1.length; i++) {
                g.lineTo(ox + P1[i][0] * sx, oy + P1[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 2: Right section inner frame (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P2 = [
                [297.647, 2.70588],
                [300.353, 2.70588],
                [300.353, 5.41177],
                [303.059, 5.41177],
                [303.059, 37.8824],
                [300.353, 37.8824],
                [300.353, 40.5882],
                [297.647, 40.5882],
                [297.647, 43.2941],
                [265.176, 43.2941],
                [265.176, 40.5882],
                [262.471, 40.5882],
                [262.471, 37.8824],
                [259.765, 37.8824],
                [259.765, 5.41177],
                [262.471, 5.41177],
                [262.471, 2.70588],
                [265.176, 2.70588],
                [265.176, 0],
                [297.647, 0],
                [297.647, 2.70588],
            ];

            g.moveTo(ox + P2[0][0] * sx, oy + P2[0][1] * sy);
            for (let i = 1; i < P2.length; i++) {
                g.lineTo(ox + P2[i][0] * sx, oy + P2[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 3: Main section outer frame (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P3 = [
                [254.355, 5.41139],
                [257.061, 5.41139],
                [257.061, 8.11729],
                [259.765, 8.11729],
                [259.765, 40.5882],
                [257.061, 40.5882],
                [257.061, 43.2941],
                [254.355, 43.2941],
                [254.355, 46],
                [5.41182, 46],
                [5.41182, 43.2941],
                [2.70591, 43.2941],
                [2.70591, 40.5882],
                [0, 40.5882],
                [0, 8.11729],
                [2.70591, 8.11729],
                [2.70591, 5.41139],
                [5.41182, 5.41139],
                [5.41182, 2.70548],
                [254.355, 2.70548],
                [254.355, 5.41139],
            ];

            g.moveTo(ox + P3[0][0] * sx, oy + P3[0][1] * sy);
            for (let i = 1; i < P3.length; i++) {
                g.lineTo(ox + P3[i][0] * sx, oy + P3[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 4: Main section inner frame (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P4 = [
                [254.355, 2.70548],
                [257.061, 2.70591],
                [257.061, 5.41139],
                [259.765, 5.41139],
                [259.765, 37.8824],
                [257.061, 37.8824],
                [257.061, 40.5882],
                [254.355, 40.5882],
                [254.355, 43.2941],
                [5.41182, 43.2941],
                [5.41182, 40.5882],
                [2.70591, 40.5882],
                [2.70591, 37.8824],
                [0, 37.8824],
                [0, 5.41182],
                [2.70591, 5.41182],
                [2.70591, 2.70591],
                [5.41182, 2.70548],
                [5.41182, 0],
                [254.355, 0],
                [254.355, 2.70548],
            ];

            g.moveTo(ox + P4[0][0] * sx, oy + P4[0][1] * sy);
            for (let i = 1; i < P4.length; i++) {
                g.lineTo(ox + P4[i][0] * sx, oy + P4[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 5: Connection piece (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P5 = [
                [254.355, 40.5886],
                [257.061, 40.5882],
                [257.061, 43.2941],
                [254.355, 43.2941],
                [254.355, 40.5886],
            ];

            g.moveTo(ox + P5[0][0] * sx, oy + P5[0][1] * sy);
            for (let i = 1; i < P5.length; i++) {
                g.lineTo(ox + P5[i][0] * sx, oy + P5[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 6: Connection piece (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P6 = [
                [254.355, 43.2941],
                [257.061, 43.2941],
                [257.059, 46],
                [254.355, 46],
                [254.355, 43.2941],
            ];

            g.moveTo(ox + P6[0][0] * sx, oy + P6[0][1] * sy);
            for (let i = 1; i < P6.length; i++) {
                g.lineTo(ox + P6[i][0] * sx, oy + P6[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 7: Connection piece (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P7 = [
                [257.061, 40.5882],
                [259.765, 40.5882],
                [259.765, 43.2941],
                [257.061, 43.2941],
                [257.061, 40.5882],
            ];

            g.moveTo(ox + P7[0][0] * sx, oy + P7[0][1] * sy);
            for (let i = 1; i < P7.length; i++) {
                g.lineTo(ox + P7[i][0] * sx, oy + P7[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 8: Connection piece (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P8 = [
                [257.061, 43.2941],
                [259.765, 43.2941],
                [259.765, 46],
                [257.059, 46],
                [257.061, 43.2941],
            ];

            g.moveTo(ox + P8[0][0] * sx, oy + P8[0][1] * sy);
            for (let i = 1; i < P8.length; i++) {
                g.lineTo(ox + P8[i][0] * sx, oy + P8[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 9: Connection piece (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P9 = [
                [259.765, 40.5882],
                [262.471, 40.5882],
                [262.471, 43.2941],
                [259.765, 43.2941],
                [259.765, 40.5882],
            ];

            g.moveTo(ox + P9[0][0] * sx, oy + P9[0][1] * sy);
            for (let i = 1; i < P9.length; i++) {
                g.lineTo(ox + P9[i][0] * sx, oy + P9[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 10: Connection piece (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P10 = [
                [259.765, 43.2941],
                [262.471, 43.2941],
                [262.471, 46],
                [259.765, 46],
                [259.765, 43.2941],
            ];

            g.moveTo(ox + P10[0][0] * sx, oy + P10[0][1] * sy);
            for (let i = 1; i < P10.length; i++) {
                g.lineTo(ox + P10[i][0] * sx, oy + P10[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 11: Connection piece (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P11 = [
                [262.471, 40.5882],
                [265.176, 40.5882],
                [265.176, 43.2941],
                [262.471, 43.2941],
                [262.471, 40.5882],
            ];

            g.moveTo(ox + P11[0][0] * sx, oy + P11[0][1] * sy);
            for (let i = 1; i < P11.length; i++) {
                g.lineTo(ox + P11[i][0] * sx, oy + P11[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 12: Connection piece (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P12 = [
                [262.471, 43.2941],
                [265.176, 43.2941],
                [265.176, 46],
                [262.471, 46],
                [262.471, 43.2941],
            ];

            g.moveTo(ox + P12[0][0] * sx, oy + P12[0][1] * sy);
            for (let i = 1; i < P12.length; i++) {
                g.lineTo(ox + P12[i][0] * sx, oy + P12[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 13: Connection piece (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P13 = [
                [257.061, 37.8827],
                [259.765, 37.8824],
                [259.765, 40.5882],
                [257.061, 40.5882],
                [257.061, 37.8827],
            ];

            g.moveTo(ox + P13[0][0] * sx, oy + P13[0][1] * sy);
            for (let i = 1; i < P13.length; i++) {
                g.lineTo(ox + P13[i][0] * sx, oy + P13[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 14: Connection piece (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P14 = [
                [259.765, 37.8824],
                [262.471, 37.8824],
                [262.471, 40.5882],
                [259.765, 40.5882],
                [259.765, 37.8824],
            ];

            g.moveTo(ox + P14[0][0] * sx, oy + P14[0][1] * sy);
            for (let i = 1; i < P14.length; i++) {
                g.lineTo(ox + P14[i][0] * sx, oy + P14[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 15: Top connection (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P15 = [
                [265.176, 2.70588],
                [262.471, 2.70588],
                [262.471, 0],
                [265.176, 0],
                [265.176, 2.70588],
            ];

            g.moveTo(ox + P15[0][0] * sx, oy + P15[0][1] * sy);
            for (let i = 1; i < P15.length; i++) {
                g.lineTo(ox + P15[i][0] * sx, oy + P15[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 16: Top connection (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P16 = [
                [262.471, 2.70588],
                [259.765, 2.70588],
                [259.765, 0],
                [262.471, 0],
                [262.471, 2.70588],
            ];

            g.moveTo(ox + P16[0][0] * sx, oy + P16[0][1] * sy);
            for (let i = 1; i < P16.length; i++) {
                g.lineTo(ox + P16[i][0] * sx, oy + P16[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 17: Top connection (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P17 = [
                [259.765, 2.70588],
                [257.061, 2.70591],
                [257.059, 0],
                [259.765, 0],
                [259.765, 2.70588],
            ];

            g.moveTo(ox + P17[0][0] * sx, oy + P17[0][1] * sy);
            for (let i = 1; i < P17.length; i++) {
                g.lineTo(ox + P17[i][0] * sx, oy + P17[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 18: Top connection (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P18 = [
                [257.061, 2.70591],
                [254.355, 2.70548],
                [254.355, 0],
                [257.059, 0],
                [257.061, 2.70591],
            ];

            g.moveTo(ox + P18[0][0] * sx, oy + P18[0][1] * sy);
            for (let i = 1; i < P18.length; i++) {
                g.lineTo(ox + P18[i][0] * sx, oy + P18[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 19: Top connection (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P19 = [
                [262.471, 5.41177],
                [259.765, 5.41177],
                [259.765, 2.70588],
                [262.471, 2.70588],
                [262.471, 5.41177],
            ];

            g.moveTo(ox + P19[0][0] * sx, oy + P19[0][1] * sy);
            for (let i = 1; i < P19.length; i++) {
                g.lineTo(ox + P19[i][0] * sx, oy + P19[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 20: Top connection (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P20 = [
                [259.765, 5.41177],
                [257.061, 5.41139],
                [257.061, 2.70591],
                [259.765, 2.70588],
                [259.765, 5.41177],
            ];

            g.moveTo(ox + P20[0][0] * sx, oy + P20[0][1] * sy);
            for (let i = 1; i < P20.length; i++) {
                g.lineTo(ox + P20[i][0] * sx, oy + P20[i][1] * sy);
            }
            g.closePath();
            g.fill();
        },
        [width, height, disabled, colors?.disabled, shadowColor, currentColor, opacity]
    );

    return drawVolume;
}
