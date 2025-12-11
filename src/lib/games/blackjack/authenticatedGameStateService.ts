/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Properly type database conversions and remove eslint-disable
import { prisma } from '@/lib/prisma';
import { DebugConfig, DEBUG_SCENARIOS } from '@/types/games/blackjack/debug';
import {
  GameState,
  GameStatePhaseType,
  Card,
  GameMode,
} from '@/types/games/blackjack/game';

import { balanceService } from './balance-service';
import { DeterministicDeckProvider } from './deterministicDeckProvider';
import { createGameStateMachine, GameStateMachine } from './stateMachine';
import { TestDeckProvider } from './test-deck-provider';

const inMemoryGameStore = new Map<string, GameState>();
const inMemoryUserGameIndex = new Map<string, string>(); // userId -> gameId

function shouldUseLocalPersistence(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.USE_LOCAL_PERSISTENCE === 'true'
  );
}

export class AuthenticatedGameStateService {
  private deckProvider: DeterministicDeckProvider | TestDeckProvider;
  private debugConfig?: DebugConfig;

  constructor(debugConfig?: DebugConfig) {
    this.debugConfig = debugConfig;

    if (debugConfig?.enabled && debugConfig.deckConfig) {
      // Use test deck provider for debug mode
      if (debugConfig.deckConfig.customDeck) {
        this.deckProvider = new TestDeckProvider(
          debugConfig.deckConfig.customDeck
        );
      } else if (debugConfig.deckConfig.scenario) {
        const scenarioDeck = DEBUG_SCENARIOS[debugConfig.deckConfig.scenario];
        if (scenarioDeck) {
          this.deckProvider = new TestDeckProvider(scenarioDeck);
        } else {
          this.deckProvider = new DeterministicDeckProvider();
        }
      } else {
        this.deckProvider = new DeterministicDeckProvider();
      }
    } else {
      this.deckProvider = new DeterministicDeckProvider();
    }
  }

  /**
   * Create a new game for an authenticated user
   */
  async createGame(
    userId: string,
    initialBalance?: number,
    debugConfig?: DebugConfig
  ): Promise<GameState> {
    // Get user's current balance from database
    const currentBalance = await balanceService.getUserBalance(userId);

    // If user has no balance, give them some starting balance
    if (currentBalance <= 0) {
      // Update the user's balance in the database
      await balanceService.handleBalanceChangeEffect(userId, {
        amount: 1000,
        operation: 'INCREASE',
        reason: 'Starting balance',
      });
    }

    const gameId = `game_${Date.now()}_${userId}`;

    // Use debug configuration if provided, otherwise use default
    const shuffleId =
      debugConfig?.deckConfig?.shuffleId || `shuffle_${Date.now()}`;
    const shuffleSalt = debugConfig?.deckConfig?.shuffleSalt || 'test-salt';

    const gameState: GameState = {
      gameId,
      userId,
      shuffleId,
      shuffleSalt,
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
      balance: currentBalance,
      pendingBet: 0,
      initialBet: 0,
      gamePhase: GameStatePhaseType.BETTING,
      message: 'Place your bet to start a new game',
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      insuranceOffered: false,
      insuranceWasOffered: false,
      insuranceBet: 0,
      dealerHasBlackjack: false,
      dealingStep: 0,
      isDealing: false,
      isDealingInProgress: false,
      lastProcessedStep: 0,
      dealerDealingStep: 0,
      isDealerDealing: false,
      isBustSequence: false,
      bustSequenceStep: 0,
      dealerBustRevealStep: 0,
      startingBalance: currentBalance,
      totalWagered: 0,
      totalWon: 0,
      currentHandProfit: 0,
      gameProfit: 0,
      handResults: [],
      shuffle: false,
      pairBet: 0,
      twentyOnePlusThreeBet: 0,
      sidebetResults: [],
      originalPairBet: 0,
      originalTwentyOnePlusThreeBet: 0,
      previousBet: 0,
      gameMode: GameMode.REAL_MONEY,
    };

    // Persist the game
    if (shouldUseLocalPersistence()) {
      await this.persistGameToLocal(gameState, userId);
    } else {
      await this.persistGameToDatabase(gameState, userId);
    }

    return gameState;
  }

  /**
   * Create a debug-enabled game for testing specific scenarios
   */
  async createDebugGame(
    userId: string,
    debugConfig: DebugConfig,
    initialBalance?: number
  ): Promise<GameState> {
    // Create a new service instance with debug configuration
    const debugService = new AuthenticatedGameStateService(debugConfig);
    return await debugService.createGame(userId, initialBalance, debugConfig);
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return this.debugConfig?.enabled || false;
  }

  /**
   * Get debug configuration
   */
  getDebugConfig(): DebugConfig | undefined {
    return this.debugConfig;
  }

  /**
   * Log debug information if debug mode is enabled
   */
  private debugLog(message: string, data?: unknown): void {
    if (this.debugConfig?.options?.verboseLogging) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Get an existing game
   */
  async getGame(gameId: string): Promise<GameState | null> {
    if (shouldUseLocalPersistence()) {
      return this.loadGameFromLocal(gameId);
    }
    return await this.loadGameFromDatabase(gameId);
  }

  /**
   * Get the current (most recent) game for a user
   */
  async getCurrentGame(userId: string): Promise<GameState | null> {
    if (shouldUseLocalPersistence()) {
      return this.loadMostRecentGameFromLocal(userId);
    }
    const mostRecentGame = await this.loadMostRecentGameFromDatabase(userId);
    return mostRecentGame;
  }

  /**
   * Load a specific game from database
   */
  private async loadGameFromDatabase(
    gameId: string
  ): Promise<GameState | null> {
    try {
      const game = await prisma.blackjackGame.findUnique({
        where: { id: gameId },
        include: {
          playerHands: {
            include: { cards: true },
          },
          dealerHand: {
            include: { cards: true },
          },
        },
      });

      if (!game) {
        console.log('🔍 loadGameFromDatabase - game not found:', gameId);
        return null;
      }

      return await this.convertDatabaseGameToGameState(game);
    } catch (error) {
      console.error('Error loading game from database:', error);
      return null;
    }
  }

  /**
   * Load the most recent game from database
   */
  private async loadMostRecentGameFromDatabase(
    userId: string
  ): Promise<GameState | null> {
    try {
      // Get the most recent game from database
      const game = await prisma.blackjackGame.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          playerHands: {
            include: { cards: true },
          },
          dealerHand: {
            include: { cards: true },
          },
        },
      });

      if (!game) {
        return null;
      }

      const gameState = await this.convertDatabaseGameToGameState(game);
      return gameState;
    } catch (error) {
      console.error('Error loading game from database:', error);
      return null;
    }
  }

  /**
   * Convert string phase from database to GameStatePhaseType enum
   */
  private convertStringToGamePhase(phaseString: string): GameStatePhaseType {
    const phaseMap: Record<string, GameStatePhaseType> = {
      BETTING: GameStatePhaseType.BETTING,
      ASK_INSURANCE: GameStatePhaseType.ASK_INSURANCE,
      PLAYING: GameStatePhaseType.PLAYING,
      DEALER_TURN: GameStatePhaseType.DEALER_TURN,
      FINISHED: GameStatePhaseType.FINISHED,
    };

    return phaseMap[phaseString] || GameStatePhaseType.BETTING;
  }

  /**
   * Convert database player hands to Hand array
   */
  private convertDatabasePlayerHands(
    playerHands: Array<Record<string, unknown>>
  ): GameState['playerHands'] {
    return playerHands.map((hand) => ({
      cards: (hand.cards as Array<Record<string, unknown>>).map((card) => ({
        suit: card.suit as Card['suit'],
        rank: card.rank as Card['rank'],
        isHidden: card.isHidden as boolean,
      })),
      bet: parseFloat(hand.bet as string),
      originalBet: parseFloat(hand.bet as string),
      isStanding: hand.isStanding as boolean,
      isBusted: hand.isBusted as boolean,
      isBlackjack: hand.isBlackjack as boolean,
      isDoubled: hand.isDoubled as boolean,
      isSurrendered: hand.isSurrendered as boolean,
      isFromSplit: hand.isFromSplit as boolean,
      isSplitAces: hand.isSplitAces as boolean,
    }));
  }

  /**
   * Convert database dealer hand to FrontendDealerHand
   */
  private convertDatabaseDealerHand(
    dealerHand: Record<string, unknown> | null | undefined
  ): GameState['dealerHand'] {
    if (!dealerHand) {
      return {
        cards: [],
        isStanding: false,
        isBusted: false,
        isBlackjack: false,
        showAllCards: false,
      };
    }

    return {
      cards: ((dealerHand.cards as Array<Record<string, unknown>>) || []).map(
        (card) => ({
          suit: card.suit as Card['suit'],
          rank: card.rank as Card['rank'],
          isHidden: card.isHidden as boolean,
        })
      ),
      isStanding: dealerHand.isStanding as boolean,
      isBusted: dealerHand.isBusted as boolean,
      isBlackjack: dealerHand.isBlackjack as boolean,
      showAllCards: dealerHand.showAllCards as boolean,
    };
  }

  /**
   * Convert database game to GameState
   */
  private async convertDatabaseGameToGameState(
    game: Record<string, unknown>
  ): Promise<GameState> {
    // Get current balance from balance service
    const currentBalance = await balanceService.getUserBalance(
      game.userId as string
    );

    // Calculate totalWon and totalWagered once to avoid duplicate parsing
    const totalWon = parseFloat((game.totalPayout as string) || '0'); // Database field is totalPayout, mapped to totalWon in GameState
    const totalWagered = parseFloat((game.totalWagered as string) || '0');
    const gameProfit = totalWon - totalWagered; // Calculate: totalWon - totalWagered

    return {
      gameId: game.id as string,
      userId: game.userId as string,
      shuffleId: game.shuffleId as string,
      shuffleSalt: (game.shuffleSalt as string) || 'test-salt',
      dealtCardCount: (game.dealtCardCount as number) || 0, // Ensure dealtCardCount is always a number
      playerHands: this.convertDatabasePlayerHands(
        (game.playerHands as Array<Record<string, unknown>>) || []
      ),
      dealerHand: this.convertDatabaseDealerHand(
        game.dealerHand as Record<string, unknown> | null | undefined
      ),
      currentHandIndex: (game.currentHandIndex as number) || 0,
      balance: currentBalance, // Load actual balance from balance service
      pendingBet: parseFloat((game.pendingBet as string) || '0'),
      initialBet: parseFloat((game.initialBet as string) || '0'),
      gamePhase: this.convertStringToGamePhase(game.gamePhase as string),
      message: game.message as string,
      canDouble: game.canDouble as boolean,
      canSplit: game.canSplit as boolean,
      canSurrender: game.canSurrender as boolean,
      insuranceOffered: game.insuranceOffered as boolean,
      insuranceWasOffered: game.insuranceWasOffered as boolean,
      insuranceBet: parseFloat((game.insuranceBet as string) || '0'),
      dealerHasBlackjack: game.dealerHasBlackjack as boolean,
      dealingStep: game.dealingStep as number,
      isDealing: game.isDealing as boolean,
      isDealingInProgress: game.isDealingInProgress as boolean,
      lastProcessedStep: game.lastProcessedStep as number,
      dealerDealingStep: game.dealerDealingStep as number,
      isDealerDealing: game.isDealerDealing as boolean,
      isBustSequence: false, // This would need to be stored in the database
      bustSequenceStep: 0, // This would need to be stored in the database
      dealerBustRevealStep: 0, // This would need to be stored in the database
      startingBalance: currentBalance, // Use current balance as starting balance
      totalWagered: totalWagered,
      totalWon: totalWon,
      currentHandProfit: 0, // This would need to be calculated
      gameProfit: gameProfit,
      handResults: [],
      shuffle: false,
      pairBet: parseFloat((game.pairBet as string) || '0'),
      twentyOnePlusThreeBet: parseFloat(
        (game.twentyOnePlusThreeBet as string) || '0'
      ),
      sidebetResults: (game.sidebetResults as any[]) || [],
      originalPairBet: parseFloat((game.originalPairBet as string) || '0'),
      originalTwentyOnePlusThreeBet: parseFloat(
        (game.originalTwentyOnePlusThreeBet as string) || '0'
      ),
      previousBet: 0,
      gameMode: GameMode.REAL_MONEY,
    };

    // Debug logging
    this.debugLog('🎯 getGame debug', {
      gameId: game.id,
      totalPayout: game.totalPayout,
      totalWon: parseFloat((game.totalPayout as string) || '0'),
      gamePhase: game.gamePhase,
    });
  }

  /**
   * Get the current active game for a user, or create one if none exists
   */
  async getOrCreateCurrentGame(userId: string): Promise<GameState> {
    // First try to get the current game
    const currentGame = await this.getCurrentGame(userId);

    // Return any existing game (including FINISHED games for PLAY_AGAIN)
    if (currentGame) {
      return currentGame;
    }

    // Otherwise, create a new game
    console.log('🎯 getOrCreateCurrentGame - creating new game');
    return await this.createGame(userId);
  }

  /**
   * Create a new state machine for a game
   */
  createStateMachine(): GameStateMachine {
    // For authenticated games, we create a new state machine each time
    // since we're using persistence (database or local) instead of in-memory storage
    return createGameStateMachine(this.deckProvider);
  }

  /**
   * Update game state and persist
   */
  async updateGameState(
    gameId: string,
    newGameState: GameState,
    userId: string
  ): Promise<void> {
    if (shouldUseLocalPersistence()) {
      await this.persistGameToLocal(newGameState, userId);
    } else {
      await this.persistGameToDatabase(newGameState, userId);
    }
  }

  /**
   * Handle balance changes for authenticated users
   */
  async handleBalanceChange(
    userId: string,
    effect: {
      amount: number;
      operation: 'INCREASE' | 'DECREASE';
      reason: string;
    }
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const result = await balanceService.handleBalanceChangeEffect(
      userId,
      effect
    );

    return {
      success: result.success,
      newBalance: parseFloat(result.newBalance),
      error: result.error,
    };
  }

  /**
   * Get user's current balance from database
   */
  async getUserBalance(userId: string): Promise<number> {
    const balance = await balanceService.getUserBalance(userId);
    return balance;
  }

  private async persistGameToLocal(
    gameState: GameState,
    userId: string
  ): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const balance = await balanceService.getUserBalance(userId);
      inMemoryGameStore.set(gameState.gameId, { ...gameState, balance });

      inMemoryUserGameIndex.set(userId, gameState.gameId);

      this.debugLog('💾 Persisted game to local storage', {
        gameId: gameState.gameId,
        userId,
        gamePhase: gameState.gamePhase,
      });
    } catch (error) {
      console.error('Error persisting game to local storage:', error);
    }
  }

  private loadGameFromLocal(gameId: string): GameState | null {
    const gameState = inMemoryGameStore.get(gameId);
    if (!gameState) {
      this.debugLog('🔍 loadGameFromLocal - game not found:', gameId);
      return null;
    }
    return JSON.parse(JSON.stringify(gameState));
  }

  private loadMostRecentGameFromLocal(userId: string): GameState | null {
    const gameId = inMemoryUserGameIndex.get(userId);
    if (!gameId) {
      return null;
    }
    return this.loadGameFromLocal(gameId);
  }

  /**
   * Persist game state to database
   */
  private async persistGameToDatabase(
    gameState: GameState,
    userId: string
  ): Promise<void> {
    try {
      // Check if game exists in database
      const existingGame = await prisma.blackjackGame.findUnique({
        where: { id: gameState.gameId },
      });

      if (existingGame) {
        // Debug logging
        this.debugLog('🎯 persistGameToDatabase debug', {
          gameId: gameState.gameId,
          totalWon: gameState.totalWon,
          totalWonType: typeof gameState.totalWon,
          gamePhase: gameState.gamePhase,
          totalWagered: gameState.totalWagered,
        });

        // Update existing game
        await prisma.blackjackGame.update({
          where: { id: gameState.gameId },
          data: {
            dealtCardCount: gameState.dealtCardCount,
            gamePhase: GameStatePhaseType[gameState.gamePhase],
            pendingBet: gameState.pendingBet.toString(),
            initialBet: gameState.initialBet.toString(),
            totalWagered: gameState.totalWagered.toString(),
            insuranceBet: gameState.insuranceBet.toString(),
            message: gameState.message,
            canDouble: gameState.canDouble,
            canSplit: gameState.canSplit,
            canSurrender: gameState.canSurrender,
            insuranceOffered: gameState.insuranceOffered,
            insuranceWasOffered: gameState.insuranceWasOffered,
            dealerHasBlackjack: gameState.dealerHasBlackjack,
            dealingStep: gameState.dealingStep,
            isDealing: gameState.isDealing,
            isDealingInProgress: gameState.isDealingInProgress,
            lastProcessedStep: gameState.lastProcessedStep,
            dealerDealingStep: gameState.dealerDealingStep,
            isDealerDealing: gameState.isDealerDealing,
            result: gameState.result || null,
            totalPayout: gameState.totalWon.toString(),
            pairBet: gameState.pairBet.toString(),
            twentyOnePlusThreeBet: gameState.twentyOnePlusThreeBet.toString(),
            sidebetResults: gameState.sidebetResults as any,
            originalPairBet: gameState.originalPairBet?.toString() || '0',
            originalTwentyOnePlusThreeBet:
              gameState.originalTwentyOnePlusThreeBet?.toString() || '0',
            completedAt:
              gameState.gamePhase === GameStatePhaseType.FINISHED
                ? new Date()
                : null,
          },
        });
      } else {
        // Create new game
        await prisma.blackjackGame.create({
          data: {
            id: gameState.gameId,
            userId,
            shuffleId: gameState.shuffleId,
            shuffleSalt: gameState.shuffleSalt,
            dealtCardCount: gameState.dealtCardCount,
            gamePhase: GameStatePhaseType[gameState.gamePhase],
            pendingBet: gameState.pendingBet.toString(),
            initialBet: gameState.initialBet.toString(),
            totalWagered: gameState.totalWagered.toString(),
            insuranceBet: gameState.insuranceBet.toString(),
            message: gameState.message,
            canDouble: gameState.canDouble,
            canSplit: gameState.canSplit,
            canSurrender: gameState.canSurrender,
            insuranceOffered: gameState.insuranceOffered,
            insuranceWasOffered: gameState.insuranceWasOffered,
            dealerHasBlackjack: gameState.dealerHasBlackjack,
            dealingStep: gameState.dealingStep,
            isDealing: gameState.isDealing,
            isDealingInProgress: gameState.isDealingInProgress,
            lastProcessedStep: gameState.lastProcessedStep,
            dealerDealingStep: gameState.dealerDealingStep,
            isDealerDealing: gameState.isDealerDealing,
            result: gameState.result || null,
            totalPayout: gameState.totalWon.toString(),
            pairBet: gameState.pairBet.toString(),
            twentyOnePlusThreeBet: gameState.twentyOnePlusThreeBet.toString(),
            sidebetResults: gameState.sidebetResults as any,
            originalPairBet: gameState.originalPairBet?.toString() || '0',
            originalTwentyOnePlusThreeBet:
              gameState.originalTwentyOnePlusThreeBet?.toString() || '0',
            completedAt:
              gameState.gamePhase === GameStatePhaseType.FINISHED
                ? new Date()
                : null,
          },
        });
      }

      // Update player hands
      await this.persistPlayerHands(gameState);

      // Update dealer hand
      await this.persistDealerHand(gameState);
    } catch (error) {
      console.error('Error persisting game to database:', error);
      // Don't throw error to avoid breaking the game flow
    }
  }

  /**
   * Persist player hands to database
   */
  private async persistPlayerHands(gameState: GameState): Promise<void> {
    // Delete existing player hands
    await prisma.blackjackPlayerHand.deleteMany({
      where: { gameId: gameState.gameId },
    });

    // Create new player hands
    for (let i = 0; i < gameState.playerHands.length; i++) {
      const hand = gameState.playerHands[i];

      // Get hand result and payout from handResults if game is finished
      let handResult: string | null = null;
      let handPayout = '0';

      if (
        gameState.gamePhase === GameStatePhaseType.FINISHED &&
        gameState.handResults.length > i
      ) {
        const result = gameState.handResults[i];
        // Convert HandResultType enum to string
        // HandResultType enum: WIN=0, LOSE=1, PUSH=2, BLACKJACK=3, SURRENDER=4
        const resultNames = ['WIN', 'LOSE', 'PUSH', 'BLACKJACK', 'SURRENDER'];
        handResult = resultNames[result.result] || null;
        handPayout = result.payout.toString();
      }

      const playerHand = await prisma.blackjackPlayerHand.create({
        data: {
          gameId: gameState.gameId,
          handIndex: i,
          bet: hand.bet.toString(),
          isStanding: hand.isStanding,
          isBusted: hand.isBusted,
          isBlackjack: hand.isBlackjack,
          isDoubled: hand.isDoubled,
          isSurrendered: hand.isSurrendered,
          isFromSplit: hand.isFromSplit,
          isSplitAces: hand.isSplitAces,
          result: handResult,
          payout: handPayout,
        },
      });

      // Create cards for this hand
      for (const card of hand.cards) {
        await prisma.blackjackCard.create({
          data: {
            handId: playerHand.id,
            handType: 'player',
            suit: card.suit,
            rank: card.rank,
            isHidden: card.isHidden,
            playerHandId: playerHand.id,
          },
        });
      }
    }
  }

  /**
   * Persist dealer hand to database
   */
  private async persistDealerHand(gameState: GameState): Promise<void> {
    // Check if dealer hand exists
    if (!gameState.dealerHand) {
      console.warn('Dealer hand is null, skipping dealer hand persistence');
      return;
    }

    // Delete existing dealer hand
    await prisma.blackjackDealerHand.deleteMany({
      where: { gameId: gameState.gameId },
    });

    // Create new dealer hand
    const dealerHand = await prisma.blackjackDealerHand.create({
      data: {
        gameId: gameState.gameId,
        isStanding: gameState.dealerHand.isStanding,
        isBusted: gameState.dealerHand.isBusted,
        isBlackjack: gameState.dealerHand.isBlackjack,
        showAllCards:
          gameState.gamePhase === GameStatePhaseType.FINISHED ||
          gameState.gamePhase === GameStatePhaseType.DEALER_TURN,
      },
    });

    // Create cards for dealer hand
    for (const card of gameState.dealerHand.cards) {
      await prisma.blackjackCard.create({
        data: {
          handId: dealerHand.id,
          handType: 'dealer',
          suit: card.suit,
          rank: card.rank,
          isHidden: card.isHidden,
          dealerHandId: dealerHand.id,
        },
      });
    }
  }
}

// Export singleton instance
export const authenticatedGameStateService =
  new AuthenticatedGameStateService();

/**
 * Create a debug-enabled service instance
 */
export function createDebugGameStateService(
  debugConfig: DebugConfig
): AuthenticatedGameStateService {
  return new AuthenticatedGameStateService(debugConfig);
}
