/**
 * PixiJS Button Sprite Component
 * Pixel art styled buttons with drop shadows and beveled edges
 */

import { useState } from 'react';
import { TextStyle } from 'pixi.js';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';
import { PixiSquareContainer } from '../containers';
import { getIconTexture } from '@/utils/games/common/pixiAssets';
import { usePixiButton } from '@/hooks/games/blackjack/usePixiButton';
import { BUTTON_COLORS } from '@/utils/games/blackjack/client/uiConfig';
import { ButtonSpriteProps } from '@/types/games/blackjack/ui';

export function ButtonSprite({
  text,
  x,
  y,
  width = 180,
  height = 60,
  color = 'blue',
  disabled = false,
  onClick,
  fontSize = 20,
  zIndex = 0,
  isMobile = false,
  subtitle,
  subtitleStyle,
  opacity,
  children,
  showShadow = true,
}: ButtonSpriteProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const dropShadowFilter = useDropShadowFilter();
  const colors = BUTTON_COLORS[color];
  const currentColor = disabled
    ? colors.disabled
    : isPressed
    ? colors.normal
    : isHovered
    ? colors.hover
    : colors.normal;

  const shadowColor = colors.shadow;

  const textStyle = new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: fontSize,
    fill:
      color === 'black'
        ? '#ffffff'
        : disabled
        ? '#666666'
        : color === 'white'
        ? '#000000'
        : '#ffffff',
    align: 'center',
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 1,
    ...(color !== 'white' &&
      color !== 'black' && {
        dropShadow: {
          color: '#00000080',
          distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
          angle: Math.atan2(1.5, 1.5),
          blur: 0,
        },
      }),
  });
  const textOverlayStyle = new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: fontSize,
    fill: disabled ? '#666666' : '#000000',
    align: 'center',
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 1,
  });
  const offsetY = isPressed && !disabled ? 2 : 0;
  const offsetX = isPressed && !disabled ? 2 : 2;
  const renderText = !children && text;
  return (
    <pixiContainer
      x={x}
      y={y}
      zIndex={zIndex}
      alpha={color === 'overlay' ? 0.78 : 1}
    >
      <pixiGraphics
        draw={usePixiButton({
          width,
          height,
          colors,
          shadowColor,
          isPressed,
          disabled,
          currentColor,
          opacity,
        })}
        filters={showShadow ? dropShadowFilter : undefined}
        eventMode={disabled ? 'none' : 'static'}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onPointerEnter={() => {
          if (!disabled) setIsHovered(true);
        }}
        onPointerLeave={() => {
          if (!disabled) {
            setIsHovered(false);
            setIsPressed(false);
          }
        }}
        onPointerDown={() => {
          if (!disabled) setIsPressed(true);
        }}
        onPointerUp={() => {
          if (!disabled) {
            setIsPressed(false);
            onClick?.();
          }
        }}
        onTap={() => !disabled && onClick?.()}
      />
      {renderText && (
        <>
          <pixiText
            text={text}
            anchor={0.5}
            x={offsetX}
            y={subtitle ? offsetY - fontSize * 0.6 : offsetY}
            style={color === 'overlay' ? textOverlayStyle : textStyle}
            eventMode="none"
            resolution={2}
          />
          {subtitle && (
            <pixiText
              text={subtitle}
              anchor={0.5}
              x={offsetX}
              y={offsetY + fontSize * 0.6}
              resolution={2}
              style={
                subtitleStyle
                  ? (() => {
                      const style = subtitleStyle.clone();
                      // Ensure white text for black buttons
                      if (color === 'black') {
                        style.fill = '#ffffff';
                      }
                      return style;
                    })()
                  : color === 'overlay'
                  ? textOverlayStyle
                  : textStyle
              }
              eventMode="none"
            />
          )}
          {text === 'FOREFIT' && (
            <PixiSquareContainer
              width={24}
              height={25}
              color={0xfe4c40}
              x={isMobile ? width + 12 : width}
              y={-height / 2}
              alpha={1}
            >
              <pixiSprite
                texture={getIconTexture('flag')}
                x={0}
                y={0}
                width={16}
                height={16}
                anchor={{ x: 0.5, y: 0.5 }}
              />
            </PixiSquareContainer>
          )}
        </>
      )}
      {/* CHILDREN-ONLY MODE */}
      {children && (
        <pixiContainer x={0} y={0} anchor={0.5}>
          {children}
        </pixiContainer>
      )}
    </pixiContainer>
  );
}
