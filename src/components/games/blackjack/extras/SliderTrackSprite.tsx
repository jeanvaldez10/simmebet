/**
 * PixiJS Slider Track Sprite Component
 * Renders the slider track with blue gradient pattern
 */

import { usePixiSliderTrack } from '@/hooks/games/blackjack/usePixiSliderTrack';

interface SliderTrackSpriteProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  opacity?: number;
  zIndex?: number;
  anchor?: { x: number; y: number };
  value?: number;
  min?: number;
  max?: number;
}

export function SliderTrackSprite({
  x,
  y,
  width = 87,
  height = 6,
  opacity = 1,
  zIndex = 0,
  anchor = { x: 0, y: 0 },
  value = 0,
  min = 0,
  max = 100,
}: SliderTrackSpriteProps) {
  const drawTrack = usePixiSliderTrack({
    width,
    height,
    opacity,
    value,
    min,
    max,
  });

  const offsetX = -width * anchor.x;
  const offsetY = -height * anchor.y;

  return (
    <pixiContainer x={x} y={y} zIndex={zIndex}>
      <pixiGraphics
        draw={drawTrack}
        x={offsetX}
        y={offsetY}
      />
    </pixiContainer>
  );
}

