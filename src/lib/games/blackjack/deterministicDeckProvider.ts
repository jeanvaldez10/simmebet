/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Remove eslint-disable when implementing full dealer service
import { Card } from "@/types/games/blackjack/game";
import { DeckProvider } from "./gameStateService";
import { DealerService } from "./dealer-service";

/**
 * Deterministic deck provider that uses the DealerService for consistent card dealing
 *
 * This provider ensures that cards are dealt in the exact same order every time
 * by using the deterministic shuffle algorithm with the shuffleId and shuffleSalt.
 */
export class DeterministicDeckProvider implements DeckProvider {
  private dealtCardCount: number = 0;

  dealCard(
    deck: Card[],
    shuffleId?: string,
    shuffleSalt?: string,
    _dealtCards?: Card[]
  ): { card: Card; newDeck: Card[] } {
    if (!shuffleId) {
      throw new Error("shuffleId is required for deterministic deck provider");
    }

    // The DeterministicDeckProvider should use the dealtCardCount from the game state
    // The _dealtCards parameter is used by other deck providers but not this one
    // We rely on the dealtCardCount which is passed as the deck parameter length
    const cardIndex = deck.length; // The deck parameter contains the dealtCardCount

    // Get the card from the deterministic deck
    const card = DealerService.getCard(shuffleId, cardIndex, shuffleSalt);

    // For the newDeck, we don't need to track the actual deck state
    // since we're using deterministic shuffle. We just return an empty array
    // to indicate that the deck state is managed by the shuffleId/salt
    const newDeck: Card[] = [];

    return { card, newDeck };
  }

  /**
   * Reset the dealt card count (useful for testing or new games)
   */
  reset(): void {
    this.dealtCardCount = 0;
  }

  /**
   * Get the current dealt card count
   */
  getDealtCardCount(): number {
    return this.dealtCardCount;
  }
}
