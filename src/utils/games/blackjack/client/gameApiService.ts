import {
  GameState,
  GameActionType,
  AvailableAction,
  ShuffleVerification,
} from '@/types/games/blackjack/game';

export interface GameApiResponse {
  success: boolean;
  gameState?: GameState;
  availableActions?: AvailableAction[];
  shuffleVerification: ShuffleVerification;
  error?: string;
}

export interface GameActionResponse {
  gameState: GameState;
  availableActions?: AvailableAction[];
  shuffleVerification: ShuffleVerification;
}

export interface SendActionOptions {
  amount?: number;
  pairBetAmount?: number;
  twentyOnePlusThreeBetAmount?: number;
  overrideState?: GameState;
  applyDelayMs?: number;
  deferApply?: boolean;
}

export async function getGameState(): Promise<GameActionResponse | null> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  try {
    const response = await fetch('/api/games/blackjack/current', {
      method: 'GET',
      headers,
      mode: 'no-cors',
    });

    const data: GameApiResponse = await response.json();
    if (data.success && data.gameState) {
      return {
        gameState: data.gameState,
        availableActions: data.availableActions || [],
        shuffleVerification: data.shuffleVerification,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch game state:', error);
    return null;
  }
}

export async function sendGameAction(
  action: GameActionType,
  options: SendActionOptions = {},
  currentState: GameState
): Promise<GameActionResponse> {
  const stateToSend = options.overrideState ?? currentState;

  const response = await fetch('/api/games/blackjack/current', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify({
      action,
      betAmount: options.amount,
      pairBetAmount: options.pairBetAmount,
      twentyOnePlusThreeBetAmount: options.twentyOnePlusThreeBetAmount,
      state: stateToSend,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || 'API request failed');
  }

  const data: GameApiResponse = await response.json();

  if (!data?.gameState) {
    throw new Error('API returned no game state');
  }

  return {
    gameState: data.gameState,
    availableActions: data.availableActions,
    shuffleVerification: data.shuffleVerification,
  };
}
