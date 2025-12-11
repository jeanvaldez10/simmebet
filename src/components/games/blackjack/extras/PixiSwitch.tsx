/**
 * PixiJS Switch Toggle Component
 * A toggle switch with animated thumb that slides between positions
 */

import { useState, useCallback } from 'react';
import { SwitchThumbSprite } from './SwitchThumbSprite';
import { useTick } from '@pixi/react';
import { getUITexture } from '@/utils/games/common/pixiAssets';

interface PixiSwitchProps {
  x: number;
  y: number;
  width: number;
  height: number;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  zIndex?: number;
}

export function PixiSwitch({
  x,
  y,
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  onChange,
  zIndex = 0,
  width,
  height
}: PixiSwitchProps) {
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const currentChecked = isControlled ? controlledChecked : internalChecked;

  // Animation state
  // Thumb should move from left edge (when unchecked) to right edge (when checked) of square container (width and height)
  const thumbSize = height; // Correct thumb size
  const leftX = -width / 2 + thumbSize / 2; // Left edge position (unchecked)
  const rightX = width / 2 - thumbSize / 2; // Right edge position (checked)
  const [thumbX, setThumbX] = useState(currentChecked ? rightX : leftX);
  const targetX = currentChecked ? rightX : leftX;

  // Smooth animation
  useTick(() => {
    if (Math.abs(thumbX - targetX) > 0.5) {
      setThumbX((prev) => prev + (targetX - prev) * 0.15);
    } else {
      setThumbX(targetX);
    }
  });

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newChecked = !currentChecked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  }, [disabled, currentChecked, isControlled, onChange]);

  return (
    <pixiContainer
      x={x}
      y={y}
      width={width}
      height={height}
      eventMode={disabled ? 'none' : 'static'}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      onPointerDown={handleToggle}
      zIndex={zIndex}
    >
      <pixiSprite
        texture={getUITexture('switch')}
        x={0}
        y={0}
        width={width}
        height={height}
        anchor={0.5}
        zIndex={1}
      />
      <SwitchThumbSprite
        x={thumbX}
        y={0}
        width={thumbSize}
        height={thumbSize}
        isActive={currentChecked}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={1}
      />
    </pixiContainer>
  );
}
