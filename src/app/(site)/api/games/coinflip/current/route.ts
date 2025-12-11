import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { authenticatedCoinflipGameStateService } from '@/lib/games/coinflip/authenticatedGameStateService';
import { createCoinflipStateMachine } from '@/lib/games/coinflip/stateMachine';
import {
  GameMode,
  CoinSide,
  CoinflipGameActionType,
} from '@/types/games/coinflip/game';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const game =
      await authenticatedCoinflipGameStateService.getOrCreateCurrentGame(
        userId
      );

    // Remove internal fields before sending to frontend
    const {
      serverSeed: _serverSeed,
      nonce: _nonce,
      ...gameStateForFrontend
    } = game;
    // Suppress unused variable warnings for intentionally destructured fields
    void _serverSeed;
    void _nonce;

    return NextResponse.json({
      success: true,
      gameState: gameStateForFrontend,
      gameId: game.id,
    });
  } catch (error) {
    console.error('Error getting/creating current coinflip game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, side, state } = body;

    const gameMode = (state?.gameMode || GameMode.REAL_MONEY) as GameMode;

    const session = await auth();

    if (!session?.user?.id && gameMode === GameMode.REAL_MONEY) {
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

    const userId = session?.user?.id ?? state?.userId;

    // Get or create current game
    const game =
      gameMode === GameMode.FREE_PLAY && state
        ? state
        : await authenticatedCoinflipGameStateService.getOrCreateCurrentGame(
            userId
          );

    const stateMachine = createCoinflipStateMachine();
    const result = await stateMachine.processAction({
      gameState: game,
      action: action as CoinflipGameActionType,
      amount: amount ? parseFloat(String(amount)) : undefined,
      side: side as CoinSide | undefined,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          details: result.details,
          gameState: game,
        },
        { status: 400 }
      );
    }

    // State machine already processed effects, so newGameState includes all updates
    const updatedGame = result.newGameState;

    // Log action and persist state for real money games
    if (gameMode === GameMode.REAL_MONEY) {
      // Log action to database
      await authenticatedCoinflipGameStateService.logAction(
        game.id,
        action as CoinflipGameActionType,
        amount ? String(amount) : undefined,
        side as CoinSide | undefined,
        `${action} action`
      );

      // Persist updated game state to database
      await authenticatedCoinflipGameStateService.updateGameState(
        game.id,
        result.newGameState,
        userId
      );
    }

    // Get final balance (from state for FREE_PLAY, from database for REAL_MONEY)
    const balance =
      gameMode === GameMode.REAL_MONEY
        ? await authenticatedCoinflipGameStateService.getUserBalance(userId)
        : updatedGame.balance;

    // Remove internal fields before sending to frontend
    const {
      serverSeed: _serverSeed2,
      nonce: _nonce2,
      ...gameStateForFrontend
    } = {
      ...updatedGame,
      balance,
    };
    // Suppress unused variable warnings for intentionally destructured fields
    void _serverSeed2;
    void _nonce2;

    console.log('🎰 Coinflip API response:', {
      gameState: gameStateForFrontend,
      balance,
      gameMode,
      userId,
    });

    return NextResponse.json({
      success: true,
      gameState: gameStateForFrontend,
      gameId: updatedGame.id,
      effects: result.effects,
    });
  } catch (error) {
    console.error('Error processing coinflip game action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
