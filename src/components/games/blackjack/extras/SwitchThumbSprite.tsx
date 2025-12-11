/**
 * PixiJS Switch Thumb Sprite Component
 * Renders the switch thumb icon
 */

import { usePixiSwitchThumb } from '@/hooks/games/blackjack/usePixiSwitchThumb';

interface SwitchThumbSpriteProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  isActive?: boolean;
  opacity?: number;
  zIndex?: number;
  anchor?: { x: number; y: number };
}

export function SwitchThumbSprite({
  x,
  y,
  width = 10,
  height = 10,
  isActive = false,
  opacity = 1,
  zIndex = 0,
  anchor = { x: 0.5, y: 0.5 },
}: SwitchThumbSpriteProps) {
  const drawThumb = usePixiSwitchThumb({
    width,
    height,
    isActive,
    opacity,
  });

  const offsetX = -width * anchor.x;
  const offsetY = -height * anchor.y;

  return (
    <pixiContainer x={x} y={y} zIndex={zIndex}>
      <pixiGraphics
        draw={drawThumb}
        x={offsetX}
        y={offsetY}
      />
    </pixiContainer>
  );
}

