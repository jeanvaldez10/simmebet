import { useCallback } from 'react';
import { Graphics } from 'pixi.js';

interface PixiSwitchThumbProps {
  width?: number;
  height?: number;
  isActive?: boolean; // Active (checked) state uses blue colors, inactive uses gray
  opacity?: number;
}

export function usePixiSwitchThumb({
  width = 15,
  height = 15,
  isActive = false,
  opacity = 1,
}: PixiSwitchThumbProps) {
  const drawThumb = useCallback(
    (g: Graphics) => {
      g.clear();

      const ORIGINAL_WIDTH = 15;
      const ORIGINAL_HEIGHT = 15;

      const sx = width / ORIGINAL_WIDTH;
      const sy = height / ORIGINAL_HEIGHT;

      // Color mapping based on active/inactive state
      const getColor = (originalColor: string): number => {
        if (isActive) {
          // Active state: blue colors
          switch (originalColor) {
            case '#005AAD':
              return 0x005aad;
            case '#0372D9':
              return 0x0372d9;
            case '#0092FF':
              return 0x0092ff;
            case '#45AFFF':
              return 0x45afff;
            case 'white':
              return 0xffffff;
            default:
              return 0xffffff;
          }
        } else {
          // Inactive state: gray colors
          switch (originalColor) {
            case '#9698A3':
              return 0x9698a3;
            case '#B9BBC7':
              return 0xb9bbc7;
            case '#C9CCDB':
              return 0xc9ccdb;
            case '#DFE0E5':
              return 0xdfe0e5;
            case 'white':
              return 0xffffff;
            default:
              return 0xffffff;
          }
        }
      };

      const drawRect = (
        gx: number,
        gy: number,
        gwidth: number,
        gheight: number,
        colorStr: string
      ) => {
        g.fill({ color: getColor(colorStr), alpha: opacity });
        g.rect(gx * sx, gy * sy, gwidth * sx, gheight * sy);
        g.fill();
      };

      // All path definitions - using active SVG colors when isActive, inactive colors otherwise
      if (isActive) {
        // Active state: blue colors from the new 15x15 SVG
        drawRect(1.84245, 11.0547, 1.84245, 1.8424, '#005AAD');
        drawRect(3.6849, 12.8971, 1.84244, 1.8425, '#005AAD');
        drawRect(3.6849, 11.0547, 1.84244, 1.8424, '#0372D9');
        drawRect(5.52734, 12.8971, 1.84245, 1.8425, '#005AAD');
        drawRect(5.52734, 11.0547, 1.84245, 1.8424, '#0372D9');
        drawRect(7.36979, 12.8971, 1.84245, 1.8425, '#005AAD');
        drawRect(7.36979, 11.0547, 1.84245, 1.8424, '#0372D9');
        drawRect(9.21224, 12.8971, 1.84246, 1.8425, '#005AAD');
        drawRect(9.21224, 11.0547, 1.84246, 1.8424, '#0372D9');
        drawRect(11.0547, 11.0547, 1.8424, 1.8424, '#0372D9');
        drawRect(12.8971, 9.21224, 1.8425, 1.84246, '#0092FF');
        drawRect(12.8971, 7.36979, 1.8425, 1.84245, '#0092FF');
        drawRect(12.8971, 5.52734, 1.8425, 1.84245, '#0092FF');
        drawRect(12.8971, 3.6849, 1.8425, 1.84244, '#0092FF');
        drawRect(11.0547, 1.84245, 1.8424, 1.84245, '#0092FF');
        drawRect(11.0547, 3.6849, 1.8424, 1.84244, '#45AFFF');
        drawRect(11.0547, 5.52734, 1.8424, 1.84245, '#45AFFF');
        drawRect(11.0547, 7.36979, 1.8424, 1.84245, '#0092FF');
        drawRect(11.0547, 9.21224, 1.8424, 1.84246, '#0092FF');
        drawRect(9.21224, 0, 1.84246, 1.84245, '#0092FF');
        drawRect(9.21224, 1.84245, 1.84246, 1.84245, '#45AFFF');
        drawRect(9.21224, 3.6849, 1.84246, 1.84244, 'white');
        drawRect(9.21224, 5.52734, 1.84246, 1.84245, 'white');
        drawRect(9.21224, 7.36979, 1.84246, 1.84245, '#45AFFF');
        drawRect(9.21224, 9.21224, 1.84246, 1.84246, '#0092FF');
        drawRect(7.36979, 0, 1.84245, 1.84245, '#0092FF');
        drawRect(7.36979, 1.84245, 1.84245, 1.84245, '#45AFFF');
        drawRect(7.36979, 3.6849, 1.84245, 1.84244, 'white');
        drawRect(7.36979, 5.52734, 1.84245, 1.84245, 'white');
        drawRect(7.36979, 7.36979, 1.84245, 1.84245, '#45AFFF');
        drawRect(7.36979, 9.21224, 1.84245, 1.84246, '#0092FF');
        drawRect(5.52734, 0, 1.84245, 1.84245, '#0092FF');
        drawRect(5.52734, 1.84245, 1.84245, 1.84245, '#0092FF');
        drawRect(5.52734, 3.6849, 1.84245, 1.84244, '#45AFFF');
        drawRect(5.52734, 5.52734, 1.84245, 1.84245, '#45AFFF');
        drawRect(5.52734, 7.36979, 1.84245, 1.84245, '#0092FF');
        drawRect(5.52734, 9.21224, 1.84245, 1.84246, '#0092FF');
        drawRect(3.6849, 0, 1.84244, 1.84245, '#0092FF');
        drawRect(3.6849, 1.84245, 1.84244, 1.84245, '#0092FF');
        drawRect(3.6849, 3.6849, 1.84244, 1.84244, '#0092FF');
        drawRect(3.6849, 5.52734, 1.84244, 1.84245, '#0092FF');
        drawRect(3.6849, 7.36979, 1.84244, 1.84245, '#0092FF');
        drawRect(3.6849, 9.21224, 1.84244, 1.84246, '#0372D9');
        drawRect(1.84245, 1.84245, 1.84245, 1.84245, '#0372D9');
        drawRect(1.84245, 3.6849, 1.84245, 1.84244, '#0372D9');
        drawRect(1.84245, 5.52734, 1.84245, 1.84245, '#0372D9');
        drawRect(1.84245, 7.36979, 1.84245, 1.84245, '#0372D9');
        drawRect(1.84245, 9.21224, 1.84245, 1.84246, '#0372D9');
        drawRect(0, 3.6849, 1.84245, 1.84244, '#005AAD');
        drawRect(0, 5.52734, 1.84245, 1.84245, '#005AAD');
        drawRect(0, 7.36979, 1.84245, 1.84245, '#005AAD');
        drawRect(0, 9.21224, 1.84245, 1.84246, '#005AAD');
      } else {
        // Inactive state: gray colors (same positions as active, different colors)
        drawRect(1.84245, 11.0547, 1.84245, 1.8424, '#9698A3');
        drawRect(3.6849, 12.8971, 1.84244, 1.8425, '#9698A3');
        drawRect(3.6849, 11.0547, 1.84244, 1.8424, '#B9BBC7');
        drawRect(5.52734, 12.8971, 1.84245, 1.8425, '#9698A3');
        drawRect(5.52734, 11.0547, 1.84245, 1.8424, '#B9BBC7');
        drawRect(7.36979, 12.8971, 1.84245, 1.8425, '#9698A3');
        drawRect(7.36979, 11.0547, 1.84245, 1.8424, '#B9BBC7');
        drawRect(9.21224, 12.8971, 1.84246, 1.8425, '#9698A3');
        drawRect(9.21224, 11.0547, 1.84246, 1.8424, '#B9BBC7');
        drawRect(11.0547, 11.0547, 1.8424, 1.8424, '#B9BBC7');
        drawRect(12.8971, 9.21224, 1.8425, 1.84246, '#C9CCDB');
        drawRect(12.8971, 7.36979, 1.8425, 1.84245, '#C9CCDB');
        drawRect(12.8971, 5.52734, 1.8425, 1.84245, '#C9CCDB');
        drawRect(12.8971, 3.6849, 1.8425, 1.84244, '#C9CCDB');
        drawRect(11.0547, 1.84245, 1.8424, 1.84245, '#C9CCDB');
        drawRect(11.0547, 3.6849, 1.8424, 1.84244, '#DFE0E5');
        drawRect(11.0547, 5.52734, 1.8424, 1.84245, '#DFE0E5');
        drawRect(11.0547, 7.36979, 1.8424, 1.84245, '#C9CCDB');
        drawRect(11.0547, 9.21224, 1.8424, 1.84246, '#C9CCDB');
        drawRect(9.21224, 0, 1.84246, 1.84245, '#C9CCDB');
        drawRect(9.21224, 1.84245, 1.84246, 1.84245, '#DFE0E5');
        drawRect(9.21224, 3.6849, 1.84246, 1.84244, 'white');
        drawRect(9.21224, 5.52734, 1.84246, 1.84245, 'white');
        drawRect(9.21224, 7.36979, 1.84246, 1.84245, '#DFE0E5');
        drawRect(9.21224, 9.21224, 1.84246, 1.84246, '#C9CCDB');
        drawRect(7.36979, 0, 1.84245, 1.84245, '#C9CCDB');
        drawRect(7.36979, 1.84245, 1.84245, 1.84245, '#DFE0E5');
        drawRect(7.36979, 3.6849, 1.84245, 1.84244, 'white');
        drawRect(7.36979, 5.52734, 1.84245, 1.84245, 'white');
        drawRect(7.36979, 7.36979, 1.84245, 1.84245, '#DFE0E5');
        drawRect(7.36979, 9.21224, 1.84245, 1.84246, '#C9CCDB');
        drawRect(5.52734, 0, 1.84245, 1.84245, '#C9CCDB');
        drawRect(5.52734, 1.84245, 1.84245, 1.84245, '#C9CCDB');
        drawRect(5.52734, 3.6849, 1.84245, 1.84244, '#DFE0E5');
        drawRect(5.52734, 5.52734, 1.84245, 1.84245, '#DFE0E5');
        drawRect(5.52734, 7.36979, 1.84245, 1.84245, '#C9CCDB');
        drawRect(5.52734, 9.21224, 1.84245, 1.84246, '#C9CCDB');
        drawRect(3.6849, 0, 1.84244, 1.84245, '#C9CCDB');
        drawRect(3.6849, 1.84245, 1.84244, 1.84245, '#C9CCDB');
        drawRect(3.6849, 3.6849, 1.84244, 1.84244, '#C9CCDB');
        drawRect(3.6849, 5.52734, 1.84244, 1.84245, '#C9CCDB');
        drawRect(3.6849, 7.36979, 1.84244, 1.84245, '#C9CCDB');
        drawRect(3.6849, 9.21224, 1.84244, 1.84246, '#B9BBC7');
        drawRect(1.84245, 1.84245, 1.84245, 1.84245, '#B9BBC7');
        drawRect(1.84245, 3.6849, 1.84245, 1.84244, '#B9BBC7');
        drawRect(1.84245, 5.52734, 1.84245, 1.84245, '#B9BBC7');
        drawRect(1.84245, 7.36979, 1.84245, 1.84245, '#B9BBC7');
        drawRect(1.84245, 9.21224, 1.84245, 1.84246, '#B9BBC7');
        drawRect(0, 3.6849, 1.84245, 1.84244, '#9698A3');
        drawRect(0, 5.52734, 1.84245, 1.84245, '#9698A3');
        drawRect(0, 7.36979, 1.84245, 1.84245, '#9698A3');
        drawRect(0, 9.21224, 1.84245, 1.84246, '#9698A3');
      }
    },
    [width, height, isActive, opacity]
  );

  return drawThumb;
}
