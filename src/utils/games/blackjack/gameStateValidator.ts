import { GameActionType } from '@/types/games/blackjack/game';
import { GameState, GameStatePhaseType, Hand } from '@/types/games/blackjack/game';

import type { ValidationResult } from './actionValidation';

export interface ValidationContext {
  gameState: GameState;
  action: GameActionType;
  amount?: number;
  pairBetAmount?: number;
  twentyOnePlusThreeBetAmount?: number;
  userId?: string;
}

/**
 * Comprehensive validator service for GameStateMachine actions
 * Validates that actions are appropriate for the current game state and phase
 */
export class GameStateValidator {
  /**
   * Main validation method that orchestrates all validation checks
   */
  validateAction(context: ValidationContext): ValidationResult {
    const { gameState, action, amount } = context;

    // 1. Basic action validation
    const basicValidation = this.validateBasicAction(action, amount);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // 2. Game flow validation (before phase validation for better error messages)
    const flowValidation = this.validateGameFlow(gameState, action);
    if (!flowValidation.isValid) {
      return flowValidation;
    }

    // 3. Phase validation
    const phaseValidation = this.validateActionForPhase(gameState, action);
    if (!phaseValidation.isValid) {
      return phaseValidation;
    }

    // 4. Hand state validation
    const handValidation = this.validateHandState(gameState, action);
    if (!handValidation.isValid) {
      return handValidation;
    }

    // 5. Action-specific validation
    const actionValidation = this.validateActionSpecificRules(gameState, action, amount);
    if (!actionValidation.isValid) {
      return actionValidation;
    }

    return { isValid: true };
  }

  /**
   * Validates basic action parameters and format
   */
  private validateBasicAction(action: GameActionType, amount?: number): ValidationResult {
    // Validate action type
    if (!Object.values(GameActionType).includes(action)) {
      return {
        isValid: false,
        error: 'Invalid action type',
        details: `Action '${action}' is not a valid game action`
      };
    }

    // Validate amount parameter for actions that require it
    if (amount !== undefined) {
      if (typeof amount !== 'number' || !Number.isFinite(amount)) {
        return {
          isValid: false,
          error: 'Invalid amount parameter',
          details: 'Amount must be a valid number'
        };
      }

      if (amount < 0) {
        return {
          isValid: false,
          error: 'Invalid amount parameter',
          details: 'Amount cannot be negative'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates that the action is allowed in the current game phase
   */
  private validateActionForPhase(gameState: GameState, action: GameActionType): ValidationResult {
    const phase = gameState.gamePhase;
    const allowedActions = this.getAllowedActionsForPhase(phase);


    // Special case: Allow HIT actions during START_ROUND transition
    // This happens when the game is in BETTING phase but cards have been dealt (START_ROUND called)
    if (action === GameActionType.HIT && 
        phase === GameStatePhaseType.BETTING && 
        gameState.playerHands.length > 0 && 
        gameState.playerHands[0].cards.length > 0) {
      return { isValid: true };
    }

    if (!allowedActions.includes(action)) {
      return {
        isValid: false,
        error: `Action '${action}' not allowed in ${GameStatePhaseType[phase]} phase`,
        details: `Allowed actions in ${GameStatePhaseType[phase]} phase: ${allowedActions.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validates the current hand state for the action
   */
  private validateHandState(gameState: GameState, action: GameActionType): ValidationResult {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];

    // Actions that don't require a hand
    const noHandActions = [
      GameActionType.PLACE_BET,
      GameActionType.START_ROUND,
      GameActionType.RESET_GAME,
      GameActionType.PLAY_AGAIN,
      GameActionType.BET_AGAIN,
      GameActionType.INSURANCE,
      GameActionType.DECLINE_INSURANCE
    ];

    if (noHandActions.includes(action)) {
      return { isValid: true };
    }

    // Check if hand exists
    if (!currentHand) {
      return {
        isValid: false,
        error: 'No active hand found',
        details: 'Cannot perform hand actions without an active hand'
      };
    }

    // Check if hand is in a valid state for the action
    const handStateValidation = this.validateHandStateForAction(currentHand, action);
    if (!handStateValidation.isValid) {
      return handStateValidation;
    }

    return { isValid: true };
  }

  /**
   * Validates hand-specific state for the action
   */
  private validateHandStateForAction(hand: Hand, action: GameActionType): ValidationResult {
    // Actions that can be performed on completed hands
    // TODO: May use completedHandActions for validation
    // const completedHandActions = [GameActionType.STAND];

    // Actions that require an active hand
    const activeHandActions = [
      GameActionType.HIT,
      GameActionType.DOUBLE,
      GameActionType.SPLIT,
      GameActionType.SURRENDER
    ];

    if (activeHandActions.includes(action)) {
      if (hand.isStanding) {
        return {
          isValid: false,
          error: `Cannot ${action.toLowerCase()} on standing hand`,
          details: 'Hand has already been completed'
        };
      }

      if (hand.isBusted) {
        return {
          isValid: false,
          error: `Cannot ${action.toLowerCase()} on busted hand`,
          details: 'Hand has already busted'
        };
      }

      if (hand.isSurrendered) {
        return {
          isValid: false,
          error: `Cannot ${action.toLowerCase()} on surrendered hand`,
          details: 'Hand has already been surrendered'
        };
      }
    }

    // Special validation for split aces
    if (hand.isSplitAces && action === GameActionType.HIT) {
      return {
        isValid: false,
        error: 'Cannot hit on split aces',
        details: 'Split aces can only receive one additional card'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates action-specific rules and constraints
   */
  private validateActionSpecificRules(gameState: GameState, action: GameActionType, amount?: number): ValidationResult {
    // TODO: May use currentHand for additional validation
    // const currentHand = gameState.playerHands[gameState.currentHandIndex];

    switch (action) {
      case GameActionType.PLACE_BET:
        return this.validatePlaceBet(gameState, amount);

      case GameActionType.START_ROUND:
        return this.validateStartRound(gameState, amount);

      case GameActionType.HIT:
        return this.validateHit(gameState);

      case GameActionType.STAND:
        return this.validateStand(gameState);

      case GameActionType.DOUBLE:
        return this.validateDouble(gameState);

      case GameActionType.SPLIT:
        return this.validateSplit(gameState);

      case GameActionType.SURRENDER:
        return this.validateSurrender(gameState);

      case GameActionType.INSURANCE:
        return this.validateInsurance(gameState);

      case GameActionType.DECLINE_INSURANCE:
        return this.validateDeclineInsurance(gameState);

      case GameActionType.RESET_GAME:
        return this.validateResetGame(gameState);

      default:
        return { isValid: true };
    }
  }

  /**
   * Validates game flow and prevents invalid state transitions
   */
  private validateGameFlow(gameState: GameState, action: GameActionType): ValidationResult {
    // Prevent actions during dealer turn
    if (gameState.gamePhase === GameStatePhaseType.DEALER_TURN) {
      return {
        isValid: false,
        error: 'Cannot perform actions during dealer turn',
        details: 'Wait for dealer to complete their turn'
      };
    }

    // Prevent actions when game is finished (except reset, play again, and bet again)
    if (gameState.gamePhase === GameStatePhaseType.FINISHED && 
        action !== GameActionType.RESET_GAME && 
        action !== GameActionType.START_ROUND &&
        action !== GameActionType.PLAY_AGAIN &&
        action !== GameActionType.BET_AGAIN) {
      return {
        isValid: false,
        error: 'Game is finished',
        details: 'Only reset, play again, and bet again actions are allowed when game is finished'
      };
    }

    // Prevent starting new round while hands are active
    if (action === GameActionType.START_ROUND) {
      const hasActiveHands = gameState.playerHands.some(hand => 
        hand.cards.length > 0 && !hand.isStanding && !hand.isBusted && !hand.isSurrendered
      );
      
      if (hasActiveHands) {
        return {
          isValid: false,
          error: 'Cannot start new round while hands are active',
          details: 'Complete or reset current hands before starting a new round'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates PLACE_BET action
   */
  private validatePlaceBet(gameState: GameState, amount?: number): ValidationResult {
    if (amount === undefined || amount === null) {
      return {
        isValid: false,
        error: 'Bet amount is required',
        details: 'Must specify an amount when placing a bet'
      };
    }

    if (amount === 0) {
      return { isValid: true }; // Allow clearing bets
    }

    if (amount < 0) {
      return {
        isValid: false,
        error: 'Invalid bet amount',
        details: 'Bet amount cannot be negative'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates START_ROUND action
   */
  private validateStartRound(gameState: GameState, amount?: number): ValidationResult {
    const betAmount = amount || gameState.pendingBet;
    
    if (betAmount <= 0) {
      return {
        isValid: false,
        error: 'Must place a bet before starting round',
        details: 'Bet amount must be greater than 0'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates HIT action
   */
  private validateHit(gameState: GameState): ValidationResult {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];

    if (!currentHand) {
      return {
        isValid: false,
        error: 'No active hand found',
        details: 'Cannot hit without an active hand'
      };
    }

    if (currentHand.isBlackjack) {
      return {
        isValid: false,
        error: 'Cannot hit on blackjack',
        details: 'Blackjack hands are automatically complete'
      };
    }

    if (gameState.dealerHand.isBlackjack) {
      return {
        isValid: false,
        error: 'Cannot hit - dealer has blackjack',
        details: 'Game is over when dealer has blackjack'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates STAND action
   */
  private validateStand(gameState: GameState): ValidationResult {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];

    if (!currentHand) {
      return {
        isValid: false,
        error: 'No active hand found',
        details: 'Cannot stand without an active hand'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates DOUBLE action
   */
  private validateDouble(gameState: GameState): ValidationResult {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];

    if (!currentHand) {
      return {
        isValid: false,
        error: 'No active hand found',
        details: 'Cannot double without an active hand'
      };
    }

    if (currentHand.cards.length !== 2) {
      return {
        isValid: false,
        error: 'Can only double on first two cards',
        details: 'Double down is only allowed on the initial two cards'
      };
    }

    if (!gameState.canDouble) {
      return {
        isValid: false,
        error: 'Cannot double this hand',
        details: 'Double down is not available for this hand'
      };
    }

    if (currentHand.isSplitAces) {
      return {
        isValid: false,
        error: 'Cannot double on split aces',
        details: 'Split aces have special rules and cannot be doubled'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates SPLIT action
   */
  private validateSplit(gameState: GameState): ValidationResult {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];

    if (!currentHand) {
      return {
        isValid: false,
        error: 'No active hand found',
        details: 'Cannot split without an active hand'
      };
    }

    if (!gameState.canSplit) {
      return {
        isValid: false,
        error: 'Cannot split this hand',
        details: 'Split is not available for this hand'
      };
    }

    if (currentHand.cards.length !== 2) {
      return {
        isValid: false,
        error: 'Can only split on first two cards',
        details: 'Split is only allowed on the initial two cards'
      };
    }

    // Check if we've reached the maximum number of hands
    const MAX_SPLIT_HANDS = 4;
    if (gameState.playerHands.length >= MAX_SPLIT_HANDS) {
      return {
        isValid: false,
        error: `Maximum of ${MAX_SPLIT_HANDS} hands allowed`,
        details: `Cannot split: already have ${gameState.playerHands.length} hands (maximum is ${MAX_SPLIT_HANDS})`
      };
    }

    // Check if cards have the same rank for splitting
    // Cards must have the same rank (not just same value) to be splittable
    if (currentHand.cards[0].rank !== currentHand.cards[1].rank) {
      return {
        isValid: false,
        error: 'Can only split cards of the same rank',
        details: 'Both cards must have the same rank to split (e.g., both Queens, both 10s, etc.)'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates SURRENDER action
   */
  private validateSurrender(gameState: GameState): ValidationResult {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];

    if (!currentHand) {
      return {
        isValid: false,
        error: 'No active hand found',
        details: 'Cannot surrender without an active hand'
      };
    }

    if (!gameState.canSurrender) {
      return {
        isValid: false,
        error: 'Cannot surrender this hand',
        details: 'Surrender is not available for this hand'
      };
    }

    if (currentHand.cards.length !== 2) {
      return {
        isValid: false,
        error: 'Can only surrender on first two cards',
        details: 'Surrender is only allowed on the initial two cards'
      };
    }

    if (currentHand.isFromSplit) {
      return {
        isValid: false,
        error: 'Cannot surrender after splitting',
        details: 'Cannot surrender a hand that was created from splitting'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates INSURANCE action
   */
  private validateInsurance(gameState: GameState): ValidationResult {
    if (!gameState.insuranceOffered) {
      return {
        isValid: false,
        error: 'Insurance is not offered',
        details: 'Insurance is only offered when dealer shows an ace'
      };
    }

    if (gameState.insuranceBet > 0) {
      return {
        isValid: false,
        error: 'Insurance already placed',
        details: 'Cannot place insurance bet twice'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates DECLINE_INSURANCE action
   */
  private validateDeclineInsurance(gameState: GameState): ValidationResult {
    if (!gameState.insuranceOffered) {
      return {
        isValid: false,
        error: 'Insurance is not offered',
        details: 'Insurance is only offered when dealer shows an ace'
      };
    }

    return { isValid: true };
  }

  /**
   * Validates RESET_GAME action
   */
  private validateResetGame(gameState: GameState): ValidationResult {
    const allowedPhases = [GameStatePhaseType.BETTING, GameStatePhaseType.FINISHED];
    
    if (!allowedPhases.includes(gameState.gamePhase)) {
      return {
        isValid: false,
        error: 'Cannot reset game at this time',
        details: 'Game can only be reset during betting phase or when finished'
      };
    }

    return { isValid: true };
  }

  /**
   * Gets all allowed actions for a given game phase
   */
  private getAllowedActionsForPhase(phase: GameStatePhaseType): GameActionType[] {
    const phaseActions: Record<GameStatePhaseType, GameActionType[]> = {
      [GameStatePhaseType.BETTING]: [
        GameActionType.PLACE_BET,
        GameActionType.START_ROUND,
        GameActionType.RESET_GAME
      ],
      [GameStatePhaseType.ASK_INSURANCE]: [
        GameActionType.INSURANCE,
        GameActionType.DECLINE_INSURANCE
      ],
      [GameStatePhaseType.PLAYING]: [
        GameActionType.HIT,
        GameActionType.STAND,
        GameActionType.DOUBLE,
        GameActionType.SPLIT,
        GameActionType.SURRENDER
      ],
      [GameStatePhaseType.DEALER_TURN]: [],
      [GameStatePhaseType.FINISHED]: [
        GameActionType.RESET_GAME,
        GameActionType.START_ROUND,
        GameActionType.PLAY_AGAIN,
        GameActionType.BET_AGAIN
      ],
      [GameStatePhaseType.SHUFFLE]: []
    };

    return phaseActions[phase] || [];
  }

  /**
   * Gets all valid actions for the current game state
   */
  getValidActions(gameState: GameState): GameActionType[] {
    const validActions: GameActionType[] = [];
    const allActions = Object.values(GameActionType);

    for (const action of allActions) {
      const validation = this.validateAction({
        gameState,
        action,
        amount: action === GameActionType.PLACE_BET ? 0 : undefined
      });

      if (validation.isValid) {
        validActions.push(action);
      }
    }

    return validActions;
  }

  /**
   * Checks if a specific action is valid for the current game state
   */
  isActionValid(gameState: GameState, action: GameActionType, amount?: number): boolean {
    const validation = this.validateAction({ gameState, action, amount });
    return validation.isValid;
  }
}

// Export a singleton instance
export const gameStateValidator = new GameStateValidator();
