/**
 * MarblingBackgroundSprite Component
 *
 * A Pixi.js sprite component that renders a background with an animated marbling effect
 * using a displacement filter. Designed to be used inside a Pixi Application/Canvas.
 */

'use client';

import { useTick } from '@pixi/react';
import { DisplacementFilter, Sprite, Texture } from 'pixi.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createDisplacementTexture } from '@/utils/marbling/generateDisplacementMap';

interface MarblingBackgroundSpriteProps {
  /** Background texture to apply the marbling effect to */
  backgroundTexture: Texture;
  /** Width of the sprite */
  width: number;
  /** Height of the sprite */
  height: number;
  /** X position */
  x?: number;
  /** Y position */
  y?: number;
  /** Displacement filter scale (default: 20) */
  displacementScale?: number;
  /** Animation speed in pixels per frame (default: 0.3) */
  animationSpeed?: number;
  /** Enable debug logging for diagnosing animation glitches */
  debug?: boolean;
}

export function MarblingBackgroundSprite({
  backgroundTexture,
  width,
  height,
  x = 0,
  y = 0,
  displacementScale = 20,
  animationSpeed = 0.3,
  debug = false,
}: MarblingBackgroundSpriteProps) {
  const displacementSpriteRef = useRef<Sprite | null>(null);
  const backgroundSpriteRef = useRef<Sprite | null>(null);
  const filterRef = useRef<DisplacementFilter | null>(null);
  const [displacementTexture, setDisplacementTexture] =
    useState<Texture | null>(null);
  const [isMounted, setIsMounted] = useState(true);
  const debugStateRef = useRef<{ lastTickLog: number }>({
    lastTickLog: 0,
  });
  const phaseRef = useRef(0);

  const debugLog = useCallback(
    (message: string, payload?: Record<string, unknown>) => {
      if (!debug) return;
      console.log(`[MarblingBackground] ${message}`, payload ?? {});
    },
    [debug]
  );

  useEffect(() => {
    setIsMounted(true);
    debugLog('Mount', {
      width,
      height,
      displacementScale,
      animationSpeed,
    });
    return () => {
      setIsMounted(false);
      debugLog('Unmount');
    };
  }, [animationSpeed, displacementScale, height, width, debugLog]);

  // Generate displacement texture once
  useEffect(() => {
    debugLog('Generating displacement texture');
    const texture = createDisplacementTexture(512);
    setDisplacementTexture(texture);
    debugLog('Displacement texture ready', {
      baseWidth: texture.width,
      baseHeight: texture.height,
    });
  }, [debugLog]);

  // Initialize displacement filter when sprites are ready
  useEffect(() => {
    if (
      displacementSpriteRef.current &&
      backgroundSpriteRef.current &&
      displacementTexture &&
      !filterRef.current
    ) {
      debugLog('Initializing displacement filter');
      filterRef.current = new DisplacementFilter({
        sprite: displacementSpriteRef.current,
        scale: displacementScale,
      });

      // Apply filter to background sprite
      backgroundSpriteRef.current.filters = [filterRef.current];
    }
  }, [displacementTexture, displacementScale, debugLog]);

  // Animate displacement sprite position using Pixi ticker with seamless wrapping
  useTick({
    callback: (ticker) => {
      if (
        !isMounted ||
        !displacementSpriteRef.current ||
        displacementSpriteRef.current.destroyed
      ) {
        return;
      }

      const deltaSeconds = (ticker.deltaMS ?? 16.666) / 1000;
      const phaseSpeed = animationSpeed * 0.2; // slower, consistent speed

      phaseRef.current += phaseSpeed * deltaSeconds * Math.PI * 2;
      if (phaseRef.current > Math.PI * 2) {
        phaseRef.current -= Math.PI * 2;
      }

      const amplitudeX = Math.min(width, height) * 0.12;
      const amplitudeY = Math.min(width, height) * 0.18;
      displacementSpriteRef.current.x = Math.cos(phaseRef.current) * amplitudeX;
      displacementSpriteRef.current.y = Math.sin(phaseRef.current) * amplitudeY;

      if (
        debug &&
        (!Number.isFinite(displacementSpriteRef.current.x) ||
          !Number.isFinite(displacementSpriteRef.current.y))
      ) {
        debugLog('Detected non-finite displacement values', {
          x: displacementSpriteRef.current.x,
          y: displacementSpriteRef.current.y,
        });
        displacementSpriteRef.current.x = 0;
        displacementSpriteRef.current.y = 0;
      }

      const now = ticker?.lastTime ?? performance.now();
      if (debug && now - debugStateRef.current.lastTickLog > 1000) {
        debugStateRef.current.lastTickLog = now;
        debugLog('Tick status', {
          phase: phaseRef.current,
          x: displacementSpriteRef.current.x,
          y: displacementSpriteRef.current.y,
          filters: backgroundSpriteRef.current?.filters?.length ?? 0,
          filterScale: filterRef.current?.scale,
        });
      }
    },
    isEnabled:
      isMounted &&
      displacementTexture !== null &&
      !displacementSpriteRef.current?.destroyed,
  });

  if (!displacementTexture) {
    // Render simple background while displacement texture loads
    return (
      <pixiSprite
        texture={backgroundTexture}
        x={x}
        y={y}
        width={width}
        height={height}
        anchor={0}
      />
    );
  }

  return (
    <>
      {/* Hidden displacement sprite (used by the filter) */}
      <pixiSprite
        ref={displacementSpriteRef}
        texture={displacementTexture}
        x={0}
        y={0}
        width={width}
        height={height}
        alpha={0}
      />

      {/* Background sprite with displacement filter */}
      <pixiSprite
        ref={backgroundSpriteRef}
        texture={backgroundTexture}
        x={x}
        y={y}
        width={width}
        height={height}
        anchor={0}
      />
    </>
  );
}
