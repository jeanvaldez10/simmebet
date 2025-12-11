/**
 * Chip Animation Manager
 * Manages chip animations for wins (dealer → bet → balance) and losses (bet → dealer → offscreen)
 */

import { useEffect, useRef, useState } from 'react';
import { GameState, GamePhaseType } from '@/types/games/blackjack/game';
import { optimizeChips } from '@/utils/games/blackjack/client/stateUtils';
import { playSound } from '@/utils/games/blackjack/client/sounds';
import { ChipAnimation } from './ChipAnimation';

interface ChipAnimationManagerProps {
  gameState: GameState;
  positions: {
    dealer: { x: number; y: number };
    bet: { x: number; y: number };
    balance: { x: number; y: number };
  };
  isDealing: boolean;
  onLossAnimationStart?: () => void;
}

type WinAnimationPhase = 'dealer-to-bet' | 'bet-to-balance';
type LossAnimationPhase = 'bet-to-dealer' | 'dealer-to-offscreen';

type AnimationType = 'win' | 'loss' | null;

export function ChipAnimationManager({
  gameState,
  positions,
  isDealing,
  onLossAnimationStart,
}: ChipAnimationManagerProps) {
  const [activeAnimation, setActiveAnimation] = useState<{
    type: AnimationType;
    chips: number[];
    phase: WinAnimationPhase | LossAnimationPhase;
  } | null>(null);

  const previousGamePhaseRef = useRef<GamePhaseType>(gameState.gamePhase);
  const previousResultRef = useRef<string | undefined>(gameState.result);
  const hasTriggeredWinRef = useRef(false);
  const hasTriggeredLossRef = useRef(false);

  // Handle win animation: dealer → bet → balance
  useEffect(() => {
    const isGameFinished = gameState.gamePhase === GamePhaseType.FINISHED;
    const hasWon = gameState.result === 'WIN' && gameState.totalWon > 0;

    // Reset trigger flags when game phase changes to betting
    if (gameState.gamePhase === GamePhaseType.BETTING) {
      hasTriggeredWinRef.current = false;
      hasTriggeredLossRef.current = false;
      previousGamePhaseRef.current = gameState.gamePhase;
      previousResultRef.current = gameState.result;
      return;
    }

    // Only trigger when:
    // 1. Game is finished with a win
    // 2. Dealing is complete
    // 3. Haven't triggered yet
    if (isGameFinished && hasWon && !isDealing && !hasTriggeredWinRef.current) {
      const winAmount = gameState.totalWon;
      const winChips = optimizeChips(winAmount);
      // Delay animation to let user see the result (hack due to the delayed update of dealing state)
      const timer = setTimeout(() => {
        if (winChips.length > 0) {
          hasTriggeredWinRef.current = true;

          setActiveAnimation({
            type: 'win',
            chips: winChips,
            phase: 'dealer-to-bet',
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    previousGamePhaseRef.current = gameState.gamePhase;
    previousResultRef.current = gameState.result;
  }, [gameState.gamePhase, gameState.result, gameState.totalWon, isDealing]);

  // Handle loss animation: bet → dealer → offscreen
  useEffect(() => {
    const isGameFinished = gameState.gamePhase === GamePhaseType.FINISHED;
    // Check for loss: LOSE, BUST, or undefined result with negative profit
    const hasLost =
      gameState.result === 'LOSE' ||
      gameState.result === 'BUST' ||
      (!gameState.result && gameState.gameProfit < 0);

    console.log('[ChipAnimation] Loss animation check', {
      isGameFinished,
      hasLost,
      result: gameState.result,
      gameProfit: gameState.gameProfit,
      hasTriggeredLoss: hasTriggeredLossRef.current,
      currentPhase: gameState.gamePhase,
      initialBet: gameState.initialBet,
      isDealing,
    });

    // Only trigger when:
    // 1. Game is finished with a loss
    // 2. Dealing is complete
    // 3. Haven't triggered yet
    // 4. Has bet amount
    if (
      isGameFinished &&
      hasLost &&
      !isDealing &&
      !hasTriggeredLossRef.current &&
      gameState.initialBet > 0
    ) {
      const betAmount = gameState.initialBet;
      const betChips = optimizeChips(betAmount);

      console.log('[ChipAnimation] Starting loss animation', {
        betAmount,
        betChips,
        from: { x: positions.bet.x, y: positions.bet.y },
        to: { x: positions.dealer.x, y: positions.dealer.y },
      });

      // Delay animation to let user see the result (hack due to the delayed update of dealing state)
      const timer = setTimeout(() => {
        if (betChips.length > 0) {
          hasTriggeredLossRef.current = true;

          // Start animation - animated chips will appear on top with higher z-index
          setActiveAnimation({
            type: 'loss',
            chips: betChips,
            phase: 'bet-to-dealer',
          });
          // Hide static chips immediately since animated chips are visible
          onLossAnimationStart?.();
        } else {
          console.warn('[ChipAnimation] No chips to animate for loss');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [
    gameState.gamePhase,
    gameState.result,
    gameState.initialBet,
    gameState.gameProfit,
    isDealing,
    positions,
    onLossAnimationStart,
  ]);

  // Handle phase transitions
  const handlePhaseComplete = () => {
    if (!activeAnimation) return;

    if (activeAnimation.type === 'win') {
      if (activeAnimation.phase === 'dealer-to-bet') {
        // Move to phase 2: bet → balance
        setActiveAnimation({
          type: 'win',
          chips: activeAnimation.chips,
          phase: 'bet-to-balance',
        });
      } else if (activeAnimation.phase === 'bet-to-balance') {
        // Win animation complete
        setActiveAnimation(null);
      }
    } else if (activeAnimation.type === 'loss') {
      if (activeAnimation.phase === 'bet-to-dealer') {
        // Move to phase 2: dealer → offscreen
        setActiveAnimation({
          type: 'loss',
          chips: activeAnimation.chips,
          phase: 'dealer-to-offscreen',
        });
      } else if (activeAnimation.phase === 'dealer-to-offscreen') {
        // Loss animation complete
        setActiveAnimation(null);
      }
    }
  };

  // Play win sound when chips reach balance
  const handleSoundTrigger = () => {
    playSound('chips-collect', 0.5, 2.5);
  };

  if (!activeAnimation) return null;

  // Win animation phases
  const isWinPhase1 =
    activeAnimation.type === 'win' && activeAnimation.phase === 'dealer-to-bet';
  const isWinPhase2 =
    activeAnimation.type === 'win' &&
    activeAnimation.phase === 'bet-to-balance';

  // Loss animation phases
  const isLossPhase1 =
    activeAnimation.type === 'loss' &&
    activeAnimation.phase === 'bet-to-dealer';
  const isLossPhase2 =
    activeAnimation.type === 'loss' &&
    activeAnimation.phase === 'dealer-to-offscreen';

  return (
    <>
      {/* Win Animation Phase 1: Dealer → Bet */}
      {isWinPhase1 && (
        <ChipAnimation
          chips={activeAnimation.chips}
          startX={positions.dealer.x}
          startY={positions.dealer.y}
          endX={positions.bet.x}
          endY={positions.bet.y}
          duration={1.2}
          onComplete={handlePhaseComplete}
          zIndex={1000}
        />
      )}
      {/* Win Animation Phase 2: Bet → Balance */}
      {isWinPhase2 && (
        <ChipAnimation
          chips={activeAnimation.chips}
          startX={positions.bet.x}
          startY={positions.bet.y}
          endX={positions.balance.x}
          endY={positions.balance.y}
          duration={1.2}
          onComplete={handlePhaseComplete}
          onSoundTrigger={handleSoundTrigger}
          soundTriggerProgress={0.85}
          zIndex={1000}
        />
      )}
      {/* Loss Animation Phase 1: Bet → Dealer */}
      {isLossPhase1 && (
        <ChipAnimation
          chips={activeAnimation.chips}
          startX={positions.bet.x}
          startY={positions.bet.y}
          endX={positions.dealer.x}
          endY={positions.dealer.y}
          duration={1.2}
          onComplete={handlePhaseComplete}
          startVisible={true}
          zIndex={2000}
        />
      )}
      {/* Loss Animation Phase 2: Dealer → Offscreen (move up and fade) */}
      {isLossPhase2 && (
        <ChipAnimation
          chips={activeAnimation.chips}
          startX={positions.dealer.x}
          startY={positions.dealer.y}
          endX={positions.dealer.x}
          endY={positions.dealer.y - 300}
          duration={1.0}
          onComplete={handlePhaseComplete}
          fadeOut={true}
          startVisible={true}
          zIndex={2000}
        />
      )}
    </>
  );
}
