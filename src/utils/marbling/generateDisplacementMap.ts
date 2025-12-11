/**
 * Generates a displacement map texture for Pixi.js marbling effect
 * Creates an organic wavy pattern using blended sine functions
 */

import { Texture } from 'pixi.js';

/**
 * Generates a displacement map canvas with organic wave patterns
 * @param size - Size of the displacement map (default 512x512)
 * @returns Canvas element with the generated displacement pattern
 */
export function generateDisplacementCanvas(
  size: number = 512
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }

  // Create image data
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  // Generate organic wave pattern using multiple sine waves at different frequencies
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;

      // Normalize coordinates to 0-1 range
      const nx = x / size;
      const ny = y / size;

      // Layer multiple sine waves with 2*PI multipliers for seamless tiling
      // Each wave completes full cycles, ensuring edges match perfectly
      const wave1 =
        Math.sin(nx * Math.PI * 2 * 2) * Math.cos(ny * Math.PI * 2 * 1) * 0.5 +
        0.5;
      const wave2 =
        Math.sin(ny * Math.PI * 2 * 3) * Math.cos(nx * Math.PI * 2 * 2) * 0.5 +
        0.5;
      const wave3 = Math.sin((nx + ny) * Math.PI * 2 * 2) * 0.5 + 0.5;
      const wave4 = Math.sin((nx - ny) * Math.PI * 2 * 3) * 0.5 + 0.5;

      // Additional layer for more organic feel
      const wave5 =
        Math.cos(nx * Math.PI * 2 * 4) * Math.sin(ny * Math.PI * 2 * 4) * 0.5 +
        0.5;

      // Blend the waves together with weights
      const r =
        (wave1 * 0.25 +
          wave2 * 0.25 +
          wave3 * 0.2 +
          wave4 * 0.15 +
          wave5 * 0.15) *
        255;
      const g =
        (wave2 * 0.25 +
          wave3 * 0.25 +
          wave1 * 0.2 +
          wave5 * 0.15 +
          wave4 * 0.15) *
        255;

      // Set RGBA values
      data[index] = r; // Red channel
      data[index + 1] = g; // Green channel
      data[index + 2] = 128; // Blue channel (neutral)
      data[index + 3] = 255; // Alpha (fully opaque)
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Creates a Pixi.js Texture from the displacement canvas with REPEAT wrap mode
 * @param size - Size of the displacement map (default 512x512)
 * @returns Pixi.js Texture ready to use with DisplacementFilter
 */
export function createDisplacementTexture(size: number = 512): Texture {
  const canvas = generateDisplacementCanvas(size);

  // Create Texture from canvas (Pixi.js v8 API)
  const texture = Texture.from(canvas);

  // Set wrap mode to REPEAT for seamless tiling
  // In Pixi v8, wrap mode is set on the texture source
  if (texture.source) {
    texture.source.style.addressMode = 'repeat';
  }

  return texture;
}
