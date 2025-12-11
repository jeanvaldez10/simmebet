import { prisma } from '@/prisma';
import { balanceService } from '../blackjack/balance-service';
import { CoinflipGameStateService } from './gameStateService';
import type { CoinflipGame } from '@prisma/client';
import {
  CoinflipGameActionType,
  CoinflipGameState,
  CoinflipStatus,
  CoinSide,
  GameMode,
} from '@/types/games/coinflip/game';

export class AuthenticatedCoinflipGameStateService {
  private gameStateService: CoinflipGameStateService;

  constructor() {
    this.gameStateService = new CoinflipGameStateService();
  }

  async getUserBalance(userId: string): Promise<number> {
    return balanceService.getUserBalance(userId);
  }

  private convertPrismaStatusToTypeScript(status: string): CoinflipStatus {
    const statusMap: Record<string, CoinflipStatus> = {
      BETTING: CoinflipStatus.BETTING,
      BET_PLACED: CoinflipStatus.BET_PLACED,
      FLIPPING: CoinflipStatus.FLIPPING,
      FINISHED: CoinflipStatus.FINISHED,
      ERROR: CoinflipStatus.ERROR,
    };
    return statusMap[status] || CoinflipStatus.BETTING;
  }

  private convertTypeScriptStatusToPrisma(status: CoinflipStatus): string {
    const statusMap: Record<CoinflipStatus, string> = {
      [CoinflipStatus.BETTING]: 'BETTING',
      [CoinflipStatus.BET_PLACED]: 'BET_PLACED',
      [CoinflipStatus.FLIPPING]: 'FLIPPING',
      [CoinflipStatus.FINISHED]: 'FINISHED',
      [CoinflipStatus.ERROR]: 'ERROR',
    };
    return statusMap[status] || 'BETTING';
  }
  private convertPrismaGameToTypeScript(
    game: CoinflipGame,
    balance: number
  ): CoinflipGameState {
    const hasBet = game.betSide && parseFloat(game.betAmount) > 0;
    const hasResult = game.winningSide && game.result;

    return {
      id: game.id,
      status: this.convertPrismaStatusToTypeScript(game.status),
      amount: hasBet ? parseFloat(game.betAmount) : undefined,
      side: hasBet ? (game.betSide as CoinSide | null) : undefined,
      playerId: hasBet ? game.userId : undefined,
      winningSide: hasResult
        ? (game.winningSide as CoinSide | null)
        : undefined,
      payout: hasResult ? parseFloat(game.payout) : undefined,
      createdAt: game.createdAt.getTime(),
      updatedAt: game.updatedAt.getTime(),
      balance,
      previousBetAmount: game.previousBetAmount
        ? parseFloat(game.previousBetAmount)
        : undefined,
      previousSide: game.previousSide
        ? (game.previousSide as CoinSide | null)
        : undefined,
      gameMode: GameMode.REAL_MONEY,
      serverSeed: game.serverSeed,
      nonce: game.nonce,
    };
  }

  private convertTypeScriptGameToPrisma(
    gameState: Partial<CoinflipGameState>
  ): Partial<CoinflipGame> {
    const prismaUpdate: Partial<CoinflipGame> = {};

    if (gameState.status !== undefined) {
      prismaUpdate.status = this.convertTypeScriptStatusToPrisma(
        gameState.status
      ) as 'BETTING' | 'BET_PLACED' | 'FLIPPING' | 'FINISHED' | 'ERROR';
    }

    if (gameState.amount !== undefined || gameState.side !== undefined) {
      if (
        gameState.amount === undefined ||
        gameState.amount === 0 ||
        gameState.side === null ||
        gameState.side === undefined
      ) {
        prismaUpdate.betSide = null;
        prismaUpdate.betAmount = '0';
      } else {
        prismaUpdate.betSide = gameState.side;
        prismaUpdate.betAmount = gameState.amount.toString();
      }
    }

    if (gameState.winningSide !== undefined || gameState.payout !== undefined) {
      if (
        gameState.winningSide === null ||
        gameState.winningSide === undefined
      ) {
        prismaUpdate.winningSide = null;
        prismaUpdate.result = null;
        prismaUpdate.payout = '0';
      } else {
        prismaUpdate.winningSide = gameState.winningSide;
        prismaUpdate.result =
          gameState.payout && gameState.payout > 0 ? 'WIN' : 'LOSE';
        prismaUpdate.payout = (gameState.payout || 0).toString();
      }
    }

    if (
      gameState.previousBetAmount !== undefined ||
      gameState.previousSide !== undefined
    ) {
      prismaUpdate.previousBetAmount =
        gameState.previousBetAmount?.toString() || null;
      prismaUpdate.previousSide = gameState.previousSide
        ? gameState.previousSide
        : null;
    }

    return prismaUpdate;
  }

  async getCurrentGame(userId: string): Promise<CoinflipGameState | null> {
    const game = await prisma.coinflipGame.findFirst({
      where: {
        userId,
        status: {
          in: ['BETTING', 'BET_PLACED', 'FLIPPING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!game) {
      return null;
    }

    const balance = await this.getUserBalance(userId);
    return this.convertPrismaGameToTypeScript(game, balance);
  }

  async createNewGame(userId: string): Promise<CoinflipGameState> {
    const { serverSeed, serverSeedHash } =
      this.gameStateService.generateNewGameSeeds();

    const game = await prisma.coinflipGame.create({
      data: {
        userId,
        status: 'BETTING',
        betAmount: '0',
        betSide: null,
        winningSide: null,
        payout: '0',
        result: null,
        previousBetAmount: null,
        previousSide: null,
        serverSeed,
        serverSeedHash,
        clientSeed: null,
        nonce: 0,
        gameMode: GameMode.REAL_MONEY,
      },
    });

    const balance = await this.getUserBalance(userId);
    return this.convertPrismaGameToTypeScript(game, balance);
  }

  async getOrCreateCurrentGame(userId: string): Promise<CoinflipGameState> {
    const existingGame = await this.getCurrentGame(userId);

    if (existingGame) {
      return existingGame;
    }

    return this.createNewGame(userId);
  }

  async updateGameState(
    gameId: string,
    updates: Partial<CoinflipGameState>,
    userId: string
  ): Promise<CoinflipGameState> {
    // Verify game belongs to user
    const game = await prisma.coinflipGame.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const prismaUpdates = this.convertTypeScriptGameToPrisma(updates);
    const updatedGame = await prisma.coinflipGame.update({
      where: { id: gameId },
      data: {
        ...prismaUpdates,
        updatedAt: new Date(),
      },
    });

    const balance = await this.getUserBalance(userId);
    return this.convertPrismaGameToTypeScript(updatedGame, balance);
  }

  async logAction(
    gameId: string,
    actionType: CoinflipGameActionType,
    amount?: string,
    side?: CoinSide,
    description?: string
  ): Promise<void> {
    await prisma.coinflipGameAction.create({
      data: {
        gameId,
        actionType: actionType,
        amount: amount || null,
        side: side || null,
        description: description || actionType,
      },
    });
  }

  async getGameHistory(
    userId: string,
    limit = 10
  ): Promise<CoinflipGameState[]> {
    const games = await prisma.coinflipGame.findMany({
      where: {
        userId,
        status: 'FINISHED',
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
    });

    const balance = await this.getUserBalance(userId);
    return games.map((game) =>
      this.convertPrismaGameToTypeScript(game, balance)
    );
  }
}

export const authenticatedCoinflipGameStateService =
  new AuthenticatedCoinflipGameStateService();
