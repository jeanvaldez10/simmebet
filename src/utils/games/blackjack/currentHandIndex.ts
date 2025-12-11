import { GameState, Hand } from '@/types/games/blackjack/game';

/**
 * Calculates the current hand index based on the game state.
 * The current hand is the first hand that is not standing, not busted, and doesn't need a card.
 * If all hands are complete, returns -1.
 * 
 * @param gameState The current game state
 * @returns The index of the current active hand, or -1 if no hands are active
 */
export function getCurrentHandIndex(gameState: GameState): number {
  if (!gameState.playerHands || gameState.playerHands.length === 0) {
    return -1;
  }

  // Find the first hand that is not standing, not busted, and doesn't need a card
  const activeHandIndex = gameState.playerHands.findIndex((hand: Hand) => 
    !hand.isStanding && !hand.isBusted
  );

  return activeHandIndex;
}

/**
 * Gets the current active hand from the game state.
 * 
 * @param gameState The current game state
 * @returns The current active hand, or undefined if no hands are active
 */
export function getCurrentHand(gameState: GameState): Hand | undefined {
  const currentHandIndex = getCurrentHandIndex(gameState);
  return currentHandIndex >= 0 ? gameState.playerHands[currentHandIndex] : undefined;
}

/**
 * Checks if all hands are complete (standing or busted).
 * 
 * @param gameState The current game state
 * @returns True if all hands are complete, false otherwise
 */
export function areAllHandsComplete(gameState: GameState): boolean {
  if (!gameState.playerHands || gameState.playerHands.length === 0) {
    return true;
  }

  return gameState.playerHands.every((hand: Hand) => hand.isStanding || hand.isBusted);
}
