import { Card } from "@/types/games/blackjack/game";
import type { CardAnimation } from "@/components/games/blackjack/canvas/DealingAnimationSprite";
import {
  calculateCardPosition,
  calculateBezierControlPoints,
  type PositionCalculatorOptions,
} from "./cardPositionCalculator";

export interface QueuedCardData {
  id: string;
  card: Card;
  faceUp: boolean;
  isDealerHole: boolean;
  isPlayerCard: boolean;
  handIndex: number;
  cardIndex: number;
  shouldFlip: boolean;
}

/**
 * Create a card animation object from pending card data
 */
export function createCardAnimation(
  pendingCard: QueuedCardData,
  options: PositionCalculatorOptions,
  dealerHandShowAllCards: boolean
): CardAnimation {
  const { id, card, faceUp, isDealerHole, isPlayerCard, handIndex, cardIndex } =
    pendingCard;

  // Calculate target position
  const position = calculateCardPosition(
    isPlayerCard,
    handIndex,
    cardIndex,
    options
  );

  // Calculate bezier control points
  const { controlPoint1, controlPoint2 } = calculateBezierControlPoints(
    options.deckX,
    options.deckY,
    position.targetX,
    position.targetY,
    isPlayerCard
  );

  // Create animation card object
  return {
    id,
    startX: options.deckX,
    startY: options.deckY,
    targetX: position.targetX,
    targetY: position.targetY,
    progress: 0,
    rotation: 0,
    card,
    faceUp,
    isDealerHole,
    flipProgress: 0,
    shouldFlip: !isDealerHole || dealerHandShowAllCards,
    x: options.deckX,
    y: options.deckY,
    controlPoint1,
    controlPoint2,
    trail: [],
    bounceProgress: 0,
    glowAlpha: 0.8,
    isPlayerCard,
    handIndex,
    cardIndex,
  };
}
