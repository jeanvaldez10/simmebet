/**
 * PixiJS Card Sprite Component
 * Renders individual playing cards with animations
 */

import { useTick } from '@pixi/react';
import { useEffect, useRef, useState } from 'react';
import {
  getCardTexture,
  getCardBackTexture,
} from '@/utils/games/blackjack/client/pixiAssets';
import {
  getActualCardWidth,
  getActualCardHeight,
} from '@/utils/games/blackjack/client/uiConfig';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';

interface CardSpriteProps {
  rank: string;
  suit: string;
  x: number;
  y: number;
  faceUp?: boolean;
  isDealer?: boolean;
  scale?: number;
  rotation?: number;
  animateIn?: boolean;
  animationDelay?: number;
  zIndex?: number;
  isMobile?: boolean;
  canFlip?: boolean;
  onFlipComplete?: () => void;
}

export function CardSprite({
  rank,
  suit,
  x,
  y,
  faceUp = true,
  rotation = 0,
  animateIn = false,
  animationDelay = 0,
  zIndex = 0,
  isMobile = false,
  onFlipComplete,
  isDealer = false,
  canFlip = false,
}: CardSpriteProps) {
  const [entranceScale, setEntranceScale] = useState(1);
  const [flipScale, setFlipScale] = useState(1);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const [currentAlpha, setCurrentAlpha] = useState(1);
  const [displayFaceUp, setDisplayFaceUp] = useState(faceUp);
  const [targetFaceUp, setTargetFaceUp] = useState(faceUp);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0);
  const [flipSwapped, setFlipSwapped] = useState(false);
  const animationTime = useRef(0);
  const dropShadowFilter = useDropShadowFilter();
  const animationStarted = useRef(false);

  // Handle flip animation switch
  useEffect(() => {
    if (faceUp && canFlip && faceUp !== targetFaceUp) {
      setTargetFaceUp(faceUp);
      setIsFlipping(true);
      setFlipProgress(0);
      setFlipSwapped(false);
    }
  }, [faceUp, targetFaceUp, canFlip]);

  useTick({
    callback: (ticker) => {
      animationTime.current += ticker.deltaTime;
      const elapsed = animationTime.current / 60; // Convert to seconds

      if (elapsed < animationDelay) return;

      const animProgress = Math.min((elapsed - animationDelay) / 0.3, 1); // 0.3s animation

      // Ease out cubic
      const eased = 1 - Math.pow(1 - animProgress, 3);

      setEntranceScale(eased);
      setCurrentAlpha(eased);
      // Add slight rotation bounce
      const rotationBounce = Math.sin(animProgress * Math.PI) * 0.1;
      setCurrentRotation(rotation + rotationBounce);

      if (animProgress >= 1) {
        animationStarted.current = false;
      }
    },
    isEnabled: animateIn && animationStarted.current,
  });

  useTick({
    callback: (ticker) => {
      const newProgress = Math.min(flipProgress + ticker.deltaTime * 0.08, 1);
      setFlipProgress(newProgress);

      let scaleFactor = 1;
      if (newProgress < 0.5) {
        scaleFactor = 1 - newProgress * 2;
      } else {
        if (!flipSwapped) {
          // Swap to show the target face (targetFaceUp state)
          setDisplayFaceUp(targetFaceUp);
          setFlipSwapped(true);
        }
        scaleFactor = (newProgress - 0.5) * 2;
      }

      setFlipScale(Math.max(scaleFactor, 0.02));

      if (newProgress >= 1) {
        setIsFlipping(false);
        setFlipProgress(0);
        setFlipSwapped(false);
        setFlipScale(1);

        if (onFlipComplete && isDealer) {
          onFlipComplete();
        }
      }
    },
    isEnabled: isFlipping,
  });

  // Start animation on mount
  useEffect(() => {
    if (animateIn) {
      animationStarted.current = true;
    }
  }, [animateIn]);

  // Get the appropriate texture - add error handling
  // If suit is "hidden", always show card back
  let texture;
  try {
    if (!faceUp) {
      texture = getCardBackTexture();
    } else {
      texture = displayFaceUp
        ? getCardTexture(rank, suit)
        : getCardBackTexture();
    }
  } catch (error) {
    console.error(`Failed to load texture for ${rank}${suit}:`, error);
    // Fallback to card back if texture loading fails
    texture = getCardBackTexture();
  }

  const cardWidth = getActualCardWidth(isMobile);
  const cardHeight = getActualCardHeight(isMobile);

  return (
    <pixiSprite
      texture={texture}
      x={x}
      y={y}
      width={cardWidth * entranceScale * flipScale}
      height={cardHeight * entranceScale}
      anchor={0.5}
      rotation={currentRotation}
      alpha={currentAlpha}
      zIndex={zIndex}
      filters={dropShadowFilter}
    />
  );
}
