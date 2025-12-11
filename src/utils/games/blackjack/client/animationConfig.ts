/**
 * Shared Animation Configuration
 * Centralized animation parameters used by both DealingAnimationSprite and useGameState
 */

import { Hand } from "@/types/games/blackjack/game";


export const ANIMATION_TIMING = {
  CARD_DEAL_DELAY: 800,
  CARD_ANIMATION_DURATION: 1000,
  ANIMATION_BUFFER: 400,
} as const;

export interface AnimationFactors {
  distance: number;
  cardCount: number;
  isMobile: boolean;
  isHoleCard?: boolean;
}

export interface AnimationSpeeds {
  flySpeed: number;
  flipSpeed: number;
}

/**
 * Calculate dynamic animation speeds based on game state
 */
export function calculateAnimationSpeeds(factors: AnimationFactors): AnimationSpeeds {
  const { distance, cardCount, isMobile, isHoleCard = false } = factors;
  
  // Base speeds
  const baseFlySpeed = 0.033;
  const baseFlipSpeed = 0.08;
  
  // Distance factor: longer distances = slightly faster
  const distanceFactor = Math.min(1.2, Math.max(0.8, distance / 400));
  
  // Complexity factor: more cards = slightly slower (more visual chaos)
  const complexityFactor = Math.max(0.9, 1 - (cardCount * 0.05));
  const flipComplexityFactor = Math.max(0.9, 1 - (cardCount * 0.03));
  
  // Mobile factor: slower on mobile for better visibility
  const mobileFactor = isMobile ? 0.8 : 1.0;
  const mobileFlipFactor = isMobile ? 0.9 : 1.0;
  
  // Card type factor: hole cards flip faster for drama
  const cardTypeFactor = isHoleCard ? 1.2 : 1.0;
  
  // Calculate final speeds
  const flySpeed = baseFlySpeed * distanceFactor * complexityFactor * mobileFactor;
  const flipSpeed = baseFlipSpeed * cardTypeFactor * flipComplexityFactor * mobileFlipFactor;
  
  return { flySpeed, flipSpeed };
}

/**
 * Calculate animation duration in milliseconds
 */
export function calculateAnimationDuration(speeds: AnimationSpeeds): number {
  const { flySpeed, flipSpeed } = speeds;
  
  // Calculate durations (60fps target)
  const flyDuration = 1000 / (flySpeed * 60);
  const flipDuration = 1000 / (flipSpeed * 60);
  const bufferTime = 300; // 300ms buffer
  
  return flyDuration + flipDuration + bufferTime;
}

/**
 * Get animation factors from game state
 */
export function getAnimationFactors(
  gameState: { playerHands: Hand[] },
  distance: number = 400,
  isMobile: boolean = false,
  isHoleCard: boolean = false
): AnimationFactors {
  return {
    distance,
    cardCount: gameState.playerHands.length,
    isMobile,
    isHoleCard
  };
}

/**
 * Debug logging for animation calculations
 */
export function logAnimationDebug(
  factors: AnimationFactors,
  speeds: AnimationSpeeds,
  duration: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🎬 Animation Debug:', {
      factors: {
        distance: Math.round(factors.distance),
        cardCount: factors.cardCount,
        isMobile: factors.isMobile,
        isHoleCard: factors.isHoleCard
      },
      speeds: {
        flySpeed: Math.round(speeds.flySpeed * 1000) / 1000,
        flipSpeed: Math.round(speeds.flipSpeed * 1000) / 1000
      },
      duration: Math.round(duration),
      totalMs: `${Math.round(duration)}ms`
    });
  }
}
