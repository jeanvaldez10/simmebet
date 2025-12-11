/**
 * Game Constants for Blackjack
 * 
 * This file contains all the configurable constants for the blackjack game,
 * including payout rates, dealer rules, and game mechanics.
 */

/**
 * Dealer Rules
 */
export const DEALER_RULES = {
  /** Dealer hits on soft 17 (true) or stands on soft 17 (false) */
  HIT_ON_SOFT_17: true,
  /** Dealer stands on hard 17 or higher */
  STAND_VALUE: 17,
  /** Dealer hits on 16 or lower */
  HIT_VALUE: 16,
} as const;

/**
 * Payout Rates
 */
export const PAYOUT_RATES = {
  /** Blackjack pays 3:2 (1.5x bet) */
  BLACKJACK: 1.5,
  /** Regular win pays 1:1 (1x bet) */
  WIN: 1.0,
  /** Push returns original bet (1x bet) */
  PUSH: 1.0,
  /** Loss pays nothing (0x bet) */
  LOSE: 0,
  /** Surrender returns half bet (0.5x bet) */
  SURRENDER: 0.5,
  /** Insurance pays 2:1 (2x insurance bet) */
  INSURANCE: 2.0,
} as const;

/**
 * Side Bet Payout Multipliers
 * These match the specification in BLACKJACK_SIDEPOTS.md
 */
export const SIDEBET_PAYOUTS = {
  /** 21+3 Side Bet Payouts */
  "21+3": {
    /** Straight Flush pays 40:1 */
    STRAIGHT_FLUSH: 40,
    /** Three of a Kind pays 30:1 */
    THREE_OF_A_KIND: 30,
    /** Straight pays 10:1 */
    STRAIGHT: 10,
    /** Flush pays 5:1 */
    FLUSH: 5,
  },
  /** Perfect Pairs Side Bet Payouts */
  PAIR: {
    /** Perfect Pair pays 25:1 */
    PERFECT_PAIR: 25,
    /** Colored Pair pays 12:1 */
    COLORED_PAIR: 12,
    /** Mixed Pair pays 6:1 */
    MIXED_PAIR: 6,
  },
} as const;

/**
 * Bet Multipliers
 */
export const BET_MULTIPLIERS = {
  /** Double down requires additional bet equal to original bet */
  DOUBLE: 1.0,
  /** Split requires additional bet equal to original bet */
  SPLIT: 1.0,
  /** Insurance bet is half the original bet */
  INSURANCE: 0.5,
  /** Surrender returns half the bet */
  SURRENDER: 0.5,
} as const;

/**
 * Game Mechanics
 */
export const GAME_MECHANICS = {
  /** Maximum number of hands allowed from splitting */
  MAX_SPLIT_HANDS: 4,
  /** Maximum number of times a hand can be split */
  MAX_SPLITS_PER_HAND: 3,
  /** Whether double after split is allowed */
  DOUBLE_AFTER_SPLIT: true,
  /** Whether surrender is allowed */
  SURRENDER_ALLOWED: true,
  /** Whether late surrender is allowed (after dealer checks for blackjack) */
  LATE_SURRENDER: false,
  /** Whether insurance is offered when dealer shows ace */
  INSURANCE_OFFERED: true,
  /** Whether dealer peeks for blackjack when showing ace */
  DEALER_PEEKS_FOR_BLACKJACK: true,
} as const;

/**
 * Hand Values
 */
export const HAND_VALUES = {
  /** Blackjack value (21 with exactly 2 cards) */
  BLACKJACK: 21,
  /** Bust value (over 21) */
  BUST: 22,
  /** Minimum dealer stand value */
  DEALER_STAND: 17,
  /** Maximum dealer hit value */
  DEALER_HIT: 16,
} as const;

/**
 * Card Values
 */
export const CARD_VALUES = {
  /** Ace value (can be 1 or 11) */
  ACE: { LOW: 1, HIGH: 11 },
  /** Face card value */
  FACE: 10,
  /** Number card values are their face value */
  NUMBER: (value: number) => value,
} as const;

/**
 * Action Requirements
 */
export const ACTION_REQUIREMENTS = {
  /** Minimum bet amount */
  MIN_BET: 1,
  /** Maximum bet amount */
  MAX_BET: 1000,
  /** Minimum cards for double down */
  DOUBLE_MIN_CARDS: 2,
  /** Maximum cards for double down */
  DOUBLE_MAX_CARDS: 2,
  /** Cards required for split (must be same rank) */
  SPLIT_CARDS: 2,
  /** Cards required for surrender */
  SURRENDER_CARDS: 2,
} as const;

/**
 * Balance Operations
 */
export const BALANCE_OPERATIONS = {
  INCREASE: 'INCREASE',
  DECREASE: 'DECREASE',
} as const;

/**
 * Balance Change Reasons
 */
export const BALANCE_REASONS = {
  START_ROUND: 'START_ROUND',
  DOUBLE_DOWN: 'DOUBLE_DOWN',
  SPLIT_HAND: 'SPLIT_HAND',
  INSURANCE_BET: 'INSURANCE_BET',
  INSURANCE_WIN: 'INSURANCE_WIN',
  INSURANCE_LOSS: 'INSURANCE_LOSS',
  SURRENDER: 'SURRENDER',
  GAME_WIN: 'GAME_WIN',
} as const;

/**
 * Game Phases
 */
export const GAME_PHASES = {
  BETTING: 'BETTING',
  PLAYING: 'PLAYING',
  DEALER_TURN: 'DEALER_TURN',
  ASK_INSURANCE: 'ASK_INSURANCE',
  FINISHED: 'FINISHED',
} as const;

/**
 * Hand Results
 */
export const HAND_RESULTS = {
  WIN: 'WIN',
  LOSE: 'LOSE',
  PUSH: 'PUSH',
  BLACKJACK: 'BLACKJACK',
  BUST: 'BUST',
  SURRENDER: 'SURRENDER',
} as const;

/**
 * Default Game Configuration
 * This object contains all the default settings that can be overridden
 */
export const DEFAULT_GAME_CONFIG = {
  dealerRules: DEALER_RULES,
  payoutRates: PAYOUT_RATES,
  betMultipliers: BET_MULTIPLIERS,
  gameMechanics: GAME_MECHANICS,
  handValues: HAND_VALUES,
  cardValues: CARD_VALUES,
  actionRequirements: ACTION_REQUIREMENTS,
  balanceOperations: BALANCE_OPERATIONS,
  balanceReasons: BALANCE_REASONS,
  gamePhases: GAME_PHASES,
  handResults: HAND_RESULTS,
} as const;

/**
 * Type definitions for better type safety
 */
export type DealerRules = typeof DEALER_RULES;
export type PayoutRates = typeof PAYOUT_RATES;
export type BetMultipliers = typeof BET_MULTIPLIERS;
export type GameMechanics = typeof GAME_MECHANICS;
export type HandValues = typeof HAND_VALUES;
export type CardValues = typeof CARD_VALUES;
export type ActionRequirements = typeof ACTION_REQUIREMENTS;
export type BalanceOperations = typeof BALANCE_OPERATIONS;
export type BalanceReasons = typeof BALANCE_REASONS;
export type GamePhases = typeof GAME_PHASES;
export type HandResults = typeof HAND_RESULTS;
export type GameConfig = typeof DEFAULT_GAME_CONFIG;
