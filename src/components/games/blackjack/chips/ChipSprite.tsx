/**
 * PixiJS Chip Sprite Component
 * Renders casino chips with stacking and particle effects
 */

import { useTick } from "@pixi/react";
import { Ref, useEffect, useRef, useState } from "react";
import { getChipTexture } from "@/utils/games/blackjack/client/pixiAssets";
import { Container } from "pixi.js";

interface ChipSpriteProps {
  value: number;
  x: number;
  y: number;
  scale?: number;
  animateIn?: boolean;
  animateOut?: boolean;
  animationDelay?: number;
  stackOffset?: number;
  zIndex?: number;
}

export function ChipSprite({
  value,
  x,
  y,
  scale = 1,
  animateIn = false,
  animateOut = false,
  animationDelay = 0,
  stackOffset = 0,
  zIndex = 0,
}: ChipSpriteProps) {
  const [currentY, setCurrentY] = useState(y + stackOffset); // Start at final position
  const [currentAlpha, setCurrentAlpha] = useState(1); // Always visible
  const [currentScale, setCurrentScale] = useState(scale);
  const animationTime = useRef(0);
  const animationStarted = useRef(false);
  const fadeOutStarted = useRef(false);

  useEffect(() => {
    if (animateIn) {
      animationStarted.current = true;
    }
  }, [animateIn]);

  useEffect(() => {
    if (animateOut) {
      fadeOutStarted.current = true;
      animationTime.current = 0; // Reset animation time for fade out
    }
  }, [animateOut]);

  useTick({
    callback: (ticker) => {
      animationTime.current += ticker.deltaTime;
      const elapsed = animationTime.current / 60;

      if (elapsed < animationDelay) return;

      // Handle fade-out animation (chips disappear when losing)
      if (animateOut && fadeOutStarted.current) {
        const fadeProgress = Math.min((elapsed - animationDelay) / 0.5, 1); // 0.5s fade out
        
        // Ease in cubic for smooth fade
        const eased = fadeProgress * fadeProgress * fadeProgress;
        
        // Fade out and fall down
        setCurrentAlpha(1 - eased);
        setCurrentY((y + stackOffset) + (50 * eased)); // Fall 50px down
        setCurrentScale(scale * (1 - eased * 0.3)); // Shrink slightly
        return;
      }

      // Handle fade-in animation (chips appear when placing bet)
      if (animateIn && animationStarted.current) {
        const animProgress = Math.min((elapsed - animationDelay) / 0.4, 1); // 0.4s animation

        // Ease out bounce
        const eased =
          animProgress < 0.5
            ? 4 * animProgress * animProgress * animProgress
            : 1 - Math.pow(-2 * animProgress + 2, 3) / 2;
        const targetY = y + stackOffset;
        setCurrentY(y - 200 + (200 + stackOffset) * eased);
        setCurrentAlpha(Math.min(animProgress * 2, 1));

        // Slight bounce at the end
        if (animProgress > 0.8) {
          const bounce = Math.sin((animProgress - 0.8) * Math.PI * 5) * 2;
          setCurrentY(targetY + bounce);
        }
      }
    },
    isEnabled: (animateIn && animationStarted.current) || (animateOut && fadeOutStarted.current),
  });

  let texture;
  try {
    texture = getChipTexture(value);
  } catch (error) {
    console.error(`Failed to load chip texture for value ${value}:`, error);
    return null;
  }
  const targetWidth = 44;
  const targetHeight = 46;
  const baseScaleX = targetWidth / texture.width;
  const baseScaleY = targetHeight / texture.height;
  const normalizedScale = Math.min(baseScaleX, baseScaleY) * scale;

  return (
    <pixiSprite
      texture={texture}
      x={x}
      y={currentY}
      anchor={0.5}
      scale={normalizedScale * 10 * currentScale / scale}
      alpha={currentAlpha}
      zIndex={zIndex}
    />
  );
}

interface ChipStackProps {
  chips: number[];
  x: number;
  y: number;
  scale?: number;
  animateIn?: boolean;
  animateOut?: boolean;
  ref: Ref<Container>;
}

export function ChipStack({
  chips,
  x,
  y,
  scale = 1,
  animateIn = false,
  animateOut = false,
  ref,
}: ChipStackProps) {
  // Horizontal stacking like original - each chip slightly overlaps the previous one
  // const chipWidth = 64 * scale; // Base chip width
  // const overlapAmount = 4 * scale; // How much chips overlap (negative margin from original)
  const chipWidth = 64 * scale;
  const totalWidth = chipWidth; // Always fixed width
  // const startX = -totalWidth / 2 + chipWidth / 2;

  return (
    <pixiContainer x={x} y={y} ref={ref}>
      {chips.map((chipValue, index) => {
        // Evenly space chips within 64px range
        const chipCount = chips.length;
        const chipX =
          chipCount === 1
            ? 0
            : -totalWidth / 2 + (index / (chipCount - 1)) * totalWidth;

        return (
          <ChipSprite
            key={`chip-${index}`}
            value={chipValue}
            x={chipX}
            y={0}
            scale={scale}
            stackOffset={0}
            animateIn={animateIn}
            animateOut={animateOut}
            animationDelay={index * 0.05}
            zIndex={index}
          />
        );
      })}
    </pixiContainer>
  );
}
