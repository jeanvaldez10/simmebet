import {
  GameActionType,
  GameState,
  GameStatePhaseType,
} from "@/types/games/blackjack/game";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: string; // Additional context about why validation failed
}

/**
 * Validates if a game action is allowed for the current game state
 * @param gameState - The current game state
 * @param action - The action string to validate
 * @param amount - Optional amount parameter for actions that require it
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateAction(
  gameState: GameState,
  action: GameActionType,
  amount?: number
): ValidationResult {
  const currentHand = gameState.playerHands[gameState.currentHandIndex];

  switch (action) {
    case GameActionType.PLACE_BET:
      if (gameState.gamePhase !== GameStatePhaseType.BETTING) {
        return {
          isValid: false,
          error: "Can only place bets during betting phase",
        };
      }
      // Enhanced type checking and validation
      if (
        amount === null ||
        amount === undefined ||
        typeof amount !== "number"
      ) {
        return { isValid: false, error: "Invalid bet amount" };
      }
      if (!Number.isFinite(amount) || amount < 0) {
        return { isValid: false, error: "Invalid bet amount" };
      }
      // Allow amount 0 for clearing bets
      if (amount === 0) {
        return { isValid: true };
      }
      // Balance validation is now handled by the state machine
      return { isValid: true };

    case GameActionType.START_ROUND:
      if (gameState.gamePhase !== GameStatePhaseType.BETTING) {
        return {
          isValid: false,
          error: "Can only start round during betting phase",
        };
      }
      // Check if bet amount is provided (either as parameter or in pendingBet)
      const betAmount = amount || gameState.pendingBet;
      if (betAmount === 0) {
        return {
          isValid: false,
          error: "Must place a bet before starting round",
        };
      }
      if (betAmount < 0) {
        return { isValid: false, error: "Invalid bet amount" };
      }
      // Balance validation is now handled by the state machine
      // Check if there are any active hands that need to be completed
      // Only check for active hands if there are actually cards dealt
      const hasActiveHands = gameState.playerHands.some(
        (hand) =>
          hand.cards.length > 0 &&
          !hand.isStanding &&
          !hand.isBusted &&
          !hand.isSurrendered
      );
      if (hasActiveHands) {
        return {
          isValid: false,
          error:
            "Cannot start new hand while current hand is in progress. Please finish your current hand first.",
        };
      }
      return { isValid: true };

    case GameActionType.HIT:
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return { isValid: false, error: "Can only hit during playing phase" };
      }
      if (!currentHand) {
        return { isValid: false, error: "No active hand found" };
      }
      if (currentHand.isStanding || currentHand.isBusted) {
        return { isValid: false, error: "Cannot hit on completed hand" };
      }
      if (currentHand.isSplitAces) {
        return { isValid: false, error: "Cannot hit on split aces" };
      }
      // Prevent hitting when dealer has blackjack
      if (gameState.dealerHand?.isBlackjack) {
        return { isValid: false, error: "Cannot hit - dealer has blackjack" };
      }
      return { isValid: true };

    case GameActionType.STAND:
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return { isValid: false, error: "Can only stand during playing phase" };
      }
      if (!currentHand) {
        return { isValid: false, error: "No active hand found" };
      }
      // Cannot stand on a busted hand
      if (currentHand.isBusted) {
        return { isValid: false, error: "Cannot stand on busted hand" };
      }
      // Allow idempotent STAND for an already-standing hand only if there are remaining hands to complete
      if (currentHand.isStanding) {
        const allHandsDone = gameState.playerHands.every(
          (hand) => hand.isStanding || hand.isBusted
        );
        if (!allHandsDone) {
          return { isValid: true }; // Allow to progress to remaining hands
        }
        return { isValid: false, error: "Cannot stand on completed hand" };
      }
      // Normal active hand: standing is valid
      return { isValid: true };

    case GameActionType.DOUBLE:
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return {
          isValid: false,
          error: "Can only double during playing phase",
        };
      }
      if (!currentHand) {
        return { isValid: false, error: "No active hand found" };
      }
      if (currentHand.isStanding || currentHand.isBusted) {
        return { isValid: false, error: "Cannot double on completed hand" };
      }
      if (currentHand.cards.length !== 2) {
        return { isValid: false, error: "Can only double on first two cards" };
      }
      if (!gameState.canDouble) {
        return { isValid: false, error: "Cannot double this hand" };
      }
      // Balance validation is now handled by the state machine
      if (currentHand.isSplitAces) {
        return { isValid: false, error: "Cannot double on split aces" };
      }
      return { isValid: true };

    case GameActionType.SPLIT:
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return { isValid: false, error: "Can only split during PLAYING phase" };
      }
      if (!currentHand) {
        return { isValid: false, error: "No active hand found" };
      }
      if (currentHand.isStanding || currentHand.isBusted) {
        return { isValid: false, error: "Cannot split completed hand" };
      }
      if (!gameState.canSplit) {
        return { isValid: false, error: "Cannot split this hand" };
      }
      if (currentHand.cards.length !== 2) {
        return { isValid: false, error: "Can only split on first two cards" };
      }
      // Check if we've reached the maximum number of hands
      const MAX_SPLIT_HANDS = 4;
      if (gameState.playerHands.length >= MAX_SPLIT_HANDS) {
        return { 
          isValid: false, 
          error: `Maximum of ${MAX_SPLIT_HANDS} hands allowed` 
        };
      }
      // Balance validation is now handled by the state machine
      return { isValid: true };

    case GameActionType.SURRENDER:
      if (gameState.gamePhase !== GameStatePhaseType.PLAYING) {
        return {
          isValid: false,
          error: "Can only surrender during playing phase",
        };
      }
      if (!currentHand) {
        return { isValid: false, error: "No active hand found" };
      }
      if (currentHand.isStanding || currentHand.isBusted) {
        return { isValid: false, error: "Cannot surrender completed hand" };
      }
      if (!gameState.canSurrender) {
        return { isValid: false, error: "Cannot surrender this hand" };
      }
      if (currentHand.cards.length !== 2) {
        return {
          isValid: false,
          error: "Can only surrender on first two cards",
        };
      }
      if (currentHand.isFromSplit) {
        return { isValid: false, error: "Cannot surrender after splitting" };
      }
      return { isValid: true };

    case GameActionType.INSURANCE:
      if (gameState.gamePhase !== GameStatePhaseType.ASK_INSURANCE) {
        return {
          isValid: false,
          error: "Can only place insurance during dealing phase",
        };
      }
      if (!gameState.insuranceOffered) {
        return { isValid: false, error: "Insurance is not offered" };
      }
      // Insurance amount is automatically calculated as 50% of the bet
      // No amount parameter should be provided
      // TODO: May need to validate insuranceAmount in future
      // const insuranceAmount = Math.round(currentHand.bet / 2 * 100) / 100; // Round to nearest penny
      // Balance validation is now handled by the state machine
      return { isValid: true };

    case GameActionType.DECLINE_INSURANCE:
      if (gameState.gamePhase !== GameStatePhaseType.ASK_INSURANCE) {
        return {
          isValid: false,
          error: "Can only decline insurance during dealing phase",
        };
      }
      if (!gameState.insuranceOffered) {
        return { isValid: false, error: "Insurance is not offered" };
      }
      return { isValid: true };

    case GameActionType.RESET_GAME:
      // Allow reset in betting phase or when game is finished
      if (
        gameState.gamePhase !== GameStatePhaseType.BETTING &&
        gameState.gamePhase !== GameStatePhaseType.FINISHED
      ) {
        return {
          isValid: false,
          error: "Can only reset during betting phase or when game is finished",
        };
      }
      return { isValid: true };

    default:
      return { isValid: false, error: "Invalid action" };
  }
}

/**
 * Validates if a specific action is allowed for a given game phase
 * @param gamePhase - The current game phase
 * @param action - The action to validate
 * @returns boolean indicating if the action is allowed in this phase
 */
export function isActionAllowedInPhase(
  gamePhase: GameStatePhaseType,
  action: GameActionType
): boolean {
  const phaseActions: Record<GameStatePhaseType, GameActionType[]> = {
    [GameStatePhaseType.BETTING]: [
      GameActionType.PLACE_BET,
      GameActionType.START_ROUND,
      GameActionType.RESET_GAME,
    ],
    [GameStatePhaseType.ASK_INSURANCE]: [
      GameActionType.INSURANCE,
      GameActionType.DECLINE_INSURANCE,
    ],
    [GameStatePhaseType.PLAYING]: [
      GameActionType.HIT,
      GameActionType.STAND,
      GameActionType.DOUBLE,
      GameActionType.SPLIT,
      GameActionType.SURRENDER,
    ],
    [GameStatePhaseType.DEALER_TURN]: [],
    [GameStatePhaseType.FINISHED]: [
      GameActionType.RESET_GAME,
      GameActionType.PLAY_AGAIN,
    ],
    [GameStatePhaseType.SHUFFLE]: [],
  };

  return phaseActions[gamePhase]?.includes(action) || false;
}

/**
 * Gets all valid actions for the current game state
 * @param gameState - The current game state
 * @returns Array of valid action strings
 */
export function getValidActions(gameState: GameState): string[] {
  const validActions: string[] = [];

  // Allow reset and play again during betting phase or when game is finished
  if (
    gameState.gamePhase === GameStatePhaseType.BETTING ||
    gameState.gamePhase === GameStatePhaseType.FINISHED
  ) {
    validActions.push(GameActionType.RESET_GAME);
  }

  // Allow play again only when game is finished
  if (gameState.gamePhase === GameStatePhaseType.FINISHED) {
    validActions.push(GameActionType.PLAY_AGAIN);
  }

  // Phase-specific actions
  switch (gameState.gamePhase) {
    case GameStatePhaseType.BETTING:
      validActions.push(GameActionType.PLACE_BET, GameActionType.START_ROUND); // START_ROUND can be called with amount parameter
      break;

    case GameStatePhaseType.ASK_INSURANCE:
      validActions.push(
        GameActionType.INSURANCE,
        GameActionType.DECLINE_INSURANCE
      );
      break;

    case GameStatePhaseType.PLAYING:
      validActions.push(
        GameActionType.HIT,
        GameActionType.STAND,
        GameActionType.SWITCH_HAND
      );

      if (gameState.canDouble) {
        validActions.push(GameActionType.DOUBLE);
      }
      if (gameState.canSplit) {
        validActions.push(GameActionType.SPLIT);
      }
      if (gameState.canSurrender) {
        validActions.push(GameActionType.SURRENDER);
      }
      break;

    case GameStatePhaseType.FINISHED:
      break;
  }

  return validActions;
}
