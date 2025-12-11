import {
  GameState,
  GameStatePhaseType,
  Card,
  GameMode,
} from '@/types/games/blackjack/game';

/**
 * Creates a default game state with sensible defaults that can be overridden
 */
export function createDefaultGameState(
  overrides?: Partial<GameState>
): GameState {
  const defaultState: GameState = {
    gameId: 'test-game-default',
    shuffleId: 'test-shuffle',
    shuffleSalt: 'test-salt',
    dealtCardCount: 4,
    playerHands: [
      {
        cards: [
          { suit: 'hearts', rank: '10', isHidden: false },
          { suit: 'hearts', rank: '7', isHidden: false },
        ],
        bet: 35,
        originalBet: 35,
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        isDoubled: false,
        isSurrendered: false,
        isFromSplit: false,
        isSplitAces: false,
      },
    ],
    dealerHand: {
      cards: [
        { suit: 'spades', rank: '10', isHidden: false },
        { suit: 'hearts', rank: '6', isHidden: true },
      ],
      isStanding: false,
      isBusted: false,
      isBlackjack: false,
      showAllCards: false,
    },
    currentHandIndex: 0,
    balance: 100,
    pendingBet: 0,
    initialBet: 35,
    gamePhase: GameStatePhaseType.PLAYING,
    message: 'Cards dealt. Your turn.',
    canDouble: true,
    canSplit: false,
    canSurrender: true,
    insuranceOffered: false,
    shuffle: false,
    insuranceWasOffered: false,
    insuranceBet: 0,
    dealerHasBlackjack: false,
    dealingStep: 1,
    isDealing: false,
    isDealingInProgress: false,
    lastProcessedStep: 1,
    dealerDealingStep: 0,
    isDealerDealing: false,
    isBustSequence: false,
    bustSequenceStep: 0,
    dealerBustRevealStep: 0,
    startingBalance: 100,
    totalWagered: 35,
    totalWon: 0,
    currentHandProfit: 0,
    gameProfit: 0,
    handResults: [],
    userId: 'test-user',
    pairBet: 0,
    twentyOnePlusThreeBet: 0,
    sidebetResults: [],
    originalPairBet: 0,
    originalTwentyOnePlusThreeBet: 0,
    previousBet: 0,
    gameMode: GameMode.FREE_PLAY,
  };

  // Deep merge overrides
  if (overrides) {
    return deepMerge(defaultState, overrides);
  }

  return defaultState;
}

/**
 * Deep merge utility for game state
 */
function deepMerge(target: GameState, source: Partial<GameState>): GameState {
  const result = { ...target };

  for (const key in source) {
    if (key in source) {
      const typedKey = key as keyof GameState;
      const value = source[typedKey];
      if (value === undefined) continue;
      if (typedKey === 'playerHands' && Array.isArray(source.playerHands)) {
        result.playerHands = source.playerHands.map((hand, index) => {
          const existingHand = target.playerHands[index];
          return existingHand ? { ...existingHand, ...hand } : hand;
        });
      } else if (typedKey === 'dealerHand' && source.dealerHand) {
        result.dealerHand = {
          ...target.dealerHand,
          ...source.dealerHand,
          cards: source.dealerHand.cards || target.dealerHand.cards,
        };
      } else if (typedKey in result) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[typedKey] = source[typedKey];
      }
    }
  }

  return result;
}

/**
 * Helper to create a player hand with blackjack
 */
export function createBlackjackHand(
  bet: number = 35
): GameState['playerHands'][0] {
  return {
    cards: [
      { suit: 'diamonds', rank: 'J', isHidden: false },
      { suit: 'hearts', rank: 'A', isHidden: false },
    ],
    bet,
    originalBet: bet,
    isStanding: false,
    isBusted: false,
    isBlackjack: true,
    isDoubled: false,
    isSurrendered: false,
    isFromSplit: false,
    isSplitAces: false,
  };
}

/**
 * Helper to create a dealer hand with specific cards
 */
export function createDealerHand(
  showingCard: Card,
  holeCard: Card,
  options?: {
    isBlackjack?: boolean;
    showAllCards?: boolean;
  }
): GameState['dealerHand'] {
  return {
    cards: [showingCard, holeCard],
    isStanding: false,
    isBusted: false,
    isBlackjack: options?.isBlackjack ?? false,
    showAllCards: options?.showAllCards ?? false,
  };
}

/**
 * Helper to create a dealer hand where both player and dealer have blackjack
 */
export function createDealerBlackjackHand(
  showingCard: Card = { suit: 'spades', rank: 'J', isHidden: false },
  holeCard: Card = { suit: 'hearts', rank: 'A', isHidden: true }
): GameState['dealerHand'] {
  return createDealerHand(showingCard, holeCard, {
    isBlackjack: false, // Will be recalculated when revealed
    showAllCards: false,
  });
}

/**
 * Helper to create a dealer hand where only player has blackjack
 */
export function createDealerNonBlackjackHand(
  showingCard: Card = { suit: 'spades', rank: 'J', isHidden: false },
  holeCard: Card = { suit: 'hearts', rank: '6', isHidden: true }
): GameState['dealerHand'] {
  return createDealerHand(showingCard, holeCard, {
    isBlackjack: false,
    showAllCards: false,
  });
}
