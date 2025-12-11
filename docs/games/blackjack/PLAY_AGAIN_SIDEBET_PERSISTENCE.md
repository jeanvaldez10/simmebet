# Play Again Side Bet Persistence

## Overview
When a player clicks "Play Again" after completing a hand, the system now correctly restores **all previous bets**, including side bets that were won or lost. This ensures a consistent betting experience where players can quickly replay with the same bet configuration.

## Problem
Previously, when side bets were lost, they were cleared immediately from the game state (set to 0) to trigger the chip fade-out animation. However, when "Play Again" was clicked, it tried to preserve the current bet amounts, which were already cleared to 0. This meant side bets would not reappear on the board for the next hand.

## Solution
We implemented a **dual-state system** for side bets:
1. **Current bets** (`pairBet`, `twentyOnePlusThreeBet`) - Used for rendering and can be cleared for animations
2. **Original bets** (`originalPairBet`, `originalTwentyOnePlusThreeBet`) - Preserved throughout the game for "Play Again" functionality

### Implementation Details

#### 1. Type Updates (`src/types/games/blackjack/game.ts`)
Added new fields to both `GameState` and `FrontendGameState`:
```typescript
// Original side bet amounts (preserved for Play Again even when cleared)
originalPairBet: number;
originalTwentyOnePlusThreeBet: number;
```

#### 2. State Machine Updates (`src/lib/games/blackjack/stateMachine.ts`)

**A. Store Original Amounts Before Clearing (`initializeNewGame` method)**
```typescript
// Store original side bet amounts BEFORE clearing for Play Again functionality
const originalPairBet = gameState.pairBet;
const originalTwentyOnePlusThreeBet = gameState.twentyOnePlusThreeBet;

// Clear losing side bet amounts immediately after evaluation
// This ensures losing bets are visually removed but preserved for Play Again
let clearedPairBet = gameState.pairBet;
// ... (clearing logic for losing bets)

// Update game state with both current (cleared) and original amounts
updatedGameState = {
  ...gameState,
  pairBet: clearedPairBet,
  originalPairBet,
  originalTwentyOnePlusThreeBet,
};
```

**B. Restore from Original Amounts (`processPlayAgain` method)**
```typescript
// Use ORIGINAL bet amounts to restore side bets (even if they were cleared after loss)
const preservedPairBet = gameState.originalPairBet || 0;
const preserved21Plus3Bet = gameState.originalTwentyOnePlusThreeBet || 0;

// Reset to initial betting state but preserve bets
const newGameState: GameState = {
  ...gameState,
  gamePhase: GameStatePhaseType.BETTING,
  pairBet: preservedPairBet,
  twentyOnePlusThreeBet: preserved21Plus3Bet,
  // Preserve original amounts for next Play Again
  originalPairBet: preservedPairBet,
  originalTwentyOnePlusThreeBet: preserved21Plus3Bet,
  sidebetResults: [],
  // ... (other reset fields)
};
```

**C. Initialize Original Fields (`processResetGame` method)**
```typescript
// Reset all bets including original amounts
pairBet: 0,
twentyOnePlusThreeBet: 0,
originalPairBet: 0,
originalTwentyOnePlusThreeBet: 0,
```

#### 3. Game Service Updates (`src/lib/games/blackjack/authenticatedGameStateService.ts`)
Initialize original bet fields when creating a new game:
```typescript
const gameState: GameState = {
  // ... (other fields)
  pairBet: 0,
  twentyOnePlusThreeBet: 0,
  sidebetResults: [],
  originalPairBet: 0,
  originalTwentyOnePlusThreeBet: 0,
  // ... (other fields)
};
```

#### 4. Frontend Component (`src/components/games/blackjack/extras/SideBet.tsx`)
The SideBet component already had proper reset logic that works with this system:
```typescript
useEffect(() => {
  const isNewGame = previousGameIdRef.current !== gameState.gameId;
  const isBettingPhase = gameState.gamePhase === GamePhaseType.BETTING;

  if (isNewGame && isBettingPhase) {
    setSelectedSection('main');
    onSelectedSectionChange?.('main');
    previousGameIdRef.current = gameState.gameId;
    // Reset animation states for new game
    setPairBetAnimateOut(false);
    setTwentyOnePlus3AnimateOut(false);
    setShouldShowPairChips(true);        // ✅ Chips will show again
    setShouldShow21Plus3Chips(true);      // ✅ Chips will show again
    // Reset winning states
    setPairWinningChips([]);
    setTwentyOnePlus3WinningChips([]);
    setShowPairWinnings(false);
    setShow21Plus3Winnings(false);
    previousSidebetResultsRef.current = [];
  }
}, [gameState.gameId, gameState.gamePhase, onSelectedSectionChange]);
```

## User Flow

### Scenario 1: Side Bet Lost, Then Play Again
1. Player places main bet ($100) and side bets (Pair: $10, 21+3: $10)
2. Cards are dealt - side bets lose
3. Side bet chips fade out and disappear from the board
4. `pairBet` = 0, but `originalPairBet` = 10
5. Player finishes hand and clicks "Play Again"
6. Game restores from original amounts: `pairBet` = 10, chips reappear
7. BetInfoDisplay shows correct amounts
8. Player can immediately click "Start Round" with same bets

### Scenario 2: Side Bet Won, Then Play Again
1. Player places main bet ($100) and side bets (Pair: $10, 21+3: $10)
2. Cards are dealt - 21+3 wins ($50 payout)
3. Winning chips animate in on top of original bet
4. `twentyOnePlusThreeBet` = 10, `originalTwentyOnePlusThreeBet` = 10
5. Player finishes hand and clicks "Play Again"
6. Game restores from original amounts: `twentyOnePlusThreeBet` = 10
7. Chips reappear for next round

### Scenario 3: Mixed Results, Then Play Again
1. Player places main bet ($100) and side bets (Pair: $10, 21+3: $10)
2. Cards are dealt - Pair loses, 21+3 wins
3. Pair chips fade out, 21+3 winning chips animate in
4. `pairBet` = 0, `twentyOnePlusThreeBet` = 10
5. `originalPairBet` = 10, `originalTwentyOnePlusThreeBet` = 10
6. Player clicks "Play Again"
7. **Both side bets** reappear with original amounts ($10 each)

## Visual Confirmation

### UI Elements That Reflect Restored Bets:
1. **Chip Stacks on Side Bet Areas** - Chips reappear on both Pair and 21+3 areas
2. **BetInfoDisplay** (bottom right) - Shows correct amounts:
   ```
   MAIN: $100
   PAIR: $10
   21+3: $10
   ```
3. **Side Bet Containers** - Chips are highlighted and interactive again
4. **Game Message** - Shows total bet amount including side bets

## Benefits
- ✅ **Consistent UX**: Players can quickly replay with the same betting strategy
- ✅ **Visual Clarity**: Chips animate out when lost but come back for next hand
- ✅ **Correct Calculations**: All totals, profits, and losses are accurate
- ✅ **Animation Support**: Fade-out animations work while preserving bet history
- ✅ **Data Integrity**: Original bet amounts are never lost during gameplay

## Related Documentation
- [Blackjack Side Bets Specification](./BLACKJACK_SIDEPOTS.md)
- [Side Bet Win Notification System](./SIDEBET_WIN_NOTIFICATION.md)
- [Play Again Action Validation](./PLAY_AGAIN_ACTION_FIX.md)

