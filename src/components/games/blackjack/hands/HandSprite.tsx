import { Card as CardComponent } from '../cards/Card';
import {
  Card,
  GameActionType,
  GameStatePhaseType,
} from '@/types/games/blackjack/game';
import { useMemo, useCallback, useState, useEffect } from 'react';
import SpliteSprite from '../indicators/SpliteSprite';
import { PixiSquareContainer } from '../containers';
import InsuranceSprite from '../indicators/InsuranceSprite';
import {
  getActualCardWidth,
  getActualCardHeight,
  getCardSpacing,
} from '@/utils/games/blackjack/client/uiConfig';
import { calculateHandValue, getHandValueRange } from '@/utils/games/blackjack';
import { UI_STYLES } from '../styles';
import { TextStyle } from 'pixi.js';

// Mobile-scaled label style (smaller font for mobile to prevent overlap)
const getMobileLabelStyle = () =>
  new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: 12,
    align: 'center',
    fontWeight: '500',
    dropShadow: {
      color: '#00000080',
      distance: Math.sqrt(1.5 ** 2 + 1.5 ** 2),
      angle: Math.atan2(1.5, 1.5),
      blur: 0,
    },
    fill: '#ffffff',
  });

interface HandSpriteProps {
  cards: Card[];
  x: number;
  y: number;
  label?: string;
  animateIn?: boolean;
  isMobile?: boolean;
  isActive?: boolean;
  status?: string;
  canSplit?: boolean;
  onSplit?: (handIndex?: number) => void;
  suppressOverlayUntilAnimationDone?: boolean;
  animatedCardIds: Set<string>;
  handIndex?: number;
  isDealer?: boolean;
  isActionInProgress?: boolean;
  isDealing?: boolean;
  onAction?: (action: GameActionType, amount?: number) => void;
  gamePhase?: number;
  availableActions?: {
    action: GameActionType;
    description: string;
  }[];
  totalPlayerHands?: number;
  allPlayerCards?: number;
  onDealerHoleFlipComplete?: () => void;
}

export function HandSprite({
  cards,
  x,
  y,
  label,
  animateIn = false,
  isMobile = false,
  isActive = false,
  status,
  canSplit = false,
  onSplit,
  suppressOverlayUntilAnimationDone = false,
  animatedCardIds,
  handIndex,
  isDealer = false,
  isActionInProgress = false,
  onAction,
  gamePhase,
  totalPlayerHands,
  allPlayerCards = 0,
  onDealerHoleFlipComplete,
}: HandSpriteProps) {
  // Memoize card dimensions
  const cardDimensions = useMemo(
    () => ({
      width: getActualCardWidth(isMobile),
      height: getActualCardHeight(isMobile),
      spacing: getCardSpacing(isMobile),
    }),
    [isMobile]
  );

  // Memoize card visibility checker
  const getCardVisibility = useCallback(
    (cardIndex: number): boolean => {
      const cardId = isDealer
        ? `dealer-${cardIndex}`
        : `player-${handIndex ?? 0}-${cardIndex}`;
      return animatedCardIds.has(cardId);
    },
    [animatedCardIds, handIndex, isDealer]
  );

  // Memoize hand layout calculations with dynamic spacing for overflow prevention (mobile/tablet only)
  const handLayout = useMemo(() => {
    const cardCount = cards.length;
    const isSplitHand = (totalPlayerHands ?? 1) > 1;
    
    let effectiveSpacing = cardDimensions.spacing;
    
    // Only apply overlap logic on mobile/tablet to prevent screen overflow
    if (isMobile) {
      // Determine when to start overlapping:
      const overlapThreshold = isSplitHand ? 2 : 4;
      // Max cards to fit without overlap (reference for width calculation)
      const maxCardsReference = isSplitHand ? 2 : 4;
      
      if (cardCount > overlapThreshold) {
        // Progressively reduce spacing: more cards = tighter overlap
        // Target: keep hand width roughly the same as the reference card count
        const maxHandWidth = maxCardsReference * cardDimensions.spacing - (cardDimensions.spacing - cardDimensions.width);
        // Calculate spacing needed to fit all cards in the max width
        effectiveSpacing = (maxHandWidth + (cardDimensions.spacing - cardDimensions.width)) / cardCount;
        // Ensure minimum spacing (at least 35% of card width visible for split, 40% for single)
        const minSpacingRatio = isSplitHand ? 0.35 : 0.4;
        const minSpacing = cardDimensions.width * minSpacingRatio;
        effectiveSpacing = Math.max(effectiveSpacing, minSpacing);
      }
    }
    
    const handWidth =
      cardCount * effectiveSpacing -
      (effectiveSpacing - cardDimensions.width);
    const startX = -handWidth / 2 + cardDimensions.width / 2;
    const rightEdge = startX + handWidth;

    return { handWidth, startX, rightEdge, effectiveSpacing };
  }, [cards.length, cardDimensions, totalPlayerHands, isMobile]);

  // 🎯 Calculate score based ONLY on animated cards
  const calculatedScore = useMemo(() => {
    const animatedCards = cards.filter((_, index) => getCardVisibility(index));
    return calculateHandValue(animatedCards);
  }, [cards, getCardVisibility]);

  // 🎯 Check if we should show range (low/high) for hands with Ace
  const handValueRange = useMemo(() => {
    const animatedCards = cards.filter((_, index) => getCardVisibility(index));
    return getHandValueRange(animatedCards);
  }, [cards, getCardVisibility]);

  // Memoize visible cards and score calculations
  const scoreData = useMemo(() => {
    const visibleCards = cards.filter((_, i) => getCardVisibility(i));
    const visibleCardCount = visibleCards.length;

    if (visibleCardCount === 0) {
      return {
        displayScore: 0,
        scoreText: '0',
        scoreColor: '#FFFFFF',
        visibleCardCount: 0,
      };
    }

    // Use calculated score or range display
    const displayScore = handValueRange
      ? `${handValueRange.low}/${handValueRange.high}`
      : calculatedScore;

    const scoreText = displayScore.toString();

    // Calculate color based on numeric score (use calculatedScore which is always a number)
    const scoreColor =
      calculatedScore === 21
        ? '#FFD700'
        : calculatedScore > 21
        ? '#FF6B6B'
        : '#FFFFFF';

    return { displayScore, scoreText, scoreColor, visibleCardCount };
  }, [cards, getCardVisibility, calculatedScore, handValueRange]);

  // Memoize score box dimensions and position (scaled for mobile)
  const scoreBoxLayout = useMemo(() => {
    const scoreBoxHeight = isMobile ? 18 : 24;
    const charWidth = isMobile ? 8 : 10;
    const minWidth = isMobile ? 18 : 24;
    const scoreBoxWidth = Math.max(scoreData.scoreText.length * charWidth, minWidth);
    const scoreBoxX = handLayout.handWidth / 2 - scoreBoxWidth / 2;
    return { scoreBoxWidth, scoreBoxX, scoreBoxHeight };
  }, [scoreData.scoreText, handLayout.handWidth, isMobile]);

  // Memoize label style based on mobile
  const labelStyle = useMemo(
    () => (isMobile ? getMobileLabelStyle() : UI_STYLES.baseLabel),
    [isMobile]
  );

  // Memoize label Y position (adjusted gap for mobile)
  const labelY = useMemo(() => {
    const gap = isMobile ? 4 : 6;
    return label === 'DEALER'
      ? cardDimensions.height / 2 + scoreBoxLayout.scoreBoxHeight / 2 + gap
      : -(cardDimensions.height / 2 + scoreBoxLayout.scoreBoxHeight / 2 + gap);
  }, [label, cardDimensions.height, scoreBoxLayout.scoreBoxHeight, isMobile]);

  const statusY = useMemo(() => {
    const gap = isMobile ? 1 : 2;
    return cardDimensions.height / 2 + scoreBoxLayout.scoreBoxHeight / 2 + gap;
  }, [cardDimensions.height, scoreBoxLayout.scoreBoxHeight, isMobile]);
  // Memoize whether to show score
  const shouldShowScore = useMemo(
    () =>
      scoreData.displayScore !== undefined && scoreData.visibleCardCount > 1,
    [scoreData]
  );

  const shouldShowLabel = useMemo(
    () => !!label && scoreData.visibleCardCount > 1,
    [label, scoreData]
  );

  // Memoize insurance display
  const showInsurance = useMemo(
    () =>
      label === 'DEALER' &&
      !isActionInProgress &&
      gamePhase === GameStatePhaseType.ASK_INSURANCE,
    [label, isActionInProgress, gamePhase]
  );

  // Memoize split display
  const showSplit = useMemo(() => {
    const MAX_HANDS = 4;
    const currentHands =
      typeof totalPlayerHands === 'number' ? totalPlayerHands : 1;
    return (
      canSplit &&
      cards.length === 2 &&
      !isActionInProgress &&
      gamePhase === GameStatePhaseType.PLAYING &&
      currentHands < MAX_HANDS
    );
  }, [totalPlayerHands, canSplit, cards.length, isActionInProgress, gamePhase]);

  // Track if split prompt was dismissed
  const [splitDismissed, setSplitDismissed] = useState(false);

  // Reset dismissal when showSplit becomes true again
  useEffect(() => {
    if (showSplit) {
      setSplitDismissed(false);
    }
  }, [showSplit]);

  const shouldShowSplitPrompt = showSplit && !splitDismissed;

  // Memoize overlay display
  const showOverlay = useMemo(
    () =>
      !isDealer &&
      (!isActive || status === 'BUST' || status === 'STAND') &&
      !suppressOverlayUntilAnimationDone,
    [isDealer, isActive, status, suppressOverlayUntilAnimationDone]
  );

  // Memoize status style based on mobile
  const statusStyle = useMemo(() => getStatusStyle(isMobile), [isMobile]);

  // Memoize card flip calculation
  const calculateCardCanFlip = useCallback(
    (cardIndex: number) => {
      if (!isDealer || cardIndex !== 1) {
        return true;
      }

      const animatedPlayerCards = Array.from(animatedCardIds).filter((id) =>
        id.includes('player')
      ).length;

      return animatedPlayerCards === allPlayerCards;
    },
    [isDealer, animatedCardIds, allPlayerCards]
  );

  // Memoize dealer hole flip complete handler
  const getDealerHoleFlipComplete = useCallback(
    (cardIndex: number) => {
      return isDealer && cardIndex === 1 ? onDealerHoleFlipComplete : undefined;
    },
    [isDealer, onDealerHoleFlipComplete]
  );

  return (
    <pixiContainer x={x} y={y} sortableChildren={true}>
      {/* Label */}
      {shouldShowLabel && (
        <pixiText
          text={label}
          anchor={{ x: 0, y: 0.5 }}
          x={-handLayout.handWidth / 2}
          y={labelY}
          style={labelStyle}
          resolution={2}
          zIndex={1}
        />
      )}
      {/* Score Display */}
      {shouldShowScore && (
        <PixiSquareContainer
          width={scoreBoxLayout.scoreBoxWidth}
          height={scoreBoxLayout.scoreBoxHeight}
          x={scoreBoxLayout.scoreBoxX}
          y={labelY}
          position="right"
        >
          <pixiText
            text={scoreData.scoreText}
            anchor={0.5}
            x={0}
            y={0}
            style={labelStyle}
            pivot={{ x: -1, y: -1 }}
            resolution={2}
          />
        </PixiSquareContainer>
      )}

      {/* Cards */}
      {cards.map((card, index) => (
        <CardComponent
          key={
            isDealer ? `dealer-${index}` : `player-${handIndex ?? 0}-${index}`
          }
          card={card}
          cardIndex={index}
          isVisible={getCardVisibility(index)}
          x={handLayout.startX + index * handLayout.effectiveSpacing}
          y={0}
          isMobile={isMobile}
          isDealer={isDealer}
          handIndex={handIndex}
          animateIn={animateIn}
          showOverlay={showOverlay}
          canFlip={calculateCardCanFlip(index)}
          onDealerHoleFlipComplete={getDealerHoleFlipComplete(index)}
        />
      ))}

      {/* Status - rendered after cards with high zIndex to appear above card shadows */}
      {status &&
        !isDealer &&
        (status === 'BUST' ||
          status === 'BLACKJACK' ||
          status === 'SURRENDER' ||
          !isActionInProgress) && (
          <pixiText
            text={status}
            anchor={0.5}
            x={5}
            y={statusY}
            style={statusStyle}
            zIndex={1000}
          />
        )}

      {/* Insurance Prompt */}
      {showInsurance && (
        <InsuranceSprite
          isMobile={isMobile}
          onAction={onAction}
          fontSize={18}
          disabled={isActionInProgress}
        />
      )}
      {/* Split Button */}
      {shouldShowSplitPrompt && (
        <SpliteSprite
          isMobile={isMobile}
          fontSize={18}
          onSplit={() => onSplit?.(handIndex)}
          onClose={() => setSplitDismissed(true)}
          disabled={isActionInProgress}
        />
      )}
    </pixiContainer>
  );
}

const getStatusStyle = (isMobile: boolean) =>
  new TextStyle({
    fontFamily: 'Minecraft, monospace',
    fontSize: isMobile ? 10 : 12,
    fill: '#ffe8a3',
    align: 'center',
    dropShadow: {
      color: '#000000',
      distance: isMobile ? 1.5 : 2,
    },
  });
