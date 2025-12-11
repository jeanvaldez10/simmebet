/**
 * Rules Data for Blackjack Game Rules Modal
 *
 * Contains the structured data for displaying game rules, side bet payouts,
 * and game mechanics in the RulesModal component.
 */

import { SIDEBET_PAYOUTS } from './sideBetEvaluation';

export interface PayoutCardData {
  handName: string;
  payout: number;
  description: string;
}

export interface RuleCardData {
  title: string;
  description: string;
}

export interface RuleSection {
  title: string;
  description: string;
  type: 'payout' | 'rule';
  items: PayoutCardData[] | RuleCardData[];
}

export const RULES_DATA: RuleSection[] = [
  {
    title: '21+3 Side Bet',
    description:
      "Uses your first two cards + dealer's upcard to form a 3-card poker hand",
    type: 'payout',
    items: [
      {
        handName: 'Straight Flush',
        payout: SIDEBET_PAYOUTS['21+3'].STRAIGHT_FLUSH,
        description: 'Three consecutive ranks, all same suit',
      },
      {
        handName: 'Three of a Kind',
        payout: SIDEBET_PAYOUTS['21+3'].THREE_OF_A_KIND,
        description: 'All three cards same rank',
      },
      {
        handName: 'Straight',
        payout: SIDEBET_PAYOUTS['21+3'].STRAIGHT,
        description:
          'Three consecutive ranks, mixed suits (Ace can be high or low)',
      },
      {
        handName: 'Flush',
        payout: SIDEBET_PAYOUTS['21+3'].FLUSH,
        description: 'All three cards same suit',
      },
    ] as PayoutCardData[],
  },
  {
    title: 'Perfect Pairs Side Bet',
    description: 'Uses only your first two cards',
    type: 'payout',
    items: [
      {
        handName: 'Perfect Pair',
        payout: SIDEBET_PAYOUTS.PAIR.PERFECT_PAIR,
        description: 'Same rank, same suit',
      },
      {
        handName: 'Colored Pair',
        payout: SIDEBET_PAYOUTS.PAIR.COLORED_PAIR,
        description:
          'Same rank, same color (red/red or black/black), different suits',
      },
      {
        handName: 'Mixed Pair',
        payout: SIDEBET_PAYOUTS.PAIR.MIXED_PAIR,
        description: 'Same rank, different colors',
      },
    ] as PayoutCardData[],
  },
  {
    title: 'Surrender Rules',
    description:
      'Fold a weak hand before drawing new cards and recoup half your bet. The dealer keeps the remaining 50%.',
    type: 'rule',
    items: [
      {
        title: 'How It Works',
        description:
          'When you surrender, you forfeit your hand immediately and receive 50% of your bet back. The other 50% goes to the dealer.',
      },
      {
        title: 'When to Use',
        description:
          'Surrender is best used when you have a weak hand with low winning probability, typically hard 16 vs dealer 9/10/Ace or hard 15 vs dealer 10.',
      },
      {
        title: 'Strategic Advantage',
        description:
          'Surrendering minimizes losses on unfavorable hands. Better to lose half your bet than risk losing the entire amount.',
      },
    ] as RuleCardData[],
  },
  {
    title: 'Split Rules',
    description:
      'When you receive two cards of the same rank, you can split them into two separate hands',
    type: 'rule',
    items: [
      {
        title: 'How Splitting Works',
        description:
          'Split your pair into two hands by placing an additional bet equal to your original bet. Each hand is played independently.',
      },
      {
        title: 'Split Limits',
        description:
          'You can split up to 4 hands in a single round. After splitting, you can hit, stand, or double down on each hand normally.',
      },
      {
        title: 'Splitting Aces',
        description:
          'When you split Aces, you receive only one additional card per Ace. If you get a 10-value card, it counts as 21, not blackjack.',
      },
      {
        title: 'Best Pairs to Split',
        description:
          "Always split Aces and 8s. Never split 10s or 5s. Other pairs depend on the dealer's upcard.",
      },
    ] as RuleCardData[],
  },
  {
    title: 'Insurance Rules',
    description:
      'When the dealer shows an Ace, you can protect your bet by taking insurance against dealer blackjack.',
    type: 'rule',
    items: [
      {
        title: 'When Insurance is Offered',
        description:
          "Insurance is available when the dealer's upcard is an Ace. A Yes/No modal will appear asking if you want to take insurance.",
      },
      {
        title: 'Insurance Bet Amount',
        description:
          'If you choose Yes, you place an insurance bet equal to 50% of your main bet. This amount is deducted from your balance immediately.',
      },
      {
        title: 'How Insurance Pays',
        description:
          'If the dealer has blackjack, insurance pays 2:1. Your main bet still loses unless you also have blackjack (then it pushes). If dealer does not have blackjack, the insurance bet is lost and play continues normally.',
      },
      {
        title: 'Visual Display',
        description:
          'Insurance is displayed like a sidepot with its own chip stack tied to your hand. Win/lose animations use the same chip system as sidepots.',
      },
    ] as RuleCardData[],
  },
];

