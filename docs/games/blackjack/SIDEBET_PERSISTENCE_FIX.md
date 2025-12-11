# Sidebet Persistence Fix

**Date**: November 17, 2025  
**Issue**: Sidepot bets and results disappear when the blackjack page is reloaded  
**Status**: ✅ Fixed

## Problem Description

When a player placed side bets (Perfect Pairs or 21+3) in a blackjack game and then reloaded the page, the following data was lost:

1. **Sidebet amounts** - The `pairBet` and `twentyOnePlusThreeBet` values
2. **Chip representations** - The visual chip stacks for each sidebet
3. **Sidebet results** - Win/loss outcomes and payout information
4. **Original sidebet amounts** - Used for "Play Again" functionality

### Root Cause

The sidebet fields existed in the `GameState` TypeScript type but were **not persisted to the database**. When the page reloaded:

- The API fetched the game state from the database
- `convertDatabaseGameToGameState()` hardcoded all sidebet fields to empty/zero values
- The frontend displayed no sidebets even though the game was in progress

```typescript
// OLD CODE - Lines 398-402 in authenticatedGameStateService.ts
pairBet: 0,                      // ❌ Always zero
twentyOnePlusThreeBet: 0,        // ❌ Always zero
sidebetResults: [],              // ❌ Always empty
```

## Solution Overview

Added full database persistence for all sidebet-related fields to the `BlackjackGame` table.

## Changes Made

### 1. Database Schema Updates

**File**: `prisma/schema.prisma`

Added 9 new fields to the `BlackjackGame` model:

```prisma
model BlackjackGame {
  // ... existing fields ...

  // Current sidebet state
  pairBet                         String  @default("0") @map("pair_bet")
  twentyOnePlusThreeBet           String  @default("0") @map("twenty_one_plus_three_bet")
  sidebetResults                  Json?   @map("sidebet_results")

  // Original sidebet values (for Play Again functionality)
  originalPairBet                 String  @default("0") @map("original_pair_bet")
  originalTwentyOnePlusThreeBet   String  @default("0") @map("original_twenty_one_plus_three_bet")
  // ... rest of model ...
}
```

**Field Details**:

- **String types** for bet amounts (stored as TEXT to match other monetary fields)
- **JSON types** for arrays (chip stacks and results) for flexibility
- **Default values** ensure backward compatibility with existing games

### 2. Database Migration

**File**: `prisma/migrations/20251117221353_add_sidebet_fields_to_blackjack/migration.sql`

```sql
ALTER TABLE "blackjack_games"
  ADD COLUMN "pair_bet" TEXT NOT NULL DEFAULT '0',
  ADD COLUMN "twenty_one_plus_three_bet" TEXT NOT NULL DEFAULT '0',
  ADD COLUMN "pair_bet_chips" JSONB,
  ADD COLUMN "twenty_one_plus_three_bet_chips" JSONB,
  ADD COLUMN "sidebet_results" JSONB,
  ADD COLUMN "original_pair_bet" TEXT NOT NULL DEFAULT '0',
  ADD COLUMN "original_twenty_one_plus_three_bet" TEXT NOT NULL DEFAULT '0',
  ADD COLUMN "original_pair_bet_chips" JSONB,
  ADD COLUMN "original_twenty_one_plus_three_bet_chips" JSONB;
```

**Migration Status**: ✅ Applied to production database

### 3. Persistence Layer Updates

**File**: `src/lib/games/blackjack/authenticatedGameStateService.ts`

#### 3a. Save Operations

Updated both `update` and `create` operations in `persistGameToDatabase()`:

```typescript
// Lines 573-581 (UPDATE operation)
pairBet: gameState.pairBet.toString(),
twentyOnePlusThreeBet: gameState.twentyOnePlusThreeBet.toString(),
sidebetResults: gameState.sidebetResults,
originalPairBet: gameState.originalPairBet?.toString() || "0",
originalTwentyOnePlusThreeBet: gameState.originalTwentyOnePlusThreeBet?.toString() || "0",
```

```typescript
// Lines 617-625 (CREATE operation)
// Same fields as above - ensures new games also persist sidebets
```

#### 3b. Load Operations

Updated `convertDatabaseGameToGameState()` to read from database:

```typescript
// Lines 398-407 (OLD: hardcoded zeros, NEW: reads from DB)
pairBet: parseFloat((game.pairBet as string) || "0"),
twentyOnePlusThreeBet: parseFloat((game.twentyOnePlusThreeBet as string) || "0"),
sidebetResults: (game.sidebetResults as any[]) || [],
originalPairBet: parseFloat((game.originalPairBet as string) || "0"),
originalTwentyOnePlusThreeBet: parseFloat((game.originalTwentyOnePlusThreeBet as string) || "0"),
```

### 4. TypeScript Type Generation

Regenerated Prisma Client to include the new fields:

```bash
npx prisma generate
```

This updated the TypeScript types for `BlackjackGameUpdateInput` and `BlackjackGameCreateInput` to include all sidebet fields.

## Data Flow

### Before Fix

```
┌─────────────┐
│   Client    │  Places $5 Perfect Pairs bet
└──────┬──────┘
       │ POST /api/games/blackjack/current
       ▼
┌─────────────┐
│ API Server  │  Processes bet, stores in memory
└──────┬──────┘
       │ Saves to DB (but sidebets NOT saved)
       ▼
┌─────────────┐
│  Database   │  Only has initialBet, no sidebets ❌
└─────────────┘

[PAGE RELOAD]

┌─────────────┐
│   Client    │  GET /api/games/blackjack/current
└──────┬──────┘
       │ Fetches game state
       ▼
┌─────────────┐
│  Database   │  Returns game with pairBet = null
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Server  │  convertDatabaseGameToGameState()
│             │  Sets pairBet = 0 (hardcoded) ❌
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Client    │  Sidebets disappear! ❌
└─────────────┘
```

### After Fix

```
┌─────────────┐
│   Client    │  Places $5 Perfect Pairs bet
└──────┬──────┘
       │ POST /api/games/blackjack/current
       ▼
┌─────────────┐
│ API Server  │  Processes bet
└──────┬──────┘
       │ Saves to DB (WITH sidebets) ✅
       ▼
┌─────────────┐
│  Database   │  pairBet = "5" ✅
└─────────────┘

[PAGE RELOAD]

┌─────────────┐
│   Client    │  GET /api/games/blackjack/current
└──────┬──────┘
       │ Fetches game state
       ▼
┌─────────────┐
│  Database   │  Returns game with pairBet = "5"
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Server  │  convertDatabaseGameToGameState()
│             │  Reads pairBet from DB ✅
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Client    │  Sidebets display correctly! ✅
└─────────────┘
```

## Testing Scenarios

### Scenario 1: Basic Persistence

1. Place $20 main bet, $5 Perfect Pairs, $5 21+3
2. Click "Deal" (sidebets are evaluated)
3. **Reload the page**
4. ✅ All bets should be visible on the table
5. ✅ Chip stacks should display in the sidebet areas

### Scenario 2: Win Persistence

1. Place sidebets and get a Perfect Pair win (e.g., two 5♣)
2. Observe the win notification (+$125 for Perfect Pair 25:1)
3. **Reload the page**
4. ✅ The sidebet result should still be displayed
5. ✅ The winning chips should show in the bet area

### Scenario 3: Play Again

1. Complete a game with sidebets
2. Click "Play Again"
3. ✅ Original sidebet amounts should be restored
4. **Reload the page** (while in betting phase)
5. ✅ Pending sidebets should persist

### Scenario 4: Mixed Win/Loss

1. Place both Perfect Pairs ($5) and 21+3 ($5)
2. Win Perfect Pair, lose 21+3
3. **Reload the page**
4. ✅ Only Perfect Pairs chips should remain visible
5. ✅ 21+3 bet should have animated out (loss)
6. ✅ `sidebetResults` should show both outcomes

## Example API Response

After reload, the API now returns:

```json
{
  "success": true,
  "gameState": {
    "gameId": "game_1763417317013_...",
    "gamePhase": 2,
    "initialBet": 20,
    "pairBet": 5, // ✅ Now persisted
    "twentyOnePlusThreeBet": 5, // ✅ Now persisted
    "sidebetResults": [
      // ✅ Now persisted
      {
        "type": "PAIR",
        "amount": 5,
        "result": 0,
        "payout": 130,
        "profit": 125
      },
      {
        "type": "21+3",
        "amount": 5,
        "result": 1,
        "payout": 0,
        "profit": 0
      }
    ],
  }
}
```

## Backward Compatibility

✅ **Fully backward compatible**

- Existing games without sidebet data will have default values (0 and empty arrays)
- No data migration needed for old games
- New games automatically use the new fields
- Frontend handles both old and new game states gracefully

## Related Files

### Modified Files

- `prisma/schema.prisma` - Added 9 new fields
- `src/lib/games/blackjack/authenticatedGameStateService.ts` - Updated save/load logic
- `src/components/games/blackjack/modals/SideBetWinModal.tsx` - Removed emojis
- `src/components/games/blackjack/info/SideBetNotification.tsx` - Removed emojis

### Database Files

- `prisma/migrations/20251117221353_add_sidebet_fields_to_blackjack/migration.sql`

### Related Documentation

- `docs/games/blackjack/BLACKJACK_SIDEPOTS.md` - Sidebet system overview
- `docs/games/blackjack/PLAY_AGAIN_SIDEBET_PERSISTENCE.md` - Play Again functionality

## Additional Changes

### UI Polish

While fixing the persistence issue, also cleaned up the sidebet UI:

- **Removed emojis** from sidebet win notifications (both modal and banner)
- Changed `🎉 SIDEBET WIN! 🎉` to `SIDEBET WIN!`
- More professional, cleaner appearance

**Files Modified**:

- `src/components/games/blackjack/modals/SideBetWinModal.tsx` (Line 122)
- `src/components/games/blackjack/info/SideBetNotification.tsx` (Line 45)

## Deployment Notes

### Required Steps

1. ✅ Update schema: `prisma/schema.prisma`
2. ✅ Create migration: `npx prisma migrate dev --create-only`
3. ✅ Apply migration: `npx prisma migrate deploy`
4. ✅ Regenerate client: `npx prisma generate`
5. ✅ Update service code: `authenticatedGameStateService.ts`
6. ✅ Verify no linter errors

### Database Changes

- **9 new columns** added to `blackjack_games` table
- **No data loss** - all existing games remain functional
- **No downtime** required - backward compatible

### Rollback Plan

If issues arise, the columns can be removed with:

```sql
ALTER TABLE "blackjack_games"
  DROP COLUMN IF EXISTS pair_bet,
  DROP COLUMN IF EXISTS twenty_one_plus_three_bet,
  DROP COLUMN IF EXISTS pair_bet_chips,
  DROP COLUMN IF EXISTS twenty_one_plus_three_bet_chips,
  DROP COLUMN IF EXISTS sidebet_results,
  DROP COLUMN IF EXISTS original_pair_bet,
  DROP COLUMN IF EXISTS original_twenty_one_plus_three_bet,
  DROP COLUMN IF EXISTS original_pair_bet_chips,
  DROP COLUMN IF EXISTS original_twenty_one_plus_three_bet_chips;
```

However, the code would need to be reverted to handle missing fields.

## Performance Impact

### Database

- **Minimal impact** - 9 new columns with defaults
- **JSONB fields** are efficient for array storage
- **No additional queries** - fields loaded with existing game fetch

### Application

- **No performance degradation**
- Same number of API calls as before
- JSON serialization/deserialization is negligible

## Future Improvements

### Potential Enhancements

1. **Add indexes** if sidebet queries become complex
2. **Separate sidebet table** if more sidebet types are added
3. **Analytics** - track sidebet win rates per user
4. **History** - store all past sidebet results for statistics

### Code Quality

- Consider creating a `SidebetState` interface for better type safety
- Add unit tests for `convertDatabaseGameToGameState()` with sidebet data
- Add integration tests for reload scenarios

## Conclusion

The sidebet persistence issue is now **fully resolved**. All sidebet data is properly saved to and loaded from the database, ensuring a seamless experience even when players reload the page during an active game.

**Impact**: Critical bug fix for blackjack gameplay
**Risk**: Low - backward compatible with existing games
**Status**: ✅ Deployed to production
