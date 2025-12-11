/**
 * Insurance Chip Display Component
 *
 * Displays insurance chips on a hand and handles win/loss animations
 * similar to sidepot chip animations.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { GameState, InsuranceResult } from '@/types/games/blackjack/game';
import { optimizeChips } from '@/utils/games/blackjack/client/stateUtils';
import { ChipStack } from './ChipSprite';
import { ChipAnimation } from './ChipAnimation';
import { playSound } from '@/utils/games/blackjack/client/sounds';
import { Container } from 'pixi.js';

interface InsuranceChipDisplayProps {
  gameState: GameState;
  handIndex: number;
  handPosition: { x: number; y: number };
  isMobile: boolean;
  balancePosition: { x: number; y: number };
}

export function InsuranceChipDisplay({
  gameState,
  handIndex,
  handPosition,
  isMobile,
  balancePosition,
}: InsuranceChipDisplayProps) {
  const [shouldShowChips, setShouldShowChips] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [winningChips, setWinningChips] = useState<number[]>([]);
  const [isAnimatingWin, setIsAnimatingWin] = useState(false);
  const chipRef = useRef<Container>(null);
  const previousInsuranceResultsRef = useRef<InsuranceResult[] | undefined>(
    gameState.insuranceResults
  );

  const insuranceBet = gameState.insuranceBet ?? 0;
  const insuranceChips = optimizeChips(insuranceBet);

  // Calculate insurance chip position (to the right of the hand, like a sidepot)
  const chipPosition = useMemo(() => {
    const cardSpacing = isMobile ? 35 : 50;
    const handWidth =
      (gameState.playerHands[handIndex]?.cards.length ?? 0) * cardSpacing;
    return {
      x: handPosition.x + handWidth / 2 + (isMobile ? 30 : 40),
      y: handPosition.y,
    };
  }, [handPosition, handIndex, gameState.playerHands, isMobile]);

  // Show chips when insurance is taken
  useEffect(() => {
    if (insuranceBet > 0 && !shouldShowChips) {
      setShouldShowChips(true);
      setAnimateOut(false);
    } else if (insuranceBet === 0 && shouldShowChips) {
      setShouldShowChips(false);
    }
  }, [insuranceBet, shouldShowChips]);

  // Handle insurance results and trigger animations
  useEffect(() => {
    const hasNewInsuranceResults =
      gameState.insuranceResults &&
      gameState.insuranceResults.length > 0 &&
      JSON.stringify(gameState.insuranceResults) !==
        JSON.stringify(previousInsuranceResultsRef.current);

    if (hasNewInsuranceResults) {
      previousInsuranceResultsRef.current = gameState.insuranceResults;

      // Find insurance result for this hand
      const insuranceResult = gameState.insuranceResults?.find(
        (result) => result.handIndex === handIndex
      );

      if (!insuranceResult) return;

      // Add delay before revealing insurance results (wait for dealer hole card flip)
      const delay = 2000;
      const timer = setTimeout(() => {
        if (insuranceResult.result === 'LOSE') {
          // Trigger fade-out animation for losing insurance
          setAnimateOut(true);
          setTimeout(() => {
            setShouldShowChips(false);
          }, 600);
        } else if (
          insuranceResult.result === 'WIN' &&
          insuranceResult.payout &&
          insuranceResult.payout > 0
        ) {
          // Hide original insurance chips and animate winning chips to balance
          setShouldShowChips(false);
          const payoutChips = optimizeChips(insuranceResult.payout);
          setWinningChips(payoutChips);
          setIsAnimatingWin(true);
          playSound('game-win-3', 0.5);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [gameState.insuranceResults, handIndex]);

  // Handle win animation completion
  const handleWinAnimationComplete = () => {
    setIsAnimatingWin(false);
  };

  if (!shouldShowChips && !isAnimatingWin) return null;

  return (
    <>
      {/* Insurance bet chips */}
      {shouldShowChips && insuranceChips.length > 0 && (
        <ChipStack
          chips={insuranceChips}
          x={chipPosition.x}
          y={chipPosition.y}
          scale={isMobile ? 0.08 : 0.1}
          animateIn={false}
          animateOut={animateOut}
          ref={chipRef}
        />
      )}

      {/* Win animation: insurance chips → balance (2:1 payout) */}
      {isAnimatingWin && winningChips.length > 0 && (
        <ChipAnimation
          chips={winningChips}
          startX={chipPosition.x}
          startY={chipPosition.y}
          endX={balancePosition.x}
          endY={balancePosition.y}
          duration={1.2}
          onComplete={handleWinAnimationComplete}
          soundTriggerProgress={0.85}
          zIndex={1000}
        />
      )}
    </>
  );
}
