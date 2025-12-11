import { CoinflipGameStateService } from './gameStateService';
import {
  CoinflipGameState,
  CoinflipStatus,
  CoinSide,
  CoinflipGameActionType,
  GameMode,
} from '@/types/games/coinflip/game';
import { balanceService } from '@/lib/games/blackjack/balance-service';

export interface CoinflipStateMachineEffect {
  type:
    | 'BALANCE_CHANGE'
    | 'SIDE_SELECTED'
    | 'BET_PLACED'
    | 'COIN_FLIPPED'
    | 'GAME_RESET';
  data: Record<string, unknown>;
}

export interface BalanceChangeEffect extends CoinflipStateMachineEffect {
  type: 'BALANCE_CHANGE';
  data: {
    amount: number;
    operation: 'INCREASE' | 'DECREASE';
    reason: string;
  };
}

export interface CoinflipStateMachineResult {
  success: boolean;
  newGameState: Partial<CoinflipGameState>;
  effects: CoinflipStateMachineEffect[];
  error?: string;
  details?: string;
}

export interface CoinflipStateMachineInput {
  gameState: CoinflipGameState;
  action: CoinflipGameActionType;
  amount?: number;
  side?: CoinSide;
  userId?: string;
}

export class CoinflipStateMachine {
  private gameStateService: CoinflipGameStateService;

  constructor() {
    this.gameStateService = new CoinflipGameStateService();
  }

  private async handleBalanceChangeEffect(
    gameState: CoinflipGameState,
    effect: BalanceChangeEffect,
    userId?: string
  ): Promise<CoinflipGameState> {
    const updatedState = { ...gameState };
    const { amount, operation } = effect.data;

    // Update state balance
    const currentBalance = updatedState.balance || 0;
    if (operation === 'INCREASE') {
      updatedState.balance = currentBalance + amount;
    } else {
      updatedState.balance = currentBalance - amount;
    }

    // Update database balance for REAL_MONEY mode
    if (updatedState.gameMode === GameMode.REAL_MONEY && userId) {
      await balanceService.handleBalanceChangeEffect(userId, {
        amount,
        operation,
        reason: effect.data.reason,
      });
    }

    return updatedState;
  }

  async processEffects(
    gameState: CoinflipGameState,
    effects: CoinflipStateMachineEffect[],
    userId?: string
  ): Promise<CoinflipGameState> {
    let updatedState = { ...gameState };

    for (const effect of effects) {
      switch (effect.type) {
        case 'BALANCE_CHANGE':
          updatedState = await this.handleBalanceChangeEffect(
            updatedState,
            effect as BalanceChangeEffect,
            userId
          );
          break;

        case 'SIDE_SELECTED':
        case 'BET_PLACED':
        case 'COIN_FLIPPED':
        case 'GAME_RESET':
          // These effects are informational and don't require state updates
          break;

        default:
          // Unknown effect type - log but don't fail
          console.warn(
            'Unknown effect type:',
            (effect as { type: string }).type
          );
          break;
      }
    }

    return updatedState;
  }

  private async validateBalance(
    input: CoinflipStateMachineInput
  ): Promise<{ isValid: boolean; error?: string }> {
    const { gameState, action, amount, userId } = input;

    let requiredAmount = 0;

    switch (action) {
      case CoinflipGameActionType.PLACE_BET:
        // For PLACE_BET, calculate total bet amount (current + new)
        const currentBet = gameState.amount || 0;
        const newBetAmount = amount || 0;
        requiredAmount = currentBet + newBetAmount;

        // Validate bet amount is greater than zero
        if (requiredAmount <= 0) {
          return {
            isValid: false,
            error: 'Bet amount must be greater than zero',
          };
        }
        break;

      case CoinflipGameActionType.DOUBLE:
        // For DOUBLE, need to double the current bet
        const currentBetAmount = gameState.amount || 0;
        requiredAmount = currentBetAmount * 2;

        // Validate there's a bet to double
        if (currentBetAmount <= 0) {
          return {
            isValid: false,
            error: 'No bet to double',
          };
        }
        break;

      case CoinflipGameActionType.FLIP:
        // For FLIP, need to have the current bet amount available
        const flipBetAmount = gameState.amount || 0;
        requiredAmount = flipBetAmount;

        // Validate there's a bet to flip
        if (flipBetAmount <= 0) {
          return {
            isValid: false,
            error: 'Must place a bet before flipping',
          };
        }
        break;

      default:
        // No balance validation needed for other actions
        return { isValid: true };
    }

    // Check if required amount is valid
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

    const hasBalance = await balanceService.hasSufficientBalance(
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

  async processAction(
    input: CoinflipStateMachineInput
  ): Promise<CoinflipStateMachineResult> {
    const { gameState, action, amount, side, userId } = input;
    const effects: CoinflipStateMachineEffect[] = [];

    try {
      // Validate action
      const validation = await this.validateAction(input);
      if (!validation.isValid) {
        return {
          success: false,
          newGameState: {},
          effects: [],
          error: validation.error,
          details: validation.details,
        };
      }

      let newGameState: Partial<CoinflipGameState> = {};

      switch (action) {
        case CoinflipGameActionType.SELECT_SIDE:
          if (!side) {
            return {
              success: false,
              newGameState: {},
              effects: [],
              error: 'Side is required',
            };
          }

          newGameState = {
            status: CoinflipStatus.BET_PLACED,
            side,
            amount: gameState.amount || 0,
            playerId: gameState.playerId || gameState.id,
          };
          effects.push({
            type: 'SIDE_SELECTED',
            data: { side },
          });
          break;

        case CoinflipGameActionType.PLACE_BET:
          if (!amount || amount <= 0) {
            return {
              success: false,
              newGameState: {},
              effects: [],
              error: 'Valid bet amount is required',
            };
          }

          const currentBet = gameState.amount || 0;
          const newBetAmount = currentBet + amount;
          const currentSide = gameState.side || side || CoinSide.HEADS;

          newGameState = {
            amount: newBetAmount,
            side: currentSide,
            playerId: gameState.playerId || gameState.id,
          };
          effects.push({
            type: 'BET_PLACED',
            data: { amount },
          });
          break;

        case CoinflipGameActionType.FLIP:
          if (!gameState.side) {
            return {
              success: false,
              newGameState: {},
              effects: [],
              error: 'Must select a side before flipping',
            };
          }

          if (!gameState.amount || gameState.amount <= 0) {
            return {
              success: false,
              newGameState: {},
              effects: [],
              error: 'Must place a bet before flipping',
            };
          }

          // if (!gameState.serverSeed || gameState.nonce === undefined) {
          //   return {
          //     success: false,
          //     newGameState: {},
          //     effects: [],
          //     error: 'Game state missing required fields for coin flip',
          //   };
          // }

          // TODO: Remove fallback defaults once server seeds flow to clients
          const serverSeed = gameState.serverSeed ?? '';
          const nonce = gameState.nonce ?? 0;

          // Deduct bet from balance
          const betDeductionEffect: BalanceChangeEffect = {
            type: 'BALANCE_CHANGE',
            data: {
              amount: gameState.amount,
              operation: 'DECREASE',
              reason: 'Coinflip bet placed',
            },
          };
          effects.push(betDeductionEffect);

          // Generate client seed and flip coin
          const clientSeed = this.gameStateService.generateClientSeed();
          const flipResult = this.gameStateService.flipCoin(
            serverSeed,
            clientSeed,
            nonce
          );

          // Calculate winning side, result, and payout in state machine
          const winningSide =
            flipResult.winningSide === 'HEADS'
              ? CoinSide.HEADS
              : CoinSide.TAILS;
          const isWinner = gameState.side === winningSide;
          const payout = isWinner ? (gameState.amount || 0) * 2 : 0;

          // Add payout if won
          if (isWinner) {
            const payoutEffect: BalanceChangeEffect = {
              type: 'BALANCE_CHANGE',
              data: {
                amount: payout,
                operation: 'INCREASE',
                reason: 'Coinflip win',
              },
            };
            effects.push(payoutEffect);
          }

          newGameState = {
            status: CoinflipStatus.FINISHED,
            winningSide,
            payout,
            previousBetAmount: gameState.amount,
            previousSide: gameState.side,
          };

          effects.push({
            type: 'COIN_FLIPPED',
            data: {
              winningSide,
              result: isWinner ? 'WIN' : 'LOSE',
              payout,
            },
          });
          break;

        case 'DOUBLE':
          if (!gameState.amount || gameState.amount <= 0) {
            return {
              success: false,
              newGameState: {},
              effects: [],
              error: 'No bet to double',
            };
          }

          newGameState = {
            amount: gameState.amount * 2,
            side: gameState.side,
            playerId: gameState.playerId,
          };
          effects.push({
            type: 'BET_PLACED',
            data: { amount: gameState.amount },
          });
          break;

        case 'CLEAR':
          newGameState = {
            amount: undefined,
            side: null,
            playerId: undefined,
          };
          break;

        case 'RESET_GAME':
        case 'PLAY_AGAIN':
          newGameState = {
            status: CoinflipStatus.BETTING,
            // Restore previous bet amount and side for next game
            amount: gameState.previousBetAmount,
            side: gameState.previousSide ?? undefined,
            playerId: undefined,
            winningSide: undefined,
            payout: undefined,
          };
          effects.push({
            type: 'GAME_RESET',
            data: {},
          });
          break;

        default:
          return {
            success: false,
            newGameState: {},
            effects: [],
            error: `Unknown action: ${action}`,
          };
      }

      // Process all effects to update state (including balance)
      const finalState = await this.processEffects(
        {
          ...gameState,
          ...newGameState,
        },
        effects,
        userId
      );

      return {
        success: true,
        newGameState: finalState,
        effects,
      };
    } catch (error) {
      return {
        success: false,
        newGameState: {},
        effects: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async validateAction(
    input: CoinflipStateMachineInput
  ): Promise<{ isValid: boolean; error?: string; details?: string }> {
    const { gameState, action, amount, side } = input;

    // Check game status
    if (
      action === 'SELECT_SIDE' &&
      gameState.status !== CoinflipStatus.BETTING
    ) {
      return {
        isValid: false,
        error: 'Can only select side during betting phase',
      };
    }

    if (
      action === 'PLACE_BET' &&
      gameState.status !== CoinflipStatus.BETTING &&
      gameState.status !== CoinflipStatus.BET_PLACED
    ) {
      return {
        isValid: false,
        error: 'Can only place bets during betting phase',
      };
    }

    if (
      action === 'FLIP' &&
      gameState.status !== CoinflipStatus.BETTING &&
      gameState.status !== CoinflipStatus.BET_PLACED
    ) {
      return {
        isValid: false,
        error: 'Can only flip during betting phase',
      };
    }

    // Validate bet amount
    if (action === 'PLACE_BET' || action === 'DOUBLE') {
      if (!amount || amount <= 0) {
        return {
          isValid: false,
          error: 'Bet amount must be greater than zero',
        };
      }
    }

    // Validate side selection
    if (action === 'SELECT_SIDE' && !side) {
      return {
        isValid: false,
        error: 'Side selection is required',
      };
    }

    // Validate balance
    const balanceValidation = await this.validateBalance(input);
    if (!balanceValidation.isValid) {
      return balanceValidation;
    }

    return { isValid: true };
  }
}

export function createCoinflipStateMachine(): CoinflipStateMachine {
  return new CoinflipStateMachine();
}
