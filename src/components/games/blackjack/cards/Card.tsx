import { Card as CardType } from '@/types/games/blackjack/game';
import { CardSprite } from './CardSprite';
import { getIconTexture } from '@/utils/games/blackjack/client/pixiAssets';
import {
  getActualCardWidth,
  getActualCardHeight,
} from '@/utils/games/blackjack/client/uiConfig';

interface CardProps {
  card: CardType;
  x: number;
  y: number;
  cardIndex: number;
  isMobile: boolean;
  isDealer?: boolean;
  canFlip?: boolean;
  handIndex?: number;
  animateIn?: boolean;
  showOverlay?: boolean;
  isVisible?: boolean;
  onDealerHoleFlipComplete?: () => void;
}

export function Card({
  card,
  x,
  y,
  cardIndex,
  isMobile,
  isVisible = true,
  isDealer = false,
  animateIn = false,
  showOverlay = false,
  canFlip,
  onDealerHoleFlipComplete,
}: CardProps) {
  const cardWidth = getActualCardWidth(isMobile);
  const cardHeight = getActualCardHeight(isMobile);

  // Get actual card data (handle hidden cards)
  const actualRank = card.isHidden ? '?' : card.rank;
  const actualSuit = card.isHidden ? 'hidden' : card.suit;

  if (!isVisible) return null;

  return (
    <pixiContainer x={x} y={y}>
      {/* Card Sprite */}
      <CardSprite
        rank={actualRank}
        suit={actualSuit}
        x={0}
        y={0}
        isDealer={isDealer}
        faceUp={!card.isHidden}
        animateIn={animateIn}
        animationDelay={0}
        canFlip={canFlip}
        zIndex={cardIndex}
        isMobile={isMobile}
        onFlipComplete={onDealerHoleFlipComplete}
      />

      {/* Overlay for inactive cards */}
      {showOverlay && (
        <pixiSprite
          texture={getIconTexture('pixelatedOverlay')}
          x={0}
          y={0}
          anchor={0.5}
          width={cardWidth}
          height={cardHeight}
          zIndex={999}
        />
      )}
    </pixiContainer>
  );
}
