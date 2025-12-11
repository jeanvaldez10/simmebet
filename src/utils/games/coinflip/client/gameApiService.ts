import {
  CoinflipGameState,
  CoinflipGameActionType,
  CoinSide,
} from "@/types/games/coinflip/game";

export interface CoinflipApiResponse {
  success: boolean;
  gameState?: CoinflipGameState;
  availableActions?: Array<{
    action: CoinflipGameActionType;
    description: string;
  }>;
  error?: string;
}

export interface CoinflipActionResponse {
  gameState: CoinflipGameState;
  availableActions?: Array<{
    action: CoinflipGameActionType;
    description: string;
  }>;
}

export interface SendCoinflipActionOptions {
  amount?: number;
  side?: CoinSide;
  overrideState?: CoinflipGameState;
  applyDelayMs?: number;
  deferApply?: boolean;
}

/**
 * Fetch the current coinflip game state from the API
 */
export async function getCoinflipGameState(): Promise<CoinflipActionResponse | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };

  try {
    const response = await fetch("/api/games/coinflip/current", {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch coinflip game state:", response.statusText);
      return null;
    }

    const data: CoinflipApiResponse = await response.json();
    if (data.success && data.gameState) {
      return {
        gameState: data.gameState,
        availableActions: data.availableActions || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch coinflip game state:", error);
    return null;
  }
}

/**
 * Send a coinflip game action to the API
 */
export async function sendCoinflipAction(
  action: CoinflipGameActionType,
  options: SendCoinflipActionOptions = {},
  currentState: CoinflipGameState
): Promise<CoinflipActionResponse> {
  const stateToSend = options.overrideState ?? currentState;

  const response = await fetch("/api/games/coinflip/current", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      action,
      amount: options.amount,
      side: options.side,
      state: stateToSend,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || "API request failed");
  }

  const data: CoinflipApiResponse = await response.json();

  if (!data?.gameState) {
    throw new Error("API returned no game state");
  }

  return {
    gameState: data.gameState,
    availableActions: data.availableActions,
  };
}

