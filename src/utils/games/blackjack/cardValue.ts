import { Card } from '@/types/games/blackjack/game';
import { CARD_VALUES } from './gameConstants';

/**
 * Calculates the value of a single card in blackjack
 * @param card - The card to calculate value for
 * @returns The numeric value of the card
 */
export function getCardValue(card: Card): number {
  if (card.rank === 'A') {
    return CARD_VALUES.ACE.HIGH; // Default to 11, will be adjusted in hand calculation
  } else if (['K', 'Q', 'J'].includes(card.rank)) {
    return CARD_VALUES.FACE;
  } else if (card.rank === '?') {
    return 0; // Unknown card
  } else {
    return CARD_VALUES.NUMBER(parseInt(card.rank));
  }
}

/**
 * Calculates the value of a single card for display purposes
 * This is the same as getCardValue but with a more descriptive name
 * @param card - The card to calculate value for
 * @returns The numeric value of the card
 */
export function calculateCardValue(card: Card): number {
  return getCardValue(card);
}

/**
 * Gets the display value of a card (for UI purposes)
 * @param card - The card to get display value for
 * @returns The display value string
 */
export function getCardDisplayValue(card: Card): string {
  if (card.rank === 'A') {
    return 'A';
  } else if (['K', 'Q', 'J'].includes(card.rank)) {
    return card.rank;
  } else if (card.rank === '?') {
    return '?';
  } else {
    return card.rank;
  }
}
