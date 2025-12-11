'use client';

import {
  CoinflipGameActionType,
  CoinflipGameState,
  CoinSide,
  CoinflipStatus,
  GameMode,
} from '@/types/games/coinflip/game';
import {
  getCoinflipGameState,
  sendCoinflipAction,
} from '@/utils/games/coinflip/client/gameApiService';
import { optimizeChips } from '@/utils/games/blackjack/client/stateUtils';
import {
  getFreePlaySession,
  updateFreePlayBalance,
} from '@/utils/games/coinflip/client/sessionUtils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { playSound } from '@/utils/games/blackjack/client/sounds';

function createInitialState(
  gameMode: GameMode | null = null
): CoinflipGameState {
  let balance = 100; // Default (for backward compatibility)
  let tabId: string | undefined;
  const actualGameMode = gameMode || GameMode.FREE_PLAY;

  // If Free Play mode, use session-based balance
  if (gameMode === GameMode.FREE_PLAY) {
    const session = getFreePlaySession(GameMode.FREE_PLAY);
    balance = session.balance;
    tabId = session.tabId ?? undefined;
    console.log(
      '[Coinflip Init] Free Play mode - Balance:',
      balance,
      'TabId:',
      tabId
    );
  }

  return {
    id: `game_${Date.now()}`,
    status: CoinflipStatus.BETTING,
    amount: undefined,
    side: undefined,
    playerId: undefined,
    winningSide: undefined,
    payout: undefined,
    createdAt: Date.now(),
    updatedAt: undefined,
    previousBetAmount: undefined,
    previousSide: undefined,
    balance,
    gameMode: actualGameMode,
    tabId,
  };
}

export function useGameState(gameMode: GameMode) {
  const [gameState, setGameState] = useState<CoinflipGameState>(() =>
    createInitialState(gameMode)
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const latestStateRef = useRef<CoinflipGameState>(gameState);

  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  // Update gameMode immediately when prop changes to ensure UI reflects correct mode
  useEffect(() => {
    if (gameState.gameMode !== gameMode) {
      setGameState((prev) => ({
        ...prev,
        gameMode,
      }));
    }
  }, [gameMode, gameState.gameMode]);

  // Fetch initial game state on mount
  useEffect(() => {
    const initializeGameState = async () => {
      if (gameMode === null) {
        return;
      }
      if (gameMode === GameMode.FREE_PLAY) {
        setInitialLoading(false);
        setGameState(createInitialState(gameMode));
        return;
      }

      try {
        setInitialLoading(true);

        const response = await getCoinflipGameState();
        if (response?.gameState) {
          setGameState(response.gameState);
        } else {
          throw new Error('Failed to fetch initial game state');
        }
      } catch (err) {
        console.error('Failed to fetch initial coinflip game state:', err);
        setError('Failed to load game state');
      } finally {
        setInitialLoading(false);
      }
    };

    initializeGameState();
  }, [gameMode]);

  useEffect(() => {
    if (
      gameMode === GameMode.FREE_PLAY &&
      gameState.gameMode === GameMode.FREE_PLAY &&
      gameState.tabId
    ) {
      updateFreePlayBalance(gameState.balance, gameState.tabId);
    }
  }, [gameState.balance, gameState.gameMode, gameState.tabId, gameMode]);

  // API request handler - uses real API or mock based on USE_MOCK_API flag
  const sendMockRequest = useCallback(
    async (
      action: CoinflipGameActionType,
      options: {
        amount?: number;
        side?: CoinSide;
        overrideState?: CoinflipGameState;
        applyDelayMs?: number;
        deferApply?: boolean;
        skipLoadingState?: boolean;
      } = {}
    ) => {
      if (!options.skipLoadingState) {
        setActionLoading(true);
      }

      let result: CoinflipGameState;

      try {
        const response = await sendCoinflipAction(
          action,
          options,
          latestStateRef.current
        );
        result = response.gameState;

        if (options.deferApply) {
          return result;
        }

        await new Promise<void>((resolve) => {
          const applyState = () => {
            setGameState(result);
            resolve();
          };

          if (options.applyDelayMs && options.applyDelayMs > 0) {
            setTimeout(applyState, options.applyDelayMs);
          } else {
            applyState();
          }
        });

        return result;
      } catch (err) {
        console.error('Failed to send action:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to process action';
        setError(message);
        throw err;
      } finally {
        if (!options.skipLoadingState) {
          setTimeout(() => {
            setActionLoading(false);
          }, 100);
        }
      }
    },
    []
  );

  // Select side (Heads or Tails) - creates player bet with 0 amount to mark the side
  const selectSide = useCallback((side: CoinSide) => {
    setError(null);

    const prev = latestStateRef.current;
    if (prev.status !== CoinflipStatus.BETTING) {
      setError('Can only select side when game is betting');
      return;
    }

    // Create or update player bet with selected side (amount starts at 0)
    setGameState({
      ...prev,
      amount: prev.amount || 0,
      side: side,
      playerId: prev.playerId || 'current_user', // TODO: Get from auth
    });
  }, []);

  // Flip the coin
  const flip = useCallback(() => {
    setError(null);

    const prev = latestStateRef.current;

    // Check if player has placed a bet
    if (!prev.amount || prev.amount === 0) {
      setError('Please place a bet on HEADS or TAILS first');
      return;
    }

    // Use existing player bet
    const stateToFlip: CoinflipGameState = {
      ...prev,
      status: CoinflipStatus.BET_PLACED,
    };

    setGameState(stateToFlip);

    sendMockRequest(CoinflipGameActionType.FLIP, {
      amount: prev.amount,
      side: prev.side || CoinSide.HEADS,
      deferApply: true,
      overrideState: stateToFlip,
    })
      .then((serverState) => {
        // Server returns state with FLIPPING status and result already calculated
        setGameState({
          ...serverState,
          status: CoinflipStatus.FLIPPING,
        });

        // Automatically transition to FINISHED after animation (300ms to match animation)
        // Preserve the bet for Play Again
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            winningSide: prev.winningSide,
            payout: prev.payout,
            status: CoinflipStatus.FINISHED,
          }));
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              // Restore previous bet amount and side for next game
              amount: prev.previousBetAmount,
              side: prev.previousSide ?? undefined,
              playerId: undefined,
              status: CoinflipStatus.BETTING,
            }));
          }, 3000);
        }, 3000);
      })
      .catch(() => {
        setGameState((prev) => ({
          ...prev,
          // Restore previous bet amount and side on error
          amount: prev.previousBetAmount,
          side: prev.previousSide ?? undefined,
          playerId: undefined,
          status: CoinflipStatus.BETTING,
        }));
        setError('Failed to flip. Please try again.');
      });
  }, [sendMockRequest]);

  // Double the bet - updates local state only
  const double = useCallback(() => {
    setError(null);

    const prev = latestStateRef.current;
    if (!prev.amount || prev.amount === 0) {
      setError('No bet to double');
      return;
    }

    const currentBalance = prev.balance || 0;
    const currentBet = prev.amount || 0;
    const newBetAmount = currentBet * 2;
    const additionalAmount = newBetAmount - currentBet;

    if (currentBalance < additionalAmount) {
      setError('Insufficient balance to double');
      return;
    }

    playSound('chips-place-bet', 0.5);

    setGameState({
      ...prev,
      amount: newBetAmount,
      side: prev.side,
      playerId: prev.playerId,
    });
  }, []);

  // Play again - preserve previous bet
  const playAgain = useCallback(() => {
    setError(null);

    const latest = latestStateRef.current;

    // Get previous bet (preserved from last flip or current player bet)
    const previousBetAmount = latest.previousBetAmount || latest.amount;
    const previousSide =
      latest.previousSide !== undefined ? latest.previousSide : latest.side;

    if (!previousBetAmount || previousBetAmount <= 0) {
      setError('No previous bet to repeat');
      return;
    }

    // Check if user has enough balance
    if (previousBetAmount > latest.balance) {
      setError('Insufficient balance');
      return;
    }

    // Update UI immediately with preserved bet
    setGameState({
      ...latest,
      status: CoinflipStatus.BETTING,
      amount: previousBetAmount,
      side: previousSide || undefined,
      playerId: latest.playerId,
      winningSide: undefined,
      payout: undefined,
      previousBetAmount,
      previousSide,
    });

    // Send PLAY_AGAIN request
    sendMockRequest(CoinflipGameActionType.PLAY_AGAIN, {
      deferApply: true,
    })
      .then((serverState) => {
        // Preserve bet from server state or use previous bet
        const preservedBetAmount =
          serverState.previousBetAmount || previousBetAmount;
        const preservedBetSide =
          serverState.previousSide !== undefined
            ? serverState.previousSide
            : previousSide;
        setGameState({
          ...serverState,
          amount: preservedBetAmount,
          side: preservedBetSide || undefined,
          playerId: serverState.playerId,
          previousBetAmount: preservedBetAmount,
          previousSide: preservedBetSide,
        });
      })
      .catch(() => {
        setError('Failed to start new game. Please try again.');
      });
  }, [sendMockRequest]);

  // Reset game
  const resetGame = useCallback(() => {
    setError(null);

    sendMockRequest(CoinflipGameActionType.RESET_GAME).catch(() => {
      setError('Failed to reset game. Please try again.');
    });
  }, [sendMockRequest]);

  // Cancel bet
  const cancelBet = useCallback(() => {
    setError(null);

    const prev = latestStateRef.current;
    if (prev.status !== CoinflipStatus.BET_PLACED) {
      setError('No bet to cancel');
      return;
    }

    sendMockRequest(CoinflipGameActionType.CANCEL_BET).catch(() => {
      setError('Failed to cancel bet. Please try again.');
    });
  }, [sendMockRequest]);

  // Clear bet - resets player bet to null
  const clearBet = useCallback(() => {
    setError(null);

    const prev = latestStateRef.current;
    if (prev.amount || prev.side) {
      setGameState({
        ...prev,
        amount: undefined,
        side: undefined,
        playerId: undefined,
      });
    }
  }, []);

  // Place bet amount on the selected side
  const placeBet = useCallback((amount: number) => {
    setError(null);

    const prev = latestStateRef.current;
    if (prev.status !== CoinflipStatus.BETTING) {
      setError('Can only place bets when game is betting');
      return;
    }

    if (!prev.side) {
      setError('Please select HEADS or TAILS first');
      return;
    }

    // Check if player has enough balance
    const currentBalance = prev.balance || 0;
    const currentBet = prev.amount || 0;

    if (currentBalance < currentBet + amount) {
      setError('Insufficient balance');
      return;
    }

    playSound('chips-place-bet', 0.5);

    // Update player bet amount
    const newBetAmount = currentBet + amount;
    const updatedState: CoinflipGameState = {
      ...prev,
      amount: newBetAmount,
      side: prev.side,
      playerId: prev.playerId,
    };

    setGameState(updatedState);
  }, []);

  // Send action - main action handler
  const sendAction = useCallback(
    (
      action: CoinflipGameActionType,
      amountOrOptions?: number | { side?: CoinSide; amount?: number }
    ) => {
      // Handle both number and object parameters
      let amount: number | undefined;
      let side: CoinSide | undefined;

      if (typeof amountOrOptions === 'number') {
        amount = amountOrOptions;
      } else if (amountOrOptions) {
        amount = amountOrOptions.amount;
        side = amountOrOptions.side;
      }

      switch (action) {
        case CoinflipGameActionType.SELECT_SIDE:
          if (side) {
            selectSide(side);
          } else {
            setError('Side is required for SELECT_SIDE');
          }
          break;

        case CoinflipGameActionType.PLACE_BET:
          if (amount) {
            placeBet(amount);
          } else {
            setError('Amount is required for PLACE_BET');
          }
          break;

        case CoinflipGameActionType.FLIP:
          flip();
          break;

        case CoinflipGameActionType.DOUBLE:
          double();
          break;

        case CoinflipGameActionType.PLAY_AGAIN:
          playAgain();
          break;

        case CoinflipGameActionType.RESET_GAME:
          resetGame();
          break;

        case CoinflipGameActionType.CANCEL_BET:
          cancelBet();
          break;

        case CoinflipGameActionType.CLEAR:
          clearBet();
          break;

        default:
          console.warn(`Action not implemented: ${action}`);
      }
    },
    [
      selectSide,
      placeBet,
      flip,
      double,
      playAgain,
      resetGame,
      cancelBet,
      clearBet,
    ]
  );

  // Calculate result for modal (WIN or LOSE)
  const result = useMemo<'WIN' | 'LOSE' | null>(() => {
    if (
      gameState.status === CoinflipStatus.FINISHED &&
      gameState.payout !== undefined
    ) {
      return gameState.payout > 0 ? 'WIN' : 'LOSE';
    }
    return null;
  }, [gameState.status, gameState.payout]);

  // Calculate profit (payout - bet amount)
  const profit = useMemo(() => {
    if (
      gameState.status === CoinflipStatus.FINISHED &&
      gameState.payout !== undefined &&
      gameState.amount
    ) {
      return gameState.payout - gameState.amount;
    }
    return 0;
  }, [gameState.status, gameState.payout, gameState.amount]);

  // Convert bet amount to chips array
  const chips = useMemo(() => {
    if (gameState.amount) {
      return optimizeChips(gameState.amount);
    }
    return [];
  }, [gameState.amount]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    gameState,
    initialLoading,
    actionLoading,
    error,
    clearError,
    sendAction,
    setError,
    placeBet,
    clearBet,
    result,
    profit,
    chips,
  };
}
