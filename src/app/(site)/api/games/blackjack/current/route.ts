/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Fix type issues and remove eslint-disable
import { NextRequest, NextResponse } from 'next/server';

import { authenticatedGameStateService } from '@/lib/games/blackjack/authenticatedGameStateService';
import { getAvailableActions } from '@/utils/games/blackjack/actionUtils';
import { sanitizeGameData } from '@/utils/games/blackjack/sanitizeHand';
import { createGameStateMachine } from '@/lib/games/blackjack/stateMachine';
import { StandardDeckProvider } from '@/lib/games/blackjack/gameStateService';
import { getShuffleVerificationForResponse } from '@/utils/games/blackjack/shuffleVerificationUtils';
import { auth } from '@/auth';
import {
  GameActionType,
  GameMode,
  GameState,
} from '@/types/games/blackjack/game';
import { DealerService } from '@/lib/games/blackjack/dealer-service';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get or create current game
    const gameState =
      await authenticatedGameStateService.getOrCreateCurrentGame(userId);

    // For Free Play mode, use the balance from game state
    // For real money mode, get balance from database
    const isFreePlay = gameState.gameMode === GameMode.FREE_PLAY;
    const currentBalance = isFreePlay
      ? gameState.balance
      : await authenticatedGameStateService.getUserBalance(userId);

    const availableActions = getAvailableActions(gameState);

    // Generate shuffle verification info
    const shuffleVerification = getShuffleVerificationForResponse(gameState);

    return NextResponse.json({
      success: true,
      gameState: sanitizeGameData({
        ...gameState,
        balance: currentBalance,
      }),
      availableActions,
      shuffleVerification,
      gameId: gameState.gameId,
    });
  } catch (error) {
    console.error('Error getting/creating current game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      betAmount,
      pairBetAmount,
      twentyOnePlusThreeBetAmount,
      state,
    } = body;

    // Determine game mode from state or default to REAL_MONEY
    const gameMode = state?.gameMode || GameMode.REAL_MONEY;

    const session = await auth();

    if (!session?.user?.id && gameMode === gameMode.REAL_MONEY) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const userId = session?.user?.id ?? state.userId;

    // Get or create current game
    // For FREE_PLAY, use the client-provided state
    // For REAL_MONEY, get from database
    let gameState =
      gameMode === GameMode.FREE_PLAY && state
        ? (state as GameState)
        : await authenticatedGameStateService.getOrCreateCurrentGame(userId);

    // For FREE_PLAY mode, reconstruct real dealer cards if we have placeholders
    // This ensures backend game logic works with real card data, not sanitized placeholders
    if (gameMode === GameMode.FREE_PLAY && gameState.dealerHand?.cards) {
      const reconstructedDealerCards = gameState.dealerHand.cards.map(
        (card, index) => {
          if (card.suit === 'hidden' || card.rank === '?') {
            const cardIndex = index === 0 ? 1 : 3;
            return DealerService.getCard(
              gameState.shuffleId,
              cardIndex,
              gameState.shuffleSalt
            );
          }
          return card;
        }
      );

      gameState = {
        ...gameState,
        dealerHand: {
          ...gameState.dealerHand,
          cards: reconstructedDealerCards,
        },
      };
    }

    // Create state machine and process the action
    const stateMachine = createGameStateMachine(new StandardDeckProvider());
    const result = await stateMachine.processActionWithLoop({
      gameState,
      action: action as GameActionType,
      amount: betAmount,
      pairBetAmount: pairBetAmount,
      twentyOnePlusThreeBetAmount: twentyOnePlusThreeBetAmount,
      userId: userId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          gameState: sanitizeGameData(gameState),
        },
        { status: 400 }
      );
    }

    if (gameMode === GameMode.REAL_MONEY) {
      // Update game state in database if it's not free play
      await authenticatedGameStateService.updateGameState(
        gameState.gameId,
        result.newGameState,
        userId
      );
    }

    // For Free Play mode, use the balance from game state
    // For real money mode, get balance from database
    const isFreePlay = result.newGameState.gameMode === GameMode.FREE_PLAY;
    const currentBalance = isFreePlay
      ? result.newGameState.balance
      : await authenticatedGameStateService.getUserBalance(userId);

    const availableActions = getAvailableActions(result.newGameState);

    // Generate shuffle verification info
    const shuffleVerification = getShuffleVerificationForResponse(
      result.newGameState
    );

    console.log('🎯 API balance update:', {
      gameStateBalance: result.newGameState.balance,
      currentBalance,
      isFreePlay,
      userId,
      totalWon: result.newGameState.totalWon,
      gameProfit: result.newGameState.gameProfit,
    });

    return NextResponse.json({
      success: true,
      gameState: sanitizeGameData({
        ...result.newGameState,
        balance: currentBalance,
      }),
      availableActions,
      shuffleVerification,
      gameId: result.newGameState.gameId,
      effects: result.effects,
    });
  } catch (error) {
    console.error('Error processing game action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
