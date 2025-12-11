import { TextStyle } from 'pixi.js';
import { ButtonSprite } from '../buttons/ButtonSprite';

interface FreePlayBannerProps {
  text: string;
  style: TextStyle;
  width: number;
  x?: number;
  y?: number;
  isMobile: boolean;
  onCLick?: () => void;
}

export const GameModeBanner = ({
  text,
  x,
  y,
  style,
  isMobile,
}: FreePlayBannerProps) => {
  const rawFontSize = style.fontSize;
  const fontSize =
    typeof rawFontSize === 'number'
      ? rawFontSize
      : parseInt(String(rawFontSize), 12) || 16;

  const padding = 16;
  const approxCharWidth = fontSize * 0.6;
  const minWidth = 160;

  const desiredWidth = Math.max(
    minWidth,
    Math.ceil(text.length * approxCharWidth) + padding * 2
  );

  return (
    <pixiContainer x={x} y={y} pivot={{ x: 0, y: -15 }}>
      <ButtonSprite
        text={text}
        x={0}
        y={0}
        width={desiredWidth}
        height={isMobile ? 25 : 30}
        color={'blue'}
        fontSize={12}
        zIndex={1003}
        radius={12}
      />
    </pixiContainer>
  );
};
