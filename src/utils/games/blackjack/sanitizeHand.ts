import {
  GameState,
  FrontendGameState,
  GameStatePhaseType,
  Card,
  FrontendDealerHand,
} from '@/types/games/blackjack/game';

/**
 * Sanitizes game data for frontend consumption to prevent cheating.
 *
 * Security rules:
 * 1. Dealer's hole cards (second card and beyond) are hidden until game is finished
 * 2. Dealer's blackjack status is hidden until insurance decision is made or game is finished
 * 3. Dealer's hand value is not revealed until appropriate time
 *
 * @param gameState - The full game state from the backend
 * @returns Sanitized game state safe for frontend display
 */
export function sanitizeGameData(gameState: GameState): FrontendGameState {
  // Create a sanitized dealer hand
  const sanitizedDealerHand = sanitizeDealerHand(gameState);

  // Create sanitized game state
  const sanitizedState: FrontendGameState = {
    gameId: gameState.gameId,
    shuffleId: gameState.shuffleId,
    shuffleSalt: gameState.shuffleSalt,
    playerHands: gameState.playerHands, // Player hands are always visible
    dealerHand: sanitizedDealerHand,
    currentHandIndex: gameState.currentHandIndex,
    balance: gameState.balance,
    pendingBet: gameState.pendingBet,
    initialBet: gameState.initialBet,
    gamePhase: gameState.gamePhase,
    message: gameState.message,
    canDouble: gameState.canDouble,
    canSplit: gameState.canSplit,
    canSurrender: gameState.canSurrender,
    insuranceOffered: gameState.insuranceOffered,
    shuffle: gameState.shuffle,
    insuranceWasOffered: gameState.insuranceWasOffered,
    insuranceBet: gameState.insuranceBet,
    dealerHasBlackjack: sanitizeDealerBlackjackStatus(gameState),
    dealingStep: gameState.dealingStep,
    isDealing: gameState.isDealing,
    isDealingInProgress: gameState.isDealingInProgress,
    lastProcessedStep: gameState.lastProcessedStep,
    dealerDealingStep: gameState.dealerDealingStep,
    isDealerDealing: gameState.isDealerDealing,
    isBustSequence: gameState.isBustSequence,
    bustSequenceStep: gameState.bustSequenceStep,
    dealerBustRevealStep: gameState.dealerBustRevealStep,
    startingBalance: gameState.startingBalance,
    totalWagered: gameState.totalWagered,
    totalWon: gameState.totalWon,
    currentHandProfit: gameState.currentHandProfit,
    gameProfit: gameState.gameProfit,
    handResults: gameState.handResults,
    result: gameState.result,
    // Sidebet fields
    pairBet: gameState.pairBet,
    twentyOnePlusThreeBet: gameState.twentyOnePlusThreeBet,
    sidebetResults: gameState.sidebetResults,
    insuranceResults: gameState.insuranceResults,
    originalPairBet: gameState.originalPairBet,
    originalTwentyOnePlusThreeBet: gameState.originalTwentyOnePlusThreeBet,
    previousBet: gameState.previousBet,
    gameMode: gameState.gameMode,
    tabId: gameState.tabId,
  };

  return sanitizedState;
}

/**
 * Sanitizes the dealer hand to hide hole cards until appropriate time
 */
function sanitizeDealerHand(gameState: GameState): FrontendDealerHand {
  const dealerHand = gameState.dealerHand;

  // Determine if all cards should be shown
  const shouldShowAllCards = shouldRevealDealerCards(gameState);

  // Sanitize dealer cards
  const sanitizedCards = dealerHand.cards
    .map((card, index) => {
      // First card is always visible
      if (index === 0) {
        return card;
      }

      // Other cards are hidden until dealer turn or game finished
      if (shouldShowAllCards) {
        // When showing all cards, filter out any hidden cards or placeholder cards
        // This ensures we only return actual visible cards
        if (card.isHidden || card.rank === '?' || card.suit === 'hidden') {
          // Skip hidden cards when all should be shown
          return null;
        }
        return card;
      }

      // Return hidden card
      return {
        suit: 'hidden' as const,
        rank: '?' as const,
        isHidden: true,
      };
    })
    .filter((card): card is Card => card !== null); // Remove null entries

  return {
    cards: sanitizedCards,
    isStanding: shouldShowAllCards ? dealerHand.isStanding : false,
    isBusted: shouldShowAllCards ? dealerHand.isBusted : false,
    isBlackjack: shouldShowAllCards ? dealerHand.isBlackjack : false,
    showAllCards: shouldShowAllCards,
  };
}

/**
 * Determines if dealer cards should be revealed based on game phase and state
 */
function shouldRevealDealerCards(gameState: GameState): boolean {
  // Always show cards when game is finished
  if (gameState.gamePhase === GameStatePhaseType.FINISHED) {
    return true;
  }

  // Show cards during dealer turn
  if (gameState.gamePhase === GameStatePhaseType.DEALER_TURN) {
    return true;
  }

  // Don't show cards during betting, insurance decision, or player turn
  return false;
}

/**
 * Sanitizes dealer blackjack status based on game phase
 */
function sanitizeDealerBlackjackStatus(gameState: GameState): boolean {
  // If insurance is currently being offered, hide blackjack status
  if (gameState.gamePhase === GameStatePhaseType.ASK_INSURANCE) {
    return false;
  }

  // If insurance was offered but player declined (no insurance bet), still hide until game progresses
  if (
    gameState.insuranceWasOffered &&
    !gameState.insuranceOffered &&
    gameState.insuranceBet === 0 &&
    gameState.gamePhase === GameStatePhaseType.PLAYING
  ) {
    return false;
  }

  // Show blackjack status in all other phases
  return gameState.dealerHasBlackjack || false;
}

/**
 * Creates a hidden card for display purposes
 */
export function createHiddenCard(): Card {
  return {
    suit: 'hidden',
    rank: '?',
    isHidden: true,
  };
}

/**
 * Checks if a card should be visible to the player
 */
export function isCardVisible(
  card: Card,
  cardIndex: number,
  gamePhase: GameStatePhaseType
): boolean {
  // First card is always visible
  if (cardIndex === 0) {
    return true;
  }

  // Other cards are visible only when dealer turn or game finished
  return (
    gamePhase === GameStatePhaseType.DEALER_TURN ||
    gamePhase === GameStatePhaseType.FINISHED
  );
}

/**
 * Gets the appropriate dealer hand value for display
 * Returns null if dealer cards should be hidden
 */
export function getDealerHandValueForDisplay(
  dealerHand: FrontendDealerHand,
  gamePhase: GameStatePhaseType
): number | null {
  if (!shouldRevealDealerCards({ gamePhase } as GameState)) {
    return null;
  }

  // Calculate hand value from visible cards only
  return calculateHandValue(dealerHand.cards.filter((card) => !card.isHidden));
}

/**
 * Helper function to calculate hand value
 */
function calculateHandValue(cards: Card[]): number {
  let value = 0;
  let aces = 0;

  cards.forEach((card) => {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10;
    } else if (card.rank !== '?') {
      value += parseInt(card.rank);
    }
  });

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}
