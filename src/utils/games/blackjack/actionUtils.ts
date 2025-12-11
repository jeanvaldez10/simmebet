import { GameState, GameStatePhaseType, GameActionType, AvailableAction } from '@/types/games/blackjack/game';

/**
 * Determines what actions are available to the player based on the current game state
 * @param gameState - The current game state
 * @returns Array of available actions with descriptions
 */
export function getAvailableActions(gameState: GameState): AvailableAction[] {
  const availableActions: AvailableAction[] = [];

  // Handle different game phases
  switch (gameState.gamePhase) {
    case GameStatePhaseType.BETTING:
      availableActions.push({ action: GameActionType.START_ROUND, description: 'Start the round with your bet' });
      break;

    case GameStatePhaseType.PLAYING:
      const currentHand = gameState.playerHands[gameState.currentHandIndex];
      
      if (currentHand && !currentHand.isStanding && !currentHand.isBusted && !currentHand.isSurrendered) {
        // Basic actions for active hands
        if (!currentHand.isBlackjack) {
          availableActions.push({ action: GameActionType.HIT, description: 'Hit (take another card)' });
          availableActions.push({ action: GameActionType.STAND, description: 'Stand (end your turn)' });
          
          // Special actions based on game state flags
          if (gameState.canDouble) {
            availableActions.push({ action: GameActionType.DOUBLE, description: 'Double down' });
          }
          if (gameState.canSplit) {
            availableActions.push({ action: GameActionType.SPLIT, description: 'Split hand' });
          }
          if (gameState.canSurrender) {
            availableActions.push({ action: GameActionType.SURRENDER, description: 'Surrender hand' });
          }
        }
      }
      break;

    case GameStatePhaseType.ASK_INSURANCE:
      availableActions.push({ action: GameActionType.INSURANCE, description: 'Take insurance' });
      availableActions.push({ action: GameActionType.DECLINE_INSURANCE, description: 'Decline insurance' });
      break;

    case GameStatePhaseType.DEALER_TURN:
      // No actions available during dealer turn
      break;

    case GameStatePhaseType.FINISHED:
      // Game is over, only allow reset
      availableActions.push({ action: GameActionType.RESET_GAME, description: 'Reset game to start new round' });
      availableActions.push({ action: GameActionType.PLAY_AGAIN, description: 'Play again with same bet' });
      availableActions.push({ action: GameActionType.START_ROUND, description: 'Start the round with your bet' });
      break;
  }

  return availableActions;
}

/**
 * Checks if a specific action is available in the current game state
 * @param gameState - The current game state
 * @param action - The action to check
 * @returns True if the action is available
 */
export function isActionAvailable(gameState: GameState, action: GameActionType): boolean {
  const availableActions = getAvailableActions(gameState);
  return availableActions.some(availableAction => availableAction.action === action);
}

/**
 * Gets a human-readable description of why an action is not available
 * @param gameState - The current game state
 * @param action - The action to check
 * @returns Description of why the action is not available, or null if it is available
 */
export function getActionUnavailableReason(gameState: GameState, action: GameActionType): string | null {
  if (isActionAvailable(gameState, action)) {
    return null;
  }

  const currentHand = gameState.playerHands[gameState.currentHandIndex];

  switch (action) {
    case 'PLACE_BET':
      if (gameState.gamePhase !== GameStatePhaseType.BETTING) {
        return 'Can only place bets during betting phase';
      }
      break;

    case 'START_ROUND':
      if (gameState.gamePhase !== GameStatePhaseType.BETTING) {
        return 'Can only start round during betting phase';
      }
      if (gameState.pendingBet <= 0) {
        return 'Must place a bet before starting round';
      }
      break;

    case 'HIT':
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return 'Can only hit during playing phase';
      }
      if (!currentHand) {
        return 'No active hand found';
      }
      if (currentHand.isStanding || currentHand.isBusted || currentHand.isSurrendered) {
        return 'Hand is already complete';
      }
      if (currentHand.isBlackjack) {
        return 'Cannot hit on blackjack';
      }
      break;

    case 'STAND':
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return 'Can only stand during playing phase';
      }
      if (!currentHand) {
        return 'No active hand found';
      }
      if (currentHand.isStanding || currentHand.isBusted || currentHand.isSurrendered) {
        return 'Hand is already complete';
      }
      break;

    case 'DOUBLE':
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return 'Can only double during playing phase';
      }
      if (!currentHand) {
        return 'No active hand found';
      }
      if (currentHand.isStanding || currentHand.isBusted || currentHand.isSurrendered) {
        return 'Hand is already complete';
      }
      if (currentHand.isBlackjack) {
        return 'Cannot double on blackjack';
      }
      if (!gameState.canDouble) {
        return 'Cannot double this hand';
      }
      break;

    case 'SPLIT':
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return 'Can only split during playing phase';
      }
      if (!currentHand) {
        return 'No active hand found';
      }
      if (currentHand.isStanding || currentHand.isBusted || currentHand.isSurrendered) {
        return 'Hand is already complete';
      }
      if (currentHand.isBlackjack) {
        return 'Cannot split on blackjack';
      }
      if (!gameState.canSplit) {
        return 'Cannot split this hand';
      }
      break;

    case 'SURRENDER':
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return 'Can only surrender during playing phase';
      }
      if (!currentHand) {
        return 'No active hand found';
      }
      if (currentHand.isStanding || currentHand.isBusted || currentHand.isSurrendered) {
        return 'Hand is already complete';
      }
      if (currentHand.isBlackjack) {
        return 'Cannot surrender on blackjack';
      }
      if (!gameState.canSurrender) {
        return 'Cannot surrender this hand';
      }
      break;

    case 'INSURANCE':
      if (!gameState.insuranceOffered) {
        return 'Insurance is not offered';
      }
      break;

    case 'DECLINE_INSURANCE':
      if (!gameState.insuranceOffered) {
        return 'Insurance is not offered';
      }
      break;
  }

  return 'Action not available in current game state';
}
