import { Card } from '@/types/games/blackjack/game';
import { DeckProvider } from './gameStateService';

/**
 * Test deck provider that uses a preconfigured deck for deterministic testing
 */
export class TestDeckProvider implements DeckProvider {
  private preconfiguredDeck: Card[];
  private currentIndex: number = 0;

  constructor(preconfiguredDeck: Card[]) {
    this.preconfiguredDeck = [...preconfiguredDeck];
  }

  /**
   * Deal a card from the preconfigured deck
   */
  dealCard(deck: Card[], shuffleId?: string, shuffleSalt?: string, dealtCards?: Card[]): { card: Card; newDeck: Card[] } {
    // The TestDeckProvider should use the current index, not the dealtCards length
    // The dealtCards parameter is used by other deck providers but not this one
    // We rely on the currentIndex which is managed internally

    console.log('TestDeckProvider.dealCard called with:', {
      currentIndex: this.currentIndex,
      deckLength: deck?.length || 0,
      shuffleId,
      shuffleSalt,
      preconfiguredDeckLength: this.preconfiguredDeck.length,
      dealtCardsLength: dealtCards?.length || 0
    });

    if (this.currentIndex >= this.preconfiguredDeck.length) {
      throw new Error('No more cards in preconfigured deck');
    }

    const card = this.preconfiguredDeck[this.currentIndex];
    this.currentIndex++;

    // Always return the remaining cards from the preconfigured deck
    const newDeck = this.preconfiguredDeck.slice(this.currentIndex);

    console.log('TestDeckProvider.dealCard returning:', {
      card,
      newDeckLength: newDeck.length,
      nextCard: newDeck[0]
    });

    return { card, newDeck };
  }

  /**
   * Reset the deck to the beginning
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * Get the current position in the deck
   */
  getCurrentPosition(): number {
    return this.currentIndex;
  }

  /**
   * Get the remaining cards in the deck
   */
  getRemainingCards(): Card[] {
    return this.preconfiguredDeck.slice(this.currentIndex);
  }
}

/**
 * Create a test deck provider with a specific scenario
 */
export function createTestDeckProvider(scenario: 'blackjack' | 'bust' | 'win' | 'push' | 'split'): TestDeckProvider {
  let deck: Card[] = [];

  switch (scenario) {
    case 'blackjack':
      // Player gets A, K (blackjack), Dealer gets 10, 6 (no blackjack)
      deck = [
        { suit: 'hearts', rank: 'A', isHidden: false }, // Player first card
        { suit: 'hearts', rank: '10', isHidden: false }, // Dealer first card
        { suit: 'hearts', rank: 'K', isHidden: false }, // Player second card (blackjack)
        { suit: 'hearts', rank: '6', isHidden: false }, // Dealer second card
        // Add extra cards in case dealer needs to hit
        { suit: 'hearts', rank: '5', isHidden: false },
        { suit: 'hearts', rank: '4', isHidden: false },
        { suit: 'hearts', rank: '3', isHidden: false },
        { suit: 'hearts', rank: '2', isHidden: false },
      ];
      break;

    case 'bust':
      // Player gets 10, 6, 8 (bust), Dealer gets 9, 7 (17)
      deck = [
        { suit: 'hearts', rank: '10', isHidden: false }, // Player first card
        { suit: 'hearts', rank: '9', isHidden: false }, // Dealer first card
        { suit: 'hearts', rank: '6', isHidden: false }, // Player second card
        { suit: 'hearts', rank: '7', isHidden: false }, // Dealer second card
        { suit: 'hearts', rank: '8', isHidden: false }, // Player third card (bust)
      ];
      break;

    case 'win':
      // Player gets 10, 7 (17), Dealer gets 9, 6, 3 (18) - but dealer busts
      deck = [
        { suit: 'hearts', rank: '10', isHidden: false }, // Player first card
        { suit: 'hearts', rank: '9', isHidden: false }, // Dealer first card
        { suit: 'hearts', rank: '7', isHidden: false }, // Player second card
        { suit: 'hearts', rank: '6', isHidden: false }, // Dealer second card
        { suit: 'hearts', rank: '3', isHidden: false }, // Dealer third card (bust)
      ];
      break;

    case 'push':
      // Both player and dealer get 17
      deck = [
        { suit: 'hearts', rank: '10', isHidden: false }, // Player first card
        { suit: 'hearts', rank: '9', isHidden: false }, // Dealer first card
        { suit: 'hearts', rank: '7', isHidden: false }, // Player second card
        { suit: 'hearts', rank: '8', isHidden: false }, // Dealer second card
      ];
      break;

    case 'split':
      // Player gets 8, 8 (can split), Dealer gets 10, 6
      deck = [
        { suit: 'hearts', rank: '8', isHidden: false }, // Player first card
        { suit: 'hearts', rank: '10', isHidden: false }, // Dealer first card
        { suit: 'hearts', rank: '8', isHidden: false }, // Player second card (same as first)
        { suit: 'hearts', rank: '6', isHidden: false }, // Dealer second card
        { suit: 'hearts', rank: '5', isHidden: false }, // First split hand card
        { suit: 'hearts', rank: '4', isHidden: false }, // Second split hand card
        { suit: 'hearts', rank: '3', isHidden: false }, // Dealer third card
      ];
      break;

    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }

  return new TestDeckProvider(deck);
}

/**
 * Create a custom test deck provider with specific cards
 */
export function createCustomTestDeckProvider(cards: Card[]): TestDeckProvider {
  return new TestDeckProvider(cards);
}
