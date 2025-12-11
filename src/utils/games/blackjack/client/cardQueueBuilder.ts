import { Card } from "@/types/games/blackjack/game";
import type { CardPosition } from "./cardAnimationManager";

/**
 * Build the queue of cards to register in correct dealing order
 * Following standard Blackjack dealing sequence:
 * 1. Initial deal: Player[0] → Dealer[0] → Player[1] → Dealer[1]
 * 2. Additional cards per hand (hand 0, then hand 1, etc.)
 * 3. Dealer additional cards
 */
export function buildCardQueue(
  playerHands: Card[][],
  dealerCards: Card[]
): Array<{ position: CardPosition; card: Card }> {
  const queue: Array<{ position: CardPosition; card: Card }> = [];
  const firstPlayerHand = playerHands[0] || [];

  // Initial deal: Player[0] → Dealer[0] → Player[1] → Dealer[1]
  if (firstPlayerHand.length > 0) {
    queue.push({
      position: { type: "player", handIndex: 0, cardIndex: 0 },
      card: firstPlayerHand[0],
    });
  }

  if (dealerCards.length > 0) {
    queue.push({
      position: { type: "dealer", handIndex: 0, cardIndex: 0 },
      card: dealerCards[0],
    });
  }

  if (firstPlayerHand.length > 1) {
    queue.push({
      position: { type: "player", handIndex: 0, cardIndex: 1 },
      card: firstPlayerHand[1],
    });
  }

  if (dealerCards.length > 1) {
    queue.push({
      position: { type: "dealer", handIndex: 0, cardIndex: 1 },
      card: dealerCards[1],
    });
  }

  // After initial deal: Process each hand in order
  // Deal all cards to hand 0, then all cards to hand 1, etc.
  for (let handIndex = 0; handIndex < playerHands.length; handIndex++) {
    const hand = playerHands[handIndex] || [];
    for (let cardIndex = 0; cardIndex < hand.length; cardIndex++) {
      queue.push({
        position: { type: "player", handIndex, cardIndex },
        card: hand[cardIndex],
      });
    }
  }

  // Then check dealer cards (after initial 2)
  for (let cardIndex = 2; cardIndex < dealerCards.length; cardIndex++) {
    queue.push({
      position: { type: "dealer", handIndex: 0, cardIndex },
      card: dealerCards[cardIndex],
    });
  }

  return queue;
}

