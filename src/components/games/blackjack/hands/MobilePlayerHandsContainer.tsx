import { useState, useMemo, useEffect, useRef } from 'react';
import type { FederatedPointerEvent } from 'pixi.js';
import { Rectangle } from 'pixi.js';
import { PlayerHandSprite } from './PlayerHandSprite';
import { GameState, GameActionType } from '@/types/games/blackjack/game';
import { getIconTexture } from '@/utils/games/blackjack/client/pixiAssets';
import { PixiSquareContainer } from '../containers';
import { getActualCardWidth, getActualCardHeight, getCardSpacing } from '@/utils/games/blackjack/client/uiConfig';
import { UI_STYLES } from '../styles';
import { useDropShadowFilter } from '@/hooks/games/blackjack/useDropShadowFilter';



interface MobilePlayerHandsContainerProps {
  gameState: GameState;
  basePosition: { x: number; y: number };
  isActionInProgress: boolean;
  isDealing: boolean;
  onAction?: (action: GameActionType, amount?: number) => void;
  animatedCardIds: Set<string>;
  isMobile: boolean;
  balancePosition?: { x: number; y: number };
}



const INITIAL_HANDS_TO_SHOW = 2;



// UI Constants
const SPLIT_INFO_ICON = {
  width: 47,
  height: 39,
} as const;



const INDICATOR_BADGE = {
  width: 12.97,
  height: 12.97,
  color: 0xfe4c40,
} as const;



const NAVIGATION = {
  yOffset: -100,
  yIconOffset: -70,
  leftSideX: -150,
  rightSideX: 150,
  handSpacing: 60,
} as const;



export function MobilePlayerHandsContainer({
  gameState,
  basePosition,
  isActionInProgress,
  isDealing,
  onAction,
  animatedCardIds,
  isMobile,
  balancePosition,
}: MobilePlayerHandsContainerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalHands = gameState.playerHands.length;
  const maxPage = Math.max(0, totalHands - INITIAL_HANDS_TO_SHOW);

  // Simply clamp currentPage if it's out of bounds (no useEffect needed)
  const validCurrentPage = Math.min(currentPage, maxPage);

  // Swipe state for mouse drag
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 50; // Minimum distance in pixels to trigger swipe

  // Reset to page 0 when starting a new game (hands go from >2 to <=2)
  const prevTotalHandsRef = useRef(totalHands);
  useEffect(() => {
    const prevTotal = prevTotalHandsRef.current;
    prevTotalHandsRef.current = totalHands;

    // Only reset if hands decreased significantly (new game started)
    if (totalHands <= INITIAL_HANDS_TO_SHOW && prevTotal > INITIAL_HANDS_TO_SHOW) {
      setCurrentPage(0);
    }
  }, [totalHands]);



  // Always show 2 hands, sliding window with overlap
  const visibleHands = useMemo(() => {

    // Start index shifts by 1 for each page, creating the overlap
    const startIndex = validCurrentPage;
    const endIndex = Math.min(startIndex + INITIAL_HANDS_TO_SHOW, totalHands);

    return gameState.playerHands.slice(startIndex, endIndex).map((hand, idx) => {
      const originalIndex = startIndex + idx;
      return {
        hand,
        originalIndex,
      };
    });
  }, [gameState.playerHands, validCurrentPage, totalHands]);



  // Calculate positions and dimensions for 2 hands centered on screen
  const cardHeight = getActualCardHeight(isMobile);

  const handPositions = useMemo(() => {
    if (visibleHands.length === 0) return [];

    const cardSpacing = getCardSpacing(isMobile);
    const cardWidth = getActualCardWidth(isMobile);

    // Calculate hand widths
    const handWidths = visibleHands.map(({ hand }) => {
      const cardCount = hand.cards.length;
      if (cardCount <= 1) return cardWidth;
      return cardSpacing * (cardCount - 1) + cardWidth;
    });



    // Spacing between hands (if 2 hands)
    const handSpacing = visibleHands.length === 2 ? NAVIGATION.handSpacing : 0;
    const totalWidth = handWidths.reduce((sum, w) => sum + w, 0) + handSpacing * (visibleHands.length - 1);



    // Center the hands
    const startX = basePosition.x - totalWidth / 2;
    const positions: { x: number; y: number; width: number }[] = [];
    let currentX = startX;



    handWidths.forEach((width) => {
      positions.push({
        x: currentX + width / 2,
        y: basePosition.y,
        width,
      });
      currentX += width + handSpacing;
    });



    return positions;
  }, [visibleHands, basePosition, isMobile]);



  // Calculate remaining hands on the left (towards hand4, leftmost in display)
  const remainingHandsLeft = useMemo(() => {
    const endIndex = validCurrentPage + INITIAL_HANDS_TO_SHOW;
    return Math.max(0, totalHands - endIndex);
  }, [validCurrentPage, totalHands]);

  // Calculate remaining hands on the right (towards hand1, rightmost in display)
  const remainingHandsRight = useMemo(() => {
    return validCurrentPage;
  }, [validCurrentPage]);



  // Navigation handlers - move one hand at a time
  const navigateForward = () => {
    // Navigate left (slide to show one more hand to the left)
    setCurrentPage(prev => {
      const newPage = prev + 1;
      return newPage <= maxPage ? newPage : prev;
    });
  };



  const navigateBackward = () => {
    // Navigate right (slide to show one more hand to the right)
    setCurrentPage(prev => {
      const newPage = prev - 1;
      return newPage >= 0 ? newPage : prev;
    });
  };



  // Mouse swipe handlers for hand sprites (carousel functionality)
  const handleHandPointerDown = (event: FederatedPointerEvent) => {
    if (totalHands <= INITIAL_HANDS_TO_SHOW) return;

    const globalPos = event.global;
    swipeStartRef.current = { x: globalPos.x, y: globalPos.y };
  };



  const handleHandPointerUp = (event: FederatedPointerEvent) => {
    if (!swipeStartRef.current || totalHands <= INITIAL_HANDS_TO_SHOW) {
      swipeStartRef.current = null;
      return;
    }



    const globalPos = event.global;
    const deltaX = globalPos.x - swipeStartRef.current.x;
    const deltaY = globalPos.y - swipeStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);



    // Only trigger swipe if horizontal movement is greater than vertical (horizontal swipe)
    // and exceeds the threshold
    if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Swipe right -> navigate backward (show rightmost hands)
        navigateBackward();
      } else {
        // Swipe left -> navigate forward (show leftmost hands)
        navigateForward();
      }
    }



    swipeStartRef.current = null;
  };



  // Calculate navigation button positions (above hands)
  const navY = basePosition.y + NAVIGATION.yOffset;
  const iconY = navY + NAVIGATION.yIconOffset;
  const leftSideX = basePosition.x + NAVIGATION.leftSideX - 12;
  const rightSideX = basePosition.x + NAVIGATION.rightSideX + 12;
  const dropShadowFilter = useDropShadowFilter({
    offset: { x: 4, y: 4 },
  });

  return (
    <pixiContainer>
      {/* Visible Hands */}
      {visibleHands.map(({ hand, originalIndex }, idx) => {
        const handPos = handPositions[idx];
        if (!handPos) return null;

        const hitArea = new Rectangle(
          -handPos.width / 2,
          -cardHeight / 2,
          handPos.width,
          cardHeight
        );

        return (
          <pixiContainer
            key={`mobile-hand-wrapper-${originalIndex}`}
            x={handPos.x}
            y={handPos.y}
            hitArea={hitArea}
            eventMode={totalHands > INITIAL_HANDS_TO_SHOW ? "static" : "none"}
            onPointerDown={totalHands > INITIAL_HANDS_TO_SHOW ? handleHandPointerDown : undefined}
            onPointerUp={totalHands > INITIAL_HANDS_TO_SHOW ? handleHandPointerUp : undefined}
            onPointerUpOutside={totalHands > INITIAL_HANDS_TO_SHOW ? () => {
              swipeStartRef.current = null;
            } : undefined}
          >
            <PlayerHandSprite
              key={`mobile-hand-${originalIndex}`}
              hand={hand}
              handIndex={originalIndex}
              gameState={gameState}
              position={{ x: 0, y: 0 }}
              isMobile={isMobile}
              onAction={onAction}
              animatedCardIds={animatedCardIds}
              isActionInProgress={isActionInProgress}
              isDealing={isDealing}
              balancePosition={balancePosition}
            />
          </pixiContainer>
        );
      })}



      {/* Navigation Carousel - SplitInfo buttons - Rendered after hands to ensure they're on top */}
      {totalHands > INITIAL_HANDS_TO_SHOW && (
        <pixiContainer>
          {/* Left Side - SplitInfo to navigate forward (show leftmost hands) */}
          {remainingHandsLeft > 0 && (
            <pixiContainer
              x={leftSideX}
              y={iconY}
              resolution={2}
              zIndex={1000}
            >
              <pixiSprite
                texture={getIconTexture('infoLeft')}
                x={0}
                y={0}
                width={SPLIT_INFO_ICON.width}
                height={SPLIT_INFO_ICON.height}
                anchor={{ x: 0.5, y: 0.5 }}
                filters={dropShadowFilter}
                eventMode="static"
                cursor="pointer"
                onTap={() => navigateForward()}
              />
              {/* Show remaining hands indicator - positioned at top right of splitInfo icon */}
              <PixiSquareContainer
                width={INDICATOR_BADGE.width}
                height={INDICATOR_BADGE.height}
                x={SPLIT_INFO_ICON.width + 30 + 10}
                y={-SPLIT_INFO_ICON.height / 2 - INDICATOR_BADGE.height / 2 + 3}
                color={INDICATOR_BADGE.color}
                alpha={1}
                filters={dropShadowFilter}
                eventMode="none"
              >
                <pixiText
                  text={remainingHandsLeft.toString()}
                  anchor={0.5}
                  x={1.5}
                  y={1}
                  style={UI_STYLES.xxsLabel}
                  eventMode="none"
                  resolution={2}
                />
              </PixiSquareContainer>
            </pixiContainer>
          )}



          {/* Right Side - SplitInfo to navigate backward (show rightmost hands) */}
          {remainingHandsRight > 0 && (
            <pixiContainer
              x={rightSideX}
              y={iconY}
              zIndex={1000}
            >
              <pixiSprite
                texture={getIconTexture('infoRight')}
                x={0}
                y={0}
                width={SPLIT_INFO_ICON.width}
                height={SPLIT_INFO_ICON.height}
                anchor={{ x: 0.5, y: 0.5 }}
                filters={dropShadowFilter}
                eventMode="static"
                cursor="pointer"
                onTap={() => navigateBackward()}
              />
              {/* Show remaining hands indicator - positioned at top right of splitInfo icon */}
              <PixiSquareContainer
                width={INDICATOR_BADGE.width}
                height={INDICATOR_BADGE.height}
                x={SPLIT_INFO_ICON.width / 2 + INDICATOR_BADGE.width / 2 + 6}
                y={-SPLIT_INFO_ICON.height / 2 - INDICATOR_BADGE.height / 2 + 3}
                color={INDICATOR_BADGE.color}
                alpha={1}
                filters={dropShadowFilter}
                eventMode="none"
              >
                <pixiText
                  text={remainingHandsRight.toString()}
                  anchor={0.5}
                  x={1}
                  y={1}
                  style={UI_STYLES.xxsLabel}
                  eventMode="none"
                  resolution={2}
                />
              </PixiSquareContainer>
            </pixiContainer>
          )}
        </pixiContainer>
      )}
    </pixiContainer>
  );
}