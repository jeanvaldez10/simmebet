import { ShuffleVerification, GameState, FrontendGameState } from '@/types/games/blackjack/game';
import { GameStatePhaseType, Card } from '@/types/games/blackjack/game';

import { getShuffleVerificationInfo, createShuffledDeck } from './deterministicShuffle';

/**
 * Generate shuffle verification info for a game state
 * @param gameState - The current game state
 * @param revealSalt - Whether to reveal the salt (should be true when game ends)
 * @returns ShuffleVerification object
 */
export function generateShuffleVerification(
  gameState: GameState | FrontendGameState, 
  revealSalt: boolean = false
): ShuffleVerification {
  const shuffleId = gameState.shuffleId;
  const shuffleSalt = gameState.shuffleSalt;
  
  // If we're revealing the salt, we need to provide the actual shuffled deck
  // that was used in the game for verification
  let actualShuffledDeck: Card[] | undefined;
  
  if (revealSalt && shuffleSalt) {
    // Generate the actual shuffled deck that was used in the game
    actualShuffledDeck = createShuffledDeck(shuffleId, shuffleSalt);
  }
  
  return getShuffleVerificationInfo(
    shuffleId, 
    revealSalt, 
    shuffleSalt, 
    actualShuffledDeck
  );
}

/**
 * Determine if the salt should be revealed based on game state
 * @param gameState - The current game state
 * @returns true if salt should be revealed (game has ended)
 */
export function shouldRevealSalt(gameState: GameState | FrontendGameState): boolean {
  // Reveal salt when the game is finished
  return gameState.gamePhase === GameStatePhaseType.FINISHED;
}

/**
 * Generate shuffle verification for game response
 * @param gameState - The current game state
 * @returns ShuffleVerification object or null if not applicable
 */
export function getShuffleVerificationForResponse(
  gameState: GameState | FrontendGameState
): ShuffleVerification | null {
  // Always include shuffle verification info
  const revealSalt = shouldRevealSalt(gameState);
  return generateShuffleVerification(gameState, revealSalt);
}
