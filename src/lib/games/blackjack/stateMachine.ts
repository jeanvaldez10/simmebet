/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, prefer-const */
// TODO: Properly type all state machine logic and remove eslint-disable
import {
  GameState,
  GameStatePhaseType,
  Card,
  GameActionType,
  Sidebet,
  SidebetResultType,
  SidebetType,
  GameMode,
  HandResultType,
  Hand,
  InsuranceResult,
} from '@/types/games/blackjack/game';

import {
  gameStateValidator,
  ValidationContext,
  GameStateActions,
  validateAction,
  getCurrentHandIndex,
  getCurrentHand,
  DEALER_RULES,
  PAYOUT_RATES,
  BET_MULTIPLIERS,
} from '@/utils/games/blackjack';
import { calculateHandResultsFromGameState } from '@/utils/games/blackjack/handResults';
import { evaluateAllSideBets } from '@/utils/games/blackjack/sideBetEvaluation';

import { DeckProvider } from './gameStateService';
import { BalanceService } from './balance-service';
import { DealerService } from './dealer-service';

// Types for state machine effects
export interface StateMachineEffect {
  type:
    | 'BALANCE_CHANGE'
    | 'DEAL_CARD'
    | 'GAME_PHASE_CHANGE'
    | 'HAND_UPDATE'
    | 'MESSAGE_UPDATE'
    | 'DEALER_TURN'
    | 'INITIALIZE_GAME_STATE'
    | 'SURRENDER'
    | 'CHECK_SPLIT_STATE'
    | 'SIDEBET_EVALUATION'
    | 'INSURANCE_RESOLUTION';
  data: Record<string, unknown>; // TODO: Create specific effect data types for each effect type
}

export interface BalanceChangeEffect extends StateMachineEffect {
  type: 'BALANCE_CHANGE';
  data: {
    amount: number;
    operation: 'INCREASE' | 'DECREASE';
    reason: string;
    gameOutcome?: string;
    totalWagered?: number;
  };
}

export interface DealCardEffect extends StateMachineEffect {
  type: 'DEAL_CARD';
  data: {
    target: 'PLAYER' | 'DEALER';
    handIndex?: number;
    actionType?: 'HIT' | 'DOUBLE' | 'INITIAL_DEAL' | 'SPLIT' | 'DEALER_TURN';
  };
}

export interface SurrenderEffect extends StateMachineEffect {
  type: 'SURRENDER';
  data: {
    handIndex: number;
    surrenderAmount: number;
  };
}

export interface GamePhaseChangeEffect extends StateMachineEffect {
  type: 'GAME_PHASE_CHANGE';
  data: {
    from: GameStatePhaseType;
    to: GameStatePhaseType;
  };
}

export interface HandUpdateEffect extends StateMachineEffect {
  type: 'HAND_UPDATE';
  data: {
    handIndex: number;
    updates: Partial<GameState['playerHands'][0]>;
  };
}

export interface MessageUpdateEffect extends StateMachineEffect {
  type: 'MESSAGE_UPDATE';
  data: {
    message: string;
  };
}

export interface DealerTurnEffect extends StateMachineEffect {
  type: 'DEALER_TURN';
  data: {
    reason: 'ALL_PLAYER_HANDS_COMPLETE';
  };
}

export interface InitializeGameStateEffect extends StateMachineEffect {
  type: 'INITIALIZE_GAME_STATE';
  data: Record<string, never>; // Empty object type
}

export interface CheckSplitStateEffect extends StateMachineEffect {
  type: 'CHECK_SPLIT_STATE';
  data: {
    isSplitAces?: boolean;
    currentHandIndex?: number;
  };
}

export interface SidebetEvaluationEffect extends StateMachineEffect {
  type: 'SIDEBET_EVALUATION';
  data: {
    sidebetResults: Sidebet[];
  };
}

export interface InsuranceResolutionEffect extends StateMachineEffect {
  type: 'INSURANCE_RESOLUTION';
  data: {
    insuranceResults: InsuranceResult[];
  };
}

// State machine result
export interface StateMachineResult {
  success: boolean;
  newGameState: GameState;
  effects: StateMachineEffect[];
  waitingForUserAction: boolean;
  error?: string;
  details?: string; // Additional context about validation errors
}

// State machine input
export interface StateMachineInput {
  gameState: GameState;
  action: GameActionType;
  amount?: number;
  pairBetAmount?: number;
  twentyOnePlusThreeBetAmount?: number;
  userId?: string; // Required for balance validation
}

export class GameStateMachine {
  private gameStateActions: GameStateActions;
  private static processedGameStates = new Set<string>();
  private dealerService: DealerService;
  private balanceService: BalanceService;

  constructor(deckProvider: DeckProvider) {
    this.gameStateActions = new GameStateActions(deckProvider);
    this.dealerService = require('./dealer-service').DealerService;
    this.balanceService = require('./balance-service').balanceService;
  }

  /**
   * Get the validator service for external validation
   * @returns The game state validator instance
   */
  getValidator() {
    return gameStateValidator;
  }

  /**
   * Process effects and return updated game state
   * @param gameState - Current game state
   * @param effects - Effects to process
   * @returns Updated game state after processing effects
   */
  async processEffects(
    gameState: GameState,
    effects: StateMachineEffect[]
  ): Promise<GameState> {
    let updatedState = { ...gameState };
    const newEffects: StateMachineEffect[] = [];

    // Process other effects
    for (const effect of effects) {
      switch (effect.type) {
        case 'DEAL_CARD':
          const dealCardResult = await this.handleDealCardEffect(
            updatedState,
            effect as DealCardEffect
          );
          updatedState = dealCardResult.newState;
          newEffects.push(...dealCardResult.effects);
          break;
        case 'BALANCE_CHANGE':
          // Balance changes are handled by the balance service
          updatedState = await this.handleBalanceChangeEffect(
            updatedState,
            effect as BalanceChangeEffect
          );
          break;
        case 'HAND_UPDATE':
          updatedState = this.handleHandUpdateEffect(
            updatedState,
            effect as HandUpdateEffect
          );
          break;
        case 'MESSAGE_UPDATE':
          updatedState = this.handleMessageUpdateEffect(
            updatedState,
            effect as MessageUpdateEffect
          );
          break;
        case 'DEALER_TURN':
          const dealerResult = await this.handleDealerTurnEffect(
            updatedState,
            effect as DealerTurnEffect
          );
          updatedState = dealerResult.newState;
          newEffects.push(...dealerResult.effects);
          break;
        case 'INITIALIZE_GAME_STATE':
          const initResult = this.handleInitializeGameStateEffect(
            updatedState,
            effect as InitializeGameStateEffect
          );
          updatedState = initResult.newState;
          if (initResult.effects.length > 0) {
            newEffects.push(...initResult.effects);
          }
          break;
        case 'SURRENDER':
          updatedState = await this.handleSurrenderEffect(
            updatedState,
            effect as SurrenderEffect
          );
          break;
        case 'CHECK_SPLIT_STATE':
          const checkSplitResult = this.handleCheckSplitStateEffect(
            updatedState,
            effect as CheckSplitStateEffect
          );
          updatedState = checkSplitResult.newState;
          newEffects.push(...checkSplitResult.effects);
          break;
        case 'SIDEBET_EVALUATION':
          const sidebetResult = await this.handleSidebetEvaluationEffect(
            updatedState,
            effect as SidebetEvaluationEffect
          );
          updatedState = sidebetResult.newState;
          newEffects.push(...sidebetResult.effects);
          break;
        case 'INSURANCE_RESOLUTION':
          const insuranceResult = await this.handleInsuranceResolutionEffect(
            updatedState,
            effect as InsuranceResolutionEffect
          );
          updatedState = insuranceResult.newState;
          newEffects.push(...insuranceResult.effects);
          break;
      }
    }

    // Process any new effects that were generated
    if (newEffects.length > 0) {
      updatedState = await this.processEffects(updatedState, newEffects);
    }

    return updatedState;
  }

  /**
   * Process a game action and continue until waiting for user action or game complete
   * @param input - The state machine input containing game state, action, and optional amount
   * @returns StateMachineResult with final game state and effects
   */
  async processActionWithLoop(
    input: StateMachineInput
  ): Promise<StateMachineResult> {
    let currentState = input.gameState;
    let allEffects: StateMachineEffect[] = [];
    let waitingForUserAction = false;
    let maxIterations = 100; // Prevent infinite loops
    let iteration = 0;
    let newState = currentState;

    let result: StateMachineResult;
    while (!waitingForUserAction && iteration < maxIterations) {
      iteration++;

      // Process the action or continue the game loop
      result = await this.processAction({
        gameState: currentState,
        action: input.action,
        amount: input.amount,
        pairBetAmount: input.pairBetAmount,
        twentyOnePlusThreeBetAmount: input.twentyOnePlusThreeBetAmount,
        userId: input.userId,
      });
      newState = result.newGameState;

      if (!result.success) {
        return result;
      }

      // Process the effects
      newState = await this.processEffects(newState, result.effects);
      allEffects.push(...result.effects);

      // Validate state after processing effects
      if (!newState) {
        console.error('ERROR: newState is undefined after processEffects');
        return {
          success: false,
          newGameState: currentState,
          effects: allEffects,
          waitingForUserAction: false,
          error: 'Game state became undefined after processing effects',
        };
      }

      // Check for game completion after processing effects
      const completionResult = await this.checkGameCompletion(newState);
      newState = completionResult.newState;
      allEffects.push(...completionResult.effects);

      // If there are new effects from game completion, process them immediately
      if (completionResult.effects.length > 0) {
        newState = await this.processEffects(
          newState,
          completionResult.effects
        );
      }

      // Check if we're waiting for user action
      waitingForUserAction = this.isWaitingForUserAction(newState);

      // Update currentState for the next iteration
      currentState = newState;

      // If waiting for user action, break the loop
      if (waitingForUserAction) {
        break;
      }

      // If not waiting for user action, continue with automatic game progression
      // Determine next automatic action
      const nextAction = this.getNextAutomaticAction(currentState);
      if (nextAction) {
        input.action = nextAction;
        input.amount = undefined; // Automatic actions don't need amounts
      } else {
        // No more automatic actions, game is complete
        break;
      }
    }

    // Ensure we have a valid game state
    if (!currentState) {
      console.error(
        'ERROR: currentState is undefined in processActionWithLoop'
      );
      return {
        success: false,
        newGameState: input.gameState,
        effects: allEffects,
        waitingForUserAction: false,
        error: 'Game state became undefined',
      };
    }

    return {
      success: true,
      newGameState: currentState, // Use the final state after processing all effects
      effects: allEffects,
      waitingForUserAction,
    };
  }

  /**
   * Validate balance requirements for an action before processing
   * @param input - The state machine input
   * @returns Promise<boolean> - true if balance is sufficient, false otherwise
   */
  private async validateBalance(
    input: StateMachineInput
  ): Promise<{ isValid: boolean; error?: string }> {
    const {
      gameState,
      action,
      amount,
      pairBetAmount,
      twentyOnePlusThreeBetAmount,
      userId,
    } = input;

    if (!userId) {
      return { isValid: true }; // Skip balance validation if no userId provided
    }

    let requiredAmount = 0;
    let mainAmount = 0;

    switch (action) {
      case GameActionType.START_ROUND:
        // For START_ROUND, use explicit input amounts (including sidebets)
        mainAmount = amount || 0;
        const startPairBet = pairBetAmount ?? gameState.pairBet ?? 0;
        const start21Plus3Bet =
          twentyOnePlusThreeBetAmount ?? gameState.twentyOnePlusThreeBet ?? 0;

        // Main bet must be greater than zero
        if (mainAmount <= 0) {
          return {
            isValid: false,
            error: 'Must provide a bet amount greater than zero to start round',
          };
        }

        requiredAmount = mainAmount + startPairBet + start21Plus3Bet;
        break;

      case GameActionType.PLAY_AGAIN:
        // For PLAY_AGAIN, use explicit parameters with fallback to original amounts
        mainAmount = gameState.initialBet ?? gameState.previousBet ?? 0;
        const preservedPairBet = gameState.originalPairBet || 0;
        const preserved21Plus3Bet =
          gameState.originalTwentyOnePlusThreeBet || 0;

        // Main bet must be greater than zero
        if (mainAmount <= 0) {
          return {
            isValid: false,
            error: 'No previous bet to repeat',
          };
        }

        requiredAmount = mainAmount + preservedPairBet + preserved21Plus3Bet;
        break;

      case GameActionType.BET_AGAIN:
        // For BET_AGAIN, use explicit parameters with fallback to original amounts
        mainAmount = gameState.initialBet ?? gameState.previousBet ?? 0;
        const betAgainPairBet = gameState.originalPairBet ?? 0;
        const betAgain21Plus3Bet = gameState.originalTwentyOnePlusThreeBet ?? 0;

        // Main bet must be greater than zero
        if (mainAmount <= 0) {
          return {
            isValid: false,
            error: 'No previous bet to repeat',
          };
        }

        requiredAmount = mainAmount + betAgainPairBet + betAgain21Plus3Bet;
        break;

      case GameActionType.DOUBLE:
        const currentHand = getCurrentHand(gameState);
        requiredAmount = currentHand?.bet || 0;
        break;

      case GameActionType.SPLIT:
        const splitHand = getCurrentHand(gameState);
        requiredAmount = splitHand?.bet || 0;
        break;

      case GameActionType.INSURANCE:
        const insuranceHand = getCurrentHand(gameState);
        requiredAmount =
          Math.round(
            (insuranceHand?.bet || 0) * BET_MULTIPLIERS.INSURANCE * 100
          ) / 100;
        break;

      default:
        return { isValid: true }; // No balance validation needed for other actions
    }

    // Check if required amount is valid (for non-betting actions)
    if (requiredAmount <= 0) {
      return { isValid: true };
    }

    // For FREE_PLAY mode, compare against gameState.balance
    if (gameState.gameMode === GameMode.FREE_PLAY) {
      const availableBalance = gameState.balance || 0;
      if (availableBalance < requiredAmount) {
        const actionName = action.replace(/_/g, ' ').toLowerCase();
        return {
          isValid: false,
          error: `Insufficient balance to ${actionName}. Required: $${requiredAmount.toFixed(
            2
          )}, Available: $${availableBalance.toFixed(2)}`,
        };
      }
      return { isValid: true };
    }

    // For REAL_MONEY mode, check balance using balanceService
    if (!userId) {
      return { isValid: true };
    }

    const hasBalance = await this.balanceService.hasSufficientBalance(
      userId,
      requiredAmount.toString()
    );

    if (!hasBalance) {
      const actionName = action.replace(/_/g, ' ').toLowerCase();
      return {
        isValid: false,
        error: `Insufficient balance to ${actionName}. Required: $${requiredAmount.toFixed(
          2
        )}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Process a game action through the state machine
   * @param input - The state machine input containing game state, action, and optional amount
   * @returns StateMachineResult with new game state and effects
   */
  async processAction(input: StateMachineInput): Promise<StateMachineResult> {
    const {
      gameState,
      action,
      amount,
      pairBetAmount,
      twentyOnePlusThreeBetAmount,
      userId,
    } = input;

    const currentHandIndex = getCurrentHandIndex(gameState);

    // Normalize the game state to ensure all hands have proper structure
    const normalizedGameState = {
      ...gameState,
      playerHands: gameState.playerHands.map((hand) => ({
        ...hand,
        cards: hand.cards || [],
      })),
      dealerHand: {
        ...gameState.dealerHand,
        cards: gameState?.dealerHand?.cards || [],
      },
      currentHandIndex,
    };

    // Ensure userId is set in gameState if provided
    const updatedGameState = userId
      ? { ...normalizedGameState, userId }
      : normalizedGameState;

    // Use the comprehensive validator service
    const validationContext: ValidationContext = {
      gameState: updatedGameState,
      action,
      amount,
      pairBetAmount,
      twentyOnePlusThreeBetAmount,
      userId,
    };

    // const validation = gameStateValidator.validateAction(validationContext);
    // if (!validation.isValid) {
    //   return {
    //     success: false,
    //     newGameState: updatedGameState,
    //     effects: [],
    //     waitingForUserAction: false,
    //     error: validation.error,
    //     details: validation.details,
    //   };
    // }

    // Validate balance after action validation (before state transition)
    const balanceValidation = await this.validateBalance(input);
    if (!balanceValidation.isValid) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: balanceValidation.error,
      };
    }

    // Process the action based on type
    switch (action) {
      case GameActionType.PLACE_BET:
        return this.processPlaceBet(updatedGameState, amount);
      case GameActionType.PLACE_PAIR_BET:
        return this.processPlacePairBet(updatedGameState, amount);
      case GameActionType.PLACE_21PLUS3_BET:
        return this.processPlace21Plus3Bet(updatedGameState, amount);
      case GameActionType.START_ROUND:
        return this.processStartRound(
          updatedGameState,
          amount,
          pairBetAmount,
          twentyOnePlusThreeBetAmount
        );

      case GameActionType.HIT:
        return this.processHit(updatedGameState);

      case GameActionType.STAND:
        return this.processStand(updatedGameState);

      case GameActionType.DOUBLE:
        return this.processDouble(updatedGameState);

      case GameActionType.SPLIT:
        return this.processSplit(updatedGameState);

      case GameActionType.SURRENDER:
        return this.processSurrender(updatedGameState);

      case GameActionType.INSURANCE:
        return this.processInsurance(updatedGameState);

      case GameActionType.DECLINE_INSURANCE:
        return this.processDeclineInsurance(updatedGameState);

      case GameActionType.RESET_GAME:
        return this.processResetGame(updatedGameState);

      case GameActionType.START_NEW_GAME:
        return this.processResetGame(updatedGameState); // Same as RESET_GAME - creates new game ID

      case GameActionType.PLAY_AGAIN:
        return this.processPlayAgain(updatedGameState);

      case GameActionType.BET_AGAIN:
        return await this.processBetAgain(updatedGameState);

      default:
        return {
          success: false,
          newGameState: updatedGameState,
          effects: [],
          waitingForUserAction: false,
          error: `Unsupported action: ${action}`,
        };
    }
  }

  // processPlaceBet removed - functionality consolidated into processStartRound

  private async processStartRound(
    gameState: GameState,
    amount?: number,
    pairBetAmount?: number,
    twentyOnePlusThreeBetAmount?: number
  ): Promise<StateMachineResult> {
    const effects: StateMachineEffect[] = [];

    // Note: Bet amount validation (> 0) and balance validation are already done in validateBalance method
    const betAmount = amount || gameState.pendingBet;

    // Prevent processing START_ROUND multiple times
    if (gameState.dealingStep > 0) {
      return {
        success: true,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: true,
      };
    }

    // Use explicit sidebet amounts if provided, otherwise fall back to gameState values
    const pairBet = pairBetAmount ?? gameState.pairBet ?? 0;
    const twentyOnePlus3Bet =
      twentyOnePlusThreeBetAmount ?? gameState.twentyOnePlusThreeBet ?? 0;

    // Create initial empty hands - cards will be dealt by effects
    const initialHand = this.gameStateActions.createHand(betAmount);

    // Update game state
    const newGameState: GameState = {
      ...gameState,
      gamePhase: GameStatePhaseType.BETTING, // Will transition to appropriate phase after cards are dealt
      playerHands: [initialHand], // Empty hand, cards will be dealt by effects
      dealerHand: {
        ...this.gameStateActions.createHand(0),
        showAllCards: false,
      }, // Empty hand, cards will be dealt by effects
      pendingBet: 0,
      pairBet: pairBet,
      initialBet: betAmount,
      originalPairBet: pairBet,
      originalTwentyOnePlusThreeBet: twentyOnePlus3Bet,
      twentyOnePlusThreeBet: twentyOnePlus3Bet,
      totalWagered: betAmount + pairBet + twentyOnePlus3Bet,
      previousBet: betAmount,
      totalWon: 0,
      currentHandProfit: -betAmount,
      gameProfit: 0, // Will be calculated by effects
      message: 'Starting new round...',
      dealingStep: 0,
      isDealing: true,
      lastProcessedStep: -1,
      dealerDealingStep: 0,
      isDealerDealing: false,
      isBustSequence: false,
      bustSequenceStep: 0,
      dealerBustRevealStep: 0,
      handResults: [],
      insuranceResults: [],
      dealtCardCount: 0, // Reset dealt card count for new round
    };

    // Balance change will be handled by the DEAL_CARD effect

    // Deal initial cards
    effects.push({
      type: 'DEAL_CARD',
      data: {
        target: 'PLAYER',
        handIndex: 0,
        actionType: 'INITIAL_DEAL',
      },
    } as DealCardEffect);

    effects.push({
      type: 'DEAL_CARD',
      data: {
        target: 'DEALER',
        handIndex: 0,
      },
    } as DealCardEffect);

    effects.push({
      type: 'DEAL_CARD',
      data: {
        target: 'PLAYER',
        handIndex: 0,
      },
    } as DealCardEffect);

    effects.push({
      type: 'DEAL_CARD',
      data: {
        target: 'DEALER',
        handIndex: 0,
      },
    } as DealCardEffect);

    // Add INITIALIZE_GAME_STATE effect after all cards are dealt
    effects.push({
      type: 'INITIALIZE_GAME_STATE',
      data: {},
    } as InitializeGameStateEffect);

    // Side bet evaluation will happen in INITIALIZE_GAME_STATE handler
    // and will create SIDEBET_EVALUATION effects if needed

    // Game phase and message will be determined by INITIALIZE_GAME_STATE effect

    // Don't process effects here - let the loop handle them
    // Action flags and blackjack detection will be calculated by the INITIALIZE_GAME_STATE effect
    const finalState = {
      ...newGameState,
      dealingStep: newGameState.dealingStep + 1,
      isDealing: false,
      lastProcessedStep: newGameState.dealingStep,
    };

    return {
      success: true,
      newGameState: finalState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(finalState),
    };
  }

  private processPlaceBet(
    gameState: GameState,
    amount?: number
  ): StateMachineResult {
    // Allow amount to be 0 for clearing bets
    const betAmount = amount ?? 0;

    // Update the pending bet
    const newGameState: GameState = {
      ...gameState,
      pendingBet: betAmount,
      message: betAmount > 0 ? `Bet placed: $${betAmount}` : 'Bet cleared',
    };

    return {
      success: true,
      newGameState,
      effects: [],
      waitingForUserAction: true,
    };
  }

  private processPlacePairBet(
    gameState: GameState,
    amount?: number
  ): StateMachineResult {
    if (gameState.gamePhase !== GameStatePhaseType.BETTING) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'Can only place side bets during betting phase',
      };
    }

    if (!amount || amount <= 0) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'Must provide a bet amount',
      };
    }

    const newBet = gameState.pairBet + amount;

    if (newBet > gameState.balance) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'Insufficient balance',
      };
    }

    // Update the pair bet
    const newGameState: GameState = {
      ...gameState,
      pairBet: newBet,
      message: `Pair Bet: $${newBet}`,
    };

    return {
      success: true,
      newGameState,
      effects: [],
      waitingForUserAction: true,
    };
  }

  private processPlace21Plus3Bet(
    gameState: GameState,
    amount?: number
  ): StateMachineResult {
    if (gameState.gamePhase !== GameStatePhaseType.BETTING) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'Can only place side bets during betting phase',
      };
    }

    if (!amount || amount <= 0) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'Must provide a bet amount',
      };
    }

    const newBet = gameState.twentyOnePlusThreeBet + amount;

    if (newBet > gameState.balance) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'Insufficient balance',
      };
    }

    // Update the 21+3 bet
    const newGameState: GameState = {
      ...gameState,
      twentyOnePlusThreeBet: newBet,
      message: `21+3 Bet: $${newBet}`,
    };

    return {
      success: true,
      newGameState,
      effects: [],
      waitingForUserAction: true,
    };
  }

  private processHit(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Add effect for card dealing
    const dealCardEffect = {
      type: 'DEAL_CARD',
      data: {
        target: 'PLAYER',
        handIndex: getCurrentHandIndex(gameState),
        actionType: 'HIT',
      },
    } as DealCardEffect;

    effects.push(dealCardEffect);

    // Return the current state - the effect will handle the card dealing and state updates
    return {
      success: true,
      newGameState: gameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(gameState),
    };
  }

  private processStand(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    console.log('🎯 processStand called with:', {
      gamePhase: gameState.gamePhase,
      playerHands: gameState.playerHands.map((h) => ({
        isStanding: h.isStanding,
        isBusted: h.isBusted,
        isSurrendered: h.isSurrendered,
      })),
    });

    // Use existing GameStateActions logic
    let newGameState = this.gameStateActions.processStand(gameState);

    console.log('🎯 processStand after gameStateActions:', {
      gamePhase: newGameState.gamePhase,
      playerHands: newGameState.playerHands.map((h) => ({
        isStanding: h.isStanding,
        isBusted: h.isBusted,
        isSurrendered: h.isSurrendered,
      })),
    });

    // Check if a second card was automatically dealt to a split hand
    // If so, we need to update the deck in the state machine
    const currentHandIndex = getCurrentHandIndex(newGameState);
    const currentHand = getCurrentHand(newGameState);
    const previousHandIndex = getCurrentHandIndex(gameState);

    // If we moved to a new hand and it's a split hand that now has 2 cards (was 1 before),
    // it means the second card was automatically dealt
    if (
      currentHandIndex !== previousHandIndex &&
      currentHand &&
      currentHand.isFromSplit &&
      currentHand.cards.length === 2
    ) {
      // The deck was already updated in gameStateActions.processStand,
      // but we need to make sure the state machine has the updated deck
      // This is handled by the fact that newGameState already contains the updated deck
    }

    // Check if all hands are complete after stand
    const allHandsDone = newGameState.playerHands.every(
      (hand) => hand.isStanding || hand.isBusted
    );

    console.log('🎯 processStand allHandsDone:', allHandsDone);

    if (allHandsDone) {
      // Don't add DEALER_TURN effect here - let checkGameCompletion handle it
      // This prevents the dealer turn from being triggered during the STAND action
      // The checkGameCompletion function will handle the dealer turn after the STAND action is complete
      console.log(
        '🎯 processStand - all hands done, letting checkGameCompletion handle dealer turn'
      );
    } else {
      // Add message update effect when not all hands are complete
      effects.push({
        type: 'MESSAGE_UPDATE',
        data: {
          message: newGameState.message,
        },
      } as MessageUpdateEffect);
    }

    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
    };
  }

  private processDouble(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Validate the double down action first
    const validation = validateAction(gameState, GameActionType.DOUBLE);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid double down action',
        newGameState: gameState,
        effects: [],
        waitingForUserAction: this.isWaitingForUserAction(gameState),
      };
    }

    // First, update the game state using the game state actions
    const updatedState = this.gameStateActions.processDouble(gameState);

    // Balance change will be handled by the DEAL_CARD effect

    // Add effect for card dealing
    effects.push({
      type: 'DEAL_CARD',
      data: {
        target: 'PLAYER',
        handIndex: getCurrentHandIndex(gameState),
        actionType: 'DOUBLE',
      },
    } as DealCardEffect);

    // Check if all hands are complete after double down and trigger dealer turn
    if (
      this.areAllHandsComplete(updatedState) &&
      updatedState.gamePhase === GameStatePhaseType.PLAYING
    ) {
      effects.push({
        type: 'DEALER_TURN',
        data: {
          reason: 'ALL_PLAYER_HANDS_COMPLETE',
        },
      } as DealerTurnEffect);
    }

    // Return the updated state with effects
    return {
      success: true,
      newGameState: updatedState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(updatedState),
    };
  }

  private processSplit(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // TODO: we probably shouldn't mutate the hand in gameStateActions, right?
    // Use existing GameStateActions logic
    const newGameState = this.gameStateActions.processSplit(gameState);

    // Check if split was successful (new hands were created)
    if (newGameState.playerHands.length > gameState.playerHands.length) {
      // Deduct additional bet ONCE for the split
      const currentHand = getCurrentHand(gameState);
      const splitBet = currentHand?.bet || 0;
      effects.push({
        type: 'BALANCE_CHANGE',
        data: {
          amount: splitBet,
          operation: 'DECREASE',
          reason: 'SPLIT_HAND',
        },
      } as BalanceChangeEffect);
      // Deal cards to both split hands
      const currentHandIndex = getCurrentHandIndex(gameState);
      const firstHand = newGameState.playerHands[currentHandIndex];

      if (firstHand.isSplitAces) {
        // For ace splits: deal one card to both hands immediately and end player turn
        // Deal second card to first hand
        effects.push({
          type: 'DEAL_CARD',
          data: {
            target: 'PLAYER',
            handIndex: getCurrentHandIndex(gameState),
            actionType: 'SPLIT',
          },
        } as DealCardEffect);

        // Deal second card to second hand
        effects.push({
          type: 'DEAL_CARD',
          data: {
            target: 'PLAYER',
            handIndex: currentHandIndex + 1,
            actionType: 'SPLIT',
          },
        } as DealCardEffect);

        // Set both hands as standing after cards are dealt (no more actions allowed)
        effects.push({
          type: 'HAND_UPDATE',
          data: {
            handIndex: getCurrentHandIndex(gameState),
            updates: { isStanding: true },
          },
        } as HandUpdateEffect);

        effects.push({
          type: 'HAND_UPDATE',
          data: {
            handIndex: currentHandIndex + 1,
            updates: { isStanding: true },
          },
        } as HandUpdateEffect);

        // For split aces, go directly to FINISHED since both hands are complete
        effects.push({
          type: 'DEALER_TURN',
          data: {
            reason: 'ALL_PLAYER_HANDS_COMPLETE',
          },
        } as DealerTurnEffect);
      } else {
        // For regular splits: deal card to both hands immediately
        // Deal second card to first hand
        effects.push({
          type: 'DEAL_CARD',
          data: {
            target: 'PLAYER',
            handIndex: getCurrentHandIndex(gameState),
            actionType: 'SPLIT',
          },
        } as DealCardEffect);

        // Deal second card to second hand
        effects.push({
          type: 'DEAL_CARD',
          data: {
            target: 'PLAYER',
            handIndex: getCurrentHandIndex(gameState) + 1,
            actionType: 'SPLIT',
          },
        } as DealCardEffect);
      }
    }

    // Note: Hand update effects removed - they were overwriting the entire hand object
    // including cards that were added by DEAL_CARD effects. The split hands are already
    // created correctly in the processSplit method.

    // Add message update effect
    effects.push({
      type: 'MESSAGE_UPDATE',
      data: {
        message: newGameState.message,
      },
    } as MessageUpdateEffect);

    // Check if there was an error (insufficient balance, etc.)
    const hasError =
      newGameState.message.includes('Insufficient balance') ||
      newGameState.message.includes('Cannot split') ||
      newGameState.message.includes('No active hand');

    return {
      success: !hasError,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
      error: hasError ? newGameState.message : undefined,
    };
  }

  private processSurrender(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Use existing GameStateActions logic
    const newGameState = this.gameStateActions.processSurrender(gameState);

    // Add SURRENDER effect (this will handle balance change)
    const currentHand = getCurrentHand(gameState);
    if (currentHand) {
      const surrenderAmount = currentHand.bet * BET_MULTIPLIERS.SURRENDER;
      effects.push({
        type: 'SURRENDER',
        data: {
          handIndex: getCurrentHandIndex(gameState),
          surrenderAmount: surrenderAmount,
        },
      } as SurrenderEffect);
    }

    // Check if all hands are complete after surrender
    const allHandsDone = newGameState.playerHands.every(
      (hand) => hand.isStanding || hand.isBusted || hand.isSurrendered
    );
    let gamePhase = newGameState.gamePhase;
    if (allHandsDone) {
      // Emit DEALER_TURN effect instead of direct message
      gamePhase = GameStatePhaseType.FINISHED;
      effects.push({
        type: 'DEALER_TURN',
        data: {
          reason: 'ALL_PLAYER_HANDS_COMPLETE',
        },
      } as DealerTurnEffect);
    } else {
      // Add message update effect for normal hand progression
      effects.push({
        type: 'MESSAGE_UPDATE',
        data: {
          message: newGameState.message,
        },
      } as MessageUpdateEffect);
    }

    newGameState.gamePhase = gamePhase;
    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
    };
  }

  private processInsurance(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Insurance is offered before player starts playing, so check first hand (index 0)
    // Don't use getCurrentHand() as currentHandIndex may be -1
    const firstPlayerHand = gameState.playerHands[0];

    if (!firstPlayerHand) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
        error: 'No active hand found',
      };
    }

    // Calculate insurance amount (50% of main bet)
    const insuranceAmount =
      Math.round(firstPlayerHand.bet * BET_MULTIPLIERS.INSURANCE * 100) / 100;

    // Deduct insurance bet from balance immediately
    effects.push({
      type: 'BALANCE_CHANGE',
      data: {
        amount: insuranceAmount,
        operation: 'DECREASE',
        reason: 'INSURANCE_BET',
      },
    } as BalanceChangeEffect);

    const dealerBlackjack = this.gameStateActions.isBlackjack(
      gameState.dealerHand.cards
    );
    const updatedDealerHand = {
      ...gameState.dealerHand,
      isBlackjack: dealerBlackjack,
    };

    // Calculate insurance results (similar to sidebet evaluation)
    const insuranceResults = this.calculateInsuranceResults(
      insuranceAmount,
      dealerBlackjack
    );

    // Create insurance resolution effect (similar to sidebet evaluation)
    const insuranceEffect: InsuranceResolutionEffect = {
      type: 'INSURANCE_RESOLUTION',
      data: {
        insuranceResults: insuranceResults,
      },
    };
    effects.push(insuranceEffect);

    // Check for player blackjack
    const playerBlackjack = this.gameStateActions.isBlackjack(
      firstPlayerHand.cards
    );

    let gamePhase = GameStatePhaseType.PLAYING;
    let message = 'Insurance bet placed. Continuing with game...';

    if (dealerBlackjack) {
      gamePhase = GameStatePhaseType.FINISHED;
      if (playerBlackjack) {
        message = 'Dealer has blackjack! Push on main bet.';
      } else {
        message = 'Dealer has blackjack! You lose main bet.';
      }
    } else if (playerBlackjack) {
      gamePhase = GameStatePhaseType.FINISHED;
      message = 'You win with blackjack!';
    }

    const newGameState: GameState = {
      ...gameState,
      gamePhase,
      message,
      insuranceOffered: false,
      insuranceWasOffered: true,
      dealerHasBlackjack: dealerBlackjack,
      dealerHand: {
        ...updatedDealerHand,
        showAllCards: gamePhase === GameStatePhaseType.FINISHED,
      },
      insuranceBet: insuranceAmount, // Store at game state level (will be resolved by effect)
    };

    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
    };
  }

  /**
   * Calculate insurance results (similar to sidebet evaluation)
   * Insurance can only happen as the first action, so there's only one insurance bet per game
   * Returns insurance results without creating balance change effects
   */
  private calculateInsuranceResults(
    insuranceAmount: number,
    dealerBlackjack: boolean
  ): InsuranceResult[] {
    const insuranceResults: InsuranceResult[] = [];

    if (insuranceAmount <= 0) {
      return insuranceResults;
    }

    if (dealerBlackjack) {
      // Insurance wins: pays 2:1
      const payout = insuranceAmount * 2; // 2:1 payout
      const profit = payout - insuranceAmount; // Net profit

      // Insurance is tied to the first hand (handIndex 0) since it can only happen before any actions
      insuranceResults.push({
        handIndex: 0,
        amount: insuranceAmount,
        result: 'WIN',
        payout,
        profit,
      });
    } else {
      // Insurance loses: bet was already deducted when insurance was taken
      insuranceResults.push({
        handIndex: 0,
        amount: insuranceAmount,
        result: 'LOSE',
        payout: 0,
        profit: -insuranceAmount,
      });
    }

    return insuranceResults;
  }

  private processDeclineInsurance(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Check if dealer has blackjack after declining insurance
    const dealerCards = gameState.dealerHand.cards || [];
    const dealerBlackjack = this.gameStateActions.isBlackjack(dealerCards);

    // Insurance is offered before player starts playing, so check first hand (index 0)
    // Don't use getCurrentHand() as currentHandIndex may be -1
    const firstPlayerHand = gameState.playerHands[0];
    // Use the isBlackjack flag that was set during INITIALIZE_GAME_STATE
    const playerBlackjack = firstPlayerHand?.isBlackjack || false;

    let gamePhase = GameStatePhaseType.PLAYING;
    let message = 'Insurance declined. Continuing with game...';

    if (dealerBlackjack) {
      gamePhase = GameStatePhaseType.FINISHED;
      if (playerBlackjack) {
        message = 'Dealer has blackjack! Push on main bet.';
        // Balance changes will be handled by the DEALER_TURN effect
      } else {
        message = 'Dealer has blackjack! You lose main bet.';
        // Balance changes will be handled by the DEALER_TURN effect
      }
    } else if (playerBlackjack) {
      // Player has blackjack, dealer doesn't - player wins
      gamePhase = GameStatePhaseType.FINISHED;
      message = 'You win with blackjack!';
      // Balance changes will be handled by the DEALER_TURN effect
    }

    const newGameState: GameState = {
      ...gameState,
      insuranceBet: 0,
      insuranceOffered: false,
      insuranceWasOffered: true,
      gamePhase,
      message,
      dealerHasBlackjack: dealerBlackjack,
      // Explicitly preserve hands
      playerHands: gameState.playerHands,
      dealerHand: {
        ...gameState.dealerHand,
        isBlackjack: dealerBlackjack,
        showAllCards: gamePhase === GameStatePhaseType.FINISHED, // Reveal cards when game finishes
      },
    };

    // Add message update effect
    effects.push({
      type: 'MESSAGE_UPDATE',
      data: {
        message: newGameState.message,
      },
    } as MessageUpdateEffect);

    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
    };
  }

  private processResetGame(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Generate new game ID and shuffle ID for the fresh game
    const newGameId = `game_${Date.now()}_${gameState.userId}`;
    const newShuffleId = `shuffle_${Date.now()}`;

    const newGameState: GameState = {
      ...gameState,
      // gameId: newGameId,
      // shuffleId: newShuffleId,
      dealtCardCount: 0,
      gamePhase: GameStatePhaseType.BETTING,
      playerHands: [],
      dealerHand: {
        ...this.gameStateActions.createHand(0),
        showAllCards: false,
      },
      pendingBet: 0,
      initialBet: 0,
      previousBet: 0,
      totalWagered: 0,
      insuranceBet: 0,
      pairBet: 0,
      twentyOnePlusThreeBet: 0,
      sidebetResults: [],
      originalPairBet: 0,
      originalTwentyOnePlusThreeBet: 0,
      message: 'New game started. Place your bet to start a new round.',
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      insuranceOffered: false,
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
      totalWon: 0,
      currentHandProfit: 0,
      gameProfit: 0,
      handResults: [],
      result: undefined,
    };

    // Add phase change effect
    effects.push({
      type: 'GAME_PHASE_CHANGE',
      data: {
        from: gameState.gamePhase,
        to: GameStatePhaseType.BETTING,
      },
    } as GamePhaseChangeEffect);

    // Add message update effect
    effects.push({
      type: 'MESSAGE_UPDATE',
      data: {
        message: newGameState.message,
      },
    } as MessageUpdateEffect);

    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
    };
  }

  private processPlayAgain(gameState: GameState): StateMachineResult {
    const effects: StateMachineEffect[] = [];

    // Preserve bets from previous round
    const preservedMainBet = gameState.initialBet ?? gameState.previousBet ?? 0;
    // Use ORIGINAL bet amounts to restore side bets (even if they were cleared after loss)
    const preservedPairBet = gameState.originalPairBet || 0;
    const preserved21Plus3Bet = gameState.originalTwentyOnePlusThreeBet || 0;

    // Reset to initial betting state but preserve bets
    const newGameState: GameState = {
      ...gameState,
      gamePhase: GameStatePhaseType.BETTING,
      playerHands: [],
      dealerHand: {
        ...this.gameStateActions.createHand(0),
        showAllCards: false,
      },
      pendingBet: preservedMainBet,
      initialBet: 0,
      previousBet: preservedMainBet,
      totalWagered: 0, // Will be updated when round starts
      insuranceBet: 0,
      pairBet: preservedPairBet,
      twentyOnePlusThreeBet: preserved21Plus3Bet,
      // Preserve original amounts for next Play Again
      originalPairBet: preservedPairBet,
      originalTwentyOnePlusThreeBet: preserved21Plus3Bet,
      sidebetResults: [],
      message:
        preservedMainBet > 0 ? `Bet: $${preservedMainBet}` : 'Place your bet',
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      insuranceOffered: false,
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
      totalWon: 0,
      currentHandProfit: 0,
      gameProfit: 0,
      handResults: [],
      result: undefined,
    };

    // Add phase change effect
    effects.push({
      type: 'GAME_PHASE_CHANGE',
      data: {
        from: gameState.gamePhase,
        to: GameStatePhaseType.BETTING,
      },
    } as GamePhaseChangeEffect);

    // Add message update effect
    effects.push({
      type: 'MESSAGE_UPDATE',
      data: {
        message: newGameState.message,
      },
    } as MessageUpdateEffect);

    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: this.isWaitingForUserAction(newGameState),
    };
  }

  /**
   * Process BET_AGAIN action - combines PLAY_AGAIN + START_ROUND
   * Preserves previous bets and immediately deals cards in one atomic operation
   */
  private async processBetAgain(
    gameState: GameState
  ): Promise<StateMachineResult> {
    // Validate phase - only allowed from BETTING or FINISHED
    if (
      gameState.gamePhase !== GameStatePhaseType.BETTING &&
      gameState.gamePhase !== GameStatePhaseType.FINISHED
    ) {
      return {
        success: false,
        error:
          'Bet Again is only allowed during betting phase or after game finishes',
        newGameState: gameState,
        effects: [],
        waitingForUserAction: false,
      };
    }

    // Determine bet amounts to use
    // Priority: initialBet > previousBet
    // Note: Balance validation is already done in validateBalance method
    const mainBet = gameState.initialBet ?? gameState.previousBet ?? 0;

    const pairBet = gameState.originalPairBet ?? 0;
    const twentyOnePlusThreeBet = gameState.originalTwentyOnePlusThreeBet ?? 0;

    // Step 1: Reset to betting state with bets placed (like PLAY_AGAIN)
    const stateWithBets: GameState = {
      ...gameState,
      gamePhase: GameStatePhaseType.BETTING,
      playerHands: [],
      dealerHand: {
        ...this.gameStateActions.createHand(0),
        showAllCards: false,
      },
      pendingBet: mainBet,
      initialBet: 0,
      previousBet: 0,
      pairBet: pairBet,
      twentyOnePlusThreeBet: twentyOnePlusThreeBet,
      originalPairBet: pairBet,
      originalTwentyOnePlusThreeBet: twentyOnePlusThreeBet,
      totalWagered: 0, // Will be updated by START_ROUND
      insuranceBet: 0,
      sidebetResults: [],
      message: 'Dealing cards...',
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      insuranceOffered: false,
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
      totalWon: 0,
      currentHandProfit: 0,
      gameProfit: 0,
      handResults: [],
      insuranceResults: [],
      result: undefined,
    };

    // Step 2: Immediately call START_ROUND with all bet amounts
    return await this.processStartRound(
      stateWithBets,
      mainBet,
      pairBet,
      twentyOnePlusThreeBet
    );
  }

  /**
   * Handle SURRENDER effect - process surrender balance change
   */
  private async handleSurrenderEffect(
    gameState: GameState,
    effect: SurrenderEffect
  ): Promise<GameState> {
    const { surrenderAmount } = effect.data;

    // Create balance change effect for surrender
    const balanceChangeEffect = {
      type: 'BALANCE_CHANGE',
      data: {
        amount: surrenderAmount,
        operation: 'INCREASE',
        reason: 'SURRENDER',
      },
    } as BalanceChangeEffect;

    // Process the balance change
    return await this.handleBalanceChangeEffect(gameState, balanceChangeEffect);
  }

  /**
   * Handle CHECK_SPLIT_STATE effect to deal cards to remaining split hands
   */
  private handleCheckSplitStateEffect(
    gameState: GameState,
    effect: CheckSplitStateEffect
  ): { newState: GameState; effects: StateMachineEffect[] } {
    const effects: StateMachineEffect[] = [];

    // Find hands that need their second card (split hands with only 1 card)
    const handsNeedingCards = gameState.playerHands.filter(
      (hand, index) =>
        hand.isFromSplit &&
        hand.cards.length === 1 &&
        !hand.isStanding &&
        !hand.isBusted
    );

    if (handsNeedingCards.length > 0) {
      // Deal card to the first hand that needs one
      const handIndex = gameState.playerHands.findIndex(
        (hand) =>
          hand.isFromSplit &&
          hand.cards.length === 1 &&
          !hand.isStanding &&
          !hand.isBusted
      );

      effects.push({
        type: 'DEAL_CARD',
        data: {
          target: 'PLAYER',
          handIndex: handIndex,
          actionType: 'SPLIT',
        },
      } as DealCardEffect);
    } else {
      // All hands have been dealt to, check if we need to set ace splits as standing
      const aceSplitHands = gameState.playerHands.filter(
        (hand) => hand.isSplitAces && !hand.isStanding
      );

      if (aceSplitHands.length > 0) {
        // Set all ace split hands as standing
        aceSplitHands.forEach((hand, index) => {
          const handIndex = gameState.playerHands.findIndex((h) => h === hand);
          effects.push({
            type: 'HAND_UPDATE',
            data: {
              handIndex: handIndex,
              updates: { isStanding: true },
            },
          } as HandUpdateEffect);
        });
      }
    }

    return {
      newState: gameState,
      effects,
    };
  }

  /**
   * Handle DEAL_CARD effect by using the dealer service
   */
  private async handleDealCardEffect(
    gameState: GameState,
    effect: DealCardEffect
  ): Promise<{ newState: GameState; effects: StateMachineEffect[] }> {
    const { target, handIndex, actionType } = effect.data;

    // Collect all dealt cards to pass to the deck provider
    const dealtCards: Card[] = [];
    if (gameState.playerHands && gameState.playerHands.length > 0) {
      gameState.playerHands.forEach((hand) => {
        dealtCards.push(...hand.cards);
      });
    }

    if (gameState.dealerHand) {
      dealtCards.push(...gameState.dealerHand.cards);
    } // Use the configured deck provider to deal a card

    const { card } = (this.gameStateActions as any).dealCard(
      gameState.shuffleId,
      gameState.dealtCardCount,
      gameState.shuffleSalt
    );

    // Automatically increment the dealt card count
    const newDealtCardCount = gameState.dealtCardCount + 1;

    // Handle balance changes based on action type
    if (target === 'PLAYER') {
      if (effect.data.actionType === 'INITIAL_DEAL' && handIndex === 0) {
        // This is the first card dealt to the player, so we need to deduct the initial bet
        // Also deduct side bets at the same time
        const totalSidebetAmount =
          gameState.pairBet + gameState.twentyOnePlusThreeBet;
        const totalBetAmount = gameState.initialBet + totalSidebetAmount;

        const balanceChangeEffect = {
          type: 'BALANCE_CHANGE',
          data: {
            amount: totalBetAmount,
            operation: 'DECREASE',
            reason: 'START_ROUND',
          },
        } as BalanceChangeEffect;

        // Process the balance change
        // TODO: push this to the effects system
        gameState = await this.handleBalanceChangeEffect(
          gameState,
          balanceChangeEffect
        );
      } else if (effect.data.actionType === 'DOUBLE') {
        // This is a double down, so we need to deduct the additional bet
        const currentHand = gameState.playerHands[handIndex || 0];
        if (currentHand) {
          // For double down, we need to deduct the original bet amount (before doubling)
          // The hand bet is already doubled, so we need to get the original amount
          const originalBetAmount =
            currentHand.originalBet || currentHand.bet / 2;
          const balanceChangeEffect = {
            type: 'BALANCE_CHANGE',
            data: {
              amount: originalBetAmount,
              operation: 'DECREASE',
              reason: 'DOUBLE_DOWN',
            },
          } as BalanceChangeEffect;

          // Process the balance change
          gameState = await this.handleBalanceChangeEffect(
            gameState,
            balanceChangeEffect
          );
        }
      }
    }

    if (target === 'PLAYER') {
      // Use the appropriate logic method based on the action type
      let updatedState;
      if (effect.data.actionType === 'DOUBLE') {
        // For double down, the state has already been updated in processDouble
        // We just need to add the card to the hand and ensure it's finalized
        const currentHand = gameState.playerHands[handIndex || 0];
        if (currentHand) {
          const updatedHand = {
            ...currentHand,
            cards: [...currentHand.cards, card],
            isStanding: true, // Ensure the hand is standing after double down
            isDoubled: true, // Ensure the hand is marked as doubled
          };

          // Check if busted after adding the card
          if (this.gameStateActions.isBusted(updatedHand.cards)) {
            updatedHand.isBusted = true;
          }

          const updatedHands = [...gameState.playerHands];
          updatedHands[handIndex || 0] = updatedHand;

          // Check if all hands are complete after the double down
          const allHandsDone = updatedHands.every(
            (hand) => hand.isStanding || hand.isBusted
          );

          updatedState = {
            ...gameState,
            playerHands: updatedHands,
            // If all hands are done, transition to dealer turn
            gamePhase: allHandsDone
              ? GameStatePhaseType.PLAYING
              : gameState.gamePhase,
          };
        } else {
          updatedState = gameState;
        }
      } else if (effect.data.actionType === 'SPLIT') {
        // Handle split cards - add the card to the specified hand
        const targetHand = gameState.playerHands[handIndex || 0];

        if (targetHand) {
          const updatedHand = {
            ...targetHand,
            cards: [...targetHand.cards, card],
          };

          // Check if busted after adding the card
          const handValue = this.gameStateActions.calculateHandValue(
            updatedHand.cards
          );

          if (this.gameStateActions.isBusted(updatedHand.cards)) {
            updatedHand.isBusted = true;
            updatedHand.isStanding = true;
          } else if (handValue === 21) {
            // Check if this is a blackjack (21 with exactly 2 cards)
            if (updatedHand.cards.length === 2) {
              updatedHand.isBlackjack = true;
            }
            updatedHand.isStanding = true;
          }

          const updatedHands = [...gameState.playerHands];
          updatedHands[handIndex || 0] = updatedHand;

          // Recalculate action flags for the current hand after dealing the card
          const currentHandAfterDeal = updatedHands[handIndex || 0];
          const currentHandActions = this.gameStateActions.getHandActions(
            currentHandAfterDeal,
            { ...gameState, playerHands: updatedHands }
          );

          // If this hand got 21 and there are more hands that need cards, move to the next hand
          if (
            handValue === 21 &&
            !this.gameStateActions.isBusted(updatedHand.cards)
          ) {
            const allHandsDone = updatedHands.every(
              (hand) => hand.isStanding || hand.isBusted
            );

            if (!allHandsDone) {
              // Find the next hand that needs a card (split hand with only 1 card)
              const nextHandIndex = updatedHands.findIndex(
                (hand, index) =>
                  index > (handIndex || 0) &&
                  !hand.isStanding &&
                  !hand.isBusted &&
                  hand.isFromSplit &&
                  hand.cards.length === 1
              );

              if (nextHandIndex !== -1) {
                // Move to the next hand and recalculate action flags for it
                const nextHand = updatedHands[nextHandIndex];
                const nextHandActions = this.gameStateActions.getHandActions(
                  nextHand,
                  { ...gameState, playerHands: updatedHands }
                );
                updatedState = {
                  ...gameState,
                  playerHands: updatedHands,
                  currentHandIndex: nextHandIndex,
                  canDouble: nextHandActions.canDouble,
                  canSplit: nextHandActions.canSplit,
                  canSurrender: nextHandActions.canSurrender,
                };

                // The CHECK_SPLIT_STATE effect will handle dealing the card to the next hand
                // This will be triggered by the processActionWithLoop method
              } else {
                updatedState = {
                  ...gameState,
                  playerHands: updatedHands,
                  canDouble: currentHandActions.canDouble,
                  canSplit: currentHandActions.canSplit,
                  canSurrender: currentHandActions.canSurrender,
                };
              }
            } else {
              updatedState = {
                ...gameState,
                playerHands: updatedHands,
                canDouble: currentHandActions.canDouble,
                canSplit: currentHandActions.canSplit,
                canSurrender: currentHandActions.canSurrender,
              };
            }
          } else {
            updatedState = {
              ...gameState,
              playerHands: updatedHands,
              canDouble: currentHandActions.canDouble,
              canSplit: currentHandActions.canSplit,
              canSurrender: currentHandActions.canSurrender,
            };
          }
        } else {
          updatedState = gameState;
        }
      } else {
        // For HIT action, we need to ensure we're targeting the correct hand

        const tempGameState = {
          ...gameState,
        };

        updatedState = this.gameStateActions.processHitLogic(
          tempGameState,
          card
        );

        // Also check for auto-standing on 21 for the default case
        if (handIndex !== undefined && updatedState.playerHands[handIndex]) {
          const updatedHand = updatedState.playerHands[handIndex];
          const handValue = this.gameStateActions.calculateHandValue(
            updatedHand.cards
          );

          if (handValue === 21 && !updatedHand.isStanding) {
            updatedHand.isStanding = true;

            const updatedHands = [...updatedState.playerHands];
            updatedHands[handIndex] = updatedHand;

            // If this is a split hand that just got 21, we need to move to the next hand
            // and deal it a card if it needs one
            const allHandsDone = updatedHands.every(
              (hand) => hand.isStanding || hand.isBusted
            );

            if (!allHandsDone) {
              // Find the next hand that needs a card (has only 1 card)
              const nextHandIndex = updatedHands.findIndex(
                (hand, index) =>
                  index > handIndex &&
                  !hand.isStanding &&
                  !hand.isBusted &&
                  hand.isFromSplit &&
                  hand.cards.length === 1
              );

              if (nextHandIndex !== -1) {
                // Move to the next hand and mark it to receive a card
                updatedState = {
                  ...updatedState,
                  playerHands: updatedHands,
                  currentHandIndex: nextHandIndex,
                };

                // The CHECK_SPLIT_STATE effect will handle dealing the card to the next hand
                // This will be triggered by the processActionWithLoop method
              } else {
                updatedState = {
                  ...updatedState,
                  playerHands: updatedHands,
                };
              }
            } else {
              updatedState = {
                ...updatedState,
                playerHands: updatedHands,
              };
            }
          }
        }
      }

      // Check if all hands are complete after the action
      const allHandsDone =
        updatedState.playerHands && updatedState.playerHands.length > 0
          ? updatedState.playerHands.every(
              (hand) => hand.isStanding || hand.isBusted
            )
          : false;

      if (allHandsDone) {
        // If all hands are complete, we need to trigger the dealer turn
        // The processHitLogic already sets the phase to PLAYING and message correctly
        // We'll let the processEffects method handle this by creating a DEALER_TURN effect
        // Keep the phase as PLAYING - the effect system will handle the transition
        updatedState.gamePhase = GameStatePhaseType.PLAYING;
      }

      return {
        newState: {
          ...updatedState,
          dealtCardCount: newDealtCardCount,
        },
        effects: [],
      };
    } else if (target === 'DEALER') {
      const dealerCards = gameState.dealerHand?.cards || [];
      const newCards = [...dealerCards, card];

      // Mark the dealer's second card (hole card) as hidden only during initial deal
      if (
        newCards.length === 2 &&
        gameState.gamePhase !== GameStatePhaseType.DEALER_TURN
      ) {
        newCards[1] = { ...newCards[1], isHidden: true };
      }

      const handValue = this.gameStateActions.calculateHandValue(newCards);
      const isBlackjack = this.gameStateActions.isBlackjack(newCards);
      const isBusted = this.gameStateActions.isBusted(newCards);

      const updatedDealerHand = {
        ...gameState.dealerHand,
        cards: newCards,
        isBlackjack,
        isBusted,
        isStanding:
          isBlackjack || isBusted || handValue >= DEALER_RULES.STAND_VALUE,
      };

      // If this is during dealer turn, check if we need more cards
      if (gameState.gamePhase === GameStatePhaseType.DEALER_TURN) {
        const updatedState = {
          ...gameState,
          dealtCardCount: newDealtCardCount,
          dealerHand: updatedDealerHand,
          dealerDealingStep: gameState.dealerDealingStep + 1,
        };

        // If dealer busts or reaches stand value, finish the game
        if (isBusted || handValue >= DEALER_RULES.STAND_VALUE) {
          const finalState = {
            ...updatedState,
            gamePhase: GameStatePhaseType.FINISHED,
            message: isBusted ? 'Dealer busts!' : 'Dealer stands.',
            isDealerDealing: false,
            dealerHand: {
              ...updatedDealerHand,
              showAllCards: true, // Ensure cards are revealed when game finishes
            },
          };

          const winnerResult = await this.determineWinner(finalState);
          return {
            newState: winnerResult.newState,
            effects: winnerResult.effects,
          };
        } else {
          // Dealer needs more cards, continue dealing
          const nextEffects: StateMachineEffect[] = [
            {
              type: 'DEAL_CARD',
              data: {
                target: 'DEALER',
                handIndex: 0,
                actionType: 'DEALER_TURN',
              },
            } as DealCardEffect,
          ];

          return {
            newState: {
              ...updatedState,
              message: `Dealer hits... (${handValue})`,
            },
            effects: nextEffects,
          };
        }
      }

      // Clear any remaining DEAL_CARD effects after dealer turn
      if (gameState.gamePhase === GameStatePhaseType.FINISHED) {
        return {
          newState: {
            ...gameState,
            dealtCardCount: newDealtCardCount,
            dealerHand: updatedDealerHand,
          },
          effects: [],
        };
      }
      return {
        newState: {
          ...gameState,
          dealtCardCount: newDealtCardCount,
          dealerHand: updatedDealerHand,
        },
        effects: [],
      };
    }

    return {
      newState: gameState,
      effects: [],
    };
  }

  /**
   * Handle BALANCE_CHANGE effect
   * Updates the gameState.balance field based on the effect
   */
  private async handleBalanceChangeEffect(
    gameState: GameState,
    effect: BalanceChangeEffect
  ): Promise<GameState> {
    const { amount, operation, reason, gameOutcome, totalWagered } =
      effect.data;

    console.log('[Balance Update]', {
      currentBalance: gameState.balance,
      amount,
      operation,
      reason,
      gameMode: gameState.gameMode,
      userId: gameState.userId,
    });

    // Handle game completion balance update (no delay)
    if (
      reason === 'GAME_COMPLETION_DELAYED' &&
      gameOutcome &&
      totalWagered !== undefined
    ) {
      // In Free Play / test/demo mode, apply immediately
      if (gameState?.gameMode === GameMode.FREE_PLAY) {
        const newBalance = gameState.balance + amount;

        return {
          ...gameState,
          balance: newBalance,
          // Preserve important fields
          initialBet: gameState.initialBet,
          insuranceBet: gameState.insuranceBet,
          playerHands: gameState.playerHands,
          dealerHand: gameState.dealerHand,
        };
      }

      // For real users, update balance immediately
      try {
        const balanceResult = await this.balanceService.updateBalanceAfterRound(
          gameState.userId,
          gameOutcome,
          amount.toString(),
          totalWagered.toString()
        );

        if (balanceResult.success) {
          const newBalance = parseFloat(balanceResult.newBalance);
          return {
            ...gameState,
            balance: newBalance,
            // Preserve important fields
            initialBet: gameState.initialBet,
            insuranceBet: gameState.insuranceBet,
            playerHands: gameState.playerHands,
            dealerHand: gameState.dealerHand,
          };
        } else {
          console.error(
            'Failed to update balance after round:',
            balanceResult.error
          );
          return gameState;
        }
      } catch (error) {
        console.error('Error updating balance after round:', error);
        return gameState;
      }
    }

    // Check game mode for Free Play or demo users
    if (
      gameState?.gameMode === GameMode.FREE_PLAY ||
      gameState?.userId === 'freeplay_user' ||
      !gameState?.userId ||
      gameState.userId === 'demo-user'
    ) {
      let newBalance = gameState.balance;

      if (operation === 'INCREASE') {
        newBalance += amount;
      } else if (operation === 'DECREASE') {
        newBalance -= amount;
      }

      // Note: Session storage updates should be handled on the client side
      // The state machine only updates the game state balance

      console.log('[Balance Update] Returning new balance:', newBalance);
      return {
        ...gameState,
        balance: newBalance,
        // Preserve important fields
        initialBet: gameState.initialBet,
        insuranceBet: gameState.insuranceBet,
        playerHands: gameState.playerHands,
        dealerHand: gameState.dealerHand,
      };
    }

    // Use balance service for proper balance management
    try {
      // TODO: this can probably be handled better for tracking balance changes
      const result = await this.balanceService.handleBalanceChangeEffect(
        gameState.userId,
        { amount, operation, reason }
      );

      if (!result.success) {
        console.error('Failed to update balance:', result.error);
        // Return current state if balance update failed
        return gameState;
      }

      const newBalance = parseFloat(result.newBalance);

      return {
        ...gameState,
        balance: newBalance,
        // Preserve important fields
        initialBet: gameState.initialBet,
        insuranceBet: gameState.insuranceBet,
        playerHands: gameState.playerHands,
        dealerHand: gameState.dealerHand,
      };
    } catch (error) {
      console.error('Error updating balance:', error);
      // Return current state if balance update failed
      return gameState;
    }
  }

  /**
   * Handle GAME_PHASE_CHANGE effect
   */
  private handleGamePhaseChangeEffect(
    gameState: GameState,
    effect: GamePhaseChangeEffect
  ): GameState {
    return {
      ...gameState,
      gamePhase: effect.data.to,
    };
  }

  /**
   * Handle HAND_UPDATE effect
   */
  private handleHandUpdateEffect(
    gameState: GameState,
    effect: HandUpdateEffect
  ): GameState {
    const { handIndex, updates } = effect.data;
    const updatedHands = [...gameState.playerHands];

    if (updatedHands[handIndex]) {
      updatedHands[handIndex] = {
        ...updatedHands[handIndex],
        ...updates,
      };
    }

    return {
      ...gameState,
      playerHands: updatedHands,
    };
  }

  /**
   * Handle MESSAGE_UPDATE effect
   */
  private handleMessageUpdateEffect(
    gameState: GameState,
    effect: MessageUpdateEffect
  ): GameState {
    return {
      ...gameState,
      message: effect.data.message,
    };
  }

  /**
   * Handle DEALER_TURN effect
   */
  private async handleDealerTurnEffect(
    gameState: GameState,
    effect: DealerTurnEffect
  ): Promise<{ newState: GameState; effects: StateMachineEffect[] }> {
    // Change phase to DEALER_TURN and reveal the dealer's hole card immediately
    const revealedDealerHand = {
      ...gameState.dealerHand,
      cards: gameState.dealerHand.cards.map((card, index) =>
        index === 1 ? { ...card, isHidden: false } : card
      ),
      showAllCards: true, // Reveal all dealer cards when dealer turn begins
    };

    let updatedState = {
      ...gameState,
      dealerHand: revealedDealerHand,
      gamePhase: GameStatePhaseType.DEALER_TURN,
      message: 'Dealer reveals hole card...',
      dealerDealingStep: 0,
      isDealerDealing: true,
    };

    // If dealer already has blackjack, skip dealer turn
    if (updatedState.dealerHand.isBlackjack) {
      const finalState = {
        ...updatedState,
        gamePhase: GameStatePhaseType.FINISHED,
        message: 'Dealer has blackjack!',
        isDealerDealing: false,
        dealerHand: {
          ...updatedState.dealerHand,
          showAllCards: true, // Ensure cards are revealed when game finishes
        },
      };

      // // Determine winner and return both state and effects
      const winnerResult = await this.determineWinner(finalState);
      return {
        newState: winnerResult.newState,
        effects: winnerResult.effects,
      };
    }

    // Check if dealer needs more cards
    const currentHandValue = this.gameStateActions.calculateHandValue(
      updatedState.dealerHand.cards
    );
    if (currentHandValue < DEALER_RULES.STAND_VALUE) {
      // Add effect to deal next card - the DEAL_CARD effect will handle continuation
      const effects: StateMachineEffect[] = [
        {
          type: 'DEAL_CARD',
          data: {
            target: 'DEALER',
            handIndex: 0,
            actionType: 'DEALER_TURN',
          },
        } as DealCardEffect,
      ];

      return {
        newState: updatedState,
        effects,
      };
    } else {
      // Dealer already has enough, finish the game
      const finalState = {
        ...updatedState,
        gamePhase: GameStatePhaseType.FINISHED,
        message: 'Dealer stands.',
        isDealerDealing: false,
        dealerHand: {
          ...updatedState.dealerHand,
          showAllCards: true, // Ensure cards are revealed when game finishes
        },
      };

      const winnerResult = await this.determineWinner(finalState);
      return {
        newState: winnerResult.newState,
        effects: winnerResult.effects,
      };
    }
  }

  /**
   * Handle INITIALIZE_GAME_STATE effect - calculate action flags after initial dealing
   */
  private handleInitializeGameStateEffect(
    gameState: GameState,
    effect: InitializeGameStateEffect
  ): { newState: GameState; effects: StateMachineEffect[] } {
    const effects: StateMachineEffect[] = [];

    // Safety check for playerHands array
    if (!gameState.playerHands || gameState.playerHands.length === 0) {
      return { newState: gameState, effects: [] };
    }

    const playerHand = gameState.playerHands[0];
    const dealerHand = gameState.dealerHand;

    const playerBlackjack = this.gameStateActions.isBlackjack(playerHand.cards);
    const dealerBlackjack = this.gameStateActions.isBlackjack(dealerHand.cards);

    // Update the hands with blackjack flags
    const updatedPlayerHand = {
      ...playerHand,
      isBlackjack: playerBlackjack,
    };

    const updatedDealerHand = {
      ...dealerHand,
      isBlackjack: dealerBlackjack,
    };

    // Calculate action flags based on the dealt cards
    const handActions = this.gameStateActions.getHandActions(
      updatedPlayerHand,
      gameState
    );

    // Evaluate side bets immediately after initial deal
    // Side bets are evaluated before any player actions
    const sidebetResults = evaluateAllSideBets(
      updatedPlayerHand,
      updatedDealerHand,
      gameState.pairBet,
      gameState.twentyOnePlusThreeBet
    );

    // Calculate total side bet winnings
    const totalSidebetWinnings = sidebetResults.reduce(
      (sum, result) => sum + (result.profit || 0),
      0
    );

    // Store original side bet amounts BEFORE clearing for Play Again functionality
    const originalPairBet = gameState.pairBet;
    const originalTwentyOnePlusThreeBet = gameState.twentyOnePlusThreeBet;

    // Clear losing side bet amounts immediately after evaluation
    // This ensures losing bets are visually removed but preserved for Play Again
    let clearedPairBet = gameState.pairBet;
    let cleared21Plus3Bet = gameState.twentyOnePlusThreeBet;

    sidebetResults.forEach((result) => {
      if (result.result === SidebetResultType.LOSE) {
        if (result.type === SidebetType.PAIR) {
          clearedPairBet = 0;
        } else if (result.type === SidebetType.TWENTY_ONE_PLUS_THREE) {
          cleared21Plus3Bet = 0;
        }
      }
    });

    // Determine game phase based on blackjack scenarios
    let gamePhase = GameStatePhaseType.PLAYING;
    let message = 'Cards dealt. Your turn.';
    let dealerHandToReturn = updatedDealerHand;

    if (updatedDealerHand.cards[0]?.rank === 'A') {
      // Dealer showing ace - ask for insurance (regardless of blackjack status)
      gamePhase = GameStatePhaseType.ASK_INSURANCE;
      if (playerBlackjack) {
        message =
          'Player has blackjack! Dealer showing Ace - insurance offered.';
      } else {
        message = 'Dealer showing Ace - insurance offered.';
      }
    } else if (dealerBlackjack) {
      // Dealer has blackjack, not showing ace - finish game immediately
      // Reveal dealer's hole card
      dealerHandToReturn = {
        ...updatedDealerHand,
        cards: updatedDealerHand.cards.map((card) => ({
          ...card,
          isHidden: false,
        })),
        showAllCards: true,
      };
      gamePhase = GameStatePhaseType.FINISHED;
      if (playerBlackjack) {
        message = 'Both have blackjack! Push.';
      } else {
        message = 'Dealer has blackjack! You lose.';
      }
    } else if (playerBlackjack) {
      // Player has blackjack, dealer not showing ace - reveal hole card and check for dealer blackjack
      // Reveal dealer's hole card first
      dealerHandToReturn = {
        ...updatedDealerHand,
        cards: updatedDealerHand.cards.map((card) => ({
          ...card,
          isHidden: false,
        })),
        showAllCards: true,
      };

      // Re-check dealer blackjack with revealed cards
      const finalDealerBlackjack = this.gameStateActions.isBlackjack(
        dealerHandToReturn.cards
      );
      dealerHandToReturn = {
        ...dealerHandToReturn,
        isBlackjack: finalDealerBlackjack,
      };

      // Finish game with appropriate message
      gamePhase = GameStatePhaseType.FINISHED;
      if (finalDealerBlackjack) {
        message = 'Both have blackjack! Push.';
      } else {
        message = 'BLACKJACK! You win!';
      }
    }

    // Update game state with side bet results
    // Clear losing side bet amounts immediately so they're not preserved on PLAY_AGAIN
    const updatedGameState = {
      ...gameState,
      playerHands: [updatedPlayerHand],
      dealerHand: dealerHandToReturn,
      sidebetResults: sidebetResults,
      totalWon: totalSidebetWinnings, // Add side bet winnings to total won
      gameProfit:
        totalSidebetWinnings -
        (gameState.pairBet + gameState.twentyOnePlusThreeBet), // Net side bet profit
      gamePhase,
      message,
      canDouble: !playerBlackjack && handActions.canDouble,
      canSplit: !playerBlackjack && handActions.canSplit,
      canSurrender: !playerBlackjack && handActions.canSurrender,
      insuranceOffered: updatedDealerHand.cards[0]?.rank === 'A',
      insuranceWasOffered: false,
      dealerHasBlackjack: dealerHandToReturn.isBlackjack,
      isDealing: false, // Clear the dealing flag after initialization
      // Clear losing side bets immediately
      pairBet: clearedPairBet,
      twentyOnePlusThreeBet: cleared21Plus3Bet,
      // Store original amounts for Play Again
      originalPairBet,
      originalTwentyOnePlusThreeBet,
    };

    // Create side bet evaluation effect to process balance changes
    // This will be handled by the effect system to update balance
    if (sidebetResults.length > 0) {
      const sidebetEffect: SidebetEvaluationEffect = {
        type: 'SIDEBET_EVALUATION',
        data: {
          sidebetResults: sidebetResults,
        },
      };
      effects.push(sidebetEffect);
    }

    // Return updated state with effects - side bet balance changes will be handled by the effect
    return { newState: updatedGameState, effects };
  }

  /**
   * Handle SIDEBET_EVALUATION effect - process side bet winnings and update balance
   */
  private async handleSidebetEvaluationEffect(
    gameState: GameState,
    effect: SidebetEvaluationEffect
  ): Promise<{ newState: GameState; effects: StateMachineEffect[] }> {
    const sidebetResults = effect.data.sidebetResults;
    const effects: StateMachineEffect[] = [];

    // Process each side bet result and create balance change effects for winners
    for (const sidebet of sidebetResults) {
      if (
        sidebet.result === SidebetResultType.WIN &&
        sidebet.profit &&
        sidebet.profit > 0
      ) {
        // Add balance increase for side bet winnings
        const balanceEffect: BalanceChangeEffect = {
          type: 'BALANCE_CHANGE',
          data: {
            amount: sidebet.profit,
            operation: 'INCREASE',
            reason: `SIDEBET_WIN_${sidebet.type}`,
            gameOutcome: `${sidebet.type} side bet win`,
          },
        };
        effects.push(balanceEffect);
      }
    }

    // Update total wagered to include side bets (they were already deducted)
    const totalSidebetAmount =
      gameState.pairBet + gameState.twentyOnePlusThreeBet;
    const updatedGameState = {
      ...gameState,
      totalWagered: gameState.initialBet + totalSidebetAmount,
    };

    return { newState: updatedGameState, effects };
  }

  /**
   * Handle INSURANCE_RESOLUTION effect - process insurance bet and update balance
   */
  private async handleInsuranceResolutionEffect(
    gameState: GameState,
    effect: InsuranceResolutionEffect
  ): Promise<{ newState: GameState; effects: StateMachineEffect[] }> {
    const insuranceResults = effect.data.insuranceResults as InsuranceResult[];
    const effects: StateMachineEffect[] = [];

    // Process each insurance result and create balance change effects for winners
    for (const insuranceResult of insuranceResults) {
      if (
        insuranceResult.result === 'WIN' &&
        insuranceResult.payout &&
        insuranceResult.payout > 0
      ) {
        // Add balance increase for insurance win (2:1 payout)
        const balanceEffect: BalanceChangeEffect = {
          type: 'BALANCE_CHANGE',
          data: {
            amount: insuranceResult.payout,
            operation: 'INCREASE',
            reason: 'INSURANCE_WIN',
            gameOutcome: 'Insurance bet win',
          },
        };
        effects.push(balanceEffect);
      }
      // Note: Insurance losses don't need balance changes as the bet was already deducted
    }

    // Update game state with insurance results
    const updatedGameState: GameState = {
      ...gameState,
      insuranceResults: insuranceResults,
      insuranceBet: 0, // Clear insurance bet after resolution
    };

    return { newState: updatedGameState, effects };
  }

  /**
   * Check if the game is waiting for user action
   */
  private isWaitingForUserAction(gameState: GameState): boolean {
    // Game is waiting for user action if:
    // 1. In playing phase and not all hands are complete
    // 2. In betting phase
    // 3. Insurance is offered
    // 4. Not in finished phase

    if (gameState.gamePhase === GameStatePhaseType.FINISHED) {
      return false;
    }

    if (gameState.gamePhase === GameStatePhaseType.BETTING) {
      return true;
    }

    if (gameState.insuranceOffered) {
      return true;
    }

    if (gameState.gamePhase === GameStatePhaseType.DEALER_TURN) {
      return false; // Dealer turn is automatic, no user action needed
    }

    if (gameState.gamePhase === GameStatePhaseType.PLAYING) {
      // During initial dealing (dealingStep <= 1), always wait for user action
      if (gameState.dealingStep <= 1) {
        return true;
      }

      // Check if all player hands are complete
      const allHandsComplete = gameState.playerHands.every(
        (hand) => hand.isStanding || hand.isBusted || hand.isSurrendered
      );
      return !allHandsComplete;
    }

    return false;
  }

  /**
   * Utility function to check if all player hands are complete
   */
  private areAllHandsComplete(gameState: GameState): boolean {
    return gameState.playerHands.every(
      (hand) => hand.isStanding || hand.isBusted || hand.isSurrendered
    );
  }

  /**
   * Check if the game should be completed and return effects for balance changes
   */
  private async checkGameCompletion(
    gameState: GameState
  ): Promise<{ newState: GameState; effects: StateMachineEffect[] }> {
    const effects: StateMachineEffect[] = [];

    // Don't override ASK_INSURANCE phase - let it proceed normally
    if (gameState.gamePhase === GameStatePhaseType.ASK_INSURANCE) {
      return { newState: gameState, effects };
    }

    // Handle blackjack scenarios that were detected in INITIALIZE_GAME_STATE
    // Only add balance changes if insurance processing hasn't already handled them
    if (
      gameState.gamePhase === GameStatePhaseType.FINISHED &&
      gameState.playerHands.length > 0 &&
      gameState.playerHands[0].cards.length === 2 &&
      (!gameState.dealerHand.cards[0] ||
        gameState.dealerHand.cards[0].rank !== 'A')
    ) {
      // Only if dealer doesn't show ace (no insurance scenario)
    }

    // Auto-resolve blackjack situations where player has blackjack but game is still in PLAYING phase
    if (gameState.gamePhase === GameStatePhaseType.PLAYING) {
      const currentHand = gameState.playerHands[gameState.currentHandIndex];
      const playerHasBlackjack = currentHand?.isBlackjack;

      // Check if player has blackjack and dealer is not showing ace
      if (playerHasBlackjack && gameState.dealerHand.cards[0]?.rank !== 'A') {
        // Check if dealer hole card is still hidden
        const dealerHoleCard = gameState.dealerHand.cards[1];
        if (dealerHoleCard?.isHidden) {
          // Reveal dealer hole card and check for dealer blackjack
          const revealedDealerHand = {
            ...gameState.dealerHand,
            cards: gameState.dealerHand.cards.map((card) => ({
              ...card,
              isHidden: false,
            })),
            showAllCards: true,
          };

          // Re-check dealer blackjack with revealed cards
          const dealerBlackjack = this.gameStateActions.isBlackjack(
            revealedDealerHand.cards
          );
          const updatedDealerHand = {
            ...revealedDealerHand,
            isBlackjack: dealerBlackjack,
          };

          // Finish game with appropriate message
          const finishedState = {
            ...gameState,
            dealerHand: updatedDealerHand,
            gamePhase: GameStatePhaseType.FINISHED,
            message: dealerBlackjack
              ? 'Both have blackjack! Push.'
              : 'BLACKJACK! You win!',
            dealerHasBlackjack: dealerBlackjack,
          };

          // Determine winner to calculate payouts
          const winnerResult = await this.determineWinner(finishedState);
          return {
            newState: winnerResult.newState,
            effects: [...effects, ...winnerResult.effects],
          };
        }
      }
    }

    // Check if all player hands are complete and dealer should play
    if (gameState.gamePhase === GameStatePhaseType.PLAYING) {
      const allHandsComplete = this.areAllHandsComplete(gameState);
      console.log('🎯 checkGameCompletion - PLAYING phase:', {
        allHandsComplete,
        isDealerDealing: gameState.isDealerDealing,
        playerHands: gameState.playerHands.map((h) => ({
          isStanding: h.isStanding,
          isBusted: h.isBusted,
          isSurrendered: h.isSurrendered,
        })),
      });

      if (allHandsComplete && !gameState.isDealerDealing) {
        console.log('🎯 Adding DEALER_TURN effect');
        // Add DEALER_TURN effect when all hands are complete
        // This will be processed after the current action is complete
        effects.push({
          type: 'DEALER_TURN',
          data: {
            reason: 'ALL_PLAYER_HANDS_COMPLETE',
          },
        } as DealerTurnEffect);

        return {
          newState: gameState,
          effects,
        };
      }
    }

    // Handle DEALER_TURN to FINISHED transition when dealer is done
    if (gameState.gamePhase === GameStatePhaseType.DEALER_TURN) {
      // Check if dealer is done (standing or busted)
      if (gameState.dealerHand.isStanding || gameState.dealerHand.isBusted) {
        const winnerResult = await this.determineWinner(gameState);
        return {
          newState: winnerResult.newState,
          effects: [...effects, ...winnerResult.effects],
        };
      }
    }

    // Handle FINISHED phase - determine winner and update balance
    if (gameState.gamePhase === GameStatePhaseType.FINISHED) {
      // determineWinner is now idempotent - safe to call multiple times
      // It will check internally if results are already calculated
      const winnerResult = await this.determineWinner(gameState);
      return {
        newState: winnerResult.newState,
        effects: [...effects, ...winnerResult.effects],
      };
    }

    return { newState: gameState, effects };
  }

  /**
   * Determine the winner and update game state
   * This function is idempotent - calling it multiple times with the same state will have no effect
   *
   * IMPORTANT: This function should ONLY be called when gamePhase === FINISHED
   */
  private async determineWinner(
    gameState: GameState
  ): Promise<{ newState: GameState; effects: StateMachineEffect[] }> {
    // GUARD: Only process if game is actually finished
    if (gameState.gamePhase !== GameStatePhaseType.FINISHED) {
      console.warn(
        `⚠️ determineWinner called with gamePhase=${gameState.gamePhase}, expected FINISHED. Returning state unchanged.`
      );
      return {
        newState: gameState,
        effects: [],
      };
    }

    // IDEMPOTENCY CHECK: If results are already calculated, return immediately without creating effects
    // This prevents duplicate balance updates and ensures the function is safe to call multiple times
    if (
      gameState.handResults &&
      gameState.handResults.length > 0 &&
      gameState.result !== undefined &&
      gameState.totalWon !== undefined
    ) {
      // Results already calculated - return existing state with no effects
      return {
        newState: gameState,
        effects: [],
      };
    }

    // Mark this game state as processed BEFORE calculating (prevents race conditions)

    // Calculate hand results using the centralized utility function
    const { handResults, totalWinnings, overallResult } =
      calculateHandResultsFromGameState(
        gameState,
        this.gameStateActions.calculateHandValue.bind(this.gameStateActions)
      );

    const dealerBusted = gameState.dealerHand.isBusted;
    const dealerBlackjack = gameState.dealerHand.isBlackjack;
    const dealerValue = this.gameStateActions.calculateHandValue(
      gameState.dealerHand.cards
    );

    let message = gameState.message || ''; // Start with existing message to preserve special messages
    const effects: StateMachineEffect[] = [];

    // Debug logging
    console.log(`🎯 Hand calculations:`, {
      handResults: handResults.map((hr) => ({
        handIndex: hr.handIndex,
        bet: hr.bet,
        result: hr.result,
        payout: hr.payout,
        profit: hr.profit,
      })),
      totalWinnings,
      overallResult,
    });

    // Calculate side bet winnings (already evaluated and added to balance)
    const sidebetWinnings =
      gameState.sidebetResults?.reduce(
        (sum, result) => sum + (result.profit || 0),
        0
      ) || 0;

    // Calculate net winnings (outside the conditional blocks so it's available everywhere)
    // Include side bet winnings in total
    const netWinnings =
      totalWinnings + sidebetWinnings - gameState.totalWagered;
    // gameProfit is the net profit/loss for this game (main bet + side bets)
    const gameProfit = netWinnings;

    // Debug logging
    console.log('🎯 determineWinner debug:', {
      totalWinnings,
      totalWagered: gameState.totalWagered,
      netWinnings,
      gameProfit,
      playerHands: gameState.playerHands.map((hand) => ({
        bet: hand.bet,
        isBusted: hand.isBusted,
        isSurrendered: hand.isSurrendered,
        isBlackjack: hand.isBlackjack,
        handValue: this.gameStateActions.calculateHandValue(hand.cards),
      })),
      dealerValue,
      dealerBusted,
      dealerBlackjack,
    });

    // Check if all hands were surrendered
    const allHandsSurrendered =
      gameState.playerHands.length > 0 &&
      gameState.playerHands.every((hand) => hand.isSurrendered);

    // Only update message if it hasn't been set to a special blackjack message
    // Also check if we should preserve a blackjack win message
    const isSpecialBlackjackMessage =
      message.includes('BLACKJACK') ||
      message.includes('Both have blackjack') ||
      message.includes('Dealer has blackjack');

    const playerHasBlackjack = gameState.playerHands.some(
      (hand) => hand.isBlackjack
    );
    const shouldPreserveBlackjackMessage =
      playerHasBlackjack && message.includes('BLACKJACK');

    if (!isSpecialBlackjackMessage && !shouldPreserveBlackjackMessage) {
      if (allHandsSurrendered) {
        // Calculate surrender refund (half of total wagered)
        const surrenderRefund = gameState.totalWagered * PAYOUT_RATES.SURRENDER;
        const surrenderLoss = gameState.totalWagered - surrenderRefund;
        message = `Hand surrendered! Loss: $${surrenderLoss.toFixed(
          2
        )} (half bet returned)`;
      } else if (netWinnings > 0) {
        message = `You win! Winnings: $${netWinnings.toFixed(2)}`;
      } else if (netWinnings < 0) {
        message = `You lose! Loss: $${Math.abs(netWinnings).toFixed(2)}`;
      } else {
        message = 'Push!';
      }
    }

    // Use overallResult from handResults calculation
    const gameOutcome = overallResult || 'LOSE';

    // Surrender balance changes are handled entirely in processSurrender via SURRENDER effect
    // Exclude surrender winnings from delayed balance update to avoid double-counting
    const surrenderWinnings = handResults
      .filter((hr) => hr.result === HandResultType.SURRENDER)
      .reduce((sum, hr) => sum + hr.payout, 0);
    const nonSurrenderWinnings = totalWinnings - surrenderWinnings;

    // Add a delay effect for balance update to wait for animations
    // Only apply non-surrender winnings (surrender is already handled in processSurrender)
    if (
      nonSurrenderWinnings > 0 ||
      (gameOutcome === 'PUSH' && surrenderWinnings === 0)
    ) {
      effects.push({
        type: 'BALANCE_CHANGE',
        data: {
          amount: nonSurrenderWinnings,
          operation: 'INCREASE',
          reason: 'GAME_COMPLETION_DELAYED',
          gameOutcome: gameOutcome,
          totalWagered: gameState.totalWagered,
        },
      } as BalanceChangeEffect);
    }

    return {
      newState: {
        ...gameState,
        gamePhase: GameStatePhaseType.FINISHED,
        message,
        totalWon: totalWinnings + sidebetWinnings, // Include side bet payouts in total
        gameProfit: gameProfit, // Net profit/loss: totalWon - totalWagered
        handResults,
        result: overallResult,
        isDealerDealing: false,
        dealerHand: {
          ...gameState.dealerHand,
          showAllCards: true, // Ensure cards are revealed when game finishes
        },
      },
      effects,
    };
  }

  /**
   * Get the next automatic action to perform
   */
  private getNextAutomaticAction(gameState: GameState): GameActionType | null {
    // If in dealing phase, continue dealing (but only if dealingStep is 0 and lastProcessedStep is -1)
    if (
      gameState.gamePhase === GameStatePhaseType.BETTING &&
      gameState.isDealing &&
      gameState.dealingStep === 0 &&
      gameState.lastProcessedStep === -1
    ) {
      return GameActionType.START_ROUND;
    }

    // DEALER_TURN phase is handled by effects, not by returning actions
    if (gameState.gamePhase === GameStatePhaseType.DEALER_TURN) {
      return null; // Dealer turn is handled by the effect system
    }

    // If all player hands are complete, start dealer turn
    if (gameState.gamePhase === GameStatePhaseType.PLAYING) {
      const allHandsComplete = gameState.playerHands.every(
        (hand) => hand.isStanding || hand.isBusted || hand.isSurrendered
      );

      // Don't start dealer turn during initial dealing (dealingStep <= 1)
      if (
        allHandsComplete &&
        !gameState.isDealerDealing &&
        gameState.dealingStep > 1
      ) {
        // Start dealer dealing
        return GameActionType.STAND; // This will trigger dealer turn
      }
    }

    return null;
  }
}

// Export a factory function to create the state machine
export function createGameStateMachine(
  deckProvider: DeckProvider
): GameStateMachine {
  return new GameStateMachine(deckProvider);
}
