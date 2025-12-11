"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";

interface StarSizeOption {
  size: StarSize;
  weight: number;
}

type StarSize =
  | "tiny"
  | "small"
  | "medium"
  | "large"
  | "extra-large"
  | "huge"
  | "massive";

type GlowIntensity = "none" | "normal" | "bright" | "intense";

interface FloatingStar {
  id: string;
  size: StarSize;
  glow: boolean;
  glowIntensity: GlowIntensity;
  left: number;
  duration: number;
}

const AnimatedStarButton: React.FC = () => {
  const [floatingStars, setFloatingStars] = useState<FloatingStar[]>([]);
  const floatingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const createFloatingStars = (): void => {
      floatingIntervalRef.current = setInterval(() => {
        const sizeOptions: StarSizeOption[] = [
          // More tiny and small stars for better distribution
          { size: "tiny", weight: 25 },
          { size: "tiny", weight: 25 },
          { size: "tiny", weight: 25 },
          { size: "small", weight: 20 },
          { size: "small", weight: 20 },
          { size: "small", weight: 20 },
          { size: "small", weight: 20 },
          { size: "small", weight: 15 },
          { size: "small", weight: 15 },
          { size: "small", weight: 15 },
          { size: "medium", weight: 12 },
          { size: "medium", weight: 12 },
          { size: "medium", weight: 10 },
          { size: "large", weight: 8 },
          { size: "large", weight: 8 },
          { size: "extra-large", weight: 6 },
          { size: "extra-large", weight: 5 },
          { size: "huge", weight: 3 },
          { size: "huge", weight: 2 },
          { size: "massive", weight: 1 },
        ];

        // Weighted random selection
        const totalWeight = sizeOptions.reduce(
          (sum, option) => sum + option.weight,
          0
        );
        let random = Math.random() * totalWeight;
        let selectedSize: StarSize = "small";

        for (const option of sizeOptions) {
          if (random < option.weight) {
            selectedSize = option.size;
            break;
          }
          random -= option.weight;
        }

        // Determine glow properties based on size
        const { hasGlow, glowIntensity } = getGlowProperties(selectedSize);

        const leftPosition = Math.random() * 100;
        const animationDuration = getAnimationDuration(selectedSize);

        const newStar: FloatingStar = {
          id: `${Date.now()}-${Math.random()}`,
          size: selectedSize,
          glow: hasGlow,
          glowIntensity,
          left: leftPosition,
          duration: animationDuration,
        };

        setFloatingStars((prev) => [...prev, newStar]);

        // Remove star after animation completes
        setTimeout(() => {
          setFloatingStars((prev) =>
            prev.filter((star) => star.id !== newStar.id)
          );
        }, animationDuration * 1000);
      }, 300); // Reduced interval for more stars
    };

    createFloatingStars();

    return () => {
      if (floatingIntervalRef.current) {
        clearInterval(floatingIntervalRef.current);
      }
    };
  }, []);

  const getGlowProperties = (
    size: StarSize
  ): { hasGlow: boolean; glowIntensity: GlowIntensity } => {
    switch (size) {
      case "massive":
        return {
          hasGlow: Math.random() < 0.95,
          glowIntensity: "intense",
        };
      case "huge":
        return {
          hasGlow: Math.random() < 0.85,
          glowIntensity: "bright",
        };
      case "extra-large":
        return {
          hasGlow: Math.random() < 0.7,
          glowIntensity: "bright",
        };
      case "large":
        return {
          hasGlow: Math.random() < 0.5,
          glowIntensity: "normal",
        };
      case "medium":
        return {
          hasGlow: Math.random() < 0.3,
          glowIntensity: "normal",
        };
      default:
        return {
          hasGlow: Math.random() < 0.2,
          glowIntensity: "normal",
        };
    }
  };

  const getAnimationDuration = (size: StarSize): number => {
    // Slower animations for all sizes
    switch (size) {
      case "massive":
        return 50; // Very slow for massive stars
      case "huge":
        return 45;
      case "extra-large":
        return 42;
      case "large":
        return 40;
      case "medium":
        return 38;
      case "small":
        return 35;
      case "tiny":
        return 32;
      default:
        return 35;
    }
  };

  const getSizeClass = (size: StarSize): string => {
    switch (size) {
      case "tiny":
        return "text-[8px]";
      case "small":
        return "text-xs";
      case "medium":
        return "text-sm";
      case "large":
        return "text-base";
      case "extra-large":
        return "text-xl";
      case "huge":
        return "text-3xl";
      case "massive":
        return "text-5xl";
      default:
        return "text-sm";
    }
  };

  const getGlowStyle = (glowIntensity: GlowIntensity): string => {
    switch (glowIntensity) {
      case "intense":
        return "0 0 25px rgba(255, 255, 255, 1), 0 0 50px rgba(255, 255, 255, 0.8), 0 0 75px rgba(255, 255, 255, 0.6)";
      case "bright":
        return "0 0 18px rgba(255, 255, 255, 0.9), 0 0 35px rgba(255, 255, 255, 0.7), 0 0 50px rgba(255, 255, 255, 0.5)";
      case "normal":
        return "0 0 12px rgba(255, 255, 255, 0.8), 0 0 25px rgba(255, 255, 255, 0.6)";
      default:
        return "none";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <button
        className="relative bg-gradient-to-br from-slate-700 to-slate-800 text-white border-none px-16 py-5 text-3xl font-bold rounded-2xl cursor-pointer overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-0.5 hover:shadow-3xl active:translate-y-0"
        style={{
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        Button Text
        {floatingStars.map((star) => (
          <span
            key={star.id}
            className={`absolute pointer-events-none select-none ${getSizeClass(
              star.size
            )} ${star.glow ? "text-white" : "text-white opacity-70"}`}
            style={{
              left: `${star.left}%`,
              animation: `float-up ${star.duration}s linear forwards`,
              textShadow: star.glow ? getGlowStyle(star.glowIntensity) : "none",
            }}
          >
            ✦
          </span>
        ))}
      </button>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(200px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedStarButton;
