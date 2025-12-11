import { Card } from '@/types/games/blackjack/game';
import { createShuffledDeck } from '@/utils/games/blackjack';

/**
 * Dealer service for dealing cards from a deterministically shuffled deck
 * 
 * This service provides a secure way to deal cards by:
 * 1. Taking a shuffleId (hash) and card index
 * 2. Using deterministic shuffle to recreate the exact deck state
 * 3. Returning the card at the specified index
 * 
 * This ensures that cards are dealt in a verifiable, deterministic order
 * while keeping the deck state secure on the server side.
 */
export class DealerService {
  /**
   * Get a card from the deck at a specific index
   * 
   * @param shuffleId - The unique identifier for the shuffle
   * @param cardIndex - The index of the card to retrieve (0-based)
   * @param salt - Optional salt for the shuffle (if not provided, will use stored or default salt)
   * @returns The card at the specified index
   * @throws Error if cardIndex is out of bounds
   */
  static getCard(shuffleId: string, cardIndex: number, salt?: string): Card {
    // Validate card index
    if (isNaN(cardIndex) || cardIndex < 0) {
      throw new Error('Card index must be a non-negative number');
    }

    // Create the shuffled deck using the deterministic shuffle
    const shuffledDeck = createShuffledDeck(shuffleId, salt);

    // Check if the requested index is within bounds
    if (cardIndex >= shuffledDeck.length) {
      throw new Error(`Card index ${cardIndex} is out of bounds. Deck has ${shuffledDeck.length} cards.`);
    }

    // Return the card at the specified index
    return shuffledDeck[cardIndex];
  }

  /**
   * Get multiple cards from the deck starting at a specific index
   * 
   * @param shuffleId - The unique identifier for the shuffle
   * @param startIndex - The starting index of the cards to retrieve (0-based)
   * @param count - The number of cards to retrieve
   * @param salt - Optional salt for the shuffle
   * @returns Array of cards starting at the specified index
   * @throws Error if any card index is out of bounds
   */
  static getCards(shuffleId: string, startIndex: number, count: number, salt?: string): Card[] {
    // Validate parameters
    if (isNaN(startIndex) || startIndex < 0) {
      throw new Error('Start index must be a non-negative number');
    }
    if (isNaN(count) || count <= 0) {
      throw new Error('Count must be a positive number');
    }

    // Create the shuffled deck using the deterministic shuffle
    const shuffledDeck = createShuffledDeck(shuffleId, salt);

    // Check if the requested range is within bounds
    const endIndex = startIndex + count - 1;
    if (endIndex >= shuffledDeck.length) {
      throw new Error(`Card range ${startIndex}-${endIndex} is out of bounds. Deck has ${shuffledDeck.length} cards.`);
    }

    // Return the cards in the specified range
    return shuffledDeck.slice(startIndex, startIndex + count);
  }

  /**
   * Get the total number of cards in the deck
   * 
   * @param shuffleId - The unique identifier for the shuffle
   * @param salt - Optional salt for the shuffle
   * @returns The total number of cards in the deck (always 52 for a standard deck)
   */
  static getDeckSize(shuffleId: string, salt?: string): number {
    const shuffledDeck = createShuffledDeck(shuffleId, salt);
    return shuffledDeck.length;
  }

  /**
   * Check if a card index is valid for the given shuffle
   * 
   * @param shuffleId - The unique identifier for the shuffle
   * @param cardIndex - The index to check
   * @param salt - Optional salt for the shuffle
   * @returns True if the index is valid, false otherwise
   */
  static isValidCardIndex(shuffleId: string, cardIndex: number, salt?: string): boolean {
    try {
      if (isNaN(cardIndex)) {
        return false;
      }
      const deckSize = this.getDeckSize(shuffleId, salt);
      return cardIndex >= 0 && cardIndex < deckSize;
    } catch {
      return false;
    }
  }

  /**
   * Get a card with validation and error handling
   * 
   * @param shuffleId - The unique identifier for the shuffle
   * @param cardIndex - The index of the card to retrieve (0-based)
   * @param salt - Optional salt for the shuffle
   * @returns Object with success status, card (if successful), and error message (if failed)
   */
  static getCardSafe(shuffleId: string, cardIndex: number, salt?: string): {
    success: boolean;
    card?: Card;
    error?: string;
  } {
    try {
      const card = this.getCard(shuffleId, cardIndex, salt);
      return { success: true, card };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
