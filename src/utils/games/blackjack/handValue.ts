import { Card } from '@/types/games/blackjack/game';
import { getCardValue } from './cardValue';

/**
 * Calculates the optimal value of a hand in blackjack
 * Aces are counted as 11 when beneficial, otherwise as 1
 * @param cards Array of cards in the hand
 * @returns The best possible hand value (closest to 21 without busting)
 */
export function calculateHandValue(cards: Card[]): number {
  if (cards.length === 0) {
    return 0;
  }

  // Count aces separately
  const aces = cards.filter(card => card.rank === 'A');
  const nonAces = cards.filter(card => card.rank !== 'A');

  // Calculate value of non-ace cards
  let value = nonAces.reduce((sum, card) => sum + getCardValue(card), 0);

  // Add aces optimally - count as many as possible as 11 without busting
  let acesAs11 = 0;
  for (const ace of aces) {
    // Check if we can add this ace as 11 without busting
    // We need to consider that remaining aces will be 1s
    const remainingAces = aces.length - acesAs11 - 1;
    if (value + getCardValue(ace) + remainingAces <= 21) {
      value += getCardValue(ace);
      acesAs11++;
    } else {
      value += 1; // Ace as 1
    }
  }

  return value;
}

/**
 * Checks if a hand is a blackjack (21 with exactly 2 cards)
 * @param cards Array of cards in the hand
 * @returns True if the hand is a blackjack
 */
export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandValue(cards) === 21;
}

/**
 * Checks if a hand is busted (over 21)
 * @param cards Array of cards in the hand
 * @returns True if the hand is busted
 */
export function isBusted(cards: Card[]): boolean {
  return calculateHandValue(cards) > 21;
}

/**
 * Checks if a hand is a soft hand (contains an ace counted as 11)
 * @param cards Array of cards in the hand
 * @returns True if the hand is soft
 */
export function isSoftHand(cards: Card[]): boolean {
  if (cards.length === 0) {
    return false;
  }

  const aces = cards.filter(card => card.rank === 'A');
  if (aces.length === 0) {
    return false;
  }

  const nonAces = cards.filter(card => card.rank !== 'A');
  const nonAceValue = nonAces.reduce((sum, card) => sum + getCardValue(card), 0);

  // Check if we can count at least one ace as 11 without busting
  return nonAceValue + 11 + (aces.length - 1) <= 21;
}

/**
 * Gets all possible hand values (useful for debugging or advanced strategies)
 * @param cards Array of cards in the hand
 * @returns Array of all possible hand values
 */
export function getAllHandValues(cards: Card[]): number[] {
  if (cards.length === 0) {
    return [0];
  }

  const aces = cards.filter(card => card.rank === 'A');
  const nonAces = cards.filter(card => card.rank !== 'A');
  const nonAceValue = nonAces.reduce((sum, card) => sum + getCardValue(card), 0);

  if (aces.length === 0) {
    return [nonAceValue];
  }

  // Generate all possible combinations of ace values
  const combinations: number[] = [];
  const aceCount = aces.length;

  // Each ace can be 1 or 11, so we have 2^aceCount combinations
  for (let i = 0; i < Math.pow(2, aceCount); i++) {
    let value = nonAceValue;
    // let acesAs11 = 0; // TODO: May be used for debugging/tracking ace values

    // Count how many aces should be 11 based on binary representation
    for (let j = 0; j < aceCount; j++) {
      if (i & (1 << j)) {
        // acesAs11++; // TODO: Track aces valued as 11
        value += 11;
      } else {
        value += 1;
      }
    }

    combinations.push(value);
  }

  // Remove duplicates and sort
  return [...new Set(combinations)].sort((a, b) => a - b);
}

/**
 * Gets the low and high values for a hand with an Ace
 * Low value: all aces counted as 1
 * High value: at least one ace counted as 11 (if possible without busting)
 * @param cards Array of cards in the hand
 * @returns Object with low and high values, or null if hand has no aces or is busted
 */
export function getHandValueRange(cards: Card[]): { low: number; high: number } | null {
  if (cards.length === 0) {
    return null;
  }

  const aces = cards.filter(card => card.rank === 'A');
  if (aces.length === 0) {
    return null; // No aces, no range to show
  }

  const nonAces = cards.filter(card => card.rank !== 'A');
  const nonAceValue = nonAces.reduce((sum, card) => sum + getCardValue(card), 0);

  // Low value: all aces as 1
  const low = nonAceValue + aces.length;

  // High value: try to count at least one ace as 11
  // Check if we can count one ace as 11 without busting
  const high = nonAceValue + 11 + (aces.length - 1);

  // If high value would bust, return null (just show the low value)
  if (high > 21) {
    return null;
  }

  return { low, high };
}
