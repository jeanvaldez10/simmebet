import { useCallback } from 'react';
import { Graphics } from 'pixi.js';

interface PixiSquareProps {
  width: number;
  height: number;
  color?: number;
  alpha?: number;
  highlighted?: boolean;
}

export function usePixiSquare({
  width,
  height,
  color,
  alpha,
  highlighted = false,
}: PixiSquareProps) {
  const drawSquare = useCallback(
    (g: Graphics) => {
      g.clear();

      const ORIGINAL_WIDTH = 100;
      const ORIGINAL_HEIGHT = 100;

      const sx = width / ORIGINAL_WIDTH;
      const sy = height / ORIGINAL_HEIGHT;

      const ox = -width / 2;
      const oy = -height / 2;

      const pathPoints = [
        [89.9504, 100],
        [10.0496, 100],
        [10.0496, 93.75],
        [3.34988, 93.75],
        [3.34988, 87.5],
        [0, 87.5],
        [0, 12.5],
        [3.34988, 12.5],
        [3.34988, 6.25],
        [10.0496, 6.25],
        [10.0496, 0],
        [89.9504, 0],
        [89.9504, 6.25],
        [96.6501, 6.25],
        [96.6501, 12.5],
        [100, 12.5],
        [100, 87.5],
        [96.6501, 87.5],
        [96.6501, 93.75],
        [89.9504, 93.75],
      ];

      //
      // ---- FILL ----
      //
      g.fill({ color: color ?? 0x000000, alpha: alpha ?? 0.5 });
      g.moveTo(ox + pathPoints[0][0] * sx, oy + pathPoints[0][1] * sy);

      for (let i = 1; i < pathPoints.length; i++) {
        g.lineTo(ox + pathPoints[i][0] * sx, oy + pathPoints[i][1] * sy);
      }

      g.closePath();
      g.fill();

      //
      // ---- 1px WHITE BORDER ----
      //
      if (highlighted) {
        const avgScale = (Math.abs(sx) + Math.abs(sy)) / 2 || 1;
        const strokeWidth = 1 / avgScale;

        g.stroke({
          color: 0xffffff,
          width: strokeWidth,
          alpha: 1,
          alignment: 0.5,
        });

        g.moveTo(ox + pathPoints[0][0] * sx, oy + pathPoints[0][1] * sy);

        for (let i = 1; i < pathPoints.length; i++) {
          g.lineTo(ox + pathPoints[i][0] * sx, oy + pathPoints[i][1] * sy);
        }

        g.closePath();
        g.stroke();
      }
    },
    [width, height, color, alpha, highlighted]
  );

  return drawSquare;
}
