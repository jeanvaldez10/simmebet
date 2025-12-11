/**
 * Updatable Layout Text Component
 *
 * A wrapper around layoutText that ensures text updates properly when the text prop changes.
 * Uses a key-based approach to force remounting when text changes, which resolves
 * issues with layoutText not updating its rendered text.
 */

'use client';

import { LayoutStyles } from '@pixi/layout';
import { TextStyleOptions } from 'pixi.js';
import { useMemo } from 'react';

interface UpdatableLayoutTextProps {
  text: string;
  layout?: LayoutStyles;
  style?: TextStyleOptions;
  alpha?: number;
}

export function UpdatableLayoutText({
  text,
  layout,
  style,
  alpha,
}: UpdatableLayoutTextProps) {
  const key = useMemo(
    () => text + Math.random().toString(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, style, layout, alpha]
  );

  return (
    <layoutText
      key={key}
      text={text}
      layout={layout}
      style={{ ...style, wordWrapWidth: style?.wordWrapWidth || 10000 }}
      alpha={alpha}
    />
  );
}
