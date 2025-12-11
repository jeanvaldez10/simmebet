import { useEffect, useState } from "react";
import { CoinflipGameState, CoinflipStatus } from "@/types/games/coinflip/game";

// Particle effects thresholds
const CONFETTI_PROFIT_THRESHOLD = 100; // Show confetti if profit > this amount

/**
 * Custom hook for managing particle effects (win particles and confetti)
 */
export function useParticleEffects(gameState: CoinflipGameState) {
  const [showWinParticles, setShowWinParticles] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (
      gameState.status === CoinflipStatus.FINISHED &&
      gameState.payout !== undefined &&
      gameState.playerId &&
      gameState.amount &&
      gameState.payout > 0
    ) {
      setShowWinParticles(true);
      const profit = gameState.payout - gameState.amount;
      if (profit > CONFETTI_PROFIT_THRESHOLD) {
        setShowConfetti(true);
      }
    } else {
      setShowWinParticles(false);
      setShowConfetti(false);
    }
  }, [gameState.status, gameState.payout, gameState.playerId, gameState.amount]);

  return { showWinParticles, showConfetti };
}

