import { useCallback } from "react";
import { Graphics } from "pixi.js";

interface PixiVolumeButtonProps {
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

export function usePixiVolumeButton({
    width,
    height,
    opacity,
    disabled,
    shadowColor,
    colors,
    currentColor
}: PixiVolumeButtonProps) {
    const drawVolumeButton = useCallback(
        (g: Graphics) => {
            g.clear();
            const ORIGINAL_WIDTH = 44;
            const ORIGINAL_HEIGHT = 46;

            const sx = width / ORIGINAL_WIDTH;
            const sy = height / ORIGINAL_HEIGHT;

            const ox = -width / 2;
            const oy = -height / 2;

            const defaultGray = 0x9698a3;
            const frameColor = disabled ? colors?.disabled : (shadowColor ?? defaultGray);
            const fillColor = currentColor ?? 0xffffff;

            //
            // === Path 1: Outer frame (gray) ===
            //
            g.fill({ color: frameColor, alpha: opacity ?? 1 });

            const P1 = [
                [37.8824, 5.41101],
                [40.5882, 5.41101],
                [40.5882, 8.11694],
                [43.2941, 8.11694],
                [43.2941, 40.5881],
                [40.5882, 40.5881],
                [40.5882, 43.294],
                [37.8824, 43.294],
                [37.8824, 45.9999],
                [5.41176, 45.9999],
                [5.41176, 43.294],
                [2.70588, 43.294],
                [2.70588, 40.5881],
                [0, 40.5881],
                [0, 8.11694],
                [2.70588, 8.11694],
                [2.70588, 5.41101],
                [5.41176, 5.41101],
                [5.41176, 2.70508],
                [37.8824, 2.70508],
                [37.8824, 5.41101],
            ];

            g.moveTo(ox + P1[0][0] * sx, oy + P1[0][1] * sy);
            for (let i = 1; i < P1.length; i++) {
                g.lineTo(ox + P1[i][0] * sx, oy + P1[i][1] * sy);
            }
            g.closePath();
            g.fill();

            //
            // === Path 2: Inner frame (white) ===
            //
            g.fill({ color: fillColor, alpha: opacity ?? 1 });

            const P2 = [
                [37.8824, 2.70593],
                [40.5882, 2.70593],
                [40.5882, 5.41186],
                [43.2941, 5.41186],
                [43.2941, 37.883],
                [40.5882, 37.883],
                [40.5882, 40.5889],
                [37.8824, 40.5889],
                [37.8824, 43.2949],
                [5.41176, 43.2949],
                [5.41176, 40.5889],
                [2.70588, 40.5889],
                [2.70588, 37.883],
                [0, 37.883],
                [0, 5.41186],
                [2.70588, 5.41186],
                [2.70588, 2.70593],
                [5.41176, 2.70593],
                [5.41176, 0],
                [37.8824, 0],
                [37.8824, 2.70593],
            ];

            g.moveTo(ox + P2[0][0] * sx, oy + P2[0][1] * sy);
            for (let i = 1; i < P2.length; i++) {
                g.lineTo(ox + P2[i][0] * sx, oy + P2[i][1] * sy);
            }
            g.closePath();
            g.fill();
        },
        [width, height, disabled, colors?.disabled, shadowColor, currentColor, opacity]
    );

    return drawVolumeButton;
}

