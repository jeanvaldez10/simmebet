# Blackjack Game Lifecycle and Persistence

**Last Updated**: November 17, 2025  
**Purpose**: Explain how blackjack games are created, persisted, and managed across multiple hands

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Game vs Hand](#game-vs-hand)
4. [Game Creation Flow](#game-creation-flow)
5. [Game Update Flow](#game-update-flow)
6. [Play Again Flow](#play-again-flow)
7. [Database Schema](#database-schema)
8. [State Transitions](#state-transitions)
9. [Code Architecture](#code-architecture)
10. [Examples](#examples)

---

## Overview

The blackjack system uses a **session-based architecture** where:

- **One game = One session** (potentially multiple hands/rounds)
- **One hand = One round of blackjack** (from betting to resolution)
- Games persist across page reloads
- Multiple hands update the same game record

This design optimizes database writes and maintains session continuity for players.

---

## Core Concepts

### Game (Session)

A **game** is a database record representing a player's blackjack session:

- Has a unique `gameId` (e.g., `game_1763417317013_user-id`)
- Tracks cumulative statistics across multiple hands
- Persists in the `blackjack_games` table
- Lives until marked as `FINISHED` and user reloads/starts new session

### Hand (Round)

A **hand** is a single round of blackjack within a session:

- Starts with betting phase
- Involves dealing cards, player decisions, dealer turn
- Ends with resolution (win/lose/push)
- Does NOT create a new database record
- Updates the existing game record

### Key Properties

```typescript
{
  gameId: "game_123",           // Same across all hands in session
  totalWagered: 60,             // Accumulates across hands
  totalWon: 70,                 // Accumulates across hands
  gameProfit: 10,               // Net profit: totalWon - totalWagered
  gamePhase: "FINISHED",        // Current phase of current hand
  initialBet: 20,               // Current hand's bet
  playerHands: [...],           // Current hand's cards
  dealerHand: {...}             // Current hand's dealer cards
}
```

---

## Game vs Hand

### Visual Comparison

```
┌────────────────────────────────────────────────────────────────┐
│                  ONE GAME SESSION (gameId: game_123)           │
│  Database Record: blackjack_games WHERE id = 'game_123'        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   HAND 1     │      │   HAND 2     │      │   HAND 3     │ │
│  ├──────────────┤      ├──────────────┤      ├──────────────┤ │
│  │ Bet: $20     │      │ Bet: $20     │      │ Bet: $20     │ │
│  │ Win: $40     │ PLAY │ Lose: $0     │ PLAY │ Win: $30     │ │
│  │ Phase: ✓     │ AGAIN│ Phase: ✓     │ AGAIN│ Phase: ✓     │ │
│  └──────────────┘  →   └──────────────┘  →   └──────────────┘ │
│                                                                │
│  UPDATES same record:     UPDATES same record:                │
│  totalWagered: 0→20       totalWagered: 20→40                 │
│  totalWon: 0→40           totalWon: 40→40                     │
│  gameProfit: +$20         gameProfit: +$0                     │
│                                                                │
│  Final Session Stats:                                         │
│  totalWagered: $60 | totalWon: $70 | gameProfit: +$10        │
└────────────────────────────────────────────────────────────────┘
```

### What Changes Between Hands

| Property         | Between Hands                  | Across Hands                 |
| ---------------- | ------------------------------ | ---------------------------- |
| `gameId`         | ❌ **Same**                    | ❌ **Same**                  |
| `shuffleId`      | ❌ **Same**                    | ❌ **Same**                  |
| `gamePhase`      | ✅ **Resets to BETTING**       | Changes per phase            |
| `playerHands`    | ✅ **Cleared**                 | Different each hand          |
| `dealerHand`     | ✅ **Cleared**                 | Different each hand          |
| `initialBet`     | ✅ **Preserved from previous** | Can change per hand          |
| `totalWagered`   | ❌ **Accumulates**             | Grows with each hand         |
| `totalWon`       | ❌ **Accumulates**             | Grows with each hand         |
| `gameProfit`     | ❌ **Accumulates**             | Net: totalWon - totalWagered |
| `sidebetResults` | ✅ **Cleared**                 | Evaluated per hand           |

---

## Game Creation Flow

### When is a New Game Created?

A new game (new database record) is created ONLY when:

1. **First visit** - No game exists for user
2. **After reload when previous game is FINISHED**
3. **Explicit "Start New Game" action**

### Creation Sequence

```typescript
// User visits blackjack page
┌─────────────────────────────────────────────────────────┐
│ 1. API: GET /api/games/blackjack/current               │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. authenticatedGameStateService.getOrCreateCurrentGame │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. getCurrentGame(userId)                               │
│    - Query database for most recent game                │
│    - Check if gamePhase === FINISHED                    │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼ Game exists           ▼ No game OR game.gamePhase === FINISHED
┌───────────────┐        ┌──────────────────────────────┐
│ Return game   │        │ 4. createGame(userId)         │
└───────────────┘        │    - Generate new gameId      │
                         │    - Set initial state        │
                         │    - Save to database         │
                         └──────────────────────────────┘
```

### Code: createGame()

**File**: `src/lib/games/blackjack/authenticatedGameStateService.ts` (Lines 58-147)

```typescript
async createGame(userId: string): Promise<GameState> {
  // Get user's balance
  const currentBalance = await balanceService.getUserBalance(userId);

  // Generate unique IDs
  const gameId = `game_${Date.now()}_${userId}`;
  const shuffleId = `shuffle_${Date.now()}`;

  // Create initial game state
  const gameState: GameState = {
    gameId,
    userId,
    shuffleId,
    shuffleSalt: "test-salt",
    dealtCardCount: 0,
    playerHands: [],
    dealerHand: { cards: [], ... },
    balance: currentBalance,
    pendingBet: 0,
    initialBet: 0,
    gamePhase: GameStatePhaseType.BETTING,  // Start in betting phase
    totalWagered: 0,                        // No bets yet
    totalWon: 0,                            // No wins yet
    gameProfit: 0,                          // Net zero
    // ... all other fields
  };

  // Persist to database
  await this.persistGameToDatabase(gameState, userId);

  return gameState;
}
```

### Database Insert

**First time persisting** (Lines 605-644):

```sql
INSERT INTO blackjack_games (
  id, user_id, shuffle_id, game_phase,
  pending_bet, initial_bet, total_wagered, total_payout,
  pair_bet, twenty_one_plus_three_bet, sidebet_results,
  -- ... all fields
) VALUES (
  'game_1763417317013_user-id',
  'user-id',
  'shuffle_1763417317013',
  'betting',  -- GameStatePhaseType.BETTING
  '0', '0', '0', '0',
  '0', '0', '[]',
  -- ... all values
);
```

---

## Game Update Flow

### When is a Game Updated?

A game is **updated** (not created) after EVERY player action:

- `PLACE_BET` - User adds chips
- `START_ROUND` - Cards are dealt
- `HIT` - Player takes another card
- `STAND` - Player ends turn
- `DOUBLE` - Player doubles bet
- `SPLIT` - Player splits hand
- `INSURANCE` - Player takes insurance
- `PLAY_AGAIN` - **Resets hand, SAME game**

### Update Sequence

```typescript
// User clicks "Hit"
┌─────────────────────────────────────────────────────────┐
│ 1. Frontend: sendGameAction("HIT")                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 2. API: POST /api/games/blackjack/current               │
│    body: { action: "HIT", state: currentGameState }     │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 3. stateMachine.processAction(gameState, "HIT")         │
│    - Add card to player hand                            │
│    - Check for bust                                     │
│    - Update game phase                                  │
│    - Return new state + effects                         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ 4. updateGameState(gameId, newState, userId)            │
│    └─> persistGameToDatabase(newState, userId)          │
│        - Check if game exists (line 546)                │
│        - UPDATE existing record (line 561)              │
└─────────────────────────────────────────────────────────┘
```

### Code: persistGameToDatabase()

**File**: `src/lib/games/blackjack/authenticatedGameStateService.ts` (Lines 540-665)

```typescript
private async persistGameToDatabase(
  gameState: GameState,
  userId: string
): Promise<void> {
  // Check if game already exists
  const existingGame = await prisma.blackjackGame.findUnique({
    where: { id: gameState.gameId }
  });

  if (existingGame) {
    // ✅ UPDATE - This is the normal path during gameplay
    await prisma.blackjackGame.update({
      where: { id: gameState.gameId },
      data: {
        gamePhase: GameStatePhaseType[gameState.gamePhase],
        initialBet: gameState.initialBet.toString(),
        totalWagered: gameState.totalWagered.toString(),
        totalPayout: gameState.totalWon.toString(),
        pairBet: gameState.pairBet.toString(),
        sidebetResults: gameState.sidebetResults,
        // ... update all fields
      }
    });

    // Also update player hands and dealer hand
    await this.persistPlayerHands(gameState);
    await this.persistDealerHand(gameState);
  } else {
    // ❌ INSERT - Only on first save (very rare during gameplay)
    await prisma.blackjackGame.create({ /* ... */ });
  }
}
```

### Database Update

**Typical update** during gameplay:

```sql
UPDATE blackjack_games
SET
  game_phase = 'playing',
  initial_bet = '20',
  total_wagered = '40',
  total_payout = '40',
  pair_bet = '5',
  twenty_one_plus_three_bet = '5',
  sidebet_results = '[{"type":"PAIR","result":0,"payout":130}]',
  dealing_step = 4,
  updated_at = NOW()
WHERE id = 'game_1763417317013_user-id';

-- Cards are in separate tables
DELETE FROM blackjack_cards WHERE player_hand_id IN (
  SELECT id FROM blackjack_player_hands WHERE game_id = 'game_1763417317013_user-id'
);
-- Re-insert updated cards
INSERT INTO blackjack_cards (...) VALUES (...);
```

---

## Play Again Flow

### What Happens on "Play Again"?

When you click "Play Again" after finishing a hand:

1. **SAME game** - `gameId` does NOT change
2. **Reset hand** - Clear cards, reset to BETTING phase
3. **Preserve bets** - Main bet and sidebets are restored
4. **Accumulate stats** - `totalWagered` and `totalWon` keep growing
5. **Update database** - Same record is updated

### Code: processPlayAgain()

**File**: `src/lib/games/blackjack/stateMachine.ts` (Lines 1325-1406)

```typescript
private processPlayAgain(gameState: GameState): StateMachineResult {
  // Preserve bets from previous round
  const preservedMainBet = gameState.initialBet || 0;
  const preservedPairBet = gameState.originalPairBet || 0;
  const preserved21Plus3Bet = gameState.originalTwentyOnePlusThreeBet || 0;

  // Reset to betting state but KEEP gameId
  const newGameState: GameState = {
    ...gameState,
    gameId: gameState.gameId,              // ✅ SAME gameId
    gamePhase: GameStatePhaseType.BETTING, // Reset to betting
    playerHands: [],                       // Clear cards
    dealerHand: { cards: [] },            // Clear dealer
    pendingBet: preservedMainBet,         // Restore bet
    initialBet: preservedMainBet,         // Restore bet
    pairBet: preservedPairBet,            // Restore sidebet
    twentyOnePlusThreeBet: preserved21Plus3Bet,
    sidebetResults: [],                   // Clear results
    totalWagered: gameState.totalWagered, // ✅ KEEP accumulated
    totalWon: gameState.totalWon,         // ✅ KEEP accumulated
    gameProfit: gameState.gameProfit,     // ✅ KEEP accumulated
    // ... reset dealing states
  };

  return {
    success: true,
    newGameState,
    effects: [],
    waitingForUserAction: true
  };
}
```

### Database Impact

```sql
-- After Hand 1 (Bet $20, Win $40):
UPDATE blackjack_games
SET
  game_phase = 'betting',      -- Reset to BETTING
  initial_bet = '20',           -- Preserved
  total_wagered = '20',         -- Accumulated
  total_payout = '40',          -- Accumulated
  pair_bet = '0',
  sidebet_results = '[]'        -- Cleared
WHERE id = 'game_123';

DELETE FROM blackjack_player_hands WHERE game_id = 'game_123';
DELETE FROM blackjack_dealer_hands WHERE game_id = 'game_123';
-- No hands/cards in database during betting phase

-- After Hand 2 (Bet $20, Lose $0):
UPDATE blackjack_games
SET
  game_phase = 'betting',
  initial_bet = '20',
  total_wagered = '40',         -- 20 + 20 = 40 ✅
  total_payout = '40',          -- 40 + 0 = 40 ✅
WHERE id = 'game_123';          -- SAME game_123 ✅
```

---

## Database Schema

### Primary Table: blackjack_games

```sql
CREATE TABLE blackjack_games (
  -- Identity
  id TEXT PRIMARY KEY,                    -- gameId (e.g., 'game_123_user-id')
  user_id TEXT NOT NULL,
  shuffle_id TEXT NOT NULL,
  shuffle_salt TEXT,

  -- Game State
  game_phase TEXT DEFAULT 'betting',      -- Current phase of current hand
  dealt_card_count INT DEFAULT 0,

  -- Current Hand Bets
  pending_bet TEXT DEFAULT '0',
  initial_bet TEXT DEFAULT '0',           -- Current hand's main bet
  insurance_bet TEXT DEFAULT '0',

  -- Side Bets (Current Hand)
  pair_bet TEXT DEFAULT '0',
  twenty_one_plus_three_bet TEXT DEFAULT '0',
  pair_bet_chips JSONB,
  twenty_one_plus_three_bet_chips JSONB,
  sidebet_results JSONB,

  -- Original Side Bets (for Play Again)
  original_pair_bet TEXT DEFAULT '0',
  original_twenty_one_plus_three_bet TEXT DEFAULT '0',
  original_pair_bet_chips JSONB,
  original_twenty_one_plus_three_bet_chips JSONB,

  -- Session Statistics (Accumulated)
  total_wagered TEXT DEFAULT '0',         -- Sum across all hands
  total_payout TEXT DEFAULT '0',          -- Sum across all hands

  -- Game Flow Flags
  can_double BOOLEAN DEFAULT false,
  can_split BOOLEAN DEFAULT false,
  can_surrender BOOLEAN DEFAULT false,
  insurance_offered BOOLEAN DEFAULT false,
  insurance_was_offered BOOLEAN DEFAULT false,
  dealer_has_blackjack BOOLEAN DEFAULT false,

  -- Animation State
  dealing_step INT DEFAULT 0,
  is_dealing BOOLEAN DEFAULT false,
  is_dealing_in_progress BOOLEAN DEFAULT false,
  last_processed_step INT DEFAULT 0,
  dealer_dealing_step INT DEFAULT 0,
  is_dealer_dealing BOOLEAN DEFAULT false,

  -- Metadata
  message TEXT DEFAULT '',
  result TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Related Tables: Hands and Cards

```sql
-- Player hands (multiple if split)
CREATE TABLE blackjack_player_hands (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,              -- FK to blackjack_games
  hand_index INT NOT NULL,            -- 0 for first hand, 1+ for splits
  bet TEXT DEFAULT '0',
  is_standing BOOLEAN DEFAULT false,
  is_busted BOOLEAN DEFAULT false,
  is_blackjack BOOLEAN DEFAULT false,
  is_doubled BOOLEAN DEFAULT false,
  is_surrendered BOOLEAN DEFAULT false,
  is_from_split BOOLEAN DEFAULT false,
  is_split_aces BOOLEAN DEFAULT false,
  result TEXT,
  payout TEXT DEFAULT '0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (game_id) REFERENCES blackjack_games(id) ON DELETE CASCADE
);

-- Dealer hand (one per game)
CREATE TABLE blackjack_dealer_hands (
  id TEXT PRIMARY KEY,
  game_id TEXT UNIQUE NOT NULL,       -- FK to blackjack_games
  is_standing BOOLEAN DEFAULT false,
  is_busted BOOLEAN DEFAULT false,
  is_blackjack BOOLEAN DEFAULT false,
  show_all_cards BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (game_id) REFERENCES blackjack_games(id) ON DELETE CASCADE
);

-- Cards (for both player and dealer)
CREATE TABLE blackjack_cards (
  id TEXT PRIMARY KEY,
  hand_id TEXT NOT NULL,
  hand_type TEXT NOT NULL,            -- 'player' or 'dealer'
  suit TEXT NOT NULL,                 -- 'hearts', 'diamonds', 'clubs', 'spades'
  rank TEXT NOT NULL,                 -- '2'-'10', 'J', 'Q', 'K', 'A'
  is_hidden BOOLEAN DEFAULT false,
  dealt_at TIMESTAMP DEFAULT NOW(),
  player_hand_id TEXT,                -- FK to blackjack_player_hands
  dealer_hand_id TEXT,                -- FK to blackjack_dealer_hands

  FOREIGN KEY (player_hand_id) REFERENCES blackjack_player_hands(id) ON DELETE CASCADE,
  FOREIGN KEY (dealer_hand_id) REFERENCES blackjack_dealer_hands(id) ON DELETE CASCADE
);
```

---

## State Transitions

### Game Phase Lifecycle (Single Hand)

```
┌─────────────────────────────────────────────────────────────┐
│                     SINGLE HAND LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

    ┌──────────┐
    │ BETTING  │ ◄──── Initial state (after Play Again)
    └─────┬────┘
          │ START_ROUND action
          ▼
    ┌──────────────┐
    │ ASK_INSURANCE│ (if dealer shows Ace)
    └──────┬───────┘
          │ INSURANCE or DECLINE_INSURANCE
          ▼
    ┌──────────┐
    │ PLAYING  │ ◄──── Player makes decisions (HIT/STAND/DOUBLE/SPLIT)
    └─────┬────┘
          │ All hands complete (STAND, BUST, or SURRENDER)
          ▼
    ┌─────────────┐
    │ DEALER_TURN │ ◄──── Dealer draws according to rules
    └──────┬──────┘
          │ Dealer complete
          ▼
    ┌──────────┐
    │ FINISHED │ ◄──── Winner determined, payouts processed
    └─────┬────┘
          │
          ├─> PLAY_AGAIN → Back to BETTING (same game) ✅
          │
          └─> Page reload → Create NEW game ❌
```

### Multi-Hand Session Flow

```
SESSION START
    │
    ▼
┌─────────────┐
│ Create Game │ gameId = 'game_123'
│ (DB INSERT) │ totalWagered = 0, totalWon = 0
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────┐
│              HAND 1                       │
├──────────────────────────────────────────┤
│ BETTING → PLAYING → FINISHED             │
│ Bet: $20, Win: $40                       │
│ UPDATE game_123:                         │
│   totalWagered = 20, totalWon = 40       │
└──────┬───────────────────────────────────┘
       │ PLAY_AGAIN (UPDATE, not INSERT)
       ▼
┌──────────────────────────────────────────┐
│              HAND 2                       │
├──────────────────────────────────────────┤
│ BETTING → PLAYING → FINISHED             │
│ Bet: $20, Lose: $0                       │
│ UPDATE game_123:                         │
│   totalWagered = 40, totalWon = 40       │
└──────┬───────────────────────────────────┘
       │ PLAY_AGAIN
       ▼
┌──────────────────────────────────────────┐
│              HAND 3                       │
├──────────────────────────────────────────┤
│ BETTING → PLAYING → FINISHED             │
│ Bet: $20, Win: $30                       │
│ UPDATE game_123:                         │
│   totalWagered = 60, totalWon = 70       │
└──────┬───────────────────────────────────┘
       │
       ├─> PLAY_AGAIN → Continue session
       │
       └─> Page reload (gamePhase = FINISHED)
           │
           ▼
       ┌─────────────┐
       │ Create Game │ gameId = 'game_456' (NEW!)
       │ (DB INSERT) │ totalWagered = 0, totalWon = 0
       └─────────────┘
```

---

## Code Architecture

### Service Layer

**File**: `src/lib/games/blackjack/authenticatedGameStateService.ts`

```typescript
export class AuthenticatedGameStateService {
  // CREATE new game session
  async createGame(userId: string): Promise<GameState> {
    // Generate gameId, create initial state, persist to DB
  }

  // GET existing game or create if none
  async getOrCreateCurrentGame(userId: string): Promise<GameState> {
    const currentGame = await this.getCurrentGame(userId);
    if (currentGame && currentGame.gamePhase !== FINISHED) {
      return currentGame; // Continue existing session
    }
    return await this.createGame(userId); // Start new session
  }

  // UPDATE existing game
  async updateGameState(
    gameId: string,
    newGameState: GameState,
    userId: string
  ): Promise<void> {
    await this.persistGameToDatabase(newGameState, userId);
  }

  // PERSIST to database (INSERT or UPDATE)
  private async persistGameToDatabase(
    gameState: GameState,
    userId: string
  ): Promise<void> {
    const existingGame = await prisma.blackjackGame.findUnique({
      where: { id: gameState.gameId },
    });

    if (existingGame) {
      await prisma.blackjackGame.update({
        /* ... */
      }); // UPDATE
    } else {
      await prisma.blackjackGame.create({
        /* ... */
      }); // INSERT
    }
  }

  // LOAD from database
  private async loadGameFromDatabase(
    gameId: string
  ): Promise<GameState | null> {
    const game = await prisma.blackjackGame.findUnique({
      where: { id: gameId },
      include: { playerHands: true, dealerHand: true },
    });

    return this.convertDatabaseGameToGameState(game);
  }
}
```

### State Machine Layer

**File**: `src/lib/games/blackjack/stateMachine.ts`

```typescript
export class GameStateMachine {
  // Process any game action
  async processAction(input: StateMachineInput): Promise<StateMachineResult> {
    switch (input.action) {
      case GameActionType.START_ROUND:
        return this.processStartRound(gameState, amount);
      case GameActionType.HIT:
        return this.processHit(gameState);
      case GameActionType.STAND:
        return this.processStand(gameState);
      case GameActionType.PLAY_AGAIN:
        return this.processPlayAgain(gameState); // Resets hand
      // ...
    }
  }

  // Reset to betting phase, SAME game
  private processPlayAgain(gameState: GameState): StateMachineResult {
    return {
      newGameState: {
        ...gameState,
        gameId: gameState.gameId, // SAME
        gamePhase: GameStatePhaseType.BETTING, // RESET
        playerHands: [], // CLEAR
        totalWagered: gameState.totalWagered, // KEEP
        totalWon: gameState.totalWon, // KEEP
      },
      effects: [],
      waitingForUserAction: true,
    };
  }
}
```

### API Layer

**File**: `src/app/(site)/api/games/blackjack/current/route.ts`

```typescript
// GET - Load current game
export async function GET(request: NextRequest) {
  const userId = session.user.id;

  // This will return existing game or create new one
  const gameState = await authenticatedGameStateService.getOrCreateCurrentGame(
    userId
  );

  return NextResponse.json({
    success: true,
    gameState: sanitizeGameData(gameState),
    availableActions: getAvailableActions(gameState),
  });
}

// POST - Process action and update game
export async function POST(request: NextRequest) {
  const { action, betAmount, state: clientState } = await request.json();

  // Get current game
  let gameState = await authenticatedGameStateService.getOrCreateCurrentGame(
    userId
  );

  // Process action through state machine
  const stateMachine = createGameStateMachine();
  const result = await stateMachine.processAction({
    gameState,
    action,
    amount: betAmount,
  });

  // Update database (UPDATE not INSERT)
  await authenticatedGameStateService.updateGameState(
    gameState.gameId,
    result.newGameState,
    userId
  );

  return NextResponse.json({
    success: true,
    gameState: sanitizeGameData(result.newGameState),
  });
}
```

---

## Examples

### Example 1: Complete Session (3 Hands)

```typescript
// USER VISITS PAGE
// → GET /api/games/blackjack/current

// Database: No game exists
// Action: CREATE new game
INSERT INTO blackjack_games VALUES (
  'game_1763417317013_user-123',
  'user-123',
  'shuffle_1763417317013',
  'betting',      -- gamePhase
  '0', '0', '0'   -- initialBet, totalWagered, totalWon
);

// Response: gameState with gameId='game_1763417317013_user-123'

// ─────────────────────────────────────────────────────────
// HAND 1: User bets $20, wins $40
// ─────────────────────────────────────────────────────────

// Action: START_ROUND with $20
// → POST /api/games/blackjack/current
//   body: { action: "START_ROUND", betAmount: 20 }

UPDATE blackjack_games SET
  game_phase = 'playing',
  initial_bet = '20',
  total_wagered = '20',
  dealing_step = 4
WHERE id = 'game_1763417317013_user-123';

// ... player plays (HIT/STAND)
// ... dealer plays
// ... player wins

UPDATE blackjack_games SET
  game_phase = 'finished',
  total_payout = '40',
  result = 'win'
WHERE id = 'game_1763417317013_user-123';

// Final state after Hand 1:
// totalWagered: 20, totalWon: 40, gameProfit: +20

// ─────────────────────────────────────────────────────────
// USER CLICKS "PLAY AGAIN"
// ─────────────────────────────────────────────────────────

// Action: PLAY_AGAIN
// → POST /api/games/blackjack/current
//   body: { action: "PLAY_AGAIN" }

UPDATE blackjack_games SET
  game_phase = 'betting',
  initial_bet = '20',         -- Preserved
  total_wagered = '20',       -- Still 20 (accumulated)
  total_payout = '40'         -- Still 40 (accumulated)
WHERE id = 'game_1763417317013_user-123';  -- SAME game ID

DELETE FROM blackjack_player_hands
WHERE game_id = 'game_1763417317013_user-123';

DELETE FROM blackjack_dealer_hands
WHERE game_id = 'game_1763417317013_user-123';

// ─────────────────────────────────────────────────────────
// HAND 2: User bets $20 (preserved), loses
// ─────────────────────────────────────────────────────────

// Action: START_ROUND (bet already set from Play Again)

UPDATE blackjack_games SET
  game_phase = 'playing',
  total_wagered = '40'        -- 20 + 20 = 40
WHERE id = 'game_1763417317013_user-123';

// ... player plays and loses

UPDATE blackjack_games SET
  game_phase = 'finished',
  total_payout = '40',        -- No new winnings
  result = 'lose'
WHERE id = 'game_1763417317013_user-123';

// Final state after Hand 2:
// totalWagered: 40, totalWon: 40, gameProfit: 0

// ─────────────────────────────────────────────────────────
// USER CLICKS "PLAY AGAIN"
// ─────────────────────────────────────────────────────────

// Same process as before...

// ─────────────────────────────────────────────────────────
// HAND 3: User bets $20, wins $30
// ─────────────────────────────────────────────────────────

UPDATE blackjack_games SET
  game_phase = 'finished',
  total_wagered = '60',       -- 40 + 20 = 60
  total_payout = '70',        -- 40 + 30 = 70
  result = 'win'
WHERE id = 'game_1763417317013_user-123';

// Final state after Hand 3:
// totalWagered: 60, totalWon: 70, gameProfit: +10

// ─────────────────────────────────────────────────────────
// USER RELOADS PAGE
// ─────────────────────────────────────────────────────────

// → GET /api/games/blackjack/current

SELECT * FROM blackjack_games
WHERE user_id = 'user-123'
ORDER BY created_at DESC
LIMIT 1;

// Returns game with gamePhase = 'finished'
// Logic: currentGame.gamePhase === FINISHED
// Action: CREATE new game

INSERT INTO blackjack_games VALUES (
  'game_1763417400000_user-123',  -- NEW gameId
  'user-123',
  'shuffle_1763417400000',
  'betting',
  '0', '0', '0'                   -- Fresh session
);

// New session begins...
```

### Example 2: Page Reload During Active Hand

```typescript
// USER IS IN MIDDLE OF A HAND
// gameState: {
//   gameId: 'game_123',
//   gamePhase: 'playing',
//   playerHands: [{ cards: [♠A, ♥K] }],
//   dealerHand: { cards: [♣7, ?] },
//   initialBet: 20,
//   totalWagered: 20,
//   totalWon: 0
// }

// ─────────────────────────────────────────────────────────
// USER RELOADS PAGE (accidentally)
// ─────────────────────────────────────────────────────────

// → GET /api/games/blackjack/current

SELECT * FROM blackjack_games
WHERE user_id = 'user-123'
ORDER BY created_at DESC
LIMIT 1;

// Returns: gamePhase = 'playing' (NOT finished)
// Logic: currentGame.gamePhase !== FINISHED
// Action: Return existing game, DO NOT create new one

// Frontend receives same game state:
// gameId: 'game_123',              ✅ SAME
// gamePhase: 'playing',            ✅ Restored
// playerHands: [{ cards: [...] }], ✅ Restored from DB
// dealerHand: { cards: [...] },    ✅ Restored from DB
// initialBet: 20,                  ✅ Restored
// pairBet: 5,                      ✅ Restored (NEW!)
// sidebetResults: [...]            ✅ Restored (NEW!)

// User can continue playing from where they left off!
```

### Example 3: Side Bets Across Hands

```typescript
// ─────────────────────────────────────────────────────────
// HAND 1: User places $5 Perfect Pairs, wins
// ─────────────────────────────────────────────────────────

// Initial state
{
  gameId: 'game_123',
  pairBet: 5,
  originalPairBet: 5,
}

// After deal (Perfect Pair!)
UPDATE blackjack_games SET
  sidebet_results = '[{
    "type": "PAIR",
    "amount": 5,
    "result": 0,
    "payout": 130,
    "profit": 125
  }]',
  pair_bet = '5',               -- Still visible
  pair_bet_chips = '[5]',
  total_wagered = '25',         -- 20 main + 5 sidebet
  total_payout = '170'          -- 40 main + 130 sidebet
WHERE id = 'game_123';

// ─────────────────────────────────────────────────────────
// USER CLICKS "PLAY AGAIN"
// ─────────────────────────────────────────────────────────

// Side bets are RESTORED from original values
UPDATE blackjack_games SET
  game_phase = 'betting',
  pair_bet = '5',               -- ✅ Restored
  pair_bet_chips = '[5]',       -- ✅ Restored
  sidebet_results = '[]',       -- Cleared
  original_pair_bet = '5',      -- Preserved
  original_pair_bet_chips = '[5]'
WHERE id = 'game_123';

// ─────────────────────────────────────────────────────────
// HAND 2: User's sidebet loses
// ─────────────────────────────────────────────────────────

UPDATE blackjack_games SET
  sidebet_results = '[{
    "type": "PAIR",
    "amount": 5,
    "result": 1,      -- LOSE
    "payout": 0,
    "profit": 0
  }]',
  pair_bet = '0',               -- Cleared after loss
  pair_bet_chips = '[]',        -- Cleared
  total_wagered = '50'          -- 25 + 25 = 50
WHERE id = 'game_123';

// ─────────────────────────────────────────────────────────
// USER CLICKS "PLAY AGAIN" AFTER LOSING SIDEBET
// ─────────────────────────────────────────────────────────

// Side bets are STILL restored (from original)
UPDATE blackjack_games SET
  game_phase = 'betting',
  pair_bet = '5',               -- ✅ Restored from original
  pair_bet_chips = '[5]',       -- ✅ Restored from original
  sidebet_results = '[]',
  original_pair_bet = '5'       -- Still preserved
WHERE id = 'game_123';

// This is why we store BOTH current and original sidebet amounts!
```

---

## Summary

### Key Takeaways

1. **One Game = One Session**

   - A game record in the database represents a multi-hand session
   - `gameId` remains constant across multiple hands
   - Only changes when session ends (reload after FINISHED)

2. **Hands Are Not Games**

   - Each "Play Again" resets the hand, not the game
   - No new database record is created
   - Existing game record is updated

3. **Statistics Accumulate**

   - `totalWagered` grows with each hand
   - `totalWon` grows with each win
   - `gameProfit` = `totalWon - totalWagered`

4. **Persistence on Every Action**

   - Every player action triggers a database UPDATE
   - Cards, hands, and game state are fully persisted
   - Page reload recovers exact game state

5. **Side Bets Persist**
   - Current side bets stored in `pairBet`, `twentyOnePlusThreeBet`
   - Original side bets stored for Play Again functionality
   - Results cleared between hands but bets restored

### Architecture Benefits

✅ **Database Efficiency**: One record per session, not per hand  
✅ **Session Continuity**: Players can reload and continue  
✅ **Statistics Tracking**: Accurate multi-hand profit/loss  
✅ **State Recovery**: No data loss on network issues  
✅ **Play Again UX**: Seamless transition between hands

---

## Related Documentation

- [SIDEBET_PERSISTENCE_FIX.md](./SIDEBET_PERSISTENCE_FIX.md) - How sidebets are persisted
- [PLAY_AGAIN_SIDEBET_PERSISTENCE.md](./PLAY_AGAIN_SIDEBET_PERSISTENCE.md) - Play Again functionality
- [BLACKJACK_SIDEPOTS.md](./BLACKJACK_SIDEPOTS.md) - Sidebet system overview

---

**Last Updated**: November 17, 2025
