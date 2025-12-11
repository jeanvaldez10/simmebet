import { useCallback } from 'react';
import { TextStyle } from 'pixi.js';
import { ButtonSprite } from '../buttons/ButtonSprite';

interface ErrorContainerProps {
  error: string | null;
  style: TextStyle;
  width: number; // canvas width
  isActionInProgress?: boolean;
  onClearError?: () => void;
  x?: number;
  y?: number;
}

export const ErrorContainer = ({
  error,
  x,
  y,
  style,
  width,
  isActionInProgress = false,
  onClearError,
}: ErrorContainerProps) => {
  const handleClick = useCallback(() => {
    onClearError?.();
  }, [onClearError]);

  if (!error || isActionInProgress) {
    return null;
  }

  const message = String(error);
  // determine fontSize from style (fallback to 16)
  const rawFontSize = style.fontSize;
  const fontSize =
    typeof rawFontSize === 'number'
      ? rawFontSize
      : parseInt(String(rawFontSize), 12) || 16;

  const padding = 16;
  const approxCharWidth = fontSize * 0.6; // rough average char width
  const minWidth = 200;
  // ensure some margin from canvas edges
  const canvasMargin = 40;
  const maxAllowedWidth = Math.max(200, width - canvasMargin);
  const maxWidth = Math.min(maxAllowedWidth, 800);

  // estimate desired width based on content (clamped to min/max)
  let desiredWidth = Math.ceil(message.length * approxCharWidth) + padding * 2;
  desiredWidth = Math.max(minWidth, Math.min(maxWidth, desiredWidth));

  // container is centered on canvas
  return (
    <pixiContainer x={x} y={y} pivot={{ x: 0, y: -17 }}>
      <ButtonSprite
        text={message}
        x={0}
        y={0}
        width={desiredWidth}
        height={34}
        color={'red'}
        fontSize={12}
        zIndex={1003}
        radius={12}
        onClick={handleClick}
      />
    </pixiContainer>
  );
};
