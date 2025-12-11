import {
  GameMode,
  GameState,
  GamePhaseType,
} from '@/types/games/blackjack/game';
import { getFreePlaySession } from './sessionUtils';

/**
 * Chip denominations in descending order (highest to lowest)
 */
const CHIP_DENOMINATIONS = [10000, 1000, 500, 100, 50, 25, 10, 5, 1] as const;

/**
 * Convert bet amount to highest denominations
 * Returns array of chip values, with higher values on the right
 */
export function optimizeChips(totalAmount: number): number[] {
  const optimizedChips: number[] = [];
  let remaining = totalAmount;

  for (const chipValue of CHIP_DENOMINATIONS) {
    while (remaining >= chipValue) {
      optimizedChips.push(chipValue);
      remaining -= chipValue;
    }
  }

  // Reverse so higher values are on the right
  return optimizedChips.reverse();
}

export function createInitialGameState(
  gameMode: GameMode | null = null
): GameState {
  let balance = 27318; // Default (for backward compatibility)
  let userId = 'dev_user';
  let tabId: string | undefined;
  const actualGameMode = gameMode || GameMode.FREE_PLAY;

  // If Free Play mode, use session-based balance
  if (gameMode === GameMode.FREE_PLAY) {
    const session = getFreePlaySession(gameMode);
    balance = session.balance;
    userId = session.userId;
    tabId = session.tabId ?? undefined;
    console.log(
      '[Game Init] Free Play mode - Balance:',
      balance,
      'TabId:',
      tabId
    );
  }

  return {
    gameId: `game_${Date.now()}`,
    shuffleId: `shuffle_${Date.now()}`,
    shuffleSalt: 'test-salt',
    dealtCardCount: 0,
    playerHands: [],
    dealerHand: {
      cards: [],
      isStanding: false,
      isBusted: false,
      isBlackjack: false,
      showAllCards: false,
    },
    currentHandIndex: 0,
    balance,
    pendingBet: 0,
    initialBet: 0,
    insuranceBet: 0,
    totalWagered: 0,
    totalWon: 0,
    gameProfit: 0,
    currentHandProfit: 0,
    startingBalance: balance,
    gamePhase: GamePhaseType.BETTING,
    message: 'Place your bet',
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    insuranceOffered: false,
    shuffle: false,
    insuranceWasOffered: false,
    dealerHasBlackjack: undefined,
    dealingStep: 0,
    isDealing: false,
    isDealingInProgress: false,
    lastProcessedStep: 0,
    dealerDealingStep: 0,
    isDealerDealing: false,
    isBustSequence: false,
    bustSequenceStep: 0,
    dealerBustRevealStep: 0,
    handResults: [],
    userId,
    gameMode: actualGameMode,
    tabId,
    // Sidebet fields - Set initial amounts for testing
    pairBet: 0, // Start with no sidebets
    twentyOnePlusThreeBet: 0, // Start with no sidebets
    sidebetResults: [],
    originalPairBet: 0,
    originalTwentyOnePlusThreeBet: 0,
    previousBet: 0,
  };
}

export function shouldDisableActions(gameState: GameState): boolean {
  const isDealerBlackjack = gameState.dealerHand?.isBlackjack;

  const currentHand = gameState.playerHands[gameState.currentHandIndex];
  const isPlayerBlackjack = currentHand?.isBlackjack;

  return Boolean(isDealerBlackjack || isPlayerBlackjack);
}
