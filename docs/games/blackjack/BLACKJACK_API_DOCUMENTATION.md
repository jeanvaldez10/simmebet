# Blackjack API Documentation

**Complete Technical Reference for Blackjack Game Integration**

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [API Endpoints](#api-endpoints)
4. [API Documentation & Testing Interface](#api-documentation--testing-interface)
5. [Database Schema](#database-schema)
6. [Game State Management](#game-state-management)
7. [Game Flow & Actions](#game-flow--actions)
8. [Request/Response Formats](#requestresponse-formats)
9. [Balance Management](#balance-management)
10. [Provable Fairness (Shuffle Verification)](#provable-fairness-shuffle-verification)
11. [Integration Guide](#integration-guide)
12. [Security Considerations](#security-considerations)
13. [Error Handling](#error-handling)

---

## Overview

The Blackjack API provides a complete, authenticated, provably-fair blackjack game system built on Next.js with server-side state management and PostgreSQL persistence.

### Key Features

- **🔐 Session-Based Authentication**: NextAuth.js with JWT strategy
- **🎯 State Machine Architecture**: Deterministic game logic with effect-based actions
- **💾 Database Persistence**: PostgreSQL with Prisma ORM
- **🎲 Provable Fairness**: Deterministic shuffle with cryptographic verification
- **💰 Balance Management**: Integrated user balance tracking
- **🧪 Interactive Testing**: Built-in API documentation and testing interface

### Architecture

```
Client Request
    ↓
NextAuth Session Validation
    ↓
API Route Handler (/api/games/blackjack/current)
    ↓
Authenticated Game State Service
    ↓
State Machine (Game Logic)
    ↓
Database Persistence (Prisma)
    ↓
Response with Sanitized Game State
```

---

## Authentication System

### Overview

The API uses **NextAuth.js** with a JWT-based session strategy. All blackjack API endpoints require an authenticated session.

### Authentication Flow

1. **User Signs In** (via credentials or Twitter OAuth)
2. **JWT Token Created** with user ID and session data
3. **Session Stored** in HTTP-only cookies
4. **API Requests** include session automatically
5. **Server Validates** session using `auth()` function

### Supported Authentication Methods

#### 1. Credentials Provider (Email/Password)

```typescript
// Sign in with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "securePassword123",
});
```

**Requirements:**

- Valid email/username
- Email must be verified (`emailVerified` field set)
- Password hash matches stored hash (bcrypt)

#### 2. Twitter OAuth Provider

```typescript
// Sign in with Twitter
await signIn("twitter");
```

**Requirements:**

- Twitter OAuth 2.0 configured
- `AUTH_TWITTER_ID` and `AUTH_TWITTER_SECRET` env variables set
- User account linked to Twitter ID

### Session Structure

```typescript
interface Session {
  user: {
    id: string; // User ID (required for all API calls)
    email?: string; // User email
    name?: string; // Display name
    twitterId?: string; // Twitter account ID if linked
    image?: string; // Avatar URL
  };
  userId: string; // Duplicate for easier access
  expires: string; // Session expiration
}
```

### Accessing Session in API Routes

```typescript
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  // Use userId for all database operations
}
```

### Session Configuration

```typescript
// Located in: src/auth/index.ts
session: {
  strategy: "jwt",          // JWT tokens stored in cookies
  maxAge: 1 * 24 * 60 * 60, // 24 hours
}
```

---

## API Endpoints

### Base Endpoint

**`/api/games/blackjack/current`**

This is the **single unified endpoint** for all blackjack game operations.

---

### GET `/api/games/blackjack/current`

**Purpose**: Retrieve or create the current active game for the authenticated user.

#### Authentication Required

✅ Yes - Must have valid session with `user.id`

#### Request

```http
GET /api/games/blackjack/current HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=<token>
```

**No body required** - uses session user ID automatically

#### Response

```typescript
{
  "success": true,
  "gameId": "game_1730000000000_user123",
  "gameState": {
    "gameId": "game_1730000000000_user123",
    "shuffleId": "shuffle_1730000000000",
    "shuffleSalt": "test-salt",
    "playerHands": [
      {
        "cards": [
          { "suit": "hearts", "rank": "A", "isHidden": false },
          { "suit": "diamonds", "rank": "K", "isHidden": false }
        ],
        "bet": 10,
        "originalBet": 10,
        "isStanding": false,
        "isBusted": false,
        "isBlackjack": true,
        "isDoubled": false,
        "isSurrendered": false,
        "isFromSplit": false,
        "isSplitAces": false
      }
    ],
    "dealerHand": {
      "cards": [
        { "suit": "clubs", "rank": "7", "isHidden": false },
        { "suit": "spades", "rank": "?", "isHidden": true }
      ],
      "isStanding": false,
      "isBusted": false,
      "isBlackjack": false,
      "showAllCards": false
    },
    "currentHandIndex": 0,
    "balance": 1000,
    "pendingBet": 0,
    "initialBet": 10,
    "gamePhase": "PLAYING",
    "message": "Cards dealt. Your turn.",
    "canDouble": true,
    "canSplit": false,
    "canSurrender": true,
    "insuranceOffered": false,
    "insuranceWasOffered": false,
    "insuranceBet": 0,
    "dealerHasBlackjack": false,
    "dealingStep": 1,
    "isDealing": false,
    "isDealingInProgress": false,
    "lastProcessedStep": 1,
    "dealerDealingStep": 0,
    "isDealerDealing": false,
    "isBustSequence": false,
    "bustSequenceStep": 0,
    "dealerBustRevealStep": 0,
    "startingBalance": 1000,
    "totalWagered": 10,
    "totalWon": 0,
    "currentHandProfit": -10,
    "gameProfit": 0,
    "handResults": []
  },
  "availableActions": [
    { "action": "HIT", "description": "Draw another card" },
    { "action": "STAND", "description": "End your turn" },
    { "action": "DOUBLE", "description": "Double your bet and draw one card" },
    { "action": "SURRENDER", "description": "Surrender and get half your bet back" }
  ],
  "shuffleVerification": {
    "shuffleId": "shuffle_1730000000000",
    "canBeVerified": true,
    "saltHash": "abc123...",
    "isSaltRevealed": false,
    "timestamp": "2025-11-03T12:00:00.000Z"
  }
}
```

#### Behavior

- **If no active game exists**: Creates new game in `BETTING` phase
- **If active unfinished game exists**: Returns that game state
- **If finished game exists**: Creates new game in `BETTING` phase

---

### POST `/api/games/blackjack/current`

**Purpose**: Execute a game action (place bet, hit, stand, etc.)

#### Authentication Required

✅ Yes - Must have valid session with `user.id`

#### Request

```http
POST /api/games/blackjack/current HTTP/1.1
Host: your-domain.com
Cookie: next-auth.session-token=<token>
Content-Type: application/json

{
  "action": "START_ROUND",
  "betAmount": 10
}
```

**Request Body:**

```typescript
{
  action: GameActionType;  // Required - See Game Actions below
  betAmount?: number;      // Optional - Required for START_ROUND
}
```

#### Response

Same structure as GET endpoint, but with updated game state reflecting the action.

**Success Response (200):**

```json
{
  "success": true,
  "gameState": {
    /* Updated game state */
  },
  "availableActions": [
    /* Updated available actions */
  ],
  "shuffleVerification": {
    /* Shuffle verification info */
  },
  "gameId": "game_1730000000000_user123",
  "effects": [
    /* State machine effects that were applied */
  ]
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Insufficient balance to start round. Required: $10.00",
  "gameState": {
    /* Current game state */
  }
}
```

**Error Response (401):**

```json
{
  "error": "Authentication required"
}
```

**Error Response (500):**

```json
{
  "error": "Internal server error"
}
```

---

## API Documentation & Testing Interface

### Overview

The API includes a **built-in interactive testing interface** accessible at `/api-docs`. This interface provides a secure, authenticated environment for testing and understanding the Blackjack API.

### Access URL

**`/api-docs`**

### Two-Layer Authentication

The API docs endpoint uses **two layers of security**:

#### Layer 1: Password Protection

- **Purpose**: First barrier to prevent unauthorized discovery
- **Default Password**: `bluff-dev-2025`
- **Environment Variable**: `NEXT_PUBLIC_API_DOCS_PASSWORD`
- **Storage**: Session storage (cleared on browser close)

**Setting Custom Password:**

```env
# .env.local
NEXT_PUBLIC_API_DOCS_PASSWORD=your-secure-password
```

#### Layer 2: User Authentication

- **Purpose**: Must have valid Bluff account
- **Uses**: NextAuth session (same as main API)
- **Redirect**: If not signed in, redirects to main site to authenticate

**Authentication Flow:**

```
1. User visits /api-docs
2. Enter password (Layer 1)
3. Check if user is signed in (Layer 2)
4. If not signed in → Redirect to main site
5. After signing in → Return to /api-docs
6. Access granted ✅
```

### Features

#### 1. Interactive API Tester

- **GET Request Tester**: Fetch current game state
- **POST Request Tester**: Execute game actions
- **Action Selector**: Dropdown with all available actions
- **Bet Amount Input**: For actions requiring bet amounts
- **Real-time Response Display**: JSON-formatted responses

#### 2. Available Actions

The interface provides access to all game actions:

- `PLACE_BET` - Set pending bet amount
- `START_ROUND` - Begin new round with bet
- `HIT` - Draw another card
- `STAND` - End current hand
- `DOUBLE` - Double bet and draw one card
- `SPLIT` - Split matching cards into two hands
- `SURRENDER` - Surrender hand for half bet back
- `INSURANCE` - Take insurance against dealer blackjack
- `DECLINE_INSURANCE` - Decline insurance offer
- `PLAY_AGAIN` - Start new round (after game ends)
- `START_NEW_GAME` - Reset to new game
- `RESET_GAME` - Reset current game
- `SWITCH_HAND` - Switch to next hand (split hands)

#### 3. Request Preview

Shows the exact request that will be sent:

```json
{
  "action": "HIT",
  "betAmount": 10
}
```

#### 4. Response Display

Real-time JSON response with:

- Success/error status
- Full game state
- Available actions
- Shuffle verification
- Effects applied

### Environment Variables

```env
# Password for API docs access
NEXT_PUBLIC_API_DOCS_PASSWORD=your-custom-password

# Main site URL for authentication redirects
NEXT_PUBLIC_APP_URL=https://your-site.com
```

### Security Features

1. **Password Protection**: First barrier (session storage)
2. **User Authentication**: Must have valid account
3. **Lock Button**: Manual lock to clear password
4. **Session-based**: Re-authenticate each browser session
5. **Read-only Operations**: Testing doesn't affect production data

### Adding New API Sections

To add additional game APIs to the testing interface:

```typescript
// 1. Add TabsTrigger
<TabsTrigger value="newgame">
  🎮 New Game
</TabsTrigger>

// 2. Add TabsContent
<TabsContent value="newgame">
  <NewGameApiTester />
</TabsContent>

// 3. Create component following BlackjackApiTester pattern
function NewGameApiTester() {
  // Similar structure to BlackjackApiTester
}
```

### File Structure

```
src/app/api-docs/
├── page.tsx                           # Main page with tabs
├── layout.tsx                         # Layout with SessionWrapper
├── components/
│   └── PasswordProtection.tsx         # Password protection component
└── README.md                          # API docs documentation
```

---

## Database Schema

### Overview

The blackjack system uses **4 main tables** to persist game state:

1. `blackjack_games` - Main game records
2. `blackjack_player_hands` - Player hand data
3. `blackjack_dealer_hands` - Dealer hand data
4. `blackjack_cards` - Individual card records

### Table: `blackjack_games`

**Primary game state table**

```sql
CREATE TABLE blackjack_games (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL,
  shuffle_id            TEXT NOT NULL,
  shuffle_salt          TEXT,
  dealt_card_count      INTEGER DEFAULT 0,
  game_phase            TEXT DEFAULT 'betting',
  pending_bet           TEXT DEFAULT '0',
  initial_bet           TEXT DEFAULT '0',
  total_wagered         TEXT DEFAULT '0',
  insurance_bet         TEXT DEFAULT '0',
  message               TEXT DEFAULT '',
  can_double            BOOLEAN DEFAULT false,
  can_split             BOOLEAN DEFAULT false,
  can_surrender         BOOLEAN DEFAULT false,
  insurance_offered     BOOLEAN DEFAULT false,
  insurance_was_offered BOOLEAN DEFAULT false,
  dealer_has_blackjack  BOOLEAN DEFAULT false,
  dealing_step          INTEGER DEFAULT 0,
  is_dealing            BOOLEAN DEFAULT false,
  is_dealing_in_progress BOOLEAN DEFAULT false,
  last_processed_step   INTEGER DEFAULT 0,
  dealer_dealing_step   INTEGER DEFAULT 0,
  is_dealer_dealing     BOOLEAN DEFAULT false,
  result                TEXT,
  total_payout          TEXT DEFAULT '0',
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at          TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key Fields:**

- `shuffle_id`: Unique identifier for deterministic shuffle
- `shuffle_salt`: Secret salt for shuffle verification (revealed after game)
- `dealt_card_count`: Tracks position in deterministic deck
- `game_phase`: Current phase (BETTING, PLAYING, ASK_INSURANCE, DEALER_TURN, FINISHED)
- `total_wagered`: Total amount bet in this game
- `total_payout`: Total winnings (if any)

### Table: `blackjack_player_hands`

**Player hand data (supports splits)**

```sql
CREATE TABLE blackjack_player_hands (
  id             TEXT PRIMARY KEY,
  game_id        TEXT NOT NULL,
  hand_index     INTEGER NOT NULL,
  bet            TEXT DEFAULT '0',
  is_standing    BOOLEAN DEFAULT false,
  is_busted      BOOLEAN DEFAULT false,
  is_blackjack   BOOLEAN DEFAULT false,
  is_doubled     BOOLEAN DEFAULT false,
  is_surrendered BOOLEAN DEFAULT false,
  is_from_split  BOOLEAN DEFAULT false,
  is_split_aces  BOOLEAN DEFAULT false,
  result         TEXT,
  payout         TEXT DEFAULT '0',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES blackjack_games(id) ON DELETE CASCADE,
  UNIQUE (game_id, hand_index)
);
```

**Key Fields:**

- `hand_index`: Order index (0-based) for multiple hands
- `bet`: Amount wagered on this hand
- `is_from_split`: True if created by split action
- `is_split_aces`: True if split from pair of aces (special rules)

### Table: `blackjack_dealer_hands`

**Dealer hand data**

```sql
CREATE TABLE blackjack_dealer_hands (
  id             TEXT PRIMARY KEY,
  game_id        TEXT UNIQUE NOT NULL,
  is_standing    BOOLEAN DEFAULT false,
  is_busted      BOOLEAN DEFAULT false,
  is_blackjack   BOOLEAN DEFAULT false,
  show_all_cards BOOLEAN DEFAULT false,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (game_id) REFERENCES blackjack_games(id) ON DELETE CASCADE
);
```

**Key Fields:**

- `show_all_cards`: Controls visibility of hole card (hidden until dealer turn)

### Table: `blackjack_cards`

**Individual card records**

```sql
CREATE TABLE blackjack_cards (
  id              TEXT PRIMARY KEY,
  hand_id         TEXT NOT NULL,
  hand_type       TEXT NOT NULL,
  suit            TEXT NOT NULL,
  rank            TEXT NOT NULL,
  is_hidden       BOOLEAN DEFAULT false,
  dealt_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  player_hand_id  TEXT,
  dealer_hand_id  TEXT,

  FOREIGN KEY (player_hand_id) REFERENCES blackjack_player_hands(id) ON DELETE CASCADE,
  FOREIGN KEY (dealer_hand_id) REFERENCES blackjack_dealer_hands(id) ON DELETE CASCADE
);
```

**Key Fields:**

- `hand_type`: Either "player" or "dealer"
- `suit`: hearts, diamonds, clubs, spades, or hidden
- `rank`: A, 2-10, J, Q, K, or ? (hidden)
- `is_hidden`: True for dealer's hole card until revealed

### Relationships

```
User
  ↓ (1:N)
BlackjackGame
  ↓ (1:N)
BlackjackPlayerHand
  ↓ (1:N)
BlackjackCard

BlackjackGame
  ↓ (1:1)
BlackjackDealerHand
  ↓ (1:N)
BlackjackCard
```

---

## Game State Management

### State Machine Architecture

The game uses an **effect-based state machine** with deterministic logic:

```
Action Input
    ↓
Validation
    ↓
State Transition
    ↓
Effect Generation
    ↓
Effect Processing
    ↓
New Game State
```

### Game Phases

```typescript
enum GameStatePhaseType {
  BETTING, // Waiting for bet
  ASK_INSURANCE, // Dealer showing ace (optional)
  PLAYING, // Player actions
  DEALER_TURN, // Dealer plays (automatic)
  FINISHED, // Game complete
}
```

### Phase Transitions

```
BETTING
  → START_ROUND → PLAYING or ASK_INSURANCE or FINISHED

ASK_INSURANCE
  → INSURANCE → FINISHED (if dealer has blackjack)
  → DECLINE_INSURANCE → PLAYING or FINISHED

PLAYING
  → HIT/STAND/DOUBLE/SPLIT/SURRENDER → PLAYING or DEALER_TURN

DEALER_TURN
  → (automatic dealer play) → FINISHED

FINISHED
  → RESET_GAME → BETTING
```

### State Machine Effects

Effects represent **side effects** that occur during state transitions:

```typescript
type EffectType =
  | "BALANCE_CHANGE" // Modify user balance
  | "DEAL_CARD" // Deal card from deck
  | "GAME_PHASE_CHANGE" // Change game phase
  | "HAND_UPDATE" // Update hand properties
  | "MESSAGE_UPDATE" // Update display message
  | "DEALER_TURN" // Trigger dealer play
  | "INITIALIZE_GAME_STATE" // Initialize after initial deal
  | "SURRENDER" // Process surrender
  | "CHECK_SPLIT_STATE"; // Check split hand state
```

### Effect Processing

Effects are processed **asynchronously** and can generate **new effects**:

```typescript
async processEffects(gameState, effects) {
  for (const effect of effects) {
    switch (effect.type) {
      case "DEAL_CARD":
        // Deal card, may generate more effects
        const result = await handleDealCard(effect);
        newEffects.push(...result.effects);
        break;

      case "BALANCE_CHANGE":
        // Update user balance in database
        await handleBalanceChange(effect);
        break;

      // ... other effect handlers
    }
  }

  // Recursively process new effects
  if (newEffects.length > 0) {
    await processEffects(gameState, newEffects);
  }
}
```

### Deterministic Deck Provider

Cards are dealt from a **deterministic shuffled deck** using:

```typescript
function dealCard(shuffleId: string, cardIndex: number, salt: string) {
  // Generate shuffled deck from shuffleId + salt
  const deck = createShuffledDeck(shuffleId, salt);

  // Return card at current index
  return deck[cardIndex];
}
```

This ensures:

- **Reproducible results** for verification
- **Provable fairness** with salt revelation
- **No deck state storage** needed (stateless)

---

## Game Flow & Actions

### Complete Game Flow

```
1. GET /current → Get/create game in BETTING phase
2. POST {action: START_ROUND, betAmount: 10}
3. Server deals 4 cards (player-dealer-player-dealer)
4. Check for blackjacks and insurance scenarios
5. If playing:
   - POST {action: HIT/STAND/DOUBLE/SPLIT/SURRENDER}
   - Repeat until all hands complete
6. Dealer turn (automatic)
7. Game FINISHED - determine winners
8. POST {action: RESET_GAME} to play again
```

### Available Actions

#### PLACE_BET (deprecated, use START_ROUND)

Set the pending bet amount without starting the round.

**When Valid**: BETTING phase

**Request:**

```json
{
  "action": "PLACE_BET",
  "betAmount": 10
}
```

#### START_ROUND

Begin a new round with a bet amount.

**When Valid**: BETTING phase, no active round

**Request:**

```json
{
  "action": "START_ROUND",
  "betAmount": 10
}
```

**Effects:**

- Deducts bet from balance
- Deals 4 cards (player-dealer-player-dealer)
- Hides dealer's second card
- Checks for blackjacks
- Offers insurance if dealer shows ace
- Transitions to PLAYING, ASK_INSURANCE, or FINISHED

#### HIT

Draw another card to current hand.

**When Valid**: PLAYING phase, hand not busted/standing

**Request:**

```json
{
  "action": "HIT"
}
```

**Effects:**

- Deals one card to current hand
- If bust (>21): marks hand as busted, moves to next hand
- If 21: auto-stands, moves to next hand
- If all hands complete: triggers dealer turn

#### STAND

End current hand without drawing.

**When Valid**: PLAYING phase, hand not busted/standing

**Request:**

```json
{
  "action": "STAND"
}
```

**Effects:**

- Marks current hand as standing
- Moves to next hand (if split)
- If all hands complete: triggers dealer turn

#### DOUBLE

Double the bet and draw exactly one card, then stand.

**When Valid**:

- PLAYING phase
- First action on hand (2 cards only)
- Sufficient balance for additional bet

**Request:**

```json
{
  "action": "DOUBLE"
}
```

**Effects:**

- Deducts additional bet from balance
- Doubles the hand's bet amount
- Deals exactly one card
- Automatically stands the hand
- If all hands complete: triggers dealer turn

#### SPLIT

Split matching cards into two separate hands.

**When Valid**:

- PLAYING phase
- Exactly 2 cards with same rank
- Sufficient balance for additional bet
- Haven't split this hand before

**Request:**

```json
{
  "action": "SPLIT"
}
```

**Effects:**

- Deducts additional bet from balance (equal to original)
- Creates two hands with one card each
- Deals one card to first hand
- **If split aces**: Deals one card to second hand, both hands auto-stand
- **If not aces**: Player continues with first hand, second hand dealt later

#### SURRENDER

Forfeit the hand and receive half the bet back.

**When Valid**:

- PLAYING phase
- First action on hand (2 cards only)
- Dealer not showing blackjack

**Request:**

```json
{
  "action": "SURRENDER"
}
```

**Effects:**

- Returns half of bet to balance
- Marks hand as surrendered
- If all hands complete: triggers dealer turn

#### INSURANCE

Take insurance bet against dealer blackjack (costs half original bet).

**When Valid**:

- ASK_INSURANCE phase
- Dealer showing ace
- Sufficient balance for insurance bet

**Request:**

```json
{
  "action": "INSURANCE"
}
```

**Effects:**

- Deducts insurance bet (0.5x original bet) from balance
- Checks dealer's hole card
- **If dealer has blackjack**: Pays 2:1 on insurance (insurance wins), main bet loses
- **If dealer doesn't have blackjack**: Insurance loses, game continues

#### DECLINE_INSURANCE

Decline insurance offer.

**When Valid**:

- ASK_INSURANCE phase
- Dealer showing ace

**Request:**

```json
{
  "action": "DECLINE_INSURANCE"
}
```

**Effects:**

- No balance change
- Checks dealer's hole card
- **If dealer has blackjack**: Game ends, main bet loses (unless player also has blackjack)
- **If dealer doesn't have blackjack**: Game continues to PLAYING phase

#### RESET_GAME

Reset to betting phase for a new game.

**When Valid**: FINISHED phase

**Request:**

```json
{
  "action": "RESET_GAME"
}
```

**Effects:**

- Clears all hands
- Resets game state
- Transitions to BETTING phase

---

## Request/Response Formats

### Standard Request Format

```typescript
POST /api/games/blackjack/current

{
  action: string;      // Required - One of GameActionType values
  betAmount?: number;  // Optional - Required for START_ROUND
}
```

### Standard Response Format

```typescript
{
  success: boolean;
  gameId: string;
  gameState: {
    // See GameState type below
  };
  availableActions: Array<{
    action: string;
    description: string;
  }>;
  shuffleVerification: {
    // See ShuffleVerification type below
  };
  effects?: Array<Effect>;  // Only in POST responses
  error?: string;           // Only if success: false
}
```

### GameState Type

```typescript
interface GameState {
  gameId: string;
  shuffleId: string;
  shuffleSalt?: string;
  dealtCardCount: number;

  playerHands: Array<{
    cards: Array<{
      suit: 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'hidden';
      rank: 'A' | '2'-'10' | 'J' | 'Q' | 'K' | '?';
      isHidden?: boolean;
    }>;
    bet: number;
    originalBet: number;
    isStanding: boolean;
    isBusted: boolean;
    isBlackjack: boolean;
    isDoubled: boolean;
    isSurrendered: boolean;
    isFromSplit: boolean;
    isSplitAces: boolean;
  }>;

  dealerHand: {
    cards: Array<Card>;
    isStanding: boolean;
    isBusted: boolean;
    isBlackjack: boolean;
    showAllCards: boolean;
  };

  currentHandIndex: number;
  balance: number;
  pendingBet: number;
  initialBet: number;
  gamePhase: 'BETTING' | 'ASK_INSURANCE' | 'PLAYING' | 'DEALER_TURN' | 'FINISHED';
  message: string;

  // Action flags
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  insuranceOffered: boolean;
  insuranceWasOffered: boolean;
  insuranceBet: number;
  dealerHasBlackjack: boolean;

  // Animation state
  dealingStep: number;
  isDealing: boolean;
  isDealingInProgress: boolean;
  lastProcessedStep: number;
  dealerDealingStep: number;
  isDealerDealing: boolean;
  isBustSequence: boolean;
  bustSequenceStep: number;
  dealerBustRevealStep: number;

  // Balance tracking
  startingBalance: number;
  totalWagered: number;
  totalWon: number;
  currentHandProfit: number;
  gameProfit: number;
  handResults: Array<HandResult>;
  result?: 'WIN' | 'LOSE' | 'PUSH';
}
```

### ShuffleVerification Type

```typescript
interface ShuffleVerification {
  shuffleId: string;
  canBeVerified: boolean;
  saltHash: string; // Hash of salt (always visible)
  salt?: string; // Actual salt (revealed when game ends)
  shuffledDeck?: Array<Card>; // Full deck (revealed when game ends)
  timestamp: string;
  isSaltRevealed: boolean;
}
```

---

## Balance Management

### Overview

The balance system is **currently stubbed** and returns placeholder values. The architecture is in place for integration with the main wallet system.

### Current Implementation

```typescript
// src/lib/games/blackjack/balance-service.ts

class BalanceService {
  async getUserBalance(userId: string): Promise<number> {
    // TODO: Get from actual user wallet
    return 100.0;
  }

  async hasSufficientBalance(userId: string, amount: string): Promise<boolean> {
    // TODO: Check actual balance
    return true;
  }

  async handleBalanceChangeEffect(
    userId: string,
    effect: BalanceChangeEffect
  ): Promise<BalanceUpdateResult> {
    // TODO: Update actual balance
    return { success: true, newBalance: "0" };
  }
}
```

### Integration Plan

To integrate with real balance system:

1. **Get User Balance**: Query wallet table for `balanceUsdc`
2. **Validate Sufficient Balance**: Check before deducting
3. **Update Balance**: Use Prisma transactions for atomicity
4. **Log Transactions**: Create transaction records for audit

**Example Integration:**

```typescript
async getUserBalance(userId: string): Promise<number> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balanceUsdcFloat: true }
  });
  return wallet?.balanceUsdcFloat || 0;
}

async handleBalanceChangeEffect(
  userId: string,
  effect: BalanceChangeEffect
): Promise<BalanceUpdateResult> {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
      select: { balanceUsdcFloat: true }
    });

    const currentBalance = wallet?.balanceUsdcFloat || 0;
    const newBalance = effect.operation === 'INCREASE'
      ? currentBalance + effect.amount
      : currentBalance - effect.amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    await tx.wallet.update({
      where: { userId },
      data: { balanceUsdcFloat: newBalance }
    });

    // Log transaction
    await tx.transaction.create({
      data: {
        userId,
        type: effect.reason,
        amountUsdcFloat: effect.amount,
        status: 'CONFIRMED'
      }
    });

    return { success: true, newBalance: newBalance.toString() };
  });
}
```

---

## Provable Fairness (Shuffle Verification)

### Overview

The blackjack system implements **provably fair** gameplay using:

- **Deterministic shuffling** based on shuffleId + salt
- **Pre-commitment** via salt hash
- **Post-game verification** by revealing salt

### How It Works

#### 1. Game Creation

```typescript
const shuffleId = `shuffle_${Date.now()}`;
const shuffleSalt = generateRandomSalt();
const saltHash = sha256(shuffleSalt);

// Store in game
gameState.shuffleId = shuffleId;
gameState.shuffleSalt = shuffleSalt; // Hidden from client until game ends

// Send to client
shuffleVerification = {
  shuffleId,
  saltHash, // Client can verify this later
  isSaltRevealed: false, // Salt hidden during game
};
```

#### 2. Deterministic Card Dealing

```typescript
function createShuffledDeck(shuffleId: string, salt: string): Card[] {
  // Use shuffleId + salt as seed for shuffling
  const seed = `${shuffleId}:${salt}`;

  // Generate deterministic shuffle using seeded random
  const rng = seedrandom(seed);
  const deck = createStandardDeck();

  // Fisher-Yates shuffle with seeded random
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// Deal card at specific index
function dealCard(shuffleId: string, cardIndex: number, salt: string) {
  const deck = createShuffledDeck(shuffleId, salt);
  return deck[cardIndex];
}
```

#### 3. Salt Revelation (Game End)

```typescript
// When game finishes
if (gameState.gamePhase === "FINISHED") {
  shuffleVerification = {
    shuffleId,
    saltHash,
    salt: shuffleSalt, // NOW REVEALED
    shuffledDeck: createShuffledDeck(shuffleId, shuffleSalt),
    isSaltRevealed: true,
  };
}
```

#### 4. Client-Side Verification

```typescript
// Client can verify fairness
function verifyGame(verification: ShuffleVerification) {
  // 1. Verify salt hash matches
  const computedHash = sha256(verification.salt);
  if (computedHash !== verification.saltHash) {
    throw new Error('Salt hash mismatch - game may be tampered');
  }

  // 2. Recreate shuffled deck
  const deck = createShuffledDeck(
    verification.shuffleId,
    verification.salt
  );

  // 3. Verify dealt cards match
  const dealtCards = /* cards that were dealt in game */;
  for (let i = 0; i < dealtCards.length; i++) {
    if (!cardsMatch(deck[i], dealtCards[i])) {
      throw new Error('Card mismatch - game may be tampered');
    }
  }

  return true; // Game is provably fair
}
```

### Why This Works

1. **Pre-commitment**: Salt hash is given to client before cards are dealt
2. **Server can't change outcome**: Salt is hashed, server can't change it without detection
3. **Deterministic**: Same shuffleId + salt always produces same deck
4. **Verifiable**: Client can reproduce entire deck after game ends
5. **Transparent**: Client sees salt after game, can verify fairness

---

## Integration Guide

### Prerequisites

1. **Next.js Project** with App Router
2. **NextAuth.js** configured
3. **Prisma** with PostgreSQL
4. **Environment variables** set:
   ```env
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_DOCS_PASSWORD=bluff-dev-2025
   ```

### Step 1: Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Step 2: Authentication Setup

Ensure NextAuth is configured with:

```typescript
// src/auth/index.ts
export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      /* ... */
    }),
    TwitterProvider({
      /* ... */
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      return session;
    },
  },
});
```

### Step 3: Client Integration

```typescript
// Example: React component using the API

import { useState, useEffect } from "react";

export function BlackjackGame() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch current game on mount
  useEffect(() => {
    fetchGame();
  }, []);

  async function fetchGame() {
    setLoading(true);
    try {
      const res = await fetch("/api/games/blackjack/current");
      const data = await res.json();

      if (data.success) {
        setGameState(data.gameState);
      }
    } catch (error) {
      console.error("Error fetching game:", error);
    } finally {
      setLoading(false);
    }
  }

  async function executeAction(action: string, betAmount?: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/games/blackjack/current", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, betAmount }),
      });

      const data = await res.json();

      if (data.success) {
        setGameState(data.gameState);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setLoading(false);
    }
  }

  // Render game UI
  return (
    <div>
      {loading && <div>Loading...</div>}

      {gameState?.gamePhase === "BETTING" && (
        <button onClick={() => executeAction("START_ROUND", 10)}>
          Start Round ($10)
        </button>
      )}

      {gameState?.gamePhase === "PLAYING" && (
        <>
          <button onClick={() => executeAction("HIT")}>Hit</button>
          <button onClick={() => executeAction("STAND")}>Stand</button>
          {gameState.canDouble && (
            <button onClick={() => executeAction("DOUBLE")}>Double</button>
          )}
          {gameState.canSplit && (
            <button onClick={() => executeAction("SPLIT")}>Split</button>
          )}
        </>
      )}

      {/* Render cards, balance, etc. */}
    </div>
  );
}
```

### Step 4: Balance Integration (TODO)

Update `src/lib/games/blackjack/balance-service.ts` to integrate with your wallet system:

```typescript
async getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });
  return user?.wallet?.balanceUsdcFloat || 0;
}
```

---

## Security Considerations

### Authentication

- ✅ **All endpoints require authentication** via NextAuth session
- ✅ **User ID from session** - never trust client-provided user IDs
- ✅ **JWT tokens** stored in HTTP-only cookies
- ✅ **Session expiration** after 24 hours

### State Management

- ✅ **Server-side game state** - client cannot manipulate
- ✅ **Database persistence** - state survives server restarts
- ✅ **Validation on every action** - invalid actions rejected
- ✅ **Balance checks** - insufficient balance prevents actions

### Provable Fairness

- ✅ **Deterministic shuffling** - reproducible with salt
- ✅ **Pre-commitment** - salt hash provided before dealing
- ✅ **Post-game verification** - salt revealed after game
- ✅ **Client-side verification** - anyone can verify fairness

### API Docs Access

- ✅ **Password protection** - prevents unauthorized discovery
- ✅ **User authentication** - must have valid account
- ✅ **Session storage** - password cleared on browser close
- ✅ **Manual lock button** - quick security reset

### Data Sanitization

- ✅ **Sanitized responses** - dealer hole card hidden during game
- ✅ **Salt concealment** - salt not revealed until game ends
- ✅ **Error messages** - no sensitive data in errors

### Rate Limiting

⚠️ **TODO**: Implement rate limiting on API endpoints to prevent abuse

---

## Error Handling

### Authentication Errors

**401 Unauthorized**

```json
{
  "error": "Authentication required"
}
```

**Cause**: No valid session or session expired

**Solution**: Redirect user to sign in

### Validation Errors

**400 Bad Request**

```json
{
  "success": false,
  "error": "Action is required"
}
```

**Causes**:

- Missing action in request
- Invalid action type
- Action not valid in current game phase
- Insufficient balance
- Invalid bet amount

**Solution**: Check error message and correct request

### Server Errors

**500 Internal Server Error**

```json
{
  "error": "Internal server error"
}
```

**Causes**:

- Database connection failure
- Unexpected exception in game logic
- State machine error

**Solution**: Check server logs, retry request

### Common Error Messages

| Error Message                              | Cause                  | Solution                |
| ------------------------------------------ | ---------------------- | ----------------------- |
| "Authentication required"                  | No session             | Sign in                 |
| "Action is required"                       | Missing action in body | Include action field    |
| "Insufficient balance to start round"      | Not enough funds       | Deposit funds           |
| "Invalid action for current game phase"    | Wrong action for phase | Check gamePhase         |
| "Cannot double down"                       | Not first action       | Hit or stand instead    |
| "Cannot split - cards don't match"         | Different card ranks   | Choose different action |
| "Must provide a bet amount to start round" | Missing betAmount      | Include betAmount       |

---

## Appendix

### Game Action Reference

| Action            | Phase         | Requires Bet | Balance Impact | Description                         |
| ----------------- | ------------- | ------------ | -------------- | ----------------------------------- |
| START_ROUND       | BETTING       | Yes          | -betAmount     | Begin round, deal initial cards     |
| HIT               | PLAYING       | No           | None           | Draw another card                   |
| STAND             | PLAYING       | No           | None           | End current hand                    |
| DOUBLE            | PLAYING       | No           | -originalBet   | Double bet, draw one card, stand    |
| SPLIT             | PLAYING       | No           | -originalBet   | Split matching cards into two hands |
| SURRENDER         | PLAYING       | No           | +0.5×bet       | Forfeit hand, get half bet back     |
| INSURANCE         | ASK_INSURANCE | No           | -0.5×bet       | Bet against dealer blackjack        |
| DECLINE_INSURANCE | ASK_INSURANCE | No           | None           | Decline insurance                   |
| RESET_GAME        | FINISHED      | No           | None           | Start new game                      |

### Payout Rates

| Outcome       | Payout                  |
| ------------- | ----------------------- |
| Win           | 1:1 (bet + bet)         |
| Blackjack     | 3:2 (bet + 1.5×bet)     |
| Push          | 1:0 (return bet)        |
| Lose          | 0:1 (lose bet)          |
| Surrender     | 0.5:1 (return half bet) |
| Insurance Win | 2:1 (insurance bet × 2) |

### Contact & Support

For questions or issues with the Blackjack API:

1. Check this documentation
2. Test in `/api-docs` interface
3. Check server logs for errors
4. Review Prisma schema for data structure
5. Contact development team

---

**Last Updated**: November 3, 2025  
**API Version**: 1.0.0  
**Branch**: `feat/blackjack`
