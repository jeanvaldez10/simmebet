import {
  GameState,
  HandResult,
  HandResultType,
  Hand,
  FrontendDealerHand,
} from "@/types/games/blackjack/game";
import { PAYOUT_RATES } from "@/utils/games/blackjack";
import { calculateHandValue } from "@/utils/games/blackjack/handValue";

/**
 * Calculate hand results from player hands and dealer hand
 * This is the single source of truth for calculating hand results
 */
export function calculateHandResults(
  playerHands: Hand[],
  dealerHand: FrontendDealerHand,
  calculateHandValueFn: (cards: Hand["cards"]) => number = calculateHandValue
): {
  handResults: HandResult[];
  totalWinnings: number;
  overallResult: "WIN" | "LOSE" | "PUSH" | "BUST" | undefined;
} {
  const dealerValue = calculateHandValueFn(dealerHand.cards);
  const dealerBusted = dealerHand.isBusted;
  const dealerBlackjack = dealerHand.isBlackjack;

  const handResults: HandResult[] = [];
  let totalWinnings = 0;

  // Calculate results for each player hand
  for (let i = 0; i < playerHands.length; i++) {
    const hand = playerHands[i];
    const handValue = calculateHandValueFn(hand.cards);

    let handResult: HandResult;
    let winnings = 0;

    if (hand.isSurrendered) {
      // Surrender: refund half bet
      winnings = hand.bet * PAYOUT_RATES.SURRENDER;
      totalWinnings += winnings;
      handResult = {
        handIndex: i,
        bet: hand.bet,
        result: HandResultType.SURRENDER,
        payout: winnings,
        profit: winnings - hand.bet,
        timestamp: new Date().toISOString(),
      };
    } else if (hand.isBusted) {
      // Hand busted: lose bet
      handResult = {
        handIndex: i,
        bet: hand.bet,
        result: HandResultType.LOSE,
        payout: 0,
        profit: -hand.bet,
        timestamp: new Date().toISOString(),
      };
    } else if (dealerBlackjack) {
      // Dealer has blackjack
      if (hand.isBlackjack) {
        // Both dealer and player have blackjack: PUSH
        winnings = hand.bet;
        totalWinnings += winnings;
        handResult = {
          handIndex: i,
          bet: hand.bet,
          result: HandResultType.PUSH,
          payout: winnings,
          profit: 0,
          timestamp: new Date().toISOString(),
        };
      } else if (hand.isSurrendered) {
        // Surrendered against dealer blackjack: get half bet back
        const payout = hand.bet * PAYOUT_RATES.SURRENDER;
        totalWinnings += payout;
        handResult = {
          handIndex: i,
          bet: hand.bet,
          result: HandResultType.SURRENDER,
          payout,
          profit: payout - hand.bet,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Player doesn't have blackjack, dealer does: LOSE
        handResult = {
          handIndex: i,
          bet: hand.bet,
          result: HandResultType.LOSE,
          payout: 0,
          profit: -hand.bet,
          timestamp: new Date().toISOString(),
        };
      }
    } else if (dealerBusted) {
      // Dealer busted: win bet
      // Regular win pays 1:1 (bet + bet winnings)
      winnings = hand.bet * (1 + PAYOUT_RATES.WIN);
      totalWinnings += winnings;
      handResult = {
        handIndex: i,
        bet: hand.bet,
        result: HandResultType.WIN,
        payout: winnings,
        profit: winnings - hand.bet,
        timestamp: new Date().toISOString(),
      };
    } else if (handValue > dealerValue) {
      // Player wins
      if (hand.isBlackjack && !hand.isFromSplit) {
        // Natural blackjack (not from split) pays 3:2 (bet + 1.5x bet winnings)
        winnings = hand.bet * (1 + PAYOUT_RATES.BLACKJACK);
        totalWinnings += winnings;
        handResult = {
          handIndex: i,
          bet: hand.bet,
          result: HandResultType.BLACKJACK,
          payout: winnings,
          profit: winnings - hand.bet,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Regular win pays 1:1 (bet + bet winnings)
        // This includes split hands with 21 (blackjack from split pays 1:1, not 3:2)
        winnings = hand.bet * (1 + PAYOUT_RATES.WIN);
        totalWinnings += winnings;
        handResult = {
          handIndex: i,
          bet: hand.bet,
          result: HandResultType.WIN,
          payout: winnings,
          profit: winnings - hand.bet,
          timestamp: new Date().toISOString(),
        };
      }
    } else if (handValue === dealerValue) {
      // Push: return original bet
      winnings = hand.bet;
      totalWinnings += winnings;
      handResult = {
        handIndex: i,
        bet: hand.bet,
        result: HandResultType.PUSH,
        payout: winnings,
        profit: 0,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Dealer wins: lose bet
      handResult = {
        handIndex: i,
        bet: hand.bet,
        result: HandResultType.LOSE,
        payout: 0,
        profit: -hand.bet,
        timestamp: new Date().toISOString(),
      };
    }

    handResults.push(handResult);
  }

  // Calculate overall result
  const netWinnings =
    totalWinnings - playerHands.reduce((sum, hand) => sum + hand.bet, 0);
  let overallResult: "WIN" | "LOSE" | "PUSH" | "BUST" | undefined;

  if (dealerBlackjack) {
    // Check if any player hand also has blackjack
    const playerHasBlackjack = playerHands.some((hand) => hand.isBlackjack);
    if (playerHasBlackjack) {
      // Both have blackjack: PUSH
      overallResult = "PUSH";
    } else {
      // Only dealer has blackjack: LOSE
      overallResult = "LOSE";
    }
  } else if (netWinnings > 0) {
    // Check if any hand is blackjack for special outcome
    const hasBlackjack = playerHands.some((hand) => hand.isBlackjack);
    overallResult = hasBlackjack ? "WIN" : "WIN"; // Both map to WIN for overall result
  } else if (netWinnings === 0) {
    overallResult = "PUSH";
  } else {
    overallResult = "LOSE";
  }

  return {
    handResults,
    totalWinnings,
    overallResult,
  };
}

/**
 * Calculate hand results from a game state
 */
export function calculateHandResultsFromGameState(
  gameState: GameState,
  calculateHandValueFn?: (cards: Hand["cards"]) => number
): {
  handResults: HandResult[];
  totalWinnings: number;
  overallResult: "WIN" | "LOSE" | "PUSH" | "BUST" | undefined;
} {
  return calculateHandResults(
    gameState.playerHands,
    gameState.dealerHand,
    calculateHandValueFn
  );
}
