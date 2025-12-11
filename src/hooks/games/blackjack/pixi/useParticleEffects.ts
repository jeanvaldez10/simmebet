import { useEffect, useState } from "react";
import { GameState, GamePhaseType } from "@/types/games/blackjack/game";
import { CONFETTI_PROFIT_THRESHOLD } from "@/utils/games/blackjack/client/uiConfig";

/**
 * Custom hook for managing particle effects (win particles and confetti)
 */
export function useParticleEffects(gameState: GameState) {
  const [showWinParticles, setShowWinParticles] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (
      gameState.gamePhase === GamePhaseType.FINISHED &&
      gameState.result === "WIN"
    ) {
      setShowWinParticles(true);
      if (gameState.gameProfit > CONFETTI_PROFIT_THRESHOLD) {
        setShowConfetti(true);
      }
    } else {
      setShowWinParticles(false);
      setShowConfetti(false);
    }
  }, [gameState.gamePhase, gameState.result, gameState.gameProfit]);

  return { showWinParticles, showConfetti };
}

