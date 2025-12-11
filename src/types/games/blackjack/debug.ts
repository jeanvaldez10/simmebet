/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Fix debug scenario card ranks (use valid rank types) and remove eslint-disable
import { Card } from "./game";

/**
 * Debug configuration for testing specific game scenarios
 */
export interface DebugConfig {
  /** Enable debug mode with custom deck configuration */
  enabled: boolean;
  /** Custom deck configuration for testing */
  deckConfig?: DebugDeckConfig;
  /** Additional debug options */
  options?: DebugOptions;
}

/**
 * Debug deck configuration
 */
export interface DebugDeckConfig {
  /** Predefined scenario name */
  scenario?:
    | "blackjack"
    | "bust"
    | "win"
    | "push"
    | "split"
    | "double"
    | "surrender"
    | "insurance";
  /** Custom deck of cards to use */
  customDeck?: Card[];
  /** Shuffle ID override for deterministic testing */
  shuffleId?: string;
  /** Shuffle salt override for deterministic testing */
  shuffleSalt?: string;
}

/**
 * Additional debug options
 */
export interface DebugOptions {
  /** Log detailed game state information */
  verboseLogging?: boolean;
  /** Skip certain validations for testing */
  skipValidations?: boolean;
  /** Force specific game outcomes */
  forceOutcome?: "win" | "lose" | "push" | "blackjack";
}

/**
 * Common debug scenarios with predefined deck configurations
 */
export const DEBUG_SCENARIOS: Record<string, Card[]> = {
  blackjack: [
    { suit: "hearts", rank: "A", isHidden: false }, // Player first card
    { suit: "hearts", rank: "10", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "K", isHidden: false }, // Player second card (blackjack)
    { suit: "hearts", rank: "6", isHidden: false }, // Dealer second card
  ],

  bust: [
    { suit: "hearts", rank: "10", isHidden: false }, // Player first card
    { suit: "hearts", rank: "9", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "6", isHidden: false }, // Player second card
    { suit: "hearts", rank: "7", isHidden: false }, // Dealer second card
    { suit: "hearts", rank: "8", isHidden: false }, // Player third card (bust)
  ],

  win: [
    { suit: "hearts", rank: "10", isHidden: false }, // Player first card
    { suit: "hearts", rank: "9", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "7", isHidden: false }, // Player second card
    { suit: "hearts", rank: "6", isHidden: false }, // Dealer second card
    { suit: "hearts", rank: "3", isHidden: false }, // Dealer third card (bust)
  ],

  push: [
    { suit: "hearts", rank: "10", isHidden: false }, // Player first card
    { suit: "hearts", rank: "9", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "7", isHidden: false }, // Player second card
    { suit: "hearts", rank: "8", isHidden: false }, // Dealer second card
  ],

  split: [
    { suit: "hearts", rank: "8", isHidden: false }, // Player first card
    { suit: "hearts", rank: "10", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "8", isHidden: false }, // Player second card (same as first)
    { suit: "hearts", rank: "6", isHidden: false }, // Dealer second card
    { suit: "hearts", rank: "5", isHidden: false }, // First split hand card
    { suit: "hearts", rank: "4", isHidden: false }, // Second split hand card
    { suit: "hearts", rank: "3", isHidden: false }, // Dealer third card
  ],

  double: [
    { suit: "hearts", rank: "6", isHidden: false }, // Player first card
    { suit: "hearts", rank: "10", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "5", isHidden: false }, // Player second card (11 total - good for double)
    { suit: "hearts", rank: "6", isHidden: false }, // Dealer second card
    { suit: "hearts", rank: "10", isHidden: false }, // Player double down card
    { suit: "hearts", rank: "4", isHidden: false }, // Dealer third card
  ],

  surrender: [
    { suit: "hearts", rank: "10", isHidden: false }, // Player first card (10)
    { suit: "hearts", rank: "10", isHidden: false }, // Dealer first card
    { suit: "hearts", rank: "6", isHidden: false }, // Player second card (16 total)
    { suit: "hearts", rank: "6", isHidden: false }, // Dealer second card
  ],

  insurance: [
    { suit: "hearts", rank: "10", isHidden: false }, // Player first card
    { suit: "hearts", rank: "A", isHidden: false }, // Dealer first card (A - triggers insurance)
    { suit: "hearts", rank: "K", isHidden: false }, // Player second card
    { suit: "hearts", rank: "10", isHidden: false }, // Dealer second card (blackjack)
  ],
};

/**
 * Create a debug configuration from a scenario name
 */
export function createDebugConfig(
  scenario: string,
  options?: DebugOptions
): DebugConfig {
  const deck = DEBUG_SCENARIOS[scenario];
  if (!deck) {
    throw new Error(`Unknown debug scenario: ${scenario}`);
  }

  return {
    enabled: true,
    deckConfig: {
      scenario: scenario as any, // TODO: Define proper scenario type enum
      customDeck: deck,
      shuffleId: `debug_${scenario}_${Date.now()}`,
      shuffleSalt: "debug-salt",
    },
    options,
  };
}

/**
 * Create a debug configuration with custom deck
 */
export function createCustomDebugConfig(
  customDeck: Card[],
  options?: DebugOptions
): DebugConfig {
  return {
    enabled: true,
    deckConfig: {
      customDeck,
      shuffleId: `debug_custom_${Date.now()}`,
      shuffleSalt: "debug-salt",
    },
    options,
  };
}
