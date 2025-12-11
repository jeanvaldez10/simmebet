# Side Bet Implementation Summary

## Overview
Complete implementation of 21+3 and Perfect Pairs side bets for the blackjack game, following the specification in `BLACKJACK_SIDEPOTS.md`.

## Implementation Details

### 1. Side Bet Evaluation Logic (`src/utils/games/blackjack/sideBetEvaluation.ts`)

#### 21+3 Side Bet
- **Inputs**: Player's first two cards + Dealer's upcard
- **Winning Hands** (ranked highest to lowest):
  - Straight Flush (40:1) - Three consecutive ranks, all same suit
  - Three of a Kind (30:1) - All three cards same rank
  - Straight (10:1) - Three consecutive ranks, mixed suits
  - Flush (5:1) - All three cards same suit
- **Special Rules**:
  - Ace can be high (Q-K-A) or low (A-2-3)
  - No wraparound straights (K-A-2 invalid)

#### Perfect Pairs Side Bet
- **Inputs**: Player's first two cards only
- **Winning Outcomes** (ranked highest to lowest):
  - Perfect Pair (25:1) - Same rank, same suit
  - Colored Pair (12:1) - Same rank, same color (red/red or black/black), different suits
  - Mixed Pair (6:1) - Same rank, different colors

### 2. State Machine Integration (`src/lib/games/blackjack/stateMachine.ts`)

#### Evaluation Timing
- Side bets are evaluated **immediately after the initial deal** in `handleInitializeGameStateEffect`
- Evaluation happens before any player actions
- Results are stored in `gameState.sidebetResults`

#### Balance Management
- Side bets are deducted from balance when `START_ROUND` is called (along with main bet)
- Side bet winnings are added to balance via `SIDEBET_EVALUATION` effect
- Total wagered includes both main bet and side bets

#### Effect System
- New effect type: `SIDEBET_EVALUATION`
- Processes side bet results and creates balance change effects for winners
- Balance increases are handled automatically by the balance service

### 3. UI Components

#### SideBetWinModal (`src/components/games/blackjack/modals/SideBetWinModal.tsx`)
- **Purpose**: Reveals side bet wins immediately after initial deal
- **Features**:
  - Shows winning side bet type (e.g., "Perfect Pair (25:1)")
  - Displays bet amount and profit for each winning side bet
  - Shows total winnings across all side bets
  - Auto-closes after 3 seconds
  - Plays win sound effect
  - Styled with green/yellow theme matching game aesthetic

#### Integration
- Modal is integrated into `GameModals` component
- Automatically appears when:
  - Side bet results are available
  - Game phase is `PLAYING` or `ASK_INSURANCE` (after initial deal)
  - At least one side bet has won

### 4. Payout Constants (`src/utils/games/blackjack/gameConstants.ts`)

Added `SIDEBET_PAYOUTS` constant matching the specification:
```typescript
SIDEBET_PAYOUTS = {
  "21+3": {
    STRAIGHT_FLUSH: 40,
    THREE_OF_A_KIND: 30,
    STRAIGHT: 10,
    FLUSH: 5,
  },
  PAIR: {
    PERFECT_PAIR: 25,
    COLORED_PAIR: 12,
    MIXED_PAIR: 6,
  },
}
```

### 5. Game State Updates

#### Side Bet Fields
- `pairBet`: Amount bet on Perfect Pairs
- `twentyOnePlusThreeBet`: Amount bet on 21+3
- `sidebetResults`: Array of side bet evaluation results

#### Profit Calculation
- Side bet winnings are included in `totalWon`
- `gameProfit` includes both main bet and side bet net profit/loss
- Final game resolution includes side bet winnings in total calculations

## User Experience Flow

1. **Betting Phase**: User places chips in main pot and/or side pots
2. **Initial Deal**: Cards are dealt (2 player cards, 1 dealer upcard + 1 hidden)
3. **Side Bet Evaluation**: Happens immediately after deal
4. **Win Reveal**: If side bets win, `SideBetWinModal` appears showing:
   - Which side bet(s) won
   - Win type (e.g., "Perfect Pair", "Straight Flush")
   - Payout multiplier
   - Total winnings
5. **Balance Update**: Winnings are automatically added to balance
6. **Game Continues**: Main game proceeds normally

## Key Features

✅ **Immediate Evaluation**: Side bets evaluated right after initial deal
✅ **Instant Feedback**: Modal appears immediately when side bets win
✅ **Accurate Payouts**: All payouts match specification exactly
✅ **Balance Integration**: Automatic balance updates for wins
✅ **Visual Feedback**: Clear display of win types and amounts
✅ **Sound Effects**: Win sound plays when side bets win

## Testing Considerations

- Test all 21+3 winning combinations (Straight Flush, Three of a Kind, Straight, Flush)
- Test all Perfect Pairs winning combinations (Perfect, Colored, Mixed)
- Test losing side bets (no modal should appear)
- Test multiple side bets winning simultaneously
- Test side bets with main bet wins/losses
- Verify balance updates correctly
- Verify modal appears at correct timing (after initial deal, before player actions)

