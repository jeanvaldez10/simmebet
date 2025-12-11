import { useCallback } from 'react';
import { Graphics } from 'pixi.js';

interface PixiSliderThumbProps {
  width?: number;
  height?: number;
  opacity?: number;
}

const COLORS = {
  white: 0xffffff,
  lightGray: 0xc9ccdb,
  mediumGray: 0x9698a3,
  darkGray: 0x182325,
};

export function usePixiSliderThumb({
  width = 16,
  height = 17,
  opacity = 1,
}: PixiSliderThumbProps) {
  const drawThumb = useCallback(
    (g: Graphics) => {
      g.clear();

      const ORIGINAL_WIDTH = 16;
      const ORIGINAL_HEIGHT = 17;

      const sx = width / ORIGINAL_WIDTH;
      const sy = height / ORIGINAL_HEIGHT;

      const rectangles = [
        { x: 3.82609, y: 4.17396, w: 3.82608, h: 4.17396, color: COLORS.white },
        {
          x: 7.65217,
          y: 4.17396,
          w: 3.82613,
          h: 4.17396,
          color: COLORS.lightGray,
        },
        {
          x: 3.82609,
          y: 8.34792,
          w: 3.82608,
          h: 4.17398,
          color: COLORS.lightGray,
        },
        {
          x: 7.65217,
          y: 8.34792,
          w: 3.82613,
          h: 4.17398,
          color: COLORS.mediumGray,
        },
        {
          x: 3.82609,
          y: 12.5219,
          w: 3.82608,
          h: 4.1739,
          color: COLORS.darkGray,
        },
        {
          x: 7.65217,
          y: 12.5219,
          w: 3.82613,
          h: 4.1739,
          color: COLORS.darkGray,
        },
        {
          x: 11.4783,
          y: 8.34792,
          w: 3.826,
          h: 4.17398,
          color: COLORS.darkGray,
        },
        {
          x: 11.4783,
          y: 4.17396,
          w: 3.826,
          h: 4.17396,
          color: COLORS.darkGray,
        },
        { x: 7.65217, y: 0, w: 3.82613, h: 4.17396, color: COLORS.darkGray },
        { x: 3.82609, y: 0, w: 3.82608, h: 4.17396, color: COLORS.darkGray },
        { x: 0, y: 4.17396, w: 3.82609, h: 4.17396, color: COLORS.darkGray },
        { x: 0, y: 8.34792, w: 3.82609, h: 4.17398, color: COLORS.darkGray },
      ];

      rectangles.forEach((rect) => {
        g.fill({ color: rect.color, alpha: opacity });
        g.rect(rect.x * sx, rect.y * sy, rect.w * sx, rect.h * sy);
        g.fill();
      });
    },
    [width, height, opacity]
  );

  return drawThumb;
}
