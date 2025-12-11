/**
 * Side Bet Evaluation Utilities
 *
 * Implements the complete logic for 21+3 and Perfect Pairs side bets
 * according to the BLACKJACK_SIDEPOTS.md specification
 */

import {
  Card,
  Sidebet,
  SidebetType,
  SidebetResultType,
} from "@/types/games/blackjack/game";

/**
 * Suit colors for Perfect Pairs evaluation
 */
const SUIT_COLORS: Record<string, "red" | "black"> = {
  HEARTS: "red",
  DIAMONDS: "red",
  CLUBS: "black",
  SPADES: "black",
};

/**
 * Card rank values for straight evaluation
 */
const RANK_VALUES: Record<string, number> = {
  A: 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
};

/**
 * Side Bet Payout Multipliers
 * These match the specification in BLACKJACK_SIDEPOTS.md
 */
export const SIDEBET_PAYOUTS = {
  // 21+3 Payouts
  "21+3": {
    STRAIGHT_FLUSH: 40, // 40:1
    THREE_OF_A_KIND: 30, // 30:1
    STRAIGHT: 10, // 10:1
    FLUSH: 5, // 5:1
  },
  // Perfect Pairs Payouts
  PAIR: {
    PERFECT_PAIR: 25, // 25:1
    COLORED_PAIR: 12, // 12:1
    MIXED_PAIR: 6, // 6:1
  },
} as const;

/**
 * 21+3 Result Types
 */
export enum TwentyOnePlusThreeResult {
  STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
  THREE_OF_A_KIND = "THREE_OF_A_KIND",
  STRAIGHT = "STRAIGHT",
  FLUSH = "FLUSH",
  LOSE = "LOSE",
}

/**
 * Perfect Pairs Result Types
 */
export enum PerfectPairResult {
  PERFECT_PAIR = "PERFECT_PAIR",
  COLORED_PAIR = "COLORED_PAIR",
  MIXED_PAIR = "MIXED_PAIR",
  LOSE = "LOSE",
}

/**
 * Check if three cards form a straight flush
 * - Three consecutive ranks
 * - All same suit
 */
function isStraightFlush(cards: Card[]): boolean {
  if (cards.length !== 3) return false;

  // Check all same suit
  const suits = new Set(cards.map((c) => c.suit));
  if (suits.size !== 1) return false;

  // Check consecutive ranks
  return isStraight(cards);
}

/**
 * Check if three cards form three of a kind
 * - All three cards same rank
 */
function isThreeOfAKind(cards: Card[]): boolean {
  if (cards.length !== 3) return false;

  const ranks = new Set(cards.map((c) => c.rank));
  return ranks.size === 1;
}

/**
 * Check if three cards form a straight
 * - Three consecutive ranks, mixed suits
 * - Ace can be high (Q-K-A) or low (A-2-3)
 * - No wraparound straights (K-A-2 invalid)
 */
function isStraight(cards: Card[]): boolean {
  if (cards.length !== 3) return false;

  const values = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => a - b);

  // Check for A-2-3 (low straight)
  if (values[0] === 1 && values[1] === 2 && values[2] === 3) {
    return true;
  }

  // Check for Q-K-A (high straight)
  if (values[0] === 12 && values[1] === 13 && values[2] === 1) {
    // Convert Ace to 14 for high straight
    const highValues = values
      .map((v) => (v === 1 ? 14 : v))
      .sort((a, b) => a - b);
    return (
      highValues[0] + 1 === highValues[1] && highValues[1] + 1 === highValues[2]
    );
  }

  // Regular consecutive check (no Ace)
  return values[0] + 1 === values[1] && values[1] + 1 === values[2];
}

/**
 * Check if three cards form a flush
 * - All three cards same suit
 */
function isFlush(cards: Card[]): boolean {
  if (cards.length !== 3) return false;

  const suits = new Set(cards.map((c) => c.suit));
  return suits.size === 1;
}

/**
 * Evaluate 21+3 side bet
 *
 * Inputs:
 * - Player's first two cards
 * - Dealer's upcard
 *
 * Returns the winning hand type or LOSE
 */
export function evaluate21Plus3(
  playerCard1: Card,
  playerCard2: Card,
  dealerUpcard: Card
): TwentyOnePlusThreeResult {
  const threeCards = [playerCard1, playerCard2, dealerUpcard];

  // Check in order of highest to lowest payout
  if (isStraightFlush(threeCards)) {
    return TwentyOnePlusThreeResult.STRAIGHT_FLUSH;
  }

  if (isThreeOfAKind(threeCards)) {
    return TwentyOnePlusThreeResult.THREE_OF_A_KIND;
  }

  if (isStraight(threeCards)) {
    return TwentyOnePlusThreeResult.STRAIGHT;
  }

  if (isFlush(threeCards)) {
    return TwentyOnePlusThreeResult.FLUSH;
  }

  return TwentyOnePlusThreeResult.LOSE;
}

/**
 * Check if two cards form a perfect pair
 * - Same rank
 * - Same suit
 */
function isPerfectPair(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank && card1.suit === card2.suit;
}

/**
 * Check if two cards form a colored pair
 * - Same rank
 * - Same color (red/red or black/black)
 * - Different suits
 */
function isColoredPair(card1: Card, card2: Card): boolean {
  if (card1.rank !== card2.rank) return false;
  if (card1.suit === card2.suit) return false; // Must be different suits

  return SUIT_COLORS[card1.suit] === SUIT_COLORS[card2.suit];
}

/**
 * Check if two cards form a mixed pair
 * - Same rank
 * - Different colors
 */
function isMixedPair(card1: Card, card2: Card): boolean {
  if (card1.rank !== card2.rank) return false;
  if (card1.suit === card2.suit) return false; // Must be different suits

  return SUIT_COLORS[card1.suit] !== SUIT_COLORS[card2.suit];
}

/**
 * Evaluate Perfect Pairs side bet
 *
 * Inputs:
 * - Player's first two cards only
 *
 * Returns the winning pair type or LOSE
 */
export function evaluatePerfectPair(
  playerCard1: Card,
  playerCard2: Card
): PerfectPairResult {
  // Check in order of highest to lowest payout
  if (isPerfectPair(playerCard1, playerCard2)) {
    return PerfectPairResult.PERFECT_PAIR;
  }

  if (isColoredPair(playerCard1, playerCard2)) {
    return PerfectPairResult.COLORED_PAIR;
  }

  if (isMixedPair(playerCard1, playerCard2)) {
    return PerfectPairResult.MIXED_PAIR;
  }

  return PerfectPairResult.LOSE;
}

/**
 * Calculate payout for 21+3 side bet
 */
export function calculate21Plus3Payout(
  betAmount: number,
  result: TwentyOnePlusThreeResult
): { multiplier: number; profit: number; totalReturn: number } {
  if (result === TwentyOnePlusThreeResult.LOSE) {
    return { multiplier: 0, profit: 0, totalReturn: 0 };
  }

  const multiplier = SIDEBET_PAYOUTS["21+3"][result];
  const profit = betAmount * multiplier;
  const totalReturn = betAmount + profit;

  return { multiplier, profit, totalReturn };
}

/**
 * Calculate payout for Perfect Pairs side bet
 */
export function calculatePerfectPairPayout(
  betAmount: number,
  result: PerfectPairResult
): { multiplier: number; profit: number; totalReturn: number } {
  if (result === PerfectPairResult.LOSE) {
    return { multiplier: 0, profit: 0, totalReturn: 0 };
  }

  const multiplier = SIDEBET_PAYOUTS.PAIR[result];
  const profit = betAmount * multiplier;
  const totalReturn = betAmount + profit;

  return { multiplier, profit, totalReturn };
}

/**
 * Evaluate all side bets and return results
 *
 * This should be called immediately after the initial deal,
 * before any player actions
 */
export function evaluateAllSideBets(
  playerHand: { cards: Card[] },
  dealerHand: { cards: Card[] },
  pairBet: number,
  twentyOnePlusThreeBet: number
): Sidebet[] {
  const results: Sidebet[] = [];

  // Need at least 2 player cards and 1 dealer card for evaluation
  if (playerHand.cards.length < 2 || dealerHand.cards.length < 1) {
    // Return empty results if cards aren't ready
    return results;
  }

  // Evaluate Perfect Pairs (only needs player's first two cards)
  if (pairBet > 0) {
    const pairResult = evaluatePerfectPair(
      playerHand.cards[0],
      playerHand.cards[1]
    );

    const { profit, totalReturn } = calculatePerfectPairPayout(
      pairBet,
      pairResult
    );

    const pairSidebet: Sidebet = {
      type: SidebetType.PAIR,
      amount: pairBet,
      result:
        pairResult === PerfectPairResult.LOSE
          ? SidebetResultType.LOSE
          : SidebetResultType.WIN,
      payout: totalReturn,
      profit: profit,
    };
    results.push(pairSidebet);
  }

  // Evaluate 21+3 (needs player's first two cards + dealer's upcard)
  if (twentyOnePlusThreeBet > 0) {
    const threePlusResult = evaluate21Plus3(
      playerHand.cards[0],
      playerHand.cards[1],
      dealerHand.cards[0] // Dealer's upcard
    );

    const { profit, totalReturn } = calculate21Plus3Payout(
      twentyOnePlusThreeBet,
      threePlusResult
    );

    const threePlusSidebet: Sidebet = {
      type: SidebetType.TWENTY_ONE_PLUS_THREE,
      amount: twentyOnePlusThreeBet,
      result:
        threePlusResult === TwentyOnePlusThreeResult.LOSE
          ? SidebetResultType.LOSE
          : SidebetResultType.WIN,
      payout: totalReturn,
      profit: profit,
    };
    results.push(threePlusSidebet);
  }

  return results;
}
