# Game Architecture Blueprint

This document provides a comprehensive guide to replicate the architecture pattern used in this blackjack project for any other turn-based game.

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Pattern](#architecture-pattern)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Implementation Guide](#implementation-guide)
7. [API Design Pattern](#api-design-pattern)
8. [State Management Pattern](#state-management-pattern)
9. [Authentication Pattern](#authentication-pattern)
10. [Database Schema Pattern](#database-schema-pattern)
11. [Testing Strategy](#testing-strategy)

---

## Overview

This architecture follows a **full-stack, type-safe, session-based gaming platform** pattern with:

- **Frontend**: React 19 + Next.js 15 (App Router) + TypeScript
- **Backend**: Next.js API Routes with middleware pattern
- **Authentication**: Sign-In With Ethereum (SIWE) with session cookies
- **Database**: Prisma ORM with SQLite (easily adaptable to PostgreSQL)
- **State Management**: Custom React hooks with state machine pattern
- **Balance Management**: Atomic balance updates with optimistic UI
- **Testing**: Jest with comprehensive test coverage

### Key Design Principles

1. **Type Safety**: End-to-end TypeScript with shared types between frontend and backend
2. **Separation of Concerns**: Clear separation between game logic, UI, API, and database layers
3. **State Machine Pattern**: Predictable state transitions with validation
4. **Effect System**: Side effects (balance changes, card dealing) tracked separately from state
5. **Hook-Based Architecture**: Composable, reusable React hooks for game logic
6. **Database Persistence**: All game state persisted and retrievable
7. **Authentication First**: All game actions require authenticated user

---

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "@prisma/client": "^6.15.0",
    "@reown/appkit": "^1.8.2",
    "@reown/appkit-adapter-wagmi": "^1.8.2",
    "@tanstack/react-query": "^5.86.0",
    "next": "15.5.2",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "siwe": "^3.0.0",
    "viem": "^2.37.3",
    "wagmi": "^2.16.9"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "jest": "^30.1.3",
    "prisma": "^6.15.0",
    "typescript": "^5"
  }
}
```

---

## Architecture Pattern

### High-Level Flow

```
User Action → Frontend Hook → API Route → Authentication Middleware →
State Machine → Game Logic → Database Update → Response → Frontend Update
```

### Request/Response Flow

```typescript
// 1. User triggers action
const handleAction = () => sendAction(GameActionType.HIT);

// 2. Hook sends API request
const sendAction = async (action: GameActionType, amount?: number) => {
  const response = await fetch("/api/game/current", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, betAmount: amount }),
  });
  return response.json();
};

// 3. API authenticates and processes
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request); // Auth middleware
  const { action, betAmount } = await request.json();

  const gameState = await gameService.getOrCreateCurrentGame(user.id);
  const result = await stateMachine.processActionWithLoop({
    gameState,
    action,
    amount: betAmount,
    userId: user.id,
  });

  await gameService.updateGameState(
    gameState.gameId,
    result.newGameState,
    user.id
  );

  return NextResponse.json({
    success: true,
    gameState: sanitizeGameData(result.newGameState),
    availableActions: getAvailableActions(result.newGameState),
  });
}

// 4. Frontend updates state
if (result.success && result.gameState) {
  setLocalGameState(result.gameState);
  await refreshBalance();
}
```

---

## Project Structure

```
/your-game-api/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Database seeding
├── src/
│   ├── __tests__/              # All tests
│   │   ├── api/                # API route tests
│   │   ├── game-actions/       # Game action tests
│   │   ├── integration/        # Integration tests
│   │   └── hooks/              # Hook tests
│   ├── app/
│   │   ├── api/
│   │   │   ├── game/
│   │   │   │   ├── current/
│   │   │   │   │   └── route.ts    # Main game API
│   │   │   │   └── [gameId]/
│   │   │   │       └── route.ts    # Specific game API
│   │   │   ├── siwe/
│   │   │   │   ├── route.ts        # Auth endpoints
│   │   │   │   └── me/
│   │   │   │       └── route.ts    # User session
│   │   │   └── games/
│   │   │       └── route.ts        # Game history
│   │   ├── page.tsx            # Main game page
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── [GameName]Game.tsx  # Main game component
│   │   ├── [GameName]Card.tsx  # Card/piece component
│   │   ├── AppKitProvider.tsx  # Wallet provider
│   │   └── ...                 # Other UI components
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/
│   │   ├── index.ts            # Hook exports
│   │   ├── useGameSession.ts   # Main game session hook
│   │   ├── useGameActions.ts   # Game actions hook
│   │   ├── useGameState.ts     # Game state hook
│   │   ├── useBalanceQuery.ts  # Balance management hook
│   │   └── ...                 # Other hooks
│   ├── lib/
│   │   ├── stateMachine.ts     # Game state machine
│   │   ├── gameStateActions.ts # Game action handlers
│   │   ├── gameStateValidator.ts   # Action validators
│   │   ├── authenticatedGameStateService.ts    # Game service
│   │   ├── balance-service.ts  # Balance management
│   │   ├── auth-utils.ts       # Auth utilities
│   │   └── prisma.ts           # Prisma client
│   ├── types/
│   │   └── game.ts             # Game type definitions
│   └── utils/
│       ├── actionUtils.ts      # Action utilities
│       ├── actionValidation.ts # Action validation
│       └── ...                 # Other utilities
├── package.json
├── tsconfig.json
├── jest.config.js
└── next.config.ts
```

---

## Core Components

### 1. Type System (`src/types/game.ts`)

Define all game-specific types:

```typescript
// Game Action Types - Define all possible actions in your game
export enum GameActionType {
  PLACE_BET = "PLACE_BET",
  START_ROUND = "START_ROUND",
  // Add your game-specific actions
  MOVE_PIECE = "MOVE_PIECE",
  ROLL_DICE = "ROLL_DICE",
  END_TURN = "END_TURN",
  // ... etc
}

// Game Phase Types - Define the states/phases of your game
export enum GamePhaseType {
  WAITING_FOR_PLAYERS,
  BETTING,
  PLAYING,
  FINISHED,
}

// Card/Piece/Token representation
export interface GamePiece {
  id: string;
  type: string;
  position?: number;
  // Add game-specific properties
}

// Player Hand/State
export interface PlayerState {
  pieces: GamePiece[];
  score: number;
  bet: number;
  // Add game-specific properties
}

// Main Game State - This is persisted to database
export interface GameState {
  gameId: string;
  userId: string;

  // Game-specific state
  playerStates: PlayerState[];
  currentPlayerIndex: number;

  // Universal state
  balance: number;
  pendingBet: number;
  initialBet: number;
  gamePhase: GamePhaseType;
  message: string;

  // Add game-specific fields
}

// Frontend Game State - Sanitized for frontend (no secrets)
export interface FrontendGameState extends Omit<GameState, "secretField"> {
  // Only include fields that are safe to send to frontend
}

// Available actions for UI
export interface AvailableAction {
  action: string;
  description: string;
  isEnabled?: boolean;
  metadata?: any;
}
```

### 2. State Machine (`src/lib/stateMachine.ts`)

The state machine is the heart of game logic:

```typescript
export interface StateMachineInput {
  gameState: GameState;
  action: GameActionType;
  amount?: number;
  userId?: string;
  [key: string]: any; // Game-specific parameters
}

export interface StateMachineResult {
  success: boolean;
  newGameState: GameState;
  effects: Effect[];
  waitingForUserAction: boolean;
  error?: string;
  details?: any;
}

// Effect types for side effects
export type Effect =
  | BalanceChangeEffect
  | GamePhaseChangeEffect
  | MessageUpdateEffect
  | CustomEffect;

export class GameStateMachine {
  constructor(private gameActions: GameStateActions) {}

  async processAction(input: StateMachineInput): Promise<StateMachineResult> {
    // 1. Validate action is allowed in current state
    const validation = this.validateAction(input);
    if (!validation.isValid) {
      return {
        success: false,
        newGameState: input.gameState,
        effects: [],
        waitingForUserAction: false,
        error: validation.error,
      };
    }

    // 2. Process the action based on type
    switch (input.action) {
      case GameActionType.PLACE_BET:
        return this.gameActions.placeBet(input.gameState, input.amount);

      case GameActionType.START_ROUND:
        return this.gameActions.startRound(input.gameState);

      // Add your game-specific actions
      case GameActionType.MOVE_PIECE:
        return this.gameActions.movePiece(
          input.gameState,
          input.pieceId,
          input.position
        );

      default:
        return {
          success: false,
          newGameState: input.gameState,
          effects: [],
          waitingForUserAction: false,
          error: "Unknown action",
        };
    }
  }

  // Process action with automatic transitions (e.g., computer turns)
  async processActionWithLoop(
    input: StateMachineInput
  ): Promise<StateMachineResult> {
    let result = await this.processAction(input);

    // Keep processing until waiting for user action
    while (result.success && !result.waitingForUserAction) {
      // Process automatic transitions
      const autoResult = await this.processAutoTransition(result.newGameState);
      if (!autoResult.success) break;
      result = autoResult;
    }

    return result;
  }
}
```

### 3. Game Actions (`src/lib/gameStateActions.ts`)

Implement game logic in action handlers:

```typescript
export class GameStateActions {
  constructor(private deckProvider: DeckProvider) {}

  placeBet(gameState: GameState, amount: number): StateMachineResult {
    // Validate bet
    if (amount <= 0 || amount > gameState.balance) {
      return {
        success: false,
        newGameState: gameState,
        effects: [],
        waitingForUserAction: true,
        error: "Invalid bet amount",
      };
    }

    // Update state
    const newGameState = {
      ...gameState,
      pendingBet: amount,
      message: `Bet placed: ${amount}`,
    };

    return {
      success: true,
      newGameState,
      effects: [],
      waitingForUserAction: true,
    };
  }

  startRound(gameState: GameState): StateMachineResult {
    // Deduct bet from balance
    const effects: Effect[] = [
      {
        type: "BALANCE_CHANGE",
        data: {
          amount: gameState.pendingBet,
          operation: "DECREASE",
          reason: "BET_PLACED",
        },
      },
    ];

    // Initialize game
    const newGameState = {
      ...gameState,
      initialBet: gameState.pendingBet,
      gamePhase: GamePhaseType.PLAYING,
      message: "Game started!",
    };

    return {
      success: true,
      newGameState,
      effects,
      waitingForUserAction: true,
    };
  }

  // Add your game-specific action handlers
  movePiece(
    gameState: GameState,
    pieceId: string,
    position: number
  ): StateMachineResult {
    // Implement your game logic
    // ...
  }
}
```

### 4. Authentication Middleware (`src/lib/auth-utils.ts`)

```typescript
export interface AuthenticatedUser {
  id: string;
  walletAddress: string;
  balance: number;
  createdAt: string;
}

export async function getCurrentUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const sessionToken = request.cookies.get("siwe-session")?.value;
    if (!sessionToken) return null;

    const sessionHash = Buffer.from(sessionToken, "hex").toString("base64");

    const session = await prisma.session.findUnique({
      where: { tokenHash: sessionHash },
      include: { user: { include: { wallet: true } } },
    });

    if (!session || session.expiresAt < new Date()) return null;

    return {
      id: session.user.id,
      walletAddress: session.user.walletAddress,
      balance: session.user.wallet?.balanceEth || 0,
      createdAt: session.user.createdAt.toISOString(),
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return { error: "Authentication required", status: 401 };
  }
  return { user };
}
```

### 5. Game Service (`src/lib/authenticatedGameStateService.ts`)

```typescript
export class AuthenticatedGameStateService {
  async createGame(
    userId: string,
    initialBalance?: number
  ): Promise<GameState> {
    // Get user's current balance from database
    const currentBalance = await this.getUserBalance(userId);

    const gameState: GameState = {
      gameId: `game_${Date.now()}_${userId}`,
      userId,
      balance: currentBalance,
      // Initialize your game state
      playerStates: [],
      gamePhase: GamePhaseType.WAITING_FOR_PLAYERS,
      // ...
    };

    // Persist to database
    await this.persistGameToDatabase(gameState, userId);
    return gameState;
  }

  async getOrCreateCurrentGame(userId: string): Promise<GameState> {
    const currentGame = await this.getCurrentGame(userId);

    if (currentGame && currentGame.gamePhase !== GamePhaseType.FINISHED) {
      return currentGame;
    }

    return await this.createGame(userId);
  }

  async updateGameState(
    gameId: string,
    newGameState: GameState,
    userId: string
  ): Promise<void> {
    await this.persistGameToDatabase(newGameState, userId);
  }

  private async persistGameToDatabase(
    gameState: GameState,
    userId: string
  ): Promise<void> {
    // Use Prisma to upsert game state
    await prisma.game.upsert({
      where: { id: gameState.gameId },
      create: {
        /* map gameState to database schema */
      },
      update: {
        /* map gameState to database schema */
      },
    });
  }
}
```

---

## Implementation Guide

### Step 1: Initialize Project

```bash
# Create Next.js project
npx create-next-app@latest your-game-api --typescript --tailwind --app

cd your-game-api

# Install dependencies
npm install @prisma/client @tanstack/react-query siwe wagmi viem @reown/appkit @reown/appkit-adapter-wagmi

# Install dev dependencies
npm install -D prisma @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

### Step 2: Setup Prisma

```bash
npx prisma init
```

Create your schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // or "postgresql"
  url      = env("DATABASE_URL")
}

// User and authentication
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  wallet        Wallet?
  sessions      Session[]
  games         Game[]
  transactions  Transaction[]
}

model Wallet {
  id           String   @id @default(cuid())
  userId       String   @unique
  address      String   @unique
  balanceEth   Float    @default(0.0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Game-specific models
model Game {
  id              String      @id @default(cuid())
  userId          String
  gamePhase       String
  pendingBet      String      @default("0")
  initialBet      String      @default("0")
  message         String      @default("")
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  completedAt     DateTime?

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Add your game-specific relations
  // playerStates    PlayerState[]
  // gamePieces      GamePiece[]
}

// Add your game-specific models
// model PlayerState { ... }
// model GamePiece { ... }

model Transaction {
  id          String   @id @default(cuid())
  userId      String
  type        String
  amountEth   Float
  gameId      String?
  status      String   @default("PENDING")
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

```bash
# Create and apply migrations
npx prisma migrate dev --name init
npx prisma generate
```

### Step 3: Create Type Definitions

Create `src/types/game.ts` with your game-specific types (see Core Components section).

### Step 4: Implement State Machine

1. Create `src/lib/gameStateActions.ts` with game logic
2. Create `src/lib/stateMachine.ts` with state machine
3. Create `src/lib/gameStateValidator.ts` with validation logic

### Step 5: Create Game Service

Create `src/lib/authenticatedGameStateService.ts` to handle:

- Game creation
- Game state persistence
- Game state retrieval
- Balance management integration

### Step 6: Create API Routes

#### Main Game API (`src/app/api/game/current/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { authenticatedGameStateService } from "@/lib/authenticatedGameStateService";
import { createGameStateMachine } from "@/lib/stateMachine";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gameState = await authenticatedGameStateService.getOrCreateCurrentGame(
    user.id
  );

  return NextResponse.json({
    success: true,
    gameState: sanitizeGameData(gameState),
    availableActions: getAvailableActions(gameState),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, betAmount, ...params } = await request.json();

  const gameState = await authenticatedGameStateService.getOrCreateCurrentGame(
    user.id
  );
  const stateMachine = createGameStateMachine();

  const result = await stateMachine.processActionWithLoop({
    gameState,
    action,
    amount: betAmount,
    userId: user.id,
    ...params,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, gameState: sanitizeGameData(gameState) },
      { status: 400 }
    );
  }

  await authenticatedGameStateService.updateGameState(
    gameState.gameId,
    result.newGameState,
    user.id
  );

  return NextResponse.json({
    success: true,
    gameState: sanitizeGameData(result.newGameState),
    availableActions: getAvailableActions(result.newGameState),
    effects: result.effects,
  });
}
```

### Step 7: Create React Hooks

#### Main Game Session Hook (`src/hooks/useGameSession.ts`)

```typescript
export function useGameSession() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current game state
  const loadGameState = useCallback(async () => {
    if (!user) return;

    const response = await fetch("/api/game/current");
    const data = await response.json();

    if (data.success) {
      setGameState(data.gameState);
    }
  }, [user]);

  // Send action to API
  const sendAction = useCallback(
    async (action: GameActionType, params?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/game/current", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...params }),
        });

        const data = await response.json();

        if (data.success) {
          setGameState(data.gameState);
        } else {
          setError(data.error);
        }

        return data;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  return {
    gameState,
    loading,
    error,
    sendAction,
    refreshGameState: loadGameState,
  };
}
```

### Step 8: Create Game Component

```typescript
export default function YourGameComponent() {
  const { gameState, sendAction, loading } = useGameSession();
  const { balance } = useBalanceQuery();

  const handleAction = async (action: GameActionType) => {
    await sendAction(action);
  };

  if (!gameState) return <LoadingSpinner />;

  return (
    <div>
      <div>Balance: {balance}</div>
      <div>Phase: {gameState.gamePhase}</div>

      {/* Render your game UI */}

      <button onClick={() => handleAction(GameActionType.START_ROUND)}>
        Start Round
      </button>
    </div>
  );
}
```

### Step 9: Setup Authentication

See SIWE_IMPLEMENTATION.md in this project for detailed authentication setup.

Key files:

- `src/contexts/AuthContext.tsx` - Authentication context
- `src/app/api/siwe/route.ts` - SIWE authentication endpoint
- `src/app/api/siwe/me/route.ts` - User session endpoint
- `src/components/AppKitProvider.tsx` - Wallet provider

### Step 10: Create Root Layout

```typescript
// src/app/layout.tsx
import { AppKitProvider } from "@/components/AppKitProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppKitProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </AuthProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
```

---

## API Design Pattern

### Endpoint Structure

```
GET  /api/game/current          - Get current game state
POST /api/game/current          - Send action to current game
GET  /api/game/[gameId]         - Get specific game
POST /api/game/[gameId]         - Send action to specific game
GET  /api/games                 - Get game history
GET  /api/siwe                  - Get nonce for signing
POST /api/siwe                  - Verify signature and create session
GET  /api/siwe/me               - Get current user
DELETE /api/siwe/me             - Logout
```

### Standard Response Format

```typescript
// Success response
{
  success: true,
  gameState: GameState,
  availableActions: AvailableAction[],
  effects?: Effect[],
  balance?: number
}

// Error response
{
  success: false,
  error: string,
  gameState?: GameState,  // Include current state even on error
  details?: any
}
```

### Authentication Pattern

All game API routes follow this pattern:

```typescript
export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request
  const body = await request.json();

  // 3. Process action
  const result = await processGameAction(user.id, body);

  // 4. Return response
  return NextResponse.json(result);
}
```

---

## State Management Pattern

### Hook Composition

```
useGameSession (Top-level orchestration)
  ├── useAuth (Authentication state)
  ├── useGameActions (Action handlers)
  │   └── useAuth
  ├── useGameState (Game state management)
  └── useBalanceQuery (Balance management)
      └── useAuth
```

### State Update Flow

1. **User Action**: User clicks button in UI
2. **Hook Handler**: Hook function processes action
3. **API Call**: Hook sends request to API
4. **Server Processing**: API processes through state machine
5. **Database Update**: New state persisted to database
6. **Response**: API returns new state
7. **Frontend Update**: Hook updates local state
8. **UI Re-render**: React re-renders with new state

### Optimistic Updates

For better UX, consider optimistic updates:

```typescript
const sendAction = async (action: GameActionType) => {
  // Optimistically update UI
  const optimisticState = calculateOptimisticState(gameState, action);
  setGameState(optimisticState);

  try {
    const result = await fetch("/api/game/current", {
      /* ... */
    });
    setGameState(result.gameState); // Apply server state
  } catch (error) {
    setGameState(previousGameState); // Rollback on error
    showError(error);
  }
};
```

---

## Authentication Pattern

### SIWE (Sign-In With Ethereum) Flow

1. **Connect Wallet**: User connects wallet via RainbowKit/WalletConnect
2. **Request Nonce**: Frontend requests nonce from server
3. **Sign Message**: User signs SIWE message with wallet
4. **Verify Signature**: Server verifies signature and creates session
5. **Session Cookie**: Server sets httpOnly session cookie
6. **Authenticated Requests**: All subsequent requests include session cookie

### Session Management

```typescript
// Create session on successful authentication
const session = await prisma.session.create({
  data: {
    userId: user.id,
    tokenHash: hashToken(sessionToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
});

// Set httpOnly cookie
cookies().set("siwe-session", sessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60, // 7 days
});
```

---

## Database Schema Pattern

### Core Tables

Every game needs these core tables:

1. **User** - User accounts (linked to wallet addresses)
2. **Wallet** - User balances
3. **Session** - Authentication sessions
4. **Transaction** - Balance change history
5. **Game** - Game records with core game state
6. **[GameSpecific]** - Your game-specific data models

### Game State Persistence

Store game state in two ways:

1. **Structured Data**: Store specific fields in database columns

   - Pros: Easy to query, index, and aggregate
   - Cons: Schema changes require migrations

2. **JSON Blobs**: Store complex state as JSON
   - Pros: Flexible, no schema changes needed
   - Cons: Hard to query, no type safety

**Recommended**: Use structured data for query-able fields, JSON for complex nested state.

### Example:

```prisma
model Game {
  id              String      @id
  userId          String

  // Structured fields for queries
  gamePhase       String
  initialBet      String
  totalWagered    String
  createdAt       DateTime
  completedAt     DateTime?

  // Complex state as JSON (optional)
  stateSnapshot   String?     // JSON.stringify(gameState)

  // Relations to detailed data
  playerStates    PlayerState[]
  gamePieces      GamePiece[]
}
```

---

## Testing Strategy

### Test Structure

```
src/__tests__/
├── api/                    # API route tests
│   ├── game-api.test.ts
│   └── auth-api.test.ts
├── game-actions/           # Game logic tests
│   ├── place-bet.test.ts
│   ├── start-round.test.ts
│   └── move-piece.test.ts
├── integration/            # Full flow tests
│   ├── complete-game.test.ts
│   └── balance-management.test.ts
├── hooks/                  # React hook tests
│   ├── useGameSession.test.tsx
│   └── useGameActions.test.tsx
└── utils/                  # Utility tests
    └── validation.test.ts
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### Example Test

```typescript
// src/__tests__/game-actions/place-bet.test.ts
describe("Place Bet Action", () => {
  it("should accept valid bet", async () => {
    const gameState = createInitialGameState(1000);
    const stateMachine = createGameStateMachine();

    const result = await stateMachine.processAction({
      gameState,
      action: GameActionType.PLACE_BET,
      amount: 100,
    });

    expect(result.success).toBe(true);
    expect(result.newGameState.pendingBet).toBe(100);
  });

  it("should reject bet exceeding balance", async () => {
    const gameState = createInitialGameState(50);
    const stateMachine = createGameStateMachine();

    const result = await stateMachine.processAction({
      gameState,
      action: GameActionType.PLACE_BET,
      amount: 100,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Insufficient balance");
  });
});
```

---

## Key Patterns Summary

### 1. **Type-Safe Communication**

Frontend and backend share the same TypeScript types, ensuring type safety across the entire stack.

### 2. **State Machine Pattern**

All game logic goes through a state machine that:

- Validates actions
- Updates state
- Tracks effects
- Ensures consistency

### 3. **Effect System**

Side effects (balance changes, animations, etc.) are tracked separately from state changes, allowing:

- Atomic database transactions
- Animation coordination
- Balance update tracking

### 4. **Hook-Based Architecture**

Game functionality is split into composable hooks:

- `useGameSession` - Overall game orchestration
- `useGameActions` - Action handlers
- `useGameState` - State management
- `useBalanceQuery` - Balance management

### 5. **Database as Source of Truth**

All game state is persisted to database, allowing:

- Game resumption after refresh
- Game history
- Audit trail
- Recovery from errors

### 6. **Authentication-First**

All game actions require authentication, ensuring:

- User identification
- Balance tracking
- Security
- Auditability

---

## Complete Blackjack State Reference

This section documents **every possible state, action, and transition** in the blackjack implementation. Use this as a reference when building your own game.

### Game Phases (GameStatePhaseType)

```typescript
export enum GameStatePhaseType {
  BETTING = 0, // Player places bet
  ASK_INSURANCE, // Dealer shows Ace, offer insurance
  PLAYING, // Player makes decisions
  DEALER_TURN, // Internal phase - dealer plays (auto-resolved)
  FINISHED, // Game complete, showing results
}
```

#### Phase Descriptions

1. **BETTING**

   - Initial state when game starts or after previous game finishes
   - Player can place/adjust bet
   - Valid Actions: `PLACE_BET`, `START_ROUND`
   - Transitions to: `ASK_INSURANCE` (if dealer shows Ace) OR `PLAYING` OR `FINISHED` (on blackjack)

2. **ASK_INSURANCE**

   - Triggered when dealer's upcard is an Ace
   - Player can take insurance bet (half of original bet)
   - Valid Actions: `INSURANCE`, `DECLINE_INSURANCE`
   - Transitions to: `PLAYING` (player continues) OR `FINISHED` (if dealer/player has blackjack)

3. **PLAYING**

   - Player makes decisions for current hand
   - Multiple hands possible if player split
   - Valid Actions: `HIT`, `STAND`, `DOUBLE`, `SPLIT`, `SURRENDER`
   - Transitions to: `DEALER_TURN` (when all player hands complete) OR `FINISHED` (if all hands bust)

4. **DEALER_TURN**

   - Internal phase where dealer plays according to rules
   - No user actions allowed
   - Auto-processes: Dealer hits until reaching 17 or bust
   - Transitions to: `FINISHED` (always)

5. **FINISHED**
   - Game complete, results calculated and displayed
   - Valid Actions: `RESET_GAME`, `PLAY_AGAIN`, `START_NEW_GAME`
   - Transitions to: `BETTING` (when starting new game)

### All Game Actions (GameActionType)

```typescript
export enum GameActionType {
  // Betting phase actions
  PLACE_BET = "PLACE_BET", // Place or adjust bet amount
  START_ROUND = "START_ROUND", // Start game with current bet

  // Insurance phase actions
  INSURANCE = "INSURANCE", // Accept insurance bet
  DECLINE_INSURANCE = "DECLINE_INSURANCE", // Decline insurance

  // Playing phase actions
  HIT = "HIT", // Take another card
  STAND = "STAND", // End turn for current hand
  DOUBLE = "DOUBLE", // Double bet, take one card, end turn
  SPLIT = "SPLIT", // Split matching cards into two hands
  SURRENDER = "SURRENDER", // Give up hand, lose half bet

  // Multi-hand management
  SWITCH_HAND = "SWITCH_HAND", // Move to next hand after split

  // Game control actions
  PLAY_AGAIN = "PLAY_AGAIN", // Start new game with same bet
  START_NEW_GAME = "START_NEW_GAME", // Start completely new game
  RESET_GAME = "RESET_GAME", // Reset to betting phase
}
```

### Hand States

#### Player Hand States

```typescript
interface Hand {
  cards: Card[]; // Cards in hand
  bet: number; // Current bet amount
  originalBet: number; // Original bet (before doubling)

  // Hand status flags
  isStanding: boolean; // Player chose to stand
  isBusted: boolean; // Hand value > 21
  isBlackjack: boolean; // Natural 21 (Ace + 10-value card)
  isDoubled: boolean; // Player doubled down
  isSurrendered: boolean; // Player surrendered
  isFromSplit: boolean; // Hand created from split
  isSplitAces: boolean; // Hand from splitting Aces (special rules)
}
```

#### Dealer Hand States

```typescript
interface FrontendDealerHand {
  cards: Card[]; // Dealer's cards
  isStanding: boolean; // Dealer stands on 17+
  isBusted: boolean; // Dealer busted (> 21)
  isBlackjack: boolean; // Dealer has blackjack
  showAllCards: boolean; // Show hole card (false until dealer turn)
}
```

### Hand Result Types

```typescript
export enum HandResultType {
  WIN, // Player wins (higher than dealer, dealer busts, etc.)
  LOSE, // Player loses (lower than dealer, busts, dealer blackjack)
  PUSH, // Tie (same value as dealer)
  BLACKJACK, // Player blackjack (pays 3:2)
  SURRENDER, // Player surrendered (loses half bet)
}
```

### Action Validation Rules

#### PLACE_BET

- **Valid When**: `gamePhase === BETTING`
- **Requirements**:
  - Amount > 0
  - Amount <= balance
- **Transitions**: No phase change, updates `pendingBet`

#### START_ROUND

- **Valid When**: `gamePhase === BETTING`
- **Requirements**:
  - `pendingBet > 0` OR amount parameter provided
  - `pendingBet <= balance`
  - No active hands in progress
- **Transitions**:
  - → `ASK_INSURANCE` (if dealer shows Ace)
  - → `PLAYING` (normal game)
  - → `FINISHED` (if player or dealer has immediate blackjack)

#### HIT

- **Valid When**: `gamePhase === PLAYING`
- **Requirements**:
  - Current hand exists
  - Hand not standing/busted/surrendered
  - Hand is not blackjack
  - Hand is not split Aces (can't hit split Aces)
  - Dealer doesn't have blackjack
- **Transitions**:
  - Stays in `PLAYING` if hand still active
  - → `DEALER_TURN` if hand busts and all hands complete
  - → Next hand if current hand busts and more hands remain

#### STAND

- **Valid When**: `gamePhase === PLAYING`
- **Requirements**:
  - Current hand exists
  - Hand not busted
  - Hand not already standing (unless progressing to next hand)
- **Transitions**:
  - → `DEALER_TURN` if all hands complete
  - → Next hand if more hands remain

#### DOUBLE

- **Valid When**: `gamePhase === PLAYING`
- **Requirements**:
  - Current hand has exactly 2 cards
  - `canDouble === true`
  - Hand not standing/busted/surrendered
  - Hand is not split Aces
  - Balance >= current bet (to double it)
- **Effects**:
  - Doubles bet amount
  - Deals one card
  - Automatically stands
- **Transitions**:
  - → Next hand if more hands remain
  - → `DEALER_TURN` if all hands complete

#### SPLIT

- **Valid When**: `gamePhase === PLAYING`
- **Requirements**:
  - Current hand has exactly 2 cards
  - Both cards have same rank (A-A, 8-8, etc.)
  - `canSplit === true`
  - Hand not already from split
  - Hand not standing/busted/surrendered
  - Balance >= current bet (for second hand)
  - Player has at most 1 hand currently (no re-splitting)
- **Effects**:
  - Creates two hands from one
  - Each hand gets one original card
  - Each hand gets dealt one new card
  - If splitting Aces: Each hand marked as `isSplitAces` (can't hit)
- **Transitions**: Stays in `PLAYING`, switches to first split hand

#### SURRENDER

- **Valid When**: `gamePhase === PLAYING`
- **Requirements**:
  - Current hand has exactly 2 cards (first action only)
  - `canSurrender === true`
  - Hand not from split
  - Hand not standing/busted/surrendered
- **Effects**:
  - Returns half of bet to player
  - Marks hand as surrendered
- **Transitions**:
  - → Next hand if more hands remain
  - → `DEALER_TURN` if all hands complete

#### INSURANCE

- **Valid When**: `gamePhase === ASK_INSURANCE`
- **Requirements**:
  - `insuranceOffered === true`
  - Dealer's upcard is Ace
  - Balance >= (initialBet / 2)
- **Effects**:
  - Deducts insurance amount (half of initial bet)
  - Sets `insuranceBet` to bet amount
  - If dealer has blackjack: Pays 2:1 on insurance
- **Transitions**:
  - → `PLAYING` if no immediate blackjacks
  - → `FINISHED` if dealer or player has blackjack

#### DECLINE_INSURANCE

- **Valid When**: `gamePhase === ASK_INSURANCE`
- **Requirements**:
  - `insuranceOffered === true`
- **Transitions**:
  - → `PLAYING` if no immediate blackjacks
  - → `FINISHED` if dealer or player has blackjack

### Game State Flags

These boolean flags control which actions are available:

```typescript
interface GameState {
  // Action availability flags
  canDouble: boolean; // Can player double down?
  canSplit: boolean; // Can player split?
  canSurrender: boolean; // Can player surrender?
  insuranceOffered: boolean; // Is insurance currently offered?
  insuranceWasOffered: boolean; // Was insurance offered this game?

  // Dealer state
  dealerHasBlackjack: boolean; // Does dealer have blackjack?

  // Animation/UI state
  isDealing: boolean; // Cards being dealt
  isDealingInProgress: boolean; // Dealing animation active
  isDealerDealing: boolean; // Dealer turn animation active
  isBustSequence: boolean; // Bust animation active

  // Multi-hand state
  currentHandIndex: number; // Which hand is active (for splits)

  // Financial tracking
  balance: number; // Current player balance
  pendingBet: number; // Bet amount for current game
  initialBet: number; // Original bet amount
  insuranceBet: number; // Insurance bet amount
  startingBalance: number; // Balance at game start
  totalWagered: number; // Total bet this game
  totalWon: number; // Total winnings this game
  gameProfit: number; // Net profit/loss this game
}
```

### Special Game Scenarios

#### 1. Player Blackjack (No Dealer Ace)

```
START_ROUND → Deal cards → Player 21, Dealer not Ace → FINISHED
Payout: 3:2 (bet $10, win $25)
```

#### 2. Dealer Blackjack (Showing Ace)

```
START_ROUND → Deal cards → Dealer Ace showing → ASK_INSURANCE
→ INSURANCE/DECLINE_INSURANCE → Check dealer hole → Dealer BJ → FINISHED
Insurance payout: 2:1 if taken
Main bet: Lost (unless player also has BJ = PUSH)
```

#### 3. Both Blackjack

```
START_ROUND → Both have BJ → FINISHED (PUSH)
Payout: 1:1 (get bet back)
```

#### 4. Split Aces

```
SPLIT on Aces → Creates 2 hands → Each gets 1 card → Auto-stand
Special rule: Cannot hit on split Aces
```

#### 5. Multiple Hands (Split)

```
SPLIT → Hand 1 active → HIT/STAND → Complete hand 1
→ Switch to Hand 2 → HIT/STAND → Complete hand 2
→ All hands complete → DEALER_TURN
```

#### 6. Bust Sequence

```
HIT → Total > 21 → Mark as busted
If more hands: Switch to next hand
If all hands done: DEALER_TURN
```

#### 7. All Player Hands Bust

```
All hands bust → Skip DEALER_TURN → FINISHED
Dealer doesn't play if all player hands bust
```

### State Transition Diagram

```
┌─────────┐
│ BETTING │ ◄────────────────────┐
└────┬────┘                      │
     │ START_ROUND               │
     ▼                           │
  ┌──────────────┐               │
  │ Deal Cards   │               │
  └──────┬───────┘               │
         │                       │
    ┌────┴─────┐                │
    │          │                │
    ▼          ▼                │
┌──────┐   ┌────────┐           │
│Dealer│   │No      │           │
│ Ace? │   │Insurance│          │
└──┬───┘   └───┬────┘           │
   │ Yes       │ No             │
   ▼           │                │
┌─────────────┐│                │
│ASK_INSURANCE││                │
└──────┬──────┘│                │
       │       │                │
       └───┬───┘                │
           │                    │
      ┌────┴────┐               │
      │         │               │
  ┌───▼──┐  ┌───▼──┐           │
  │Player│  │Dealer│           │
  │  BJ? │  │  BJ? │           │
  └───┬──┘  └───┬──┘           │
      │ No      │ No           │
      │         │              │
      └────┬────┘              │
           ▼                   │
      ┌─────────┐              │
      │ PLAYING │              │
      └────┬────┘              │
           │                   │
    ┌──────┴──────┐            │
    │             │            │
    ▼             ▼            │
┌────────┐   ┌─────────┐       │
│All Bust│   │Complete │       │
└───┬────┘   │All Hands│       │
    │        └────┬────┘       │
    │             │            │
    └─────┬───────┘            │
          │                    │
          ▼                    │
    ┌────────────┐             │
    │ DEALER_TURN│             │
    └─────┬──────┘             │
          │                    │
          ▼                    │
      ┌──────────┐             │
      │ FINISHED │             │
      └─────┬────┘             │
            │                  │
    RESET_GAME/PLAY_AGAIN     │
            │                  │
            └──────────────────┘
```

### Action Availability by Phase

```typescript
const phaseActions = {
  BETTING: [
    "PLACE_BET", // Adjust bet amount
    "START_ROUND", // Begin game
    "RESET_GAME", // Clear state
  ],

  ASK_INSURANCE: [
    "INSURANCE", // Accept insurance
    "DECLINE_INSURANCE", // Decline insurance
  ],

  PLAYING: [
    "HIT", // Always available (unless busted/standing)
    "STAND", // Always available (unless busted)
    "DOUBLE", // Only on 2 cards, if canDouble
    "SPLIT", // Only on 2 matching cards, if canSplit
    "SURRENDER", // Only on 2 cards, if canSurrender
    "SWITCH_HAND", // Internal action for split hands
  ],

  DEALER_TURN: [
    // No user actions - auto-processes
  ],

  FINISHED: [
    "RESET_GAME", // Start fresh
    "PLAY_AGAIN", // Same bet
    "START_NEW_GAME", // New game
  ],
};
```

### Edge Cases to Handle

1. **Insufficient Balance**

   - Validate before: START_ROUND, DOUBLE, SPLIT, INSURANCE
   - Return error: "Insufficient balance"

2. **Split Aces Special Rules**

   - Each hand gets exactly one card
   - Cannot hit on split Aces
   - If resulting hand is 21, it's not a blackjack (pays 1:1, not 3:2)

3. **Dealer Must Hit Soft 17**

   - Dealer hits on soft 17 (A-6)
   - Dealer stands on hard 17 or higher

4. **No Double After Split** (House Rule)

   - If hand is from split, canDouble = false

5. **No Surrender After Split** (House Rule)

   - If hand is from split, canSurrender = false

6. **Insurance Only When Dealer Shows Ace**

   - Only offered once per game
   - Must decide before seeing dealer's hole card

7. **Blackjack Detection**

   - Must be exactly 2 cards
   - Must be Ace + 10-value card
   - Split Aces that make 21 are NOT blackjack

8. **All Hands Bust**

   - If all player hands bust, skip dealer turn
   - Immediately transition to FINISHED

9. **Multiple Hands from Split**

   - Track currentHandIndex
   - Process each hand sequentially
   - Switch hands automatically when one completes

10. **Animation States**
    - Track dealing animations separately from game logic
    - Don't allow actions during animations
    - Coordinate card dealing with state updates

### Payout Rules

```typescript
const PAYOUTS = {
  BLACKJACK: 1.5, // 3:2 payout (bet $10, win $25 total)
  WIN: 1, // 1:1 payout (bet $10, win $20 total)
  PUSH: 0, // Return original bet (bet $10, get $10 back)
  LOSE: -1, // Lose bet (bet $10, lose $10)
  SURRENDER: -0.5, // Lose half (bet $10, lose $5)
  INSURANCE_WIN: 2, // 2:1 payout on insurance bet
};
```

### Complete GameState Fields

```typescript
interface GameState {
  // Identification
  gameId: string;
  userId: string;
  shuffleId: string;
  shuffleSalt?: string;

  // Card tracking
  dealtCardCount: number;

  // Game entities
  playerHands: Hand[];
  dealerHand: FrontendDealerHand;
  currentHandIndex: number;

  // Financial
  balance: number;
  pendingBet: number;
  initialBet: number;
  insuranceBet: number;
  startingBalance: number;
  totalWagered: number;
  totalWon: number;
  currentHandProfit: number;
  gameProfit: number;

  // Phase and messaging
  gamePhase: GameStatePhaseType;
  message: string;
  result?: "WIN" | "LOSE" | "PUSH";

  // Action flags
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
  insuranceOffered: boolean;
  insuranceWasOffered: boolean;
  dealerHasBlackjack: boolean;

  // Animation/UI state
  dealingStep: number;
  isDealing: boolean;
  isDealingInProgress: boolean;
  lastProcessedStep: number;
  dealerDealingStep: number;
  isDealerDealing: boolean;
  isBustSequence: boolean;
  bustSequenceStep: number;
  dealerBustRevealStep: number;

  // Results
  handResults: HandResult[];
}
```

### Testing Critical States

When building your game, test these scenarios:

1. ✅ Player blackjack (immediate win)
2. ✅ Dealer blackjack (immediate loss)
3. ✅ Both blackjack (push)
4. ✅ Player bust (lose)
5. ✅ Dealer bust (win)
6. ✅ Player wins with higher value
7. ✅ Dealer wins with higher value
8. ✅ Push (same value)
9. ✅ Surrender (lose half)
10. ✅ Double down (win/lose with doubled bet)
11. ✅ Split (two hands)
12. ✅ Split Aces (special rules)
13. ✅ Insurance win (dealer blackjack)
14. ✅ Insurance lose (dealer no blackjack)
15. ✅ All hands bust (skip dealer turn)
16. ✅ Split then bust both hands
17. ✅ Split, win one, lose one
18. ✅ Insufficient balance scenarios
19. ✅ Invalid action attempts
20. ✅ Phase transition edge cases

---

## Adapting for Your Game

### 1. Define Your Game Types

Start by defining:

- Game phases/states
- Actions players can take
- Game pieces/cards/tokens
- Win conditions

### 2. Implement Game Logic

Create your game-specific action handlers in `gameStateActions.ts`:

- How does each action modify game state?
- What are the rules and validations?
- What effects does each action produce?

### 3. Design Database Schema

Determine what data needs to be persisted:

- Core game state
- Player-specific data
- Game history
- Relationships between entities

### 4. Create UI Components

Build React components for:

- Game board/table
- Game pieces/cards
- Player controls
- Game information display

### 5. Add Animations

Use the animation pattern from this project:

- Track animation state separately
- Coordinate with game state updates
- Use CSS transitions and transforms

### 6. Test Thoroughly

Write tests for:

- Each game action
- State transitions
- Win conditions
- Edge cases
- Full game flows

---

## Additional Resources

### Files to Reference in This Project

1. **State Machine**: `src/lib/stateMachine.ts`
2. **Game Actions**: `src/lib/gameStateActions.ts`
3. **Main Hook**: `src/hooks/useGameSession.ts`
4. **API Route**: `src/app/api/game/current/route.ts`
5. **Auth Utils**: `src/lib/auth-utils.ts`
6. **Game Service**: `src/lib/authenticatedGameStateService.ts`
7. **Database Schema**: `prisma/schema.prisma`
8. **Tests**: `src/__tests__/` directory

### External Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [SIWE](https://docs.login.xyz/)
- [Wagmi](https://wagmi.sh/)
- [TanStack Query](https://tanstack.com/query/latest)

---

## Checklist for New Game

- [ ] Define game types (`GameActionType`, `GamePhaseType`, `GameState`)
- [ ] Create database schema (User, Wallet, Session, Game, + game-specific)
- [ ] Implement state machine (`stateMachine.ts`)
- [ ] Implement game actions (`gameStateActions.ts`)
- [ ] Implement validators (`gameStateValidator.ts`)
- [ ] Create game service (`authenticatedGameStateService.ts`)
- [ ] Create API routes (`/api/game/current`, `/api/game/[gameId]`)
- [ ] Setup authentication (`/api/siwe`)
- [ ] Create React hooks (`useGameSession`, `useGameActions`)
- [ ] Create game UI components
- [ ] Add animations
- [ ] Write tests
- [ ] Setup wallet integration
- [ ] Deploy

---

## Notes

- This architecture is designed for turn-based games with clear state transitions
- For real-time multiplayer, consider adding WebSocket support
- Balance management uses optimistic updates for better UX
- All monetary values are stored as strings to avoid floating-point precision issues
- Session cookies are httpOnly for security
- Database migrations are version controlled
- Tests use isolated test database

---

**Good luck building your game!** 🎮
