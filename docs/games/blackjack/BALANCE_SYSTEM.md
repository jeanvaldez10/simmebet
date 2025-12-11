# Blackjack Balance System Documentation

## Overview

This document details the current balance system implementation in the blackjack game and outlines the planned Free Play / Real Money mode selection feature.

---

## Current Balance System

### How Balances Are Currently Handled

#### 1. Initial Balance (Hardcoded)

**Location**: `src/utils/games/blackjack/client/stateUtils.ts`

```typescript
export function createInitialGameState(): GameState {
  return {
    // ... other fields
    balance: 27318, // Starting balance - HARDCODED
    startingBalance: 27318,
    userId: 'dev_user',
    // ... other fields
  };
}
```

- The initial balance is hardcoded to **27318**
- This value is set when creating the initial game state
- `userId` defaults to `"dev_user"` for development/testing

#### 2. Dual Balance System

The game currently operates in two modes based on the `userId`:

##### Demo/Development Mode

**Trigger**: `userId === 'dev_user'` or `userId === 'demo-user'`

**Location**: `src/lib/games/blackjack/stateMachine.ts` (lines 2136-2160)

```typescript
// If no userId or demo user, fall back to local storage (for testing/development)
if (!gameState?.userId || gameState.userId === 'demo-user') {
  let newBalance = gameState.balance;

  if (operation === 'INCREASE') {
    newBalance += amount;
  } else if (operation === 'DECREASE') {
    newBalance -= amount;
  }

  // Save balance to localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('blackjack_balance', newBalance.toString());
  }

  return {
    ...gameState,
    balance: newBalance,
    // ... other fields
  };
}
```

**Key Points**:

- Balance changes are stored in **localStorage** under the key `'blackjack_balance'`
- Persists across page reloads (within the same browser/device)
- No server-side storage or authentication required
- Used for testing and development

##### Real User Mode

**Trigger**: Any authenticated `userId` that is not `'dev_user'` or `'demo-user'`

**Location**: `src/lib/games/blackjack/stateMachine.ts` (lines 2162-2192)

```typescript
// Use balance service for proper balance management
try {
  const result = await this.balanceService.handleBalanceChangeEffect(
    gameState.userId,
    { amount, operation, reason }
  );

  if (!result.success) {
    console.error('Failed to update balance:', result.error);
    return gameState;
  }

  const newBalance = parseFloat(result.newBalance);

  return {
    ...gameState,
    balance: newBalance,
    // ... other fields
  };
} catch (error) {
  console.error('Error updating balance:', error);
  return gameState;
}
```

**Key Points**:

- Calls `balanceService.handleBalanceChangeEffect()` for database persistence
- Currently **NOT FULLY IMPLEMENTED** - the BalanceService has stub methods
- Intended to persist balances to the database via the `UserBalance` table

### 3. Database Schema

**Location**: `prisma/schema.prisma`

```prisma
model UserBalance {
  id        String   @id @default(uuid())
  userId    String   @unique
  balance   Decimal  @default(0) @db.Decimal(10, 2)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id])

  @@map("user_balances")
}
```

**Key Points**:

- Each user has one unique balance record
- Balance stored as `Decimal(10, 2)` for precision (up to 99,999,999.99)
- Default balance is 0
- Linked to the `User` model via foreign key

### 4. API Endpoints

#### Balance Update Endpoint

**Location**: `src/app/(site)/api/users/balance/route.ts`

```typescript
export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    await updateUserBalance(userId, amount);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}
```

**Key Points**:

- POST endpoint at `/api/users/balance`
- Accepts `userId` and `amount` in request body
- Calls `updateUserBalance()` from `userService.ts`

### 5. Service Layer

**Location**: `src/services/userService.ts` (lines 340-378)

```typescript
export async function updateUserBalance(
  userId: string,
  amount: number
): Promise<void> {
  if (!userId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { balance: true },
    });

    if (!user) throw new Error('User not found');

    if (!user.balance) {
      // Create balance record if it doesn't exist
      await prisma.userBalance.create({
        data: {
          userId: user.id,
          balance: amount,
        },
      });
      return;
    }

    // Update existing balance
    await prisma.userBalance.update({
      where: { userId: user.id },
      data: {
        balance: { increment: amount },
      },
    });
  } catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
}
```

**Key Points**:

- Creates `UserBalance` record if it doesn't exist
- Uses Prisma's `increment` operator for atomic updates
- Handles both creation and updates

### 6. Balance Service (Stub Implementation)

**Location**: `src/lib/games/blackjack/balance-service.ts`

The `BalanceService` class is currently **stubbed out** with TODO comments. All methods return placeholder values:

```typescript
export class BalanceService {
  // TODO: Implement balance checking logic
  async hasSufficientBalance(
    _userId: string,
    _amount: string
  ): Promise<boolean> {
    return true;
  }

  // TODO: Implement balance update after game round
  async updateBalanceAfterRound(
    _userId: string,
    _gameOutcome: string,
    _winnings: string,
    _totalWagered: string
  ): Promise<BalanceUpdateResult> {
    return { success: true, newBalance: '0' };
  }

  // TODO: Implement balance change effect handling
  async handleBalanceChangeEffect(
    _userId: string,
    _effect: {
      amount: number;
      operation: 'INCREASE' | 'DECREASE';
      reason: string;
    }
  ): Promise<BalanceUpdateResult> {
    return { success: true, newBalance: '0' };
  }

  // TODO: Implement get user balance from database
  async getUserBalance(_userId: string): Promise<number> {
    return 100.0;
  }
}
```

**Key Points**:

- All methods are placeholders that return success
- Contains extensive commented-out code showing intended implementation
- Would need to integrate with Prisma to actually persist balances

---

## Balance Update Flow

### Current Flow for Demo Users

1. User performs action (bet, win, lose, etc.)
2. Action triggers a `BalanceChangeEffect` in the state machine
3. `handleBalanceChangeEffect()` checks if `userId` is demo user
4. For demo users:
   - Calculate new balance locally
   - Save to `localStorage` as `'blackjack_balance'`
   - Update game state with new balance
5. Game continues with updated balance

### Current Flow for Real Users (Intended, Not Fully Implemented)

1. User performs action (bet, win, lose, etc.)
2. Action triggers a `BalanceChangeEffect` in the state machine
3. `handleBalanceChangeEffect()` checks if `userId` is real user
4. For real users:
   - Call `balanceService.handleBalanceChangeEffect()`
   - ⚠️ **Currently returns stub data** ⚠️
   - Update game state with new balance from service
5. Game continues with updated balance

### Intended Flow for Real Users (Future Implementation)

1. User performs action (bet, win, lose, etc.)
2. Action triggers a `BalanceChangeEffect` in the state machine
3. `handleBalanceChangeEffect()` calls `balanceService.handleBalanceChangeEffect()`
4. Balance service:
   - Validates user has sufficient balance (for DECREASE operations)
   - Makes API call to `/api/users/balance`
   - Updates `UserBalance` table in database
   - Returns new balance
5. Game state updated with new balance from database
6. Game continues with updated balance

---

## Planned Implementation: Free Play / Real Money Mode Selection

### Feature Requirements

#### Mode Selection Modal

**When it appears**:

- **Always** when visiting the blackjack game
- Modal should appear **on top of the game** (before game loads/initializes)
- Written in **Next.js/React** (not PixiJS)

**Options**:

1. **Free Play Mode**

   - No authentication required
   - Starts with 1000 balance
   - Balance resets to 1000 on page refresh/new session
   - **On page reload**: Balance should persist within the same session (localStorage)
   - User can play immediately

2. **Real Money Mode** (Future Implementation)
   - Requires authentication
   - If user is not logged in:
     - Open sign-in modal
     - User must authenticate before proceeding
   - Once authenticated:
     - Load user's real balance from database
     - All balance changes persist to database
     - Use existing `UserBalance` system

### Implementation Plan

#### 1. Create Game Mode Selection Modal Component

**Location**: `src/components/games/blackjack/modals/GameModeModal.tsx` (new file)

**Features**:

- Next.js/React component (NOT PixiJS)
- Rendered at the application level, not inside the game canvas
- Two buttons: "Free Play" and "Real Money"
- Styling consistent with existing modals (similar to `LoginModal` component)

#### 2. Modify Blackjack Game Entry Point

**Location**: `src/components/games/blackjack/BlackjackGame.tsx`

**Changes**:

- Add state to track if mode has been selected
- Show `GameModeModal` when component mounts (mode not selected)
- Only initialize game after mode selection
- Pass selected mode to game initialization

#### 3. Update Initial Game State Creation

**Location**: `src/utils/games/blackjack/client/stateUtils.ts`

**Changes**:

- Accept a parameter for game mode (FREE_PLAY vs REAL_MONEY)
- For FREE_PLAY mode:
  - Check localStorage for existing session balance
  - If exists and valid: use it
  - If not exists: set balance to 1000
  - Store in localStorage with session-specific key
- For REAL_MONEY mode (future):
  - Fetch balance from database via API
  - Use real userId

#### 4. Handle Free Play Balance Persistence

**localStorage Keys**:

- `blackjack_game_mode`: Store selected mode ('FREE_PLAY' | 'REAL_MONEY')
- `blackjack_freeplay_balance`: Store current free play balance
- `blackjack_session_id`: Generate unique session ID to differentiate sessions

**Session Logic**:

- On page load: Check if session ID exists
- If no session ID: Create new session, reset balance to 1000
- If session ID exists: Load balance from localStorage
- On page close/tab close: Can optionally clear session (or let it persist)

#### 5. Update Balance Update Logic

**Location**: `src/lib/games/blackjack/stateMachine.ts`

**Changes**:

- Check game mode instead of just checking `userId`
- For FREE_PLAY mode:
  - Always use localStorage for balance persistence
  - Use key: `blackjack_freeplay_balance`
  - Do NOT call balance service
- For REAL_MONEY mode:
  - Use existing balance service logic
  - Persist to database

### File Structure

```
src/
├── components/
│   └── games/
│       └── blackjack/
│           ├── BlackjackGame.tsx (modified)
│           └── modals/
│               ├── GameModeModal.tsx (new)
│               ├── GameModals.tsx (existing)
│               ├── ResultModal.tsx (existing)
│               └── ShuffleModal.tsx (existing)
├── types/
│   └── games/
│       └── blackjack/
│           └── game.ts (add GameMode type)
├── utils/
│   └── games/
│       └── blackjack/
│           └── client/
│               └── stateUtils.ts (modified)
└── lib/
    └── games/
        └── blackjack/
            └── stateMachine.ts (modified)
```

### New Types

```typescript
// Add to src/types/games/blackjack/game.ts

export enum GameMode {
  FREE_PLAY = 'FREE_PLAY',
  REAL_MONEY = 'REAL_MONEY',
}

export interface GameModeSelection {
  mode: GameMode;
  selectedAt: string; // timestamp
  sessionId: string;
}
```

---

## Implementation Steps (Detailed)

### Step 1: Create Types

- Add `GameMode` enum to game types
- Add `GameModeSelection` interface
- Update `GameState` interface to include `gameMode` field

### Step 2: Create Game Mode Selection Modal

- Create new React component `GameModeModal.tsx`
- Two large, prominent buttons for mode selection
- Styling similar to existing modal components
- Modal should block game initialization until selection is made

### Step 3: Integrate Modal into Blackjack Game

- Add state management for mode selection
- Show modal on component mount
- Pass mode to game initialization
- Only render BlackjackCanvas after mode is selected

### Step 4: Update Game Initialization

- Modify `createInitialGameState()` to accept mode parameter
- Implement session management for Free Play:
  - Generate session ID if new
  - Load existing balance if session exists
  - Default to 1000 for new sessions
- Store game mode in game state

### Step 5: Update Balance Update Logic

- Modify `handleBalanceChangeEffect()` in state machine
- Branch logic based on game mode:
  - FREE_PLAY: Use localStorage with `blackjack_freeplay_balance`
  - REAL_MONEY: Use existing balance service (future implementation)

### Step 6: Handle Real Money Mode (Placeholder)

- Show authentication modal if not logged in
- After authentication, proceed with game initialization
- Note: Full implementation deferred to future work

---

## Technical Considerations

### Multi-Tab and Multi-User Scenarios

**Critical Consideration**: How do we handle multiple tabs/users accessing Free Play mode?

#### Scenario Analysis

**1. Different Users on Different Devices**

- **Status**: ✅ No issues
- **Reason**: Each browser has its own localStorage
- **Behavior**: Each user has completely independent sessions

**2. Same User, Different Browsers (Same Device)**

- **Status**: ✅ No issues
- **Reason**: Each browser has its own localStorage
- **Behavior**: Each browser maintains its own free play session

**3. Same User, Multiple Tabs (Same Browser)**

- **Status**: ⚠️ **POTENTIAL ISSUES** - This is the main concern
- **Problem**: All tabs share the same localStorage
- **Issues**:
  - Both tabs read/write to same `blackjack_freeplay_balance` key
  - Balance updates in Tab A won't immediately reflect in Tab B
  - Race conditions: Both tabs could place bets simultaneously
  - Desync: Final balance could be incorrect due to competing writes
  - Confusion: User sees different balances in different tabs

#### Solutions (3 Approaches)

**Option A: Single Session Sync (Recommended)**

- All tabs share the same session and balance
- Use `storage` event listener to sync between tabs
- When Tab A updates balance, Tab B listens and updates its state
- Provides consistent experience across tabs

**Implementation**:

```typescript
// Listen for localStorage changes from other tabs
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'blackjack_freeplay_balance' && e.newValue) {
      const newBalance = parseFloat(e.newValue);
      setGameState((prev) => ({ ...prev, balance: newBalance }));
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

**Pros**:

- Consistent balance across all tabs
- User can see updates in real-time
- Most intuitive UX

**Cons**:

- More complex implementation
- Could still have race conditions if both tabs act simultaneously
- Need to handle game state sync (not just balance)

---

**Option B: Independent Sessions Per Tab**

- Each tab gets its own in-memory session ID (not stored in localStorage)
- Each tab operates completely independently
- localStorage only used for persistence between page reloads
- Use a tab-specific key: `blackjack_freeplay_balance_${tabId}`

**Implementation**:

```typescript
// Generate unique tab ID on mount (not persisted)
const tabId = useRef(`tab_${Date.now()}_${Math.random()}`);

// Use tab-specific localStorage key
const storageKey = `blackjack_freeplay_balance_${tabId.current}`;
```

**Pros**:

- Simple implementation
- No race conditions - complete isolation
- Clear separation of concerns

**Cons**:

- Each tab starts with fresh 1000 balance
- May confuse users who expect shared state
- No persistence benefit across tabs

---

**Option C: Single Tab Enforcement (Simplest)**

- Only allow one active tab at a time
- Detect multiple tabs using localStorage or BroadcastChannel
- Show warning message in secondary tabs
- Disable game functionality in inactive tabs

**Implementation**:

```typescript
// Use a timestamp to detect active tabs
const TAB_HEARTBEAT_KEY = 'blackjack_active_tab_heartbeat';
const HEARTBEAT_INTERVAL = 1000; // 1 second

useEffect(() => {
  const tabId = `tab_${Date.now()}_${Math.random()}`;
  let isActiveTab = true;

  // Heartbeat to claim active status
  const heartbeat = setInterval(() => {
    localStorage.setItem(
      TAB_HEARTBEAT_KEY,
      JSON.stringify({
        tabId,
        timestamp: Date.now(),
      })
    );
  }, HEARTBEAT_INTERVAL);

  // Check if another tab is active
  const checkActiveTab = setInterval(() => {
    const stored = localStorage.getItem(TAB_HEARTBEAT_KEY);
    if (stored) {
      const { tabId: activeTabId, timestamp } = JSON.parse(stored);
      const isStale = Date.now() - timestamp > HEARTBEAT_INTERVAL * 2;

      if (activeTabId !== tabId && !isStale) {
        isActiveTab = false;
        setShowInactiveTabWarning(true);
      } else {
        isActiveTab = true;
        setShowInactiveTabWarning(false);
      }
    }
  }, HEARTBEAT_INTERVAL);

  return () => {
    clearInterval(heartbeat);
    clearInterval(checkActiveTab);
  };
}, []);
```

**Pros**:

- Clearest UX - no confusion
- No race conditions
- Simplest to reason about

**Cons**:

- Restrictive - user can't compare strategies across tabs
- More code for tab detection
- User might find it annoying

---

#### Recommended Approach

**Use Option A (Single Session Sync) with safeguards:**

1. **Implement storage event listening** for real-time sync across tabs
2. **Add optimistic locking** using a version counter:
   ```typescript
   interface FreePlaySession {
     sessionId: string;
     balance: number;
     version: number; // Increment on each update
     timestamp: number;
   }
   ```
3. **Handle conflicts**: When updating balance, check version:

   - Read current version from localStorage
   - If version changed since last read, reload balance
   - Increment version and write
   - This prevents lost updates

4. **Graceful degradation**: If desync detected, show subtle warning:

   ```
   "Balance updated in another tab. Refreshing..."
   ```

5. **Game state locking**: During active gameplay (cards dealt), prevent other tabs from starting a new hand:
   ```typescript
   interface FreePlaySession {
     // ... other fields
     activeGameId: string | null; // Only one game active at a time
     activeTabId: string | null;
   }
   ```

**Why this approach**:

- Best user experience - balance stays consistent
- Allows multiple tabs for reference (e.g., checking strategy)
- Handles edge cases gracefully
- More work upfront but better long-term

---

### Session Management

**Question**: When should a free play session reset?

**Options**:

1. **On tab close**: Clear session ID when user closes tab/window
   - Pros: Clean separation between sessions
   - Cons: May require `beforeunload` event listeners
2. **On browser close**: Session persists until browser is fully closed
   - Pros: Simpler implementation, better UX
   - Cons: Harder to detect "new session"
3. **Time-based**: Session expires after X hours of inactivity
   - Pros: Balance between persistence and reset
   - Cons: More complex logic

**Recommendation**: Use time-based approach with 24-hour expiration. Store session timestamp, compare on load.

### Modal Rendering

The modal MUST be rendered in Next.js/React, not PixiJS:

**Correct Location**:

```typescript
// src/components/games/blackjack/BlackjackGame.tsx
export default function BlackjackGame() {
  const [modeSelected, setModeSelected] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  return (
    <>
      {/* Modal rendered in React/Next.js */}
      {!modeSelected && (
        <GameModeModal
          onSelect={(mode) => {
            setGameMode(mode);
            setModeSelected(true);
          }}
        />
      )}

      {/* Game only renders after mode selection */}
      {modeSelected && gameMode && (
        <BlackjackGameProvider value={gameState}>
          <BlackjackGameInner gameMode={gameMode} />
        </BlackjackGameProvider>
      )}
    </>
  );
}
```

**NOT in PixiJS Canvas**: The modal should overlay the entire page, not be rendered inside the canvas.

---

## Detailed Implementation Plan

### Overview

Add a game mode selection modal (Free Play vs Real Money) that appears before the blackjack game loads. The modal will be rendered in Next.js/React on top of the game interface, with proper multi-tab handling.

### Implementation Steps

#### 1. Create GameMode Types

**File**: `src/types/games/blackjack/game.ts`

**Changes**:

```typescript
export enum GameMode {
  FREE_PLAY = 'FREE_PLAY',
  REAL_MONEY = 'REAL_MONEY',
}

export interface FreePlaySession {
  sessionId: string;
  balance: number;
  version: number; // For optimistic locking
  timestamp: number;
  expiresAt: number; // timestamp + 24 hours
  activeGameId: string | null; // Currently active game
  activeTabId: string | null; // Tab with active game
}

export interface GameModeSelection {
  mode: GameMode;
  selectedAt: string;
}

// Update GameState interface to include:
export interface GameState {
  // ... existing fields
  gameMode: GameMode; // Add this field
  tabId?: string; // Unique ID for this tab
}
```

#### 2. Create Session Utilities

**File**: `src/utils/games/blackjack/client/sessionUtils.ts` (new file)

**Functions**:

```typescript
// Generate unique tab ID
export function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create new free play session
export function createFreePlaySession(): FreePlaySession {
  const sessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const timestamp = Date.now();

  return {
    sessionId,
    balance: 1000, // Starting balance
    version: 0,
    timestamp,
    expiresAt: timestamp + 24 * 60 * 60 * 1000, // 24 hours
    activeGameId: null,
    activeTabId: null,
  };
}

// Get existing session or create new one
export function getFreePlaySession(): FreePlaySession {
  if (typeof window === 'undefined') return createFreePlaySession();

  const stored = localStorage.getItem('blackjack_freeplay_session');

  if (!stored) {
    const newSession = createFreePlaySession();
    localStorage.setItem(
      'blackjack_freeplay_session',
      JSON.stringify(newSession)
    );
    return newSession;
  }

  try {
    const session: FreePlaySession = JSON.parse(stored);

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      console.log('Session expired, creating new session');
      const newSession = createFreePlaySession();
      localStorage.setItem(
        'blackjack_freeplay_session',
        JSON.stringify(newSession)
      );
      return newSession;
    }

    return session;
  } catch (error) {
    console.error('Error parsing session, creating new one:', error);
    const newSession = createFreePlaySession();
    localStorage.setItem(
      'blackjack_freeplay_session',
      JSON.stringify(newSession)
    );
    return newSession;
  }
}

// Update balance with optimistic locking
export function updateFreePlayBalance(
  newBalance: number,
  tabId: string
): { success: boolean; currentSession: FreePlaySession } {
  const session = getFreePlaySession();

  // Increment version for optimistic locking
  const updatedSession: FreePlaySession = {
    ...session,
    balance: newBalance,
    version: session.version + 1,
    timestamp: Date.now(),
  };

  localStorage.setItem(
    'blackjack_freeplay_session',
    JSON.stringify(updatedSession)
  );

  return { success: true, currentSession: updatedSession };
}

// Clear session (for testing/reset)
export function clearFreePlaySession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('blackjack_freeplay_session');
  }
}

// Check if session is valid
export function isSessionValid(session: FreePlaySession): boolean {
  return Date.now() < session.expiresAt;
}
```

#### 3. Create Game Mode Selection Modal

**File**: `src/components/games/blackjack/modals/GameModeModal.tsx` (new file)

**Component Structure**:

```typescript
import { GameMode } from '@/types/games/blackjack/game';

interface GameModeModalProps {
  onSelect: (mode: GameMode) => void;
}

export function GameModeModal({ onSelect }: GameModeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#1a1a2e] border border-[#FFFFFF29] rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Choose Game Mode
        </h2>

        <p className="text-gray-400 text-center mb-8">
          Select how you want to play blackjack
        </p>

        <div className="space-y-4">
          {/* Free Play Button */}
          <button
            onClick={() => onSelect(GameMode.FREE_PLAY)}
            className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all transform hover:scale-105"
          >
            <div className="text-2xl font-bold mb-2">🎮 Free Play</div>
            <div className="text-sm opacity-90">
              Start with $1,000 play money
            </div>
          </button>

          {/* Real Money Button (Disabled for now) */}
          <button
            disabled
            className="w-full p-6 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed opacity-50"
          >
            <div className="text-2xl font-bold mb-2">💰 Real Money</div>
            <div className="text-sm">Coming Soon - Sign in required</div>
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 4. Modify Blackjack Game Entry Point

**File**: `src/components/games/blackjack/BlackjackGame.tsx`

**Changes**:

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  BlackjackGameProvider,
  useBlackjackGame,
} from '@/contexts/BlackjackGameContext';
import { useGameState } from '@/hooks/games/blackjack/useGameState';
import { BlackjackCanvas } from './canvas/BlackjackCanvas';
import { GameShell } from '../common/GameShell';
import { ENABLE_BLACKJACK_DEV_TOOLS } from '@/constants';
import { GameStateSelector } from './dev/GameStateSelector';
import { SoundTester } from './dev/SoundTester';
import { GameModeModal } from './modals/GameModeModal';
import { GameMode } from '@/types/games/blackjack/game';

function BlackjackGameInner({ gameMode }: { gameMode: GameMode }) {
  const { setGameStateDirectly } = useBlackjackGame();

  return (
    <GameShell
      CanvasComponent={BlackjackCanvas}
      devToolsContent={
        ENABLE_BLACKJACK_DEV_TOOLS ? (
          <>
            <GameStateSelector onSelectState={setGameStateDirectly} />
            <SoundTester />
          </>
        ) : null
      }
    />
  );
}

export default function BlackjackGame() {
  const [modeSelected, setModeSelected] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  const gameState = useGameState(gameMode); // Pass gameMode to hook

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setModeSelected(true);
  };

  return (
    <>
      {/* Mode selection modal - always shows on mount */}
      {!modeSelected && <GameModeModal onSelect={handleModeSelect} />}

      {/* Game only renders after mode selection */}
      {modeSelected && gameMode && (
        <BlackjackGameProvider value={gameState}>
          <BlackjackGameInner gameMode={gameMode} />
        </BlackjackGameProvider>
      )}
    </>
  );
}
```

#### 5. Update useGameState Hook

**File**: `src/hooks/games/blackjack/useGameState.ts`

**Changes**:

- Accept `gameMode` parameter (can be null initially)
- Add storage event listener for multi-tab sync
- Initialize with correct balance based on mode

```typescript
export function useGameState(gameMode: GameMode | null) {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(gameMode)
  );

  // Multi-tab sync for Free Play mode
  useEffect(() => {
    if (gameMode !== GameMode.FREE_PLAY) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blackjack_freeplay_session' && e.newValue) {
        try {
          const session = JSON.parse(e.newValue);

          // Only update if game is not in progress
          if (gameState.gamePhase === GamePhaseType.BETTING) {
            setGameState((prev) => ({
              ...prev,
              balance: session.balance,
              startingBalance: session.balance,
            }));
          }
        } catch (error) {
          console.error('Error syncing balance from another tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [gameMode, gameState.gamePhase]);

  // Rest of existing logic...
}
```

#### 6. Update Initial Game State Creation

**File**: `src/utils/games/blackjack/client/stateUtils.ts`

**Changes**:

```typescript
import {
  GameMode,
  GamePhaseType,
  GameState,
} from '@/types/games/blackjack/game';
import { getFreePlaySession, generateTabId } from './sessionUtils';

export function createInitialGameState(
  gameMode: GameMode | null = null
): GameState {
  let balance = 27318; // Default
  let userId = 'dev_user';
  let tabId: string | undefined;

  // If Free Play mode, use session-based balance
  if (gameMode === GameMode.FREE_PLAY) {
    const session = getFreePlaySession();
    balance = session.balance;
    userId = 'freeplay_user'; // Special ID for free play
    tabId = generateTabId();
  }

  return {
    gameId: `game_${Date.now()}`,
    shuffleId: `shuffle_${Date.now()}`,
    shuffleSalt: undefined,
    dealtCardCount: 0,
    playerHands: [],
    dealerHand: {
      cards: [],
      isStanding: false,
      isBusted: false,
      isBlackjack: false,
      showAllCards: false,
    },
    currentHandIndex: 0,
    balance,
    pendingBet: 0,
    initialBet: 0,
    insuranceBet: 0,
    totalWagered: 0,
    totalWon: 0,
    gameProfit: 0,
    currentHandProfit: 0,
    startingBalance: balance,
    gamePhase: GamePhaseType.BETTING,
    message: 'Place your bet',
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    insuranceOffered: false,
    shuffle: false,
    insuranceWasOffered: false,
    dealerHasBlackjack: undefined,
    dealingStep: 0,
    isDealing: false,
    isDealingInProgress: false,
    lastProcessedStep: 0,
    dealerDealingStep: 0,
    isDealerDealing: false,
    isBustSequence: false,
    bustSequenceStep: 0,
    dealerBustRevealStep: 0,
    handResults: [],
    userId,
    gameMode: gameMode || GameMode.FREE_PLAY, // Default to free play
    tabId,
    pairBet: 0,
    twentyOnePlusThreeBet: 0,
    sidebetResults: [],
    originalPairBet: 0,
    originalTwentyOnePlusThreeBet: 0,
    previousBet: 0,
  };
}
```

#### 7. Update Balance Update Logic in State Machine

**File**: `src/lib/games/blackjack/stateMachine.ts`

**Changes** to `handleBalanceChangeEffect` method:

```typescript
private async handleBalanceChangeEffect(
  gameState: GameState,
  effect: BalanceChangeEffect
): Promise<GameState> {
  const { amount, operation, reason } = effect;

  // Check game mode instead of just userId
  if (gameState.gameMode === GameMode.FREE_PLAY ||
      !gameState.userId ||
      gameState.userId === 'demo-user' ||
      gameState.userId === 'freeplay_user') {

    let newBalance = gameState.balance;

    if (operation === 'INCREASE') {
      newBalance += amount;
    } else if (operation === 'DECREASE') {
      newBalance -= amount;
    }

    // Save balance to localStorage for Free Play mode
    if (typeof window !== 'undefined' && gameState.gameMode === GameMode.FREE_PLAY) {
      const { updateFreePlayBalance } = await import('@/utils/games/blackjack/client/sessionUtils');
      updateFreePlayBalance(newBalance, gameState.tabId || '');
    }

    return {
      ...gameState,
      balance: newBalance,
      initialBet: gameState.initialBet,
      insuranceBet: gameState.insuranceBet,
      playerHands: gameState.playerHands,
      dealerHand: gameState.dealerHand,
    };
  }

  // Real Money mode - use balance service (future implementation)
  try {
    const result = await this.balanceService.handleBalanceChangeEffect(
      gameState.userId,
      { amount, operation, reason }
    );

    if (!result.success) {
      console.error('Failed to update balance:', result.error);
      return gameState;
    }

    const newBalance = parseFloat(result.newBalance);

    return {
      ...gameState,
      balance: newBalance,
      initialBet: gameState.initialBet,
      insuranceBet: gameState.insuranceBet,
      playerHands: gameState.playerHands,
      dealerHand: gameState.dealerHand,
    };
  } catch (error) {
    console.error('Error updating balance:', error);
    return gameState;
  }
}
```

### Files to Create

1. `src/components/games/blackjack/modals/GameModeModal.tsx` - Mode selection modal
2. `src/utils/games/blackjack/client/sessionUtils.ts` - Session management utilities

### Files to Modify

1. `src/types/games/blackjack/game.ts` - Add GameMode enum and types
2. `src/components/games/blackjack/BlackjackGame.tsx` - Integrate modal and mode selection
3. `src/hooks/games/blackjack/useGameState.ts` - Add gameMode parameter and multi-tab sync
4. `src/utils/games/blackjack/client/stateUtils.ts` - Update initial state creation
5. `src/lib/games/blackjack/stateMachine.ts` - Update balance handling logic

### Multi-Tab Handling Summary

**Approach**: Single Session Sync with Storage Events

**How it works**:

1. All tabs share the same `blackjack_freeplay_session` in localStorage
2. When balance updates in one tab, it writes to localStorage
3. Other tabs listen for `storage` events and sync their balance
4. Version counter prevents race conditions (optimistic locking)
5. Only sync when game is in BETTING phase (not during active gameplay)

**Edge cases handled**:

- Session expiration (24 hours)
- Multiple simultaneous updates (version control)
- Tab-specific game states (each tab can have its own hand)
- Balance consistency across tabs

---

## Future Work: Real Money Mode

### Requirements for Full Implementation

1. **Complete Balance Service Implementation**

   - Implement all methods in `src/lib/games/blackjack/balance-service.ts`
   - Add proper error handling and validation
   - Integrate with Prisma for database operations

2. **Authentication Integration**

   - Use existing `useAuth` hook from `src/hooks/useAuth.ts`
   - Show `LoginModal` component if user is not authenticated
   - Pass real `userId` to game state after authentication

3. **Balance Source Decision**

   - **Option A**: Use `UserBalance` table (separate game balance)

     - Pros: Isolated from wallet, easier to manage
     - Cons: Requires deposit/withdrawal system

   - **Option B**: Use USDC balance from user's wallet directly

     - Pros: No separate balance management needed
     - Cons: Directly impacts user's actual funds

   - **Option C**: Hybrid approach (game balance backed by wallet)
     - Pros: Best of both worlds
     - Cons: Most complex to implement

4. **Transaction Logging**

   - Log all balance changes to database
   - Audit trail for compliance and debugging
   - Link transactions to specific game actions

5. **Balance Validation**

   - Server-side validation of all balance changes
   - Prevent negative balances
   - Prevent double-spending or race conditions

6. **Testing**
   - Unit tests for balance service
   - Integration tests for API endpoints
   - End-to-end tests for game flow with real money

---

## Summary

### Current State

- Balances are **hardcoded to 27318** in initial game state
- Demo users (`dev_user` or `demo-user`) use localStorage
- Real users are intended to use database, but BalanceService is stubbed out
- Database schema exists but is not actively used by blackjack game

### Planned Changes (Free Play Mode)

- Add mode selection modal (Next.js/React, not PixiJS)
- Modal always appears on game load
- Free Play mode: 1000 starting balance, persists on reload within session
- New session = reset to 1000
- Real Money mode: Placeholder for future implementation

### Future Work

- Complete BalanceService implementation
- Full authentication integration for Real Money mode
- Decide on balance source (UserBalance table vs wallet vs hybrid)
- Transaction logging and audit trail
- Comprehensive testing

---

## Related Files

### Current Implementation

- `src/utils/games/blackjack/client/stateUtils.ts` - Initial state creation (hardcoded balance)
- `src/lib/games/blackjack/stateMachine.ts` - Balance update logic
- `src/lib/games/blackjack/balance-service.ts` - Stubbed balance service
- `src/services/userService.ts` - Database balance operations
- `src/app/(site)/api/users/balance/route.ts` - Balance API endpoint
- `prisma/schema.prisma` - UserBalance model

### Planned Files

- `src/components/games/blackjack/modals/GameModeModal.tsx` (new)
- `src/types/games/blackjack/game.ts` (add GameMode types)

### Related Components

- `src/components/used-components/auth/login/login-modal.tsx` - Login modal for reference
- `src/components/AuthModal.tsx` - Twitter auth modal
- `src/components/games/blackjack/modals/GameModals.tsx` - Existing modal structure
- `src/hooks/useAuth.ts` - Authentication hook
