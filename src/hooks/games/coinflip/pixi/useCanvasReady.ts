import { useEffect, useState } from 'react';
import type { ApplicationRef } from '@pixi/react';

/**
 * Custom hook for notifying parent component when canvas is ready
 * Calls onReady with true/false based on ready state
 * Notifies when initialLoading changes to indicate reloading state
 */
export function useCanvasReady({
  assetsLoaded,
  initialLoading,
  appRef,
  onReady,
}: {
  assetsLoaded: boolean;
  initialLoading: boolean;
  appRef: React.RefObject<ApplicationRef | null>;
  onReady?: (isReady: boolean) => void;
}) {
  const [canvasReady, setCanvasReady] = useState(false);

  // Track when Application is initialized and ready
  useEffect(() => {
    if (canvasReady) return;

    const checkAppReady = () => {
      if (appRef.current) {
        const app = appRef.current.getApplication();
        if (app && app.renderer) {
          // Application is ready when renderer exists
          setCanvasReady(true);
          return true;
        }
      }
      return false;
    };

    if (checkAppReady()) return;

    const intervalId = setInterval(() => {
      if (checkAppReady()) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [canvasReady, appRef]);

  // Calculate if everything is ready
  const isReady = assetsLoaded && canvasReady && !initialLoading;

  // Notify when ready state changes
  useEffect(() => {
    onReady?.(isReady);
  }, [isReady, onReady]);

  return { canvasReady, isReady };
}
