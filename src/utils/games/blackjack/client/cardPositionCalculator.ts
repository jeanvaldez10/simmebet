import { Card } from "@/types/games/blackjack/game";
import { getCardSpacing, getActualCardWidth } from "./uiConfig";

export interface CardPositionData {
  targetX: number;
  targetY: number;
  isPlayerCard: boolean;
  handIndex: number;
  cardIndex: number;
}

export interface PositionCalculatorOptions {
  isMobile: boolean;
  deckX: number;
  deckY: number;
  centerX: number;
  playerY: number;
  dealerY: number;
  playerHandPositions: { x: number; y: number }[];
  playerHands: Card[][];
  dealerCards: Card[];
}

/**
 * Calculate effective card spacing based on card count and split state
 * Matches the logic in HandSprite.tsx to ensure animation targets align with final positions
 * Only applies overlap logic on mobile/tablet - desktop uses normal spacing
 */
function calculateEffectiveSpacing(
  cardCount: number,
  isMobile: boolean,
  isSplitHand: boolean
): number {
  const baseSpacing = getCardSpacing(isMobile);
  
  // Only apply overlap logic on mobile/tablet to prevent screen overflow
  if (!isMobile) {
    return baseSpacing;
  }
  
  const cardWidth = getActualCardWidth(isMobile);
  
  // Determine when to start overlapping:
  // - Single hand: overlap at 5+ cards
  // - Split hands: overlap at 3+ cards (less space available)
  const overlapThreshold = isSplitHand ? 2 : 4;
  // Max cards to fit without overlap (reference for width calculation)
  const maxCardsReference = isSplitHand ? 2 : 4;
  
  if (cardCount <= overlapThreshold) {
    return baseSpacing;
  }
  
  // Calculate reduced spacing to prevent overflow
  const maxHandWidth = maxCardsReference * baseSpacing - (baseSpacing - cardWidth);
  const effectiveSpacing = (maxHandWidth + (baseSpacing - cardWidth)) / cardCount;
  
  // Ensure minimum spacing (35% for split, 40% for single)
  const minSpacingRatio = isSplitHand ? 0.35 : 0.4;
  const minSpacing = cardWidth * minSpacingRatio;
  
  return Math.max(effectiveSpacing, minSpacing);
}

/**
 * Calculate target position for a card
 */
export function calculateCardPosition(
  isPlayerCard: boolean,
  handIndex: number,
  cardIndex: number,
  options: PositionCalculatorOptions
): CardPositionData {
  const totalPlayerHands = options.playerHands.length;
  const cardWidth = getActualCardWidth(options.isMobile);
  
  let targetX: number;
  let targetY: number;

  if (isPlayerCard) {
    // Player's card
    const activeHand = options.playerHands[handIndex] || [];
    const totalCards = activeHand.length;
    const isSplitHand = totalPlayerHands > 1;
    
    // Use dynamic spacing based on card count and split state
    const effectiveSpacing = calculateEffectiveSpacing(totalCards, options.isMobile, isSplitHand);
    
    // Calculate hand width with effective spacing
    const handWidth = totalCards * effectiveSpacing - (effectiveSpacing - cardWidth);
    const handStartX = -handWidth / 2 + cardWidth / 2;
    const cardX = handStartX + cardIndex * effectiveSpacing;

    const handPosition = options.playerHandPositions[handIndex] || {
      x: options.centerX,
      y: options.playerY,
    };

    targetX = handPosition.x + cardX;
    targetY = handPosition.y;

    console.log("🎯 Player card position:", {
      handIndex,
      cardIndex,
      totalCards,
      handStartX,
      cardX,
      effectiveSpacing,
      isSplitHand,
      handPosition,
      targetX,
      targetY,
    });
  } else {
    // Dealer's card - dealer never has split hands
    const totalCards = options.dealerCards.length;
    const effectiveSpacing = calculateEffectiveSpacing(totalCards, options.isMobile, false);
    
    // Calculate hand width with effective spacing
    const handWidth = totalCards * effectiveSpacing - (effectiveSpacing - cardWidth);
    const handStartX = -handWidth / 2 + cardWidth / 2;
    const cardX = handStartX + cardIndex * effectiveSpacing;

    targetX = options.centerX + cardX;
    targetY = options.dealerY;

    console.log("Dealer card position:", {
      cardIndex,
      totalCards,
      handStartX,
      cardX,
      effectiveSpacing,
      targetX,
      targetY,
    });
  }

  return {
    targetX,
    targetY,
    isPlayerCard,
    handIndex,
    cardIndex,
  };
}

/**
 * Calculate bezier control points for card animation curve
 */
export function calculateBezierControlPoints(
  deckX: number,
  deckY: number,
  targetX: number,
  targetY: number,
  isPlayerCard: boolean
): {
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
} {
  const midX = (deckX + targetX) / 2;
  const xOffset = Math.abs(targetX - deckX) * 0.15;
  const heightOffset = isPlayerCard ? -50 : 50;

  const controlPoint1 = {
    x: isPlayerCard ? midX - xOffset : midX + xOffset,
    y: Math.min(deckY, targetY) + heightOffset,
  };
  
  const controlPoint2 = {
    x: isPlayerCard ? midX + xOffset : midX - xOffset,
    y: Math.min(deckY, targetY) + heightOffset,
  };

  return { controlPoint1, controlPoint2 };
}

/**
 * Calculate a point on a cubic bezier curve
 */
export function getBezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): { x: number; y: number } {
  const oneMinusT = 1 - t;
  const b0 = oneMinusT * oneMinusT * oneMinusT;
  const b1 = 3 * oneMinusT * oneMinusT * t;
  const b2 = 3 * oneMinusT * t * t;
  const b3 = t * t * t;
  
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
  };
}

