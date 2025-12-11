import { useState, useEffect } from "react";
import {
  DESKTOP_CANVAS_WIDTH,
  DESKTOP_CANVAS_HEIGHT,
  MOBILE_BREAKPOINT,
  BEVEL_PADDING_X,
  BEVEL_PADDING_Y,
} from "@/utils/games/common/canvasConstants";

export interface CanvasDimensions {
  canvasWidth: number;
  canvasHeight: number;
  wrapperWidth: number;
  wrapperHeight: number;
  isMobile: boolean;
}

/**
 * Custom hook to handle responsive canvas sizing
 * Uses requestAnimationFrame throttling for performance
 */
export function useResponsiveCanvas(): CanvasDimensions {
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    canvasWidth: DESKTOP_CANVAS_WIDTH,
    canvasHeight: DESKTOP_CANVAS_HEIGHT,
    wrapperWidth: DESKTOP_CANVAS_WIDTH + BEVEL_PADDING_X * 2,
    wrapperHeight: DESKTOP_CANVAS_HEIGHT + BEVEL_PADDING_Y * 2,
    isMobile: false,
  });

  useEffect(() => {
    let resizeRaf: number | null = null;

    const compute = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isMobileView = windowWidth < MOBILE_BREAKPOINT;

      if (isMobileView) {
        // Mobile: 100% of viewport
        const canvasWidth = windowWidth;
        const canvasHeight = windowHeight;

        setDimensions({
          canvasWidth,
          canvasHeight,
          wrapperWidth: canvasWidth,
          wrapperHeight: canvasHeight,
          isMobile: true,
        });
      } else {
        // Desktop: maintain aspect ratio with bevel
        const baseCanvasWidth = DESKTOP_CANVAS_WIDTH;
        const baseCanvasHeight = DESKTOP_CANVAS_HEIGHT;

        const paddingX = BEVEL_PADDING_X * 2;
        const paddingY = BEVEL_PADDING_Y * 2;
        const baseWrapperWidth = baseCanvasWidth + paddingX;
        const baseWrapperHeight = baseCanvasHeight + paddingY;

        // Calculate size that fits within viewport with margin
        const maxWidth = windowWidth * 0.95;
        const maxHeight = windowHeight * 0.95;

        let wrapperWidth = baseWrapperWidth;
        let wrapperHeight = baseWrapperHeight;

        // Scale down if needed to fit viewport (maintain aspect ratio)
        if (wrapperWidth > maxWidth || wrapperHeight > maxHeight) {
          const widthScale = maxWidth / baseWrapperWidth;
          const heightScale = maxHeight / baseWrapperHeight;
          const scale = Math.min(widthScale, heightScale);

          wrapperWidth = Math.floor(baseWrapperWidth * scale);
          wrapperHeight = Math.floor(baseWrapperHeight * scale);
        }

        // Calculate canvas dimensions from wrapper dimensions
        const canvasWidth = wrapperWidth - paddingX;
        const canvasHeight = wrapperHeight - paddingY;

        setDimensions({
          canvasWidth,
          canvasHeight,
          wrapperWidth,
          wrapperHeight,
          isMobile: false,
        });
      }
    };

    const handleResize = () => {
      if (resizeRaf !== null) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        compute();
      });
    };

    compute();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", handleResize as EventListener);
    };
  }, []);

  return dimensions;
}

