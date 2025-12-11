/**
 * PixiJS Particle Effects
 * Chip splash, confetti, and other particle effects for game events
 */

import { useTick } from "@pixi/react";
import { useCallback, useEffect, useState } from "react";
import { Graphics } from "pixi.js";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

interface ChipSplashProps {
  x: number;
  y: number;
  active: boolean;
  onComplete?: () => void;
}

export function ChipSplash({ x, y, active, onComplete }: ChipSplashProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      // Create particles
      const newParticles: Particle[] = [];
      const colors = [0xffd700, 0xffa500, 0xff8c00, 0xffd700];

      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 3 + Math.random() * 4;
        newParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 3,
        });
      }
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active, x, y]);

  useTick({
    callback: (ticker) => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2, // Gravity
            life: p.life - ticker.deltaTime / 60 / p.maxLife,
          }))
          .filter((p) => p.life > 0);
  
        if (updated.length === 0 && onComplete) {
          onComplete();
        }
  
        return updated;
      });
    },
    isEnabled: particles.length > 0,
  });

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      particles.forEach((p) => {
        g.circle(p.x, p.y, p.size * p.life);
        g.fill({ color: p.color, alpha: p.life });
      });
    },
    [particles]
  );

  return <pixiGraphics draw={draw} />;
}

interface ConfettiProps {
  active: boolean;
  canvasWidth?: number;
  onComplete?: () => void;
}

export function Confetti({
  active,
  canvasWidth = 1920,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      // Create confetti particles
      const newParticles: Particle[] = [];
      const colors = [
        0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff,
      ];

      for (let i = 0; i < 50; i++) {
        newParticles.push({
          x: Math.random() * canvasWidth,
          y: -20 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 3,
          life: 1,
          maxLife: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 4,
        });
      }
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [active, canvasWidth]);

  useTick({
    callback: (ticker) => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - ticker.deltaTime / 60 / p.maxLife,
          }))
          .filter((p) => p.life > 0 && p.y < 1080);
  
        if (updated.length === 0 && onComplete) {
          onComplete();
        }
  
        return updated;
      });
    },
    isEnabled: particles.length > 0,
  });

  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      particles.forEach((p) => {
        g.rect(p.x, p.y, p.size, p.size * 2);
        g.fill({ color: p.color, alpha: p.life });
      });
    },
    [particles]
  );

  return <pixiGraphics draw={draw} />;
}
