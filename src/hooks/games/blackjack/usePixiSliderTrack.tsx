import { useCallback } from 'react';
import { Graphics } from 'pixi.js';


interface PixiSliderTrackProps {
  width?: number;
  height?: number;
  opacity?: number;
  value?: number;
  min?: number;
  max?: number;
}


export function usePixiSliderTrack({
  width = 87,
  height = 6,
  opacity = 1,
  value = 0,
  min = 0,
  max = 100,
}: PixiSliderTrackProps) {
  const drawTrack = useCallback(
    (g: Graphics) => {
      g.clear();


      const ORIGINAL_WIDTH = 87;
      const BORDER_PATTERN_WIDTH = 115;
      const BORDER_PATTERN_HEIGHT = 12;


      const sx = width / ORIGINAL_WIDTH;
      const borderSx = width / BORDER_PATTERN_WIDTH;
      const borderSy = height / BORDER_PATTERN_HEIGHT;


      // First: Draw the original border pattern as base
      g.fill({ color: 0x182325, alpha: opacity });


      const rectangles = [
        { x: 0, y: 5.56528, w: 2.48015, h: 2.78264 },
        { x: 0, y: 2.78264, w: 2.48015, h: 2.78264 },
        { x: 2.48015, y: 0, w: 2.48015, h: 2.78264 },
        { x: 2.48015, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 4.9603, y: 0, w: 2.48015, h: 2.78264 },
        { x: 4.9603, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 7.44045, y: 0, w: 2.48015, h: 2.78264 },
        { x: 7.44045, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 9.92061, y: 0, w: 2.48015, h: 2.78264 },
        { x: 9.92061, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 12.4008, y: 0, w: 2.48015, h: 2.78264 },
        { x: 12.4008, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 14.8809, y: 0, w: 2.48015, h: 2.78264 },
        { x: 14.8809, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 17.3611, y: 0, w: 2.48015, h: 2.78264 },
        { x: 17.3611, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 19.8412, y: 0, w: 2.48015, h: 2.78264 },
        { x: 19.8412, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 22.3214, y: 0, w: 2.48015, h: 2.78264 },
        { x: 22.3214, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 24.8015, y: 0, w: 2.48015, h: 2.78264 },
        { x: 24.8015, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 27.2817, y: 0, w: 2.48015, h: 2.78264 },
        { x: 27.2817, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 29.7618, y: 0, w: 2.48015, h: 2.78264 },
        { x: 29.7618, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 32.242, y: 0, w: 2.48015, h: 2.78264 },
        { x: 32.242, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 34.7221, y: 0, w: 2.48015, h: 2.78264 },
        { x: 34.7221, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 37.2023, y: 0, w: 2.48015, h: 2.78264 },
        { x: 37.2023, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 39.6824, y: 0, w: 2.48015, h: 2.78264 },
        { x: 39.6824, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 42.1626, y: 0, w: 2.48015, h: 2.78264 },
        { x: 42.1626, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 44.6427, y: 0, w: 2.48015, h: 2.78264 },
        { x: 44.6427, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 47.1229, y: 0, w: 2.48015, h: 2.78264 },
        { x: 47.1229, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 49.603, y: 0, w: 2.48015, h: 2.78264 },
        { x: 49.603, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 52.0832, y: 0, w: 2.48015, h: 2.78264 },
        { x: 52.0832, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 54.5633, y: 0, w: 2.48015, h: 2.78264 },
        { x: 54.5633, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 57.0435, y: 0, w: 2.48015, h: 2.78264 },
        { x: 57.0435, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 59.5236, y: 0, w: 2.48015, h: 2.78264 },
        { x: 59.5236, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 62.0038, y: 0, w: 2.48015, h: 2.78264 },
        { x: 62.0038, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 64.4839, y: 0, w: 2.48015, h: 2.78264 },
        { x: 64.4839, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 66.9641, y: 0, w: 2.48015, h: 2.78264 },
        { x: 66.9641, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 69.4442, y: 0, w: 2.48015, h: 2.78264 },
        { x: 69.4442, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 71.9244, y: 0, w: 2.48015, h: 2.78264 },
        { x: 71.9244, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 74.4045, y: 0, w: 2.48015, h: 2.78264 },
        { x: 74.4045, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 76.8847, y: 0, w: 2.48015, h: 2.78264 },
        { x: 76.8847, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 79.3649, y: 0, w: 2.48015, h: 2.78264 },
        { x: 79.3649, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 81.845, y: 0, w: 2.48015, h: 2.78264 },
        { x: 81.845, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 84.3252, y: 0, w: 2.48015, h: 2.78264 },
        { x: 84.3252, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 86.8053, y: 0, w: 2.48015, h: 2.78264 },
        { x: 86.8053, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 89.2855, y: 0, w: 2.48015, h: 2.78264 },
        { x: 89.2855, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 91.7656, y: 0, w: 2.48015, h: 2.78264 },
        { x: 91.7656, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 94.2458, y: 0, w: 2.48015, h: 2.78264 },
        { x: 94.2458, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 96.7259, y: 0, w: 2.48015, h: 2.78264 },
        { x: 96.7259, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 99.2061, y: 0, w: 2.48015, h: 2.78264 },
        { x: 99.2061, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 101.686, y: 0, w: 2.48015, h: 2.78264 },
        { x: 101.686, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 104.166, y: 0, w: 2.48015, h: 2.78264 },
        { x: 104.166, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 106.647, y: 0, w: 2.48015, h: 2.78264 },
        { x: 106.647, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 109.127, y: 0, w: 2.48015, h: 2.78264 },
        { x: 109.127, y: 8.34792, w: 2.48015, h: 2.78264 },
        { x: 111.607, y: 2.78264, w: 2.48015, h: 2.78264 },
        { x: 111.607, y: 5.56528, w: 2.48015, h: 2.78264 },
      ];


      rectangles.forEach((rect) => {
        g.rect(
          rect.x * borderSx,
          rect.y * borderSy,
          rect.w * borderSx,
          rect.h * borderSy
        );
        g.fill();
      });


      // Then: Add the blue gradient track color from SVG (only if value > 0)
      // The gradient should be drawn from the content area, not from the edge
      if (value > min) {
        const normalizedValue = Math.max(
          0,
          Math.min(1, (value - min) / (max - min))
        );
        const filledWidth = width * normalizedValue;


        // Calculate padding from edges (e.g., 2px on each side)
        const horizontalPadding = 2 * sx;
        const startX = horizontalPadding;
        const filledWidthScaled = Math.max(
          0,
          (filledWidth / width) * (86.2609 * sx - horizontalPadding * 2)
        );



        const BORDER_PATTERN_TOP_END = 2.78264; // End of top border in original 12px
        const BORDER_PATTERN_BOTTOM_START = 8.34792; // Start of bottom border in original 12px
        const contentAreaTop = (BORDER_PATTERN_TOP_END / BORDER_PATTERN_HEIGHT) * height;
        const contentAreaBottom = (BORDER_PATTERN_BOTTOM_START / BORDER_PATTERN_HEIGHT) * height;
        const contentAreaCenter = (contentAreaTop + contentAreaBottom) / 2;

        const gradientHeight = height / 2;
        const halfGradientHeight = gradientHeight / 2;

        // Center gradient in the content area (excluding border pattern)
        // Move up by 1px for better visual alignment
        const gradientTopY = contentAreaCenter - halfGradientHeight - 0.5;
        const gradientMiddleY = contentAreaCenter - 0.5;


        // Top rectangle: #0092FF (light blue) - from top to middle
        g.fill({ color: 0x0092ff, alpha: opacity });
        g.rect(startX, gradientTopY, filledWidthScaled, halfGradientHeight);
        g.fill();


        // Bottom rectangle: #005AAD (darker blue) - from middle to bottom
        g.fill({ color: 0x005aad, alpha: opacity });
        g.rect(startX, gradientMiddleY, filledWidthScaled, halfGradientHeight);
        g.fill();
      }
    },
    [width, height, opacity, value, min, max]
  );


  return drawTrack;
}

