import { useResponsiveCanvas } from '@/hooks/games/blackjack/useResponsiveCanvas';
import { preloadCommonSounds } from '@/utils/games/blackjack/client/sounds';
import { ReactNode, useEffect, useState } from 'react';
import { CanvasLoadingOverlay } from './loading/CanvasLoadingOverlay';
import {
  BEVEL_PADDING_X,
  BEVEL_PADDING_Y,
} from '@/utils/games/common/canvasConstants';
import { BEVEL_IMAGE } from '@/utils/games/blackjack/client/uiConfig';
import { DevToolsToggle } from '../blackjack/dev/DevToolsToggle';

interface GameShellProps {
  CanvasComponent: React.ComponentType<{
    width: number;
    height: number;
    isMobile: boolean;
    onReady?: (isReady: boolean) => void;
    onSwitchMode: () => void;
  }>;
  devToolsContent?: ReactNode;
  enableDevTools?: boolean;
  balance?: number;
  onSwitchMode: () => void;
}
export function GameShell({
  CanvasComponent,
  enableDevTools,
  devToolsContent,
  onSwitchMode,
}: GameShellProps) {
  const [showDevTools, setShowDevTools] = useState(false);
  const [pixiReady, setPixiReady] = useState(false);
  const dimensions = useResponsiveCanvas();

  const isMobile = dimensions.isMobile;

  // Preload sounds on mount
  useEffect(() => {
    preloadCommonSounds();
  }, []);
  return (
    <div
      className="w-full text-white font-['Minecraft'] relative flex-1 flex items-center justify-center md:py-4 xl:py-5 2xl:py-8"
      style={
        isMobile
          ? { height: '100%', minHeight: '100dvh', maxHeight: '100dvh' }
          : {}
      }
    >
      {/* Dev Tools Toggle Button - Only in development */}
      <DevToolsToggle
        showDevTools={showDevTools}
        onToggle={() => setShowDevTools(!showDevTools)}
      />
      {enableDevTools && showDevTools && devToolsContent}

      <div className="flex flex-col items-center">
        {/* PixiJS Game Canvas - Responsive with aspect ratio */}
        <div
          className="relative"
          style={
            isMobile
              ? {
                  width: '100%',
                  height: '100%',
                }
              : {
                  width: `${dimensions.wrapperWidth}px`,
                  height: `${dimensions.wrapperHeight}px`,
                }
          }
        >
          {/* Bevel Frame - Only on desktop; remains visible while PIXI loads */}
          {!isMobile && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${BEVEL_IMAGE})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                zIndex: 10,
                willChange: 'transform',
                contain: 'paint',
              }}
            />
          )}

          {/* Canvas Container with padding */}
          <div
            className={`relative w-full h-full ${
              isMobile ? 'overflow-hidden' : ''
            }`}
            style={{
              padding: isMobile
                ? `0`
                : `${BEVEL_PADDING_Y}px ${BEVEL_PADDING_X}px`,
            }}
          >
            {/* Inner container with border radius - clips canvas to rounded corners */}
            <div
              className={`relative w-full h-full overflow-hidden ${
                isMobile ? 'rounded-0' : 'rounded-3xl'
              }`}
              style={
                isMobile
                  ? {
                      width: '100%',
                      height: '100%',
                    }
                  : {
                      width: `${dimensions.canvasWidth}px`,
                      height: `${dimensions.canvasHeight}px`,
                    }
              }
            >
              {/* Felt background + centered loading text (only while PIXI not ready) */}
              <CanvasLoadingOverlay show={!pixiReady} />
              <CanvasComponent
                width={
                  isMobile ? dimensions.wrapperWidth : dimensions.canvasWidth
                }
                height={
                  isMobile ? dimensions.wrapperHeight : dimensions.canvasHeight
                }
                isMobile={isMobile}
                onReady={(isReady) => setPixiReady(isReady)}
                onSwitchMode={onSwitchMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
