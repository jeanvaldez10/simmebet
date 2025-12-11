import { Card as CardComponent } from '../cards/Card';
import {
  Card,
  GameActionType,
  GameStatePhaseType,
} from '@/types/games/blackjack/game';
import { TextStyle } from 'pixi.js';
import { useMemo, useCallback } from 'react';
import SpliteSprite from '../indicators/SpliteSprite';
import InsuranceSprite from '../indicators/InsuranceSprite';
import {
  getActualCardWidth,
  getActualCardHeight,
  getCardSpacing,
} from '@/utils/games/blackjack/client/uiConfig';
import { calculateHandValue, getHandValueRange } from '@/utils/games/blackjack';
import { UI_STYLES } from '../styles';
import { PixiTransparentContaner } from '../containers/PixiTransparentContainer';
import { LayoutStyles } from '@pixi/layout';

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
  isDealing = false,
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

  // Memoize hand layout calculations
  const handLayout = useMemo(() => {
    const handWidth =
      (cards.length - 1) * cardDimensions.spacing + cardDimensions.width;
    const startX = -handWidth / 2 + cardDimensions.width / 2;
    const rightEdge = startX + handWidth;

    return { handWidth, startX, rightEdge };
  }, [cards.length, cardDimensions]);

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

  // Memoize score box dimensions and position
  // const scoreBoxLayout = useMemo(() => {
  //   const scoreBoxWidth = Math.max(scoreData.scoreText.length * 10, 24);
  //   const scoreBoxX = handLayout.handWidth / 2 - scoreBoxWidth / 2;
  //   return { scoreBoxWidth, scoreBoxX };
  // }, [scoreData.scoreText, handLayout.handWidth]);

  // Memoize label style
  const labelStyle = useMemo(() => {
    const style = UI_STYLES.baseLabel.clone();
    style.fontSize = isMobile ? 10 : 14;
    return style;
  }, [isMobile]);

  // Memoize label Y position
  // const labelY = useMemo(
  //   () =>
  //     label === 'DEALER'
  //       ? cardDimensions.height / 2 + scoreBoxLayout.scoreBoxWidth / 2 + 5
  //       : -(cardDimensions.height / 2 + scoreBoxLayout.scoreBoxWidth / 2 + 5),
  //   [label, cardDimensions.height, scoreBoxLayout.scoreBoxWidth]
  // );

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
      !isDealing &&
      gamePhase === GameStatePhaseType.ASK_INSURANCE,
    [label, isDealing, gamePhase]
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
      gamePhase !== GameStatePhaseType.ASK_INSURANCE &&
      currentHands < MAX_HANDS
    );
  }, [totalPlayerHands, canSplit, cards.length, isActionInProgress, gamePhase]);

  // Memoize status Y position
  // const statusY = useMemo(
  //   () =>
  //     label === 'DEALER'
  //       ? -cardDimensions.height / 2 - 30
  //       : isMobile
  //       ? cardDimensions.height / 2 + 25
  //       : cardDimensions.height / 2 + 36,
  //   [label, isMobile, cardDimensions.height]
  // );

  // Memoize overlay display
  const showOverlay = useMemo(
    () =>
      !isDealer &&
      (!isActive || status === 'BUST' || status === 'STAND') &&
      !suppressOverlayUntilAnimationDone,
    [isDealer, isActive, status, suppressOverlayUntilAnimationDone]
  );

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
    <layoutContainer
      x={x}
      y={y}
      layout={{
        flexDirection: isDealer ? 'column' : 'column-reverse',
        justifyContent: 'center',
        width: handLayout.handWidth,
        right: handLayout.handWidth / 2,
        bottom: cardDimensions.height / 2 + (isDealer ? 0 : 36),
      }}
    >
      {/* Cards Container - positioned absolutely to preserve card positions */}
      <layoutContainer
        layout={{
          width: handLayout.handWidth,
          height: cardDimensions.height,
          position: 'relative',
        }}
      >
        {cards.map((card, index) => (
          <CardComponent
            key={
              isDealer ? `dealer-${index}` : `player-${handIndex ?? 0}-${index}`
            }
            card={card}
            cardIndex={index}
            isVisible={getCardVisibility(index)}
            x={index * cardDimensions.spacing}
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
        {/* Split Button - positioned between the two cards */}
        {showSplit && (
          <layoutContainer layout={styles.splitButtonContainer}>
            <SpliteSprite
              isMobile={isMobile}
              fontSize={isMobile ? 16 : 24}
              onSplit={() => onSplit?.(handIndex)}
            />
          </layoutContainer>
        )}
        {/* Insurance Prompt - centered above dealer cards */}
        {showInsurance && (
          <layoutContainer layout={styles.insuranceContainer}>
            <InsuranceSprite
              isMobile={isMobile}
              onAction={onAction}
              fontSize={18}
              disabled={isActionInProgress}
            />
          </layoutContainer>
        )}
      </layoutContainer>
      <layoutContainer layout={styles.labelContainer}>
        {/* Label */}
        {shouldShowLabel ? (
          <PixiTransparentContaner layout={styles.labelBox}>
            <layoutText
              text={label}
              layout={{ objectFit: 'none' }}
              style={labelStyle}
            />
          </PixiTransparentContaner>
        ) : (
          <layoutContainer />
        )}
        {status ? (
          <PixiTransparentContaner layout={styles.statusBox}>
            <layoutText
              text={status}
              layout={{ objectFit: 'none' }}
              style={statusStyle}
            />
          </PixiTransparentContaner>
        ) : (
          <layoutContainer />
        )}
        {shouldShowScore ? (
          <PixiTransparentContaner layout={styles.scoreBox}>
            <layoutText
              text={shouldShowScore ? scoreData.scoreText : ''}
              layout={{ objectFit: 'none' }}
              style={labelStyle}
            />
          </PixiTransparentContaner>
        ) : (
          <layoutContainer />
        )}
      </layoutContainer>
    </layoutContainer>
  );
}

const statusStyle = new TextStyle({
  fontFamily: 'Minecraft, monospace',
  fontSize: 14,
  fill: '#ffe8a3',
  align: 'center',
  dropShadow: {
    color: '#000000',
    distance: 2,
  },
});

const styles: Record<string, LayoutStyles> = {
  labelBox: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  statusBox: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  scoreBox: {
    paddingLeft: 6,
  },
  labelContainer: {
    width: '100%',
    height: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformOrigin: '50% 50%',
  },
  insuranceContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transformOrigin: '50% 50%',
  },
};
