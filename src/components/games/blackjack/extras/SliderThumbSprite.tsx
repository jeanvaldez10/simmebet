/**
 * PixiJS Slider Thumb Sprite Component
 * Renders a slider thumb pattern using PixiJS Graphics
 */

import { usePixiSliderThumb } from '@/hooks/games/blackjack/usePixiSliderThumb';

interface SliderThumbSpriteProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  opacity?: number;
  zIndex?: number;
  anchor?: { x: number; y: number };
}

export function SliderThumbSprite({
  x,
  y,
  width = 16,
  height = 17,
  opacity = 1,
  zIndex = 0,
  anchor = { x: 0, y: 0 },
}: SliderThumbSpriteProps) {
  const drawThumb = usePixiSliderThumb({
    width,
    height,
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

