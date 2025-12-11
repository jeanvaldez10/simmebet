import { useEffect, useState } from 'react';
import {
  preloadGameAssets,
  areAssetsLoaded,
} from '@/utils/games/blackjack/client/pixiAssets';
import { ASSET_LOADING_DELAY } from '@/utils/games/common/canvasConstants';

/**
 * Custom hook for managing asset loading and canvas ready state
 */
export function useAssetLoading() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const initializeCanvas = async () => {
      try {
        if (!areAssetsLoaded()) {
          await preloadGameAssets();
        }

        setTimeout(() => {
          setAssetsLoaded(true);
        }, ASSET_LOADING_DELAY);
      } catch (error) {
        console.error('Failed to load assets:', error);
      }
    };

    initializeCanvas();
  }, []);

  return { assetsLoaded };
}
