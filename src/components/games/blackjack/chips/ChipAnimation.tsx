/**
 * Chip Animation Component
 * Handles sliding animations for chips between positions
 */

import { useTick } from '@pixi/react';
import { useEffect, useRef, useState } from 'react';
import { getChipTexture } from '@/utils/games/blackjack/client/pixiAssets';

interface ChipAnimationProps {
  chips: number[];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
  onComplete?: () => void;
  onSoundTrigger?: () => void;
  soundTriggerProgress?: number;
  zIndex?: number;
  fadeOut?: boolean;
  startVisible?: boolean;
}

export function ChipAnimation({
  chips,
  startX,
  startY,
  endX,
  endY,
  duration = 1.0,
  onComplete,
  onSoundTrigger,
  soundTriggerProgress = 0.9,
  zIndex = 1000,
  fadeOut = false,
  startVisible = false,
}: ChipAnimationProps) {
  const [chipStates, setChipStates] = useState<
    Array<{
      x: number;
      y: number;
      alpha: number;
      rotation: number;
      scale: number;
    }>
  >(
    chips.map(() => ({
      x: startX,
      y: startY,
      alpha: startVisible ? 1 : 0,
      rotation: 0,
      scale: startVisible ? 1.0 : 0.8,
    }))
  );
  const animationTime = useRef(0);
  const soundTriggered = useRef(false);
  const completed = useRef(false);
  const isActive = useRef(true);

  useEffect(() => {
    isActive.current = true;
    animationTime.current = 0;
    soundTriggered.current = false;
    completed.current = false;
    setChipStates(
      chips.map(() => ({
        x: startX,
        y: startY,
        alpha: startVisible ? 1 : 0,
        rotation: 0,
        scale: startVisible ? 1.0 : 0.8,
      }))
    );
  }, [chips.length, startX, startY, endX, endY, startVisible, chips]);

  useTick({
    callback: (ticker) => {
      if (!isActive.current || completed.current) return;

      const deltaTime = (ticker.deltaMS ?? 16.666) / 1000;
      animationTime.current += deltaTime;
      const progress = Math.min(animationTime.current / duration, 1);

      // Smooth ease-out for natural deceleration
      // const eased = 1 - Math.pow(1 - progress, 2.5);

      // Update states for all chips with staggered delays
      setChipStates((prev) =>
        prev.map((state, index) => {
          const chipDelay = index * 0.08;
          const chipTime = Math.max(0, animationTime.current - chipDelay);
          const chipProgress = Math.min(chipTime / duration, 1);

          // Ease out for position
          const chipEased = 1 - Math.pow(1 - chipProgress, 2.5);

          // Handle alpha based on startVisible and fadeOut
          let alpha = startVisible ? 1 : 0;
          if (startVisible) {
            // If starting visible (like loss animation replacing static chips), stay visible
            if (fadeOut && chipProgress > 0.6) {
              // Fade out in last 40% of animation
              const fadeOutProgress = (chipProgress - 0.6) / 0.4;
              alpha = 1 - fadeOutProgress;
            } else {
              // Stay fully visible throughout
              alpha = 1;
            }
          } else {
            // Starting invisible (like win animation), fade in
            if (fadeOut) {
              // Fade in then fade out
              if (chipProgress > 0.6) {
                const fadeOutProgress = (chipProgress - 0.6) / 0.4;
                alpha = 1 - fadeOutProgress;
              } else {
                alpha = Math.min(chipProgress * 3, 1);
              }
            } else {
              // Just fade in quickly at start
              alpha = Math.min(chipProgress * 3, 1);
            }
          }

          // Slight rotation during animation for visual interest
          const rotation =
            chipProgress * Math.PI * 0.3 * (index % 2 === 0 ? 1 : -1);

          // Scale animation
          let scale = 1.0;
          if (startVisible) {
            // If starting visible, stay at full size (replacing static chips)
            if (fadeOut && chipProgress > 0.6) {
              // Shrink slightly when fading out
              const fadeOutProgress = (chipProgress - 0.6) / 0.4;
              scale = 1.0 - fadeOutProgress * 0.3;
            } else {
              scale = 1.0;
            }
          } else {
            // Starting invisible, grow in with bounce
            if (chipProgress < 0.2) {
              // Grow in
              const growProgress = chipProgress / 0.2;
              scale = 0.8 + 0.2 * growProgress;
            } else {
              // Full size with slight bounce
              scale = 1.0;
              if (chipProgress < 0.3) {
                const bounce =
                  Math.sin((chipProgress - 0.2) * Math.PI * 10) * 0.05;
                scale = 1.0 + bounce;
              }
              // Shrink slightly when fading out
              if (fadeOut && chipProgress > 0.6) {
                const fadeOutProgress = (chipProgress - 0.6) / 0.4;
                scale = 1.0 - fadeOutProgress * 0.3;
              }
            }
          }

          return {
            x: startX + (endX - startX) * chipEased,
            y: startY + (endY - startY) * chipEased,
            alpha,
            rotation,
            scale,
          };
        })
      );

      // Trigger sound at specified progress
      if (
        onSoundTrigger &&
        !soundTriggered.current &&
        progress >= soundTriggerProgress
      ) {
        onSoundTrigger();
        soundTriggered.current = true;
      }

      // Complete animation
      if (progress >= 1) {
        completed.current = true;
        isActive.current = false;
        onComplete?.();
      }
    },
    isEnabled: isActive.current && !completed.current,
  });

  return (
    <>
      {chips.map((chipValue, index) => {
        const state = chipStates[index];
        if (!state) return null;

        // For startVisible chips, always render if state exists
        // For non-startVisible chips, skip if alpha is 0 and animation has started
        if (!startVisible && state.alpha === 0 && animationTime.current > 0.1)
          return null;

        let texture;
        try {
          texture = getChipTexture(chipValue);
        } catch {
          return null;
        }

        // Match the scale used in SideBet component (scale={0.1})
        const targetWidth = 44;
        const targetHeight = 46;
        const baseScaleX = targetWidth / texture.width;
        const baseScaleY = targetHeight / texture.height;
        const normalizedScale = Math.min(baseScaleX, baseScaleY);
        const finalScale = normalizedScale * 10 * 0.1 * state.scale; // 0.1 to match SideBet scale

        // Add slight spread for multiple chips (reduced spread)
        const spreadX = (index - (chips.length - 1) / 2) * 3;
        const spreadY = (index - (chips.length - 1) / 2) * 2;

        return (
          <pixiSprite
            key={`anim-chip-${index}`}
            texture={texture}
            x={state.x + spreadX}
            y={state.y + spreadY}
            anchor={0.5}
            scale={finalScale}
            rotation={state.rotation}
            alpha={state.alpha}
            zIndex={zIndex + index}
          />
        );
      })}
    </>
  );
}
