// Game Mode Types
export enum GameMode {
  FREE_PLAY = 'FREE_PLAY',
  REAL_MONEY = 'REAL_MONEY',
}

export enum CoinSide {
  HEADS = "HEADS",
  TAILS = "TAILS",
}

export enum CoinflipStatus {
  BETTING = "BETTING", // waiting for player to place a bet
  BET_PLACED = "BET_PLACED", // bet placed, waiting for start
  FLIPPING = "FLIPPING", // animation in progress
  FINISHED = "FINISHED", // round completed
  ERROR = "ERROR", // error occurred
}

export interface CoinflipGameState {
  id: string; // unique game id
  status: CoinflipStatus; // current state
  amount?: number; // bet amount
  side?: CoinSide | null; // chosen side (HEADS or TAILS)
  playerId?: string; // player who made the bet
  winningSide?: CoinSide | null; // winning side after flip
  payout?: number; // payout amount (0 if lost, betAmount * 2 if won)
  createdAt: number; // timestamp
  updatedAt?: number;
  balance: number; // Current balance (updated by effects)
  previousBetAmount?: number; // Preserved bet amount for Play Again functionality
  previousSide?: CoinSide | null; // Preserved bet side for Play Again functionality
  gameMode?: GameMode; // Game mode (Free Play or Real Money)
  tabId?: string; // Unique ID for this tab (for multi-tab sync)
  // Internal fields for state machine (not exposed to frontend)
  serverSeed?: string; // Server seed for randomness (internal use)
  nonce?: number; // Nonce for randomness (internal use)
}

export enum CoinflipGameActionType {
  SELECT_SIDE = "SELECT_SIDE", // choose Heads or Tails
  FLIP = "FLIP", // start the coin flip animation and return result
  PLAY_AGAIN = "PLAY_AGAIN", // start another round with same or new bet
  RESET_GAME = "RESET_GAME", // reset to idle or handle error state
  CANCEL_BET = "CANCEL_BET", // optional — cancel before flip starts
  CLEAR = "CLEAR", // clear all bets
  DOUBLE = "DOUBLE",
  PLACE_BET = "PLACE_BET",
}
