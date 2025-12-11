'use client';

import {
  AvailableAction,
  GameActionType,
  GameMode,
  GamePhaseType,
  GameState,
  ShuffleVerification,
} from '@/types/games/blackjack/game';
import {
  getGameState as fetchGameState,
  sendGameAction,
} from '@/utils/games/blackjack/client/gameApiService';
import { playSound } from '@/utils/games/blackjack/client/sounds';
import {
  createInitialGameState,
  shouldDisableActions,
} from '@/utils/games/blackjack/client/stateUtils';
import { useCardAnimationManager } from '@/hooks/games/blackjack/useCardAnimationManager';
import { updateFreePlayBalance } from '@/utils/games/blackjack/client/sessionUtils';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useGameState(gameMode: GameMode) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(gameMode)
  );
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableActions, setAvailableActions] = useState<AvailableAction[]>(
    []
  );
  const [shuffleVerification, setShuffleVerification] = useState<
    ShuffleVerification | Record<string, never>
  >();

  // Use the new CardAnimationManager
  const animationManager = useCardAnimationManager();

  const latestStateRef = useRef<GameState>(gameState);
  const previousGamePhaseRef = useRef<GamePhaseType>(gameState.gamePhase);

  // Clear animation state when transitioning to BETTING phase (new round starting)
  useEffect(() => {
    const currentPhase = gameState.gamePhase;
    const previousPhase = previousGamePhaseRef.current;

    if (
      currentPhase === GamePhaseType.BETTING &&
      previousPhase !== GamePhaseType.BETTING
    ) {
      console.log(
        `[Animation] Clearing animation state: ${previousPhase} -> ${currentPhase}`
      );
      setGameState((prev) => ({
        ...prev,
        playerHands: [],
        dealerHand: {
          cards: [],
          isStanding: false,
          isBusted: false,
          isBlackjack: false,
          showAllCards: false,
        },
        currentHandIndex: 0,
      }));
      animationManager.clear();
    }

    previousGamePhaseRef.current = currentPhase;
  }, [gameState.gamePhase, animationManager]);

  // Update gameMode immediately when prop changes to ensure UI reflects correct mode
  useEffect(() => {
    if (gameState.gameMode !== gameMode) {
      setGameState((prev) => ({
        ...prev,
        gameMode,
      }));
    }
  }, [gameMode, gameState.gameMode]);

  // Each tab has its own independent Free Play session
  // Update session storage when balance changes in free play mode
  useEffect(() => {
    if (
      gameMode === GameMode.FREE_PLAY &&
      gameState.gameMode === GameMode.FREE_PLAY &&
      gameState.tabId
    ) {
      updateFreePlayBalance(gameState.balance, gameState.tabId);
    }
  }, [gameState.balance, gameState.gameMode, gameState.tabId, gameMode]);

  // Fetch initial game state on mount
  useEffect(() => {
    const initializeGameState = async () => {
      if (gameMode === GameMode.FREE_PLAY) {
        setInitialLoading(false);
        setGameState(createInitialGameState(gameMode));
        // Skips loading from server.
        return;
      }

      try {
        setInitialLoading(true);

        const {
          gameState: initialState,
          availableActions: initialAvailableActions,
          shuffleVerification: initialShuffleVerification,
        } = (await fetchGameState()) || {};
        if (initialState) {
          setGameState(initialState);

          setAvailableActions(initialAvailableActions || []);
          setShuffleVerification(initialShuffleVerification);
          animationManager.initialize(initialState);
        } else {
          throw new Error('Failed to fetch initial game state');
        }
      } catch (err) {
        console.error('Failed to fetch initial game state:', err);
        setError('Failed to load game state');
      } finally {
        setInitialLoading(false);
      }
    };
    initializeGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode]); // animationManager is stable and doesn't need to be in deps

  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  // API request handler
  const sendMockRequest = useCallback(
    async (
      action: GameActionType,
      options: {
        amount?: number;
        pairBetAmount?: number;
        twentyOnePlusThreeBetAmount?: number;
        overrideState?: GameState;
        applyDelayMs?: number;
        deferApply?: boolean;
        skipLoadingState?: boolean; // Skip automatic loading management
      } = {}
    ) => {
      // Start loading (unless explicitly skipped)
      if (!options.skipLoadingState) {
        setActionLoading(true);
      }
      setError(null);

      let result: Awaited<ReturnType<typeof sendGameAction>>;

      try {
        result = await sendGameAction(action, options, latestStateRef.current);

        if (result.availableActions) {
          setAvailableActions(result.availableActions);
        }
        if (result.shuffleVerification) {
          setShuffleVerification(result.shuffleVerification);
        }

        if (options.deferApply) {
          return result.gameState;
        }

        await new Promise<void>((resolve) => {
          const applyState = () => {
            setGameState(result.gameState);
            resolve();
          };

          if (options.applyDelayMs && options.applyDelayMs > 0) {
            setTimeout(applyState, options.applyDelayMs);
          } else {
            applyState();
          }
        });

        return result.gameState;
      } catch (err) {
        console.error('Failed to send mock action:', err);
        const message =
          err instanceof Error ? err.message : 'Failed to process action';

        setError(message);

        if (gameMode !== GameMode.FREE_PLAY) {
          // Try to re-sync with server state on error to ensure frontend is not stuck
          const {
            gameState: syncedState,
            availableActions: initialAvailableActions,
            shuffleVerification: initialShuffleVerification,
          } = (await fetchGameState()) || {};

          if (syncedState) {
            setGameState(syncedState);
            setAvailableActions(initialAvailableActions || []);
            setShuffleVerification(initialShuffleVerification);
            return syncedState;
          }
        }

        return latestStateRef.current;
      } finally {
        if (!options.skipLoadingState) {
          setTimeout(() => {
            setActionLoading(false);
          }, 100);
        }
      }
    },
    [gameMode]
  );

  // Handle blackjack resolution - TODO - Review this, what is this used for?
  const handleBlackjackResolution = useCallback(async () => {
    // Play a success sound
    playSound('button-press', 0.3, 0.5);

    // Short delay to show the blackjack result
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Automatically transition to game end
    const serverState = await sendMockRequest(GameActionType.STAND, {
      deferApply: true,
    });

    if (serverState) {
      // Update state with resolved game
      setGameState(() => ({
        ...serverState,
        message: 'Blackjack! Game Over',
      }));

      // Short delay before enabling new game options
      setTimeout(() => {
        setGameState((current) => ({
          ...current,
          gamePhase: GamePhaseType.FINISHED,
        }));
      }, 1000);
    }
  }, [sendMockRequest, setGameState]);

  useEffect(() => {
    if (gameState.gamePhase === GamePhaseType.DEALER_TURN) {
      const isDealerBlackjack = gameState.dealerHand?.isBlackjack;
      const currentHand = gameState.playerHands[gameState.currentHandIndex];
      const isPlayerBlackjack = currentHand?.isBlackjack;

      if (isDealerBlackjack || isPlayerBlackjack) {
        handleBlackjackResolution();
      }
    }
  }, [
    gameState.gamePhase,
    gameState.dealerHand?.isBlackjack,
    gameState.playerHands,
    gameState.currentHandIndex,
    handleBlackjackResolution,
  ]);

  // Place bet - add amount to pending bet
  const placeBet = useCallback((amount: number) => {
    setError(null);

    const prevState = latestStateRef.current;
    if (prevState.gamePhase !== GamePhaseType.BETTING) {
      playSound('button-press', 0.3, 0.5);
      setError('Can only place bets during betting phase');
    }

    const newBet = prevState.pendingBet + amount;

    if (newBet > prevState.balance) {
      playSound('button-press', 0.3, 0.5);
      setError('Insufficient balance');
    }

    // Play bet sound
    playSound('chips-place-bet', 0.5);

    setGameState((prev) => ({
      ...prev,
      pendingBet: newBet,
      message: `Bet: $${newBet}`,
    }));
  }, []);

  // Clear bet
  const clearBet = useCallback(() => {
    setError(null);
    playSound('button-press', 0.3, 0.5);

    setGameState((prev) => {
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        return prev;
      }

      return {
        ...prev,
        initialBet: 0,
        pendingBet: 0,
        pairBet: 0,
        twentyOnePlusThreeBet: 0,
        message: 'Place your bet',
      };
    });
  }, []);

  // Bet again: place previous bet and immediately start round (server-side)
  const betAgain = useCallback(() => {
    setError(null);

    const latest = latestStateRef.current;

    // Allow betAgain from either BETTING or FINISHED (user finished previous hand)
    if (
      latest.gamePhase !== GamePhaseType.BETTING &&
      latest.gamePhase !== GamePhaseType.FINISHED
    ) {
      setError('Cannot bet again right now');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    const prevBet = latest.initialBet ?? latest.previousBet ?? 0;

    if (prevBet <= 0) {
      setError('No previous bet to repeat');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    if (prevBet > latest.balance) {
      setError('Insufficient balance');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    // Get previous side bets from originalPairBet and originalTwentyOnePlusThreeBet
    // These are preserved even after side bets are cleared (when they lose)
    const prevPairBet = latest.originalPairBet ?? 0;
    const prev21Plus3Bet = latest.originalTwentyOnePlusThreeBet ?? 0;
    const totalSidebetAmount = prevPairBet + prev21Plus3Bet;

    // Check if user has enough balance for all bets
    if (prevBet + totalSidebetAmount > latest.balance) {
      setError('Insufficient balance for bet and side bets');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    // Play bet sound
    playSound('chips-place-bet', 0.5);

    const stateWithBet: GameState = {
      ...latest,
      // ensure UI is in betting mode before starting
      gamePhase: GamePhaseType.BETTING,
      pairBet: prevPairBet,
      twentyOnePlusThreeBet: prev21Plus3Bet,
      sidebetResults: [],
      insuranceResults: [],
    };

    // Update UI immediately
    setGameState(stateWithBet);

    // Send BET_AGAIN with explicit bet amounts to the server
    sendMockRequest(GameActionType.BET_AGAIN, {
      deferApply: true,
    }).then((serverState) => {
      setGameState({
        ...serverState,
        message: 'Dealing cards...',
      });
    });
  }, [sendMockRequest]);

  // Place pair bet
  const placePairBet = useCallback((amount: number) => {
    setError(null);

    setGameState((prev) => {
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        setError('Can only place sidebets during betting phase');
        return prev;
      }

      const newBet = prev.pairBet + amount;

      if (newBet > prev.balance) {
        setError('Insufficient balance');
        playSound('button-press', 0.3, 0.5);
        return prev;
      }

      // Play bet sound
      playSound('chips-place-bet', 0.5);

      return {
        ...prev,
        pairBet: newBet,
        message: `Pair Bet: $${newBet}`,
      };
    });
  }, []);

  // Place 21+3 bet
  const place21Plus3Bet = useCallback((amount: number) => {
    setError(null);

    setGameState((prev) => {
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        setError('Can only place sidebets during betting phase');
        return prev;
      }

      const newBet = prev.twentyOnePlusThreeBet + amount;

      if (newBet > prev.balance) {
        setError('Insufficient balance');
        playSound('button-press', 0.3, 0.5);
        return prev;
      }

      // Play bet sound
      playSound('chips-place-bet', 0.5);

      return {
        ...prev,
        twentyOnePlusThreeBet: newBet,
        message: `21+3 Bet: $${newBet}`,
      };
    });
  }, []);

  // Start round
  const startRound = useCallback(
    async (amount?: number) => {
      setError(null);
      playSound('button-press', 0.3, 0.5);

      const prev = latestStateRef.current;
      if (prev.gamePhase !== GamePhaseType.BETTING) {
        setError('Can only start round during betting phase');
        return;
      }

      const betAmount = amount ?? prev.pendingBet;
      const pairBetAmount = prev.pairBet ?? 0;
      const twentyOnePlusThreeBetAmount = prev.twentyOnePlusThreeBet ?? 0;
      const totalSidebetAmount = pairBetAmount + twentyOnePlusThreeBetAmount;

      if (betAmount <= 0) {
        setError('Please place a bet first');
        return;
      }

      if (betAmount + totalSidebetAmount > prev.balance) {
        setError('Insufficient balance');
        return;
      }

      if (betAmount > prev.balance) {
        setError('Insufficient balance');
        return;
      }

      const serverState = await sendMockRequest(GameActionType.START_ROUND, {
        deferApply: true,
        amount: betAmount,
        pairBetAmount: pairBetAmount,
        twentyOnePlusThreeBetAmount: twentyOnePlusThreeBetAmount,
      });

      setGameState(() => ({
        ...serverState,
        message: 'Dealing cards...',
      }));
    },
    [sendMockRequest]
  );

  // Hit - take another card
  const hit = useCallback(() => {
    setError(null);
    playSound('button-press', 0.3, 0.5);

    // Get server state FIRST, then start dealing animation
    sendMockRequest(GameActionType.HIT, {
      deferApply: true,
    }).then((serverState) => {
      setGameState(() => ({
        ...serverState,
        message: 'Dealing card...',
      }));
    });
  }, [sendMockRequest]);

  // Stand - end turn, dealer plays
  const stand = useCallback(() => {
    setError(null);
    if (shouldDisableActions(gameState)) {
      setError('Cannot split: Blackjack detected');
      return;
    }
    playSound('button-press', 0.3, 0.5);

    // Fetch dealer result first so we know all dealer cards, then animate them from the deck
    sendMockRequest(GameActionType.STAND, {
      deferApply: true,
    }).then((serverState) => {
      setGameState(() => ({
        ...serverState,
        message: 'Dealer drawing...',
      }));
    });
  }, [gameState, sendMockRequest]);

  // Double - double bet and hit once
  const double = useCallback(() => {
    setError(null);

    setGameState((prev) => ({
      ...prev,
      message: 'Doubling down...',
    }));

    // Play chip sound
    playSound('chips-place-bet', 0.5);

    // Get the new state from server
    sendMockRequest(GameActionType.DOUBLE, {
      deferApply: true,
    }).then((serverState) => {
      setGameState(() => ({
        ...serverState,
      }));
    });
  }, [sendMockRequest]);

  const split = useCallback(() => {
    setError(null);
    playSound('chips-place-bet', 0.5);

    const prev = latestStateRef.current;
    const splitHandIndex = prev.currentHandIndex;

    // Fetch split result without applying immediately so we can animate
    sendMockRequest(GameActionType.SPLIT, {
      deferApply: true,
    }).then((serverState) => {
      // Handle split animation with the manager
      animationManager.handleSplit(splitHandIndex);

      setGameState({
        ...serverState,
        message: 'Split! Dealing new cards...',
      });
    });
  }, [sendMockRequest, animationManager]);

  const switchHand = useCallback(() => {
    setError(null);
    playSound('button-press', 0.3, 0.5);

    sendMockRequest(GameActionType.SWITCH_HAND);
  }, [sendMockRequest]);

  // Play again - reset for new game with same bet (server-side)
  const playAgain = useCallback(() => {
    setError(null);

    const latest = latestStateRef.current;

    // Allow betAgain from either BETTING or FINISHED (user finished previous hand)
    if (latest.gamePhase !== GamePhaseType.FINISHED) {
      setError('Cannot bet again right now');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    const prevBet = latest.initialBet ?? latest.previousBet ?? 0;

    if (prevBet <= 0) {
      setError('No previous bet to repeat');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    if (prevBet > latest.balance) {
      setError('Insufficient balance');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    // Get previous side bets from originalPairBet and originalTwentyOnePlusThreeBet
    // These are preserved even after side bets are cleared (when they lose)
    const prevPairBet = latest.originalPairBet ?? 0;
    const prev21Plus3Bet = latest.originalTwentyOnePlusThreeBet ?? 0;
    const totalSidebetAmount = prevPairBet + prev21Plus3Bet;

    // Check if user has enough balance for all bets
    if (prevBet + totalSidebetAmount > latest.balance) {
      setError('Insufficient balance for bet and side bets');
      playSound('button-press', 0.3, 0.5);
      return;
    }

    // Play bet sound
    playSound('chips-place-bet', 0.5);

    const stateWithBet: GameState = {
      ...latest,
      // ensure UI is in betting mode before starting
      gamePhase: GamePhaseType.BETTING,
      pairBet: prevPairBet,
      twentyOnePlusThreeBet: prev21Plus3Bet,
      sidebetResults: [],
      insuranceResults: [],
    };

    // Update UI immediately
    setGameState(stateWithBet);

    // Send BET_AGAIN with explicit bet amounts to the server
    sendMockRequest(GameActionType.PLAY_AGAIN, {
      deferApply: true,
    }).then((serverState) => {
      setGameState({
        ...serverState,
        message: 'Dealing cards...',
      });
    });
  }, [sendMockRequest]);

  // Start new game - reset completely
  const startNewGame = useCallback(() => {
    setError(null);
    playSound('button-press', 0.3, 0.5);

    sendMockRequest(GameActionType.START_NEW_GAME);
  }, [sendMockRequest]);

  // Reset game
  const resetGame = useCallback(() => {
    playSound('button-press', 0.3, 0.5);

    sendMockRequest(GameActionType.RESET_GAME);
  }, [sendMockRequest]);

  // surrender game
  const surrender = useCallback(() => {
    setError(null);
    sendMockRequest(GameActionType.SURRENDER, { deferApply: true }).then(
      (serverState) => {
        setGameState(() => ({
          ...serverState,
          message: 'You surrendered — half your bet was returned.',
        }));
      }
    );
  }, [sendMockRequest]);

  // Take insurance
  const takeInsurance = useCallback(() => {
    setError(null);
    playSound('chips-place-bet', 0.5);

    sendMockRequest(GameActionType.INSURANCE);
  }, [sendMockRequest]);

  // Decline insurance
  const declineInsurance = useCallback(() => {
    setError(null);
    playSound('button-press', 0.3, 0.5);

    sendMockRequest(GameActionType.DECLINE_INSURANCE);
  }, [sendMockRequest]);

  // Send action - main action handler
  const sendAction = useCallback(
    (action: GameActionType, amount?: number) => {
      if (
        shouldDisableActions(gameState) &&
        [
          GameActionType.HIT,
          GameActionType.STAND,
          GameActionType.DOUBLE,
          GameActionType.SPLIT,
        ].includes(action)
      ) {
        setError('Action not allowed: Blackjack detected');
        return;
      }
      switch (action) {
        case GameActionType.PLACE_BET:
          if (amount) placeBet(amount);
          break;
        case GameActionType.CLEAR_BET:
          clearBet();
          break;
        case GameActionType.START_ROUND:
          startRound(amount);
          break;
        case GameActionType.HIT:
          hit();
          break;
        case GameActionType.STAND:
          stand();
          break;
        case GameActionType.DOUBLE:
          double();
          break;
        case GameActionType.SPLIT:
          split();
          break;
        case GameActionType.SWITCH_HAND:
          switchHand();
          break;
        case GameActionType.PLAY_AGAIN:
          playAgain();
          break;
        case GameActionType.START_NEW_GAME:
          startNewGame();
          break;
        case GameActionType.RESET_GAME:
          resetGame();
          break;
        // Sidebet actions
        case GameActionType.PLACE_PAIR_BET:
          if (amount) placePairBet(amount);
          break;
        case GameActionType.PLACE_21PLUS3_BET:
          if (amount) place21Plus3Bet(amount);
          break;
        // Bet again action
        case GameActionType.BET_AGAIN:
          betAgain();
          break;
        // surrender action
        case GameActionType.SURRENDER:
          surrender();
          break;
        // insurance action
        case GameActionType.INSURANCE:
          takeInsurance();
          break;
        // decline insurance action
        case GameActionType.DECLINE_INSURANCE:
          declineInsurance();
          break;
        default:
          console.warn(`Action not implemented: ${action}`);
      }
    },
    [
      gameState,
      placeBet,
      clearBet,
      startRound,
      hit,
      stand,
      double,
      split,
      switchHand,
      playAgain,
      startNewGame,
      resetGame,
      placePairBet,
      place21Plus3Bet,
      betAgain,
      surrender,
      takeInsurance,
      declineInsurance,
    ]
  );

  // Set game state directly (for dev tools)
  const setGameStateDirectly = useCallback((newState: Partial<GameState>) => {
    setGameState((prev) => ({
      ...prev,
      ...newState,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    gameState,
    initialLoading,
    actionLoading,
    error,
    animationManager,
    sendAction,
    placeBet,
    clearBet,
    startRound,
    hit,
    stand,
    double,
    split,
    switchHand,
    playAgain,
    startNewGame,
    resetGame,
    setGameStateDirectly,
    // Sidebet functions
    placePairBet,
    place21Plus3Bet,
    // explicit export for betAgain (optional)
    betAgain,
    availableActions,
    shuffleVerification,
    surrender,
    takeInsurance,
    declineInsurance,
    clearError,
  };
}
