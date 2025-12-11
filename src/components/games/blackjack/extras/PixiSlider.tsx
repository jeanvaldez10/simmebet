/**
 * PixiJS Slider Component
 * Combines track (SliderTrackSprite) and thumb (SliderThumbSprite) with interactive dragging
 */

import { useState, useRef, useCallback } from 'react';
import type { FederatedPointerEvent, Container } from 'pixi.js';
import { SliderTrackSprite } from './SliderTrackSprite';
import { SliderThumbSprite } from './SliderThumbSprite';

interface PixiSliderProps {
  x: number;
  y: number;
  width?: number;
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  trackHeight?: number;
  thumbWidth?: number;
  thumbHeight?: number;
  zIndex?: number;
}

export function PixiSlider({
  x,
  y,
  width = 115,
  min = 0,
  max = 100,
  value: controlledValue,
  defaultValue = 50,
  step = 1,
  disabled = false,
  onChange,
  onDragStart,
  onDragEnd,
  trackHeight = 6,
  thumbWidth = 16,
  thumbHeight = 17,
  zIndex = 0,
}: PixiSliderProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const trackRef = useRef<Container | null>(null);
  const thumbRef = useRef<Container | null>(null);

  const currentValue = isControlled ? controlledValue : internalValue;

  const clampValue = useCallback(
    (val: number) => {
      const clamped = Math.max(min, Math.min(max, val));
      return step > 0 ? Math.round(clamped / step) * step : clamped;
    },
    [min, max, step]
  );

  const valueToPosition = useCallback(
    (val: number) => {
      const normalized = (val - min) / (max - min);
      return normalized * (width - thumbWidth) + thumbWidth / 2;
    },
    [min, max, width, thumbWidth]
  );

  const positionToValue = useCallback(
    (pos: number) => {
      const effectiveWidth = width - thumbWidth;
      const adjustedPos = Math.max(thumbWidth / 2, Math.min(width - thumbWidth / 2, pos));
      const normalized = (adjustedPos - thumbWidth / 2) / effectiveWidth;
      return clampValue(min + normalized * (max - min));
    },
    [min, max, width, thumbWidth, clampValue]
  );

  const updateValue = useCallback(
    (newValue: number) => {
      const clampedValue = clampValue(newValue);
      if (!isControlled) {
        setInternalValue(clampedValue);
      }
      onChange?.(clampedValue);
    },
    [isControlled, onChange, clampValue]
  );

  const handlePointerDown = useCallback(
    (event: FederatedPointerEvent) => {
      if (disabled || !trackRef.current) return;

      const localPoint = event.data.getLocalPosition(trackRef.current);
      const newValue = positionToValue(localPoint.x);
      updateValue(newValue);
      setIsDragging(true);
      onDragStart?.();
    },
    [disabled, positionToValue, updateValue, onDragStart]
  );

  const handleThumbPointerDown = useCallback(
    (event: FederatedPointerEvent) => {
      if (disabled || !trackRef.current) return;

      event.stopPropagation();
      setIsDragging(true);
      onDragStart?.();
    },
    [disabled, onDragStart]
  );

  const handleGlobalPointerMove = useCallback(
    (event: FederatedPointerEvent) => {
      if (!isDragging || disabled || !trackRef.current) return;

      const globalPoint = event.data.global;
      const trackBounds = trackRef.current.getBounds();
      const localX = globalPoint.x - trackBounds.x;
      const newValue = positionToValue(localX);
      updateValue(newValue);
    },
    [isDragging, disabled, positionToValue, updateValue]
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  const thumbX = valueToPosition(currentValue);
  const thumbY = (trackHeight - thumbHeight) / 2;

  return (
    <pixiContainer
      ref={containerRef}
      x={x}
      y={y}
      zIndex={zIndex}
      eventMode={isDragging ? 'static' : 'passive'}
      onGlobalPointerMove={isDragging ? handleGlobalPointerMove : undefined}
      onPointerUp={isDragging ? handlePointerUp : undefined}
      onPointerUpOutside={isDragging ? handlePointerUp : undefined}
    >
      <pixiContainer
        ref={trackRef}
        x={0}
        y={0}
        eventMode={disabled ? 'none' : 'static'}
        cursor={disabled ? 'not-allowed' : 'pointer'}
        onPointerDown={handlePointerDown}
      >
        <SliderTrackSprite
          x={0}
          y={thumbY + thumbHeight / 2 - trackHeight / 2}
          width={width}
          height={trackHeight}
          opacity={disabled ? 0.5 : 1}
          value={currentValue}
          min={min}
          max={max}
        />
      </pixiContainer>
      <pixiContainer
        ref={thumbRef}
        x={thumbX}
        y={thumbY}
        zIndex={thumbHeight}
        eventMode={disabled ? 'none' : 'static'}
        cursor={disabled ? 'not-allowed' : 'grab'}
        onPointerDown={handleThumbPointerDown}
      >
        <SliderThumbSprite
          x={0}
          y={0}
          width={thumbWidth}
          height={thumbHeight}
          opacity={disabled ? 0.5 : 1}
          anchor={{ x: 0.5, y: 0 }}
        />
      </pixiContainer>
    </pixiContainer>
  );
}

