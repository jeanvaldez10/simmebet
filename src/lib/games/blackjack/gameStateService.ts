/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Implement cryptographic shuffle and remove eslint-disable
import { Card } from "@/types/games/blackjack/game";

export const STANDARD_SUITS: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
export const STANDARD_RANKS: Card["rank"][] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",  
  "10",
  "J",
  "Q",
  "K",
];

export interface DeckProvider {
  dealCard(
    deck: Card[],
    shuffleId?: string,
    shuffleSalt?: string,
    dealtCards?: Card[]
  ): { card: Card; newDeck: Card[] };
}

export class StandardDeckProvider implements DeckProvider {
  private createStandardDeck(): Card[] {
    const suits = STANDARD_SUITS;
    const ranks = STANDARD_RANKS;
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          isHidden: false,
        });
      }
    }

    return deck;
  }

  private shuffleDeck(
    deck: Card[],
    _shuffleId: string,
    _shuffleSalt?: string
  ): Card[] {
    // For now, use a simple shuffle algorithm
    // TODO: Use _shuffleId and _shuffleSalt for cryptographic shuffling
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  dealCard(
    deck: Card[],
    shuffleId?: string,
    shuffleSalt?: string,
    _dealtCards?: Card[]
  ): { card: Card; newDeck: Card[] } {
    // If no deck provided, create a new shuffled deck
    // _dealtCards parameter may be used by other implementations
    if (!deck || deck.length === 0) {
      const newDeck = this.shuffleDeck(
        this.createStandardDeck(),
        shuffleId || "default",
        shuffleSalt
      );
      const card = newDeck.pop()!;
      return { card, newDeck };
    }

    // If deck is empty, reshuffle
    if (deck.length === 0) {
      const newDeck = this.shuffleDeck(
        this.createStandardDeck(),
        shuffleId || "default",
        shuffleSalt
      );
      const card = newDeck.pop()!;
      return { card, newDeck };
    }

    // Deal from existing deck
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    return { card, newDeck };
  }
}
