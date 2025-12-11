import type { useCardAnimationManager } from "@/hooks/games/blackjack/useCardAnimationManager";
import { Card } from "@/types/games/blackjack/game";
import { calculateAnimationSpeeds } from "@/utils/games/blackjack/client/animationConfig";
import { createCardAnimation } from "@/utils/games/blackjack/client/cardAnimationFactory";
import { getBezierPoint } from "@/utils/games/blackjack/client/cardPositionCalculator";
import {
  getCardBackTexture,
  getCardTexture,
} from "@/utils/games/blackjack/client/pixiAssets";
import {
  getActualCardHeight,
  getActualCardWidth,
} from "@/utils/games/blackjack/client/uiConfig";
import { buildCardQueue } from "@/utils/games/blackjack/client/cardQueueBuilder";
import { playSound } from "@/utils/games/blackjack/client/sounds";
import { useTick } from "@pixi/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export interface CardAnimation {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  rotation: number;
  card: Card;
  faceUp: boolean;
  isDealerHole?: boolean;
  flipProgress: number;
  shouldFlip: boolean;
  x: number;
  y: number;
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
  trail: Array<{ x: number; y: number; rotation: number }>;
  bounceProgress: number;
  glowAlpha: number;
  isPlayerCard: boolean;
  handIndex: number;
  cardIndex: number;
}

interface DealingAnimationProps {
  deckX: number;
  deckY: number;
  dealerY: number;
  playerY: number;
  centerX: number;
  isMobile?: boolean;
  dealerCards: Card[];
  activeHandIndex?: number;
  playerHands: Card[][];
  playerHandPositions?: { x: number; y: number }[];
  dealerHandShowAllCards?: boolean;
  animationManager: ReturnType<typeof useCardAnimationManager>;
}

const DealingAnimationSprite = ({
  deckX,
  deckY,
  dealerY,
  playerY,
  centerX,
  isMobile = false,
  dealerCards,
  activeHandIndex = 0,
  playerHands,
  playerHandPositions = [],
  dealerHandShowAllCards = false,
  animationManager,
}: DealingAnimationProps) => {
  // State for currently animating cards
  const [cards, setCards] = useState<CardAnimation[]>([]);

  // Position calculator options - memoized to prevent recreating on every render
  const positionOptions = useMemo(
    () => ({
      isMobile,
      deckX,
      deckY,
      centerX,
      playerY,
      dealerY,
      playerHandPositions,
      playerHands,
      dealerCards,
    }),
    [
      isMobile,
      deckX,
      deckY,
      centerX,
      playerY,
      dealerY,
      playerHandPositions,
      playerHands,
      dealerCards,
    ]
  );

  // Register cards with animation manager in correct dealing order
  useEffect(() => {
    const queue = buildCardQueue(playerHands, dealerCards);

    queue.forEach(({ position, card }) => {
      animationManager.registerCard(position, card);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerHands, dealerCards]);

  // Add a new card to animate
  const addCard = useCallback((card: CardAnimation) => {
    setCards((prev) => [...prev, card]);
  }, []);

  // Try to start next card animation
  const tryStartNextCard = useCallback(() => {
    // Get next card from manager
    const nextCardId = animationManager.getNextCardToAnimate();

    if (!nextCardId) {
      return; // Nothing to animate or card is currently animating
    }

    // Get card data from registry
    const cardData = animationManager.getCard(nextCardId);

    if (!cardData) {
      console.error("Card not found in registry:", nextCardId);
      return;
    }

    // Mark as animating
    animationManager.markAsAnimating(nextCardId);

    // Prepare queued card data
    const queuedCard = {
      id: nextCardId,
      card: cardData.card,
      faceUp: cardData.position.type === "player",
      isDealerHole:
        cardData.position.type === "dealer" &&
        cardData.position.cardIndex === 1,
      isPlayerCard: cardData.position.type === "player",
      handIndex: cardData.position.handIndex,
      cardIndex: cardData.position.cardIndex,
      shouldFlip: true,
    };

    console.log("✅ Starting animation for:", {
      id: nextCardId,
      position: cardData.position,
      card: `${cardData.card.rank}${cardData.card.suit}`,
    });

    // Play sound
    playSound("card-deal", 0.3, 0.8);

    // Create animation card
    const animationCard = createCardAnimation(
      queuedCard,
      positionOptions,
      dealerHandShowAllCards
    );
    addCard(animationCard);
  }, [animationManager, positionOptions, dealerHandShowAllCards, addCard]);

  // Track completed animations and update manager
  useEffect(() => {
    const completed = cards.filter(
      (c) => c.progress >= 1 && (!c.shouldFlip || c.flipProgress >= 1)
    );

    if (completed.length > 0) {
      console.log(
        "Completing cards:",
        completed.map((c) => c.id)
      );

      // Update manager for each completed card using the wrapped method with forceUpdate
      completed.forEach((card) => {
        if (animationManager.isAnimating(card.id)) {
          console.log("Marking as complete:", card.id);
          animationManager.markAsAnimated(card.id);
        }
      });

      // Remove completed cards from state
      setCards((prev) =>
        prev.filter(
          (c) => !(c.progress >= 1 && (!c.shouldFlip || c.flipProgress >= 1))
        )
      );
    }
  }, [cards, animationManager]);

  // Get current animating cards for dependency tracking
  const animatingCardIds = useMemo(
    () => animationManager.getAnimatingCards(),
    [animationManager]
  );

  // Trigger next card animation
  useEffect(() => {
    tryStartNextCard();
  }, [
    playerHands,
    dealerCards,
    activeHandIndex,
    cards,
    animatingCardIds,
    tryStartNextCard,
  ]);

  // Dynamic animation speed calculator
  const calculateAnimationSpeed = useCallback(
    (card: CardAnimation) => {
      const distance = Math.sqrt(
        Math.pow(card.targetX - card.startX, 2) +
          Math.pow(card.targetY - card.startY, 2)
      );

      const factors = {
        distance,
        cardCount: cards.length,
        isMobile,
        isHoleCard: card.isDealerHole,
      };

      const speeds = calculateAnimationSpeeds(factors);
      return speeds.flySpeed;
    },
    [cards.length, isMobile]
  );

  // Animate cards using ticker
  useTick({
    callback: (ticker) => {
      setCards((prev) =>
        prev.map((card) => {
          // Phase 1: Flying animation
          if (card.progress < 1) {
            const dynamicSpeed = calculateAnimationSpeed(card);
            const newProgress = Math.min(
              card.progress + dynamicSpeed * ticker.deltaTime,
              1
            );

            const eased = 1 - Math.pow(1 - newProgress, 4);

            const currentPos = getBezierPoint(
              eased,
              { x: card.startX, y: card.startY },
              card.controlPoint1,
              card.controlPoint2,
              { x: card.targetX, y: card.targetY }
            );

            const trail = [
              ...card.trail,
              { x: currentPos.x, y: currentPos.y, rotation: 0 },
            ].slice(-5);

            const glowAlpha = card.glowAlpha * (1 - eased);

            return {
              ...card,
              progress: newProgress,
              rotation: 0,
              trail,
              bounceProgress: 0,
              glowAlpha,
              x: currentPos.x,
              y: currentPos.y,
            };
          }

          // Phase 2: Flip animation
          if (card.shouldFlip && card.flipProgress < 1) {
            const distance = Math.sqrt(
              Math.pow(card.targetX - card.startX, 2) +
                Math.pow(card.targetY - card.startY, 2)
            );

            const factors = {
              distance,
              cardCount: cards.length,
              isMobile,
              isHoleCard: card.isDealerHole,
            };

            const speeds = calculateAnimationSpeeds(factors);

            const newFlipProgress = Math.min(
              card.flipProgress + speeds.flipSpeed * ticker.deltaTime,
              1
            );

            return {
              ...card,
              flipProgress: newFlipProgress,
              trail: [],
              glowAlpha: 0,
            };
          }

          return card;
        })
      );
    },
    isEnabled: cards.length > 0,
  });

  if (cards.length === 0) return null;

  return (
    <pixiContainer>
      {cards.map((card) => {
        let showFaceUp = false;
        let flipScale = 1;

        if (card.progress < 1) {
          showFaceUp = false;
        } else if (card.shouldFlip && card.flipProgress < 1) {
          if (card.flipProgress <= 0.5) {
            showFaceUp = false;
            flipScale = Math.max(0.01, 1 - card.flipProgress * 2);
          } else {
            showFaceUp = true;
            flipScale = Math.max(0.01, (card.flipProgress - 0.5) * 2);
          }
        } else if (card.shouldFlip && card.flipProgress >= 1) {
          showFaceUp = true;
          flipScale = 1;
        } else {
          showFaceUp = !card.isDealerHole;
          flipScale = 1;
        }

        let texture;
        // If suit is "hidden", always show card back
        const isHiddenCard = card.card?.suit === "hidden";
        if (showFaceUp && card.card && !isHiddenCard) {
          try {
            texture = getCardTexture(card.card.rank, card.card.suit);
          } catch (error) {
            console.error(
              `Error loading card texture for ${card.card.rank}${card.card.suit}:`,
              error
            );
            texture = getCardBackTexture();
          }
        } else {
          texture = getCardBackTexture();
        }

        const cardWidth = getActualCardWidth(isMobile);
        const cardHeight = getActualCardHeight(isMobile);
        const zIndexBase = cards.indexOf(card) * 10;

        return (
          <pixiContainer key={card.id}>
            {/* Trail effect */}
            {card.trail.map((pos, i) => (
              <pixiSprite
                key={`trail-${i}`}
                texture={getCardBackTexture()}
                x={pos.x}
                y={pos.y}
                anchor={0.5}
                width={cardWidth * 0.9}
                height={cardHeight * 0.9}
                alpha={0.1 * (i / card.trail.length)}
                zIndex={zIndexBase + i}
                tint={0x4477ff}
              />
            ))}

            {/* Glow effect */}
            {card.glowAlpha > 0 && (
              <pixiSprite
                texture={texture}
                x={card.x}
                y={card.y}
                anchor={0.5}
                width={cardWidth * 1.2}
                height={cardHeight * 1.2}
                alpha={card.glowAlpha * 0.3}
                zIndex={zIndexBase + 5}
                tint={0xffffff}
                blendMode="screen"
              />
            )}

            {/* Main card */}
            <pixiSprite
              texture={texture}
              x={card.x}
              y={card.y}
              anchor={0.5}
              width={cardWidth * flipScale}
              height={cardHeight}
              alpha={card.progress}
              zIndex={zIndexBase + 6}
            />
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
};

export default DealingAnimationSprite;
