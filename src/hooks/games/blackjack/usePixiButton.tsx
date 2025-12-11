import { useCallback } from "react";
import { Graphics } from "pixi.js";

interface PixiSquareProps {
    width: number;
    height: number;
    colors?: {
        normal: number;
        hover: number;
        disabled: number;
        shadow: number;
    };
    opacity?: number;
    highlighted?: boolean;
    shadowColor?: number;
    isPressed?: boolean;
    disabled?: boolean;
    currentColor?: number;
}

export function usePixiButton({
    width,
    height,
    opacity,
    isPressed,
    disabled,
    shadowColor,
    colors,
    currentColor
}: PixiSquareProps) {
    const drawButton = useCallback(
        (g: Graphics) => {
            g.clear();
            const ORIGINAL_WIDTH = 122;
            const ORIGINAL_HEIGHT = 46;

            // scale factors
            const sx = width / ORIGINAL_WIDTH;
            const sy = height / ORIGINAL_HEIGHT;

            const offset = isPressed && !disabled ? 2 : 0;

            const ox = -width / 2 + offset;
            const oy = -height / 2 + offset;

            //
            // === Path 1 (gray outer frame) ===
            //
            const frameColor = disabled ? colors?.disabled : shadowColor;
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P1 = [
                [109.739, 46],
                [12.2605, 46],
                [12.2605, 43.2522],
                [4.08685, 43.2522],
                [4.08685, 40.5044],
                [0, 40.5044],
                [0, 7.53097],
                [4.08685, 7.53097],
                [4.08685, 4.78319],
                [12.2605, 4.78319],
                [12.2605, 2.0354],
                [109.739, 2.0354],
                [109.739, 4.78319],
                [117.913, 4.78319],
                [117.913, 7.53097],
                [122, 7.53097],
                [122, 40.5044],
                [117.913, 40.5044],
                [117.913, 43.2522],
                [109.739, 43.2522],
                [109.739, 46],
            ];

            g.moveTo(ox + P1[0][0] * sx, oy + P1[0][1] * sy);
            for (let i = 1; i < P1.length; i++) {
                g.lineTo(ox + P1[i][0] * sx, oy + P1[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 2 (white inner frame) ===
            //
            g.fill({ color: currentColor, alpha: opacity ?? 1 });

            const P2 = [
                [109.739, 43.9646],
                [12.2605, 43.9646],
                [12.2605, 41.2168],
                [4.08685, 41.2168],
                [4.08685, 38.469],
                [0, 38.469],
                [0, 5.49557],
                [4.08685, 5.49557],
                [4.08685, 2.74779],
                [12.2605, 2.74779],
                [12.2605, 0],
                [109.739, 0],
                [109.739, 2.74779],
                [117.913, 2.74779],
                [117.913, 5.49557],
                [122, 5.49557],
                [122, 38.469],
                [117.913, 38.469],
                [117.913, 41.2168],
                [109.739, 41.2168],
                [109.739, 43.9646],
            ];

            g.moveTo(ox + P2[0][0] * sx, oy + P2[0][1] * sy);
            for (let i = 1; i < P2.length; i++) {
                g.lineTo(ox + P2[i][0] * sx, oy + P2[i][1] * sy);
            }
            g.closePath();
            g.fill();
        },
        [width, height, isPressed, disabled, colors?.disabled, shadowColor, currentColor, opacity]
    );

    return drawButton;
}
