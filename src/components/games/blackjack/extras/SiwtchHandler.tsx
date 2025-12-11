import { useState } from 'react';
import { usePixiSwitchBg } from '@/hooks/games/blackjack/usePixiSwitchBg';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';

interface PixiSideBetContainerProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  children?: React.ReactNode;
  rotation?: number;
  interactive?: boolean;
  onClick?: () => void;
}

export function SwitchHandler({
  width,
  height,
  x = 0,
  y = 0,
  children,
  rotation = 180,
  interactive = false,
  onClick,
}: PixiSideBetContainerProps) {
  const [isPressed, setIsPressed] = useState(false);
  const dropShadowFilter = useDropShadowFilter();

  return (
    <pixiContainer x={x} y={y} rotation={rotation} zIndex={1002}>
      <pixiGraphics
        draw={usePixiSwitchBg({
          width,
          height,
          isPressed,
        })}
        x={0}
        y={0}
        eventMode={interactive ? 'static' : 'none'}
        cursor={interactive ? 'pointer' : 'default'}
        onPointerDown={() => {
          if (interactive) setIsPressed(true);
        }}
        onPointerUp={() => {
          if (interactive) {
            setIsPressed(false);
            onClick?.();
          }
        }}
        onPointerUpOutside={() => {
          if (interactive) setIsPressed(false);
        }}
        onTap={onClick}
        filters={dropShadowFilter}
      />
      {children}
    </pixiContainer>
  );
}
