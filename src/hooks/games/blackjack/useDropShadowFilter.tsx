import { useMemo } from 'react';
import { DropShadowFilter } from 'pixi-filters';

interface DropShadowFilterOptions {
  color?: string | number;
  alpha?: number;
  blur?: number;
  offset?: { x: number; y: number };
  shadowOnly?: boolean;
}

const DEFAULT_SHADOW_CONFIG = {
  color: '0x000000',
  alpha: 0.4,
  blur: 0.25,
  offset: { x: 4, y: 4 },
  shadowOnly: false,
} as const;

export function useDropShadowFilter(
  options?: Partial<DropShadowFilterOptions>
): DropShadowFilter {
  return useMemo(
    () =>
      new DropShadowFilter({
        color: options?.color ?? DEFAULT_SHADOW_CONFIG.color,
        alpha: options?.alpha ?? DEFAULT_SHADOW_CONFIG.alpha,
        blur: options?.blur ?? DEFAULT_SHADOW_CONFIG.blur,
        offset: options?.offset ?? DEFAULT_SHADOW_CONFIG.offset,
        shadowOnly: options?.shadowOnly ?? DEFAULT_SHADOW_CONFIG.shadowOnly,
      }),
    [options?.color, options?.alpha, options?.blur, options?.offset, options?.shadowOnly]
  );
}

