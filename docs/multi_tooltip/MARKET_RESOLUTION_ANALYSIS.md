# Market Resolution System Analysis

## Executive Summary

The current market resolution system uses **multiple redundant fields** to track a single piece of state: whether a market is resolved and what the outcome is. The primary issue is the duplication between `isResolved` (boolean) and `status` (enum) - both track whether a market is resolved, creating maintenance burden and potential inconsistencies.

This document analyzes the current implementation and proposes a unified approach using a **single enum field** to replace these redundant fields, simplify the logic, and reduce technical debt.

---

## Recent Fixes & Implementation Progress

**Date: October 16, 2025**

While analyzing the system, several critical bugs were discovered and fixed:

### 1. ✅ **FIXED: MarketCard Display Bug**

- **Issue**: Resolved markets with custom side names (e.g., "Chiefs" vs "Cowboys") were not displaying resolved styling
- **Impact**: Markets appeared in "Resolved" tab but showed as active/buyable
- **Root Cause**: `getDisplayType()` only checked for exact string matches "Yes"/"No", not custom side names or uppercase variants
- **Files Fixed**:
  - `src/components/market/MarketCard.tsx` - Updated resolution detection logic
  - `src/interfaces/market.ts` - Added `isTie?: boolean` to interface

### 2. ✅ **FIXED: Profile Positions Resolution Status**

- **Issue**: Resolved markets showed incorrect win/loss status in user positions
- **Impact**: Users couldn't see if they won/lost, claim button logic was broken
- **Root Cause**:
  - Status logic used uppercase "YES"/"NO" strings (database uses "Yes"/"No")
  - No handling for custom side names in win/loss calculation
  - Tie outcomes not properly detected
- **Files Fixed**:
  - `src/hooks/use-position-belief.tsx` - Fixed status detection, added `isResolved` and `hasWinningPosition` fields
  - `src/app/(site)/profile/common/table-row/belief-row.tsx` - Added "Finalized" status display with conditional colors
  - `src/app/(site)/profile/common/mobile-belief-card.tsx` - Mobile equivalent fixes

### 3. ✅ **FIXED: Claim Modal Integration**

- **Issue**: Profile positions used basic success/pending modals instead of proper claim flow
- **Impact**: Inconsistent UX between market page and profile page
- **Solution**: Integrated `ClaimWinnings` modal from market trading panel
- **Files Fixed**:
  - `src/app/(site)/profile/common/position.tsx` - Added proper claim modal with market data and token balances

### 4. ✅ **FIXED: Currency Formatting**

- **Issue**: Large numbers displayed without thousands separators (e.g., "$4669755.45")
- **Solution**: Implemented `formatBalance()` utility across all position displays
- **Impact**: Better readability with proper formatting (e.g., "$4,669,755.45")

### 5. ✅ **FIXED: TypeScript Type Mismatches**

- **Issue**: Prisma returns `isTie: boolean | null` but interface expects `boolean | undefined`
- **Build Error**: Type incompatibility in batch API route
- **Files Fixed**:
  - `src/app/(site)/api/markets/batch/route.ts` - Added `isTie: market.isTie ?? undefined` conversion
  - `src/hooks/use-position-belief.tsx` - Removed `as any` type assertions

### 6. ✅ **UI Improvements**

- Replaced PNG icons with SVG components (`OngoingIcon`, `ArrowUp`, `ArrowDown`)
- Consistent icon sizing (20x20 for arrows, 16x16 for ongoing circle)
- Font weight updated to semibold for status labels
- Proper tie outcome display with custom background color

### Key Discoveries

1. **Custom Side Names Are Widely Used**: Many markets use custom names (e.g., "Chiefs" vs "Cowboys") instead of "Yes"/"No", requiring careful string matching throughout the codebase.

2. **Case Sensitivity Issues**: Database stores "Yes"/"No" but some code checks for "YES"/"NO", causing silent failures.

3. **Multiple Tie Indicators**: Ties are tracked in TWO ways (`isTie: true` OR `resolvedOption === "Tie"`), requiring checks for both conditions.

4. **Null vs Undefined Confusion**: Prisma uses `null` for optional booleans, but TypeScript interfaces use `undefined`, requiring careful conversion.

5. **Position Display Complexity**: Showing resolved markets in positions requires:
   - Checking both `isResolved` boolean AND `status` enum
   - Matching `resolvedOption` against both standard AND custom side names
   - Handling uppercase/lowercase variants
   - Determining win/loss/tie for user's specific token holdings
   - Computing claim eligibility (LP-only positions can't claim)

---

## Current System Architecture

### Database Schema (Prisma)

The market resolution state is currently tracked across **TWO separate models** with **MULTIPLE fields**:

#### 1. `Market` Model - Primary Resolution Fields

```prisma
model Market {
  // Status enum
  status              MarketStatus               @default(ACTIVE)  // ACTIVE | RESOLVED

  // Resolution boolean flags
  isResolved          Boolean                    @default(false)
  isTie               Boolean?

  // Resolution outcome data
  resolvedOption      String?                    // Stores "Yes", "No", "Tie", or custom side name
  resolvedTime        DateTime?
  resolutionEvidence  String?

  // Oracle configuration
  oracleMarketId      String?
  oracleType          String?
  tieIsPossible       Boolean                    @default(false)

  // Custom side names (used in resolvedOption)
  noSideName          String?                    @default("No")
  yesSideName         String?                    @default("Yes")

  // Relations
  resolution          MarketResolution?

  // ... other fields
}
```

#### 2. `MarketResolution` Model - Secondary Resolution Data

```prisma
model MarketResolution {
  id         String   @id @default(uuid())
  marketId   String   @unique
  timestamp  DateTime @default(now())
  results    Json
  outcome    Boolean                             // YES=true, NO=false
  sources    String[]
  resultFile String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  market     Market   @relation(fields: [marketId], references: [id])
}
```

**⚠️ KEY OBSERVATIONS**:

1. The `MarketResolution` model exists in the schema but is **NEVER used anywhere** in the codebase. It was likely planned but never implemented. **This entire model can be safely dropped.**
2. Both `isResolved` (boolean) and `status` (enum) track the same information - whether a market is active or resolved. This is the **primary source of redundancy** that needs to be fixed.

---

## Current Resolution Flow

### Admin Resolution Process

**File**: `src/app/(site)/api/admin/markets/[id]/resolve/route.ts`

```typescript
// Admin submits resolution through UI modal
const { outcome, evidence, isTie } = await req.json();
// outcome: 0 (No) or 1 (Yes)
// isTie: boolean
// evidence: optional rich text string

// Call external blockchain API to resolve on-chain
await api.post(`/market/${market.contractAddress}/resolve`, {
  outcome: isTie ? 0 : outcome,
  isTie: isTie,
});

// Update database with MULTIPLE fields
await prisma.market.update({
  where: { id },
  data: {
    isResolved: true, // Boolean flag
    status: MarketStatus.RESOLVED, // Enum: ACTIVE | RESOLVED
    resolvedOption: isTie
      ? "Tie" // String literal
      : outcome === 0
      ? market.noSideName // Dynamic string (e.g., "Cowboys", "No")
      : market.yesSideName, // Dynamic string (e.g., "Chiefs", "Yes")
    resolvedTime: new Date(),
    resolutionEvidence: evidence || null,
    isTie: isTie, // Separate boolean flag
  },
});
```

**Key Issues**:

- Must update 5 separate fields to track one state
- `resolvedOption` stores dynamic strings making it hard to query/filter
- Both `isResolved` and `status` track the same state (redundant)
- `isTie` is a separate boolean rather than an enum value

---

### Resolution Display Logic

#### 1. Market Cards

**File**: `src/components/market/MarketCard.tsx`

```typescript
const getDisplayType = () => {
  if (market.isResolved) {
    if (market.resolvedOption === "Yes") {
      return "yes-won";
    } else if (market.resolvedOption === "No") {
      return "no-won";
    }
  }
  return "buy";
};
```

**Issues**:

- Hardcoded string comparisons
- Doesn't handle custom side names (e.g., "Chiefs" vs "Yes")
- Doesn't explicitly handle "Tie" outcome
- Multiple conditionals for one state

**🐛 ~~REAL BUG~~ ✅ FIXED (Oct 16, 2025)**: Markets that are resolved (appear in "Resolved" tab) don't show resolved styling if they have custom side names! The card only checks for exact string match "Yes" or "No", so markets with `resolvedOption = "Chiefs"` still show as active even though `isResolved = true`. This causes user confusion.

**Fix Applied**: Updated `getDisplayType()` to check for:

- Custom side names (`market.yesSideName`, `market.noSideName`)
- Uppercase variants ("YES", "NO")
- Tie outcomes (`market.isTie` boolean flag)

#### 2. Trading Panel - Market End

**File**: `src/app/(site)/market/trading-panel/common/market-end.tsx`

```typescript
// Determine winning side
const winningSide =
  market.resolvedOption === "Yes" ||
  market.resolvedOption === market.yesSideName
    ? "yes"
    : "no";

// Check if user has winning balance
const hasWinningBalance =
  winningSide === "yes"
    ? (tokenBBalance ?? 0n) > 0n
    : (tokenABalance ?? 0n) > 0n;
```

**Issues**:

- Complex conditional logic to determine winner
- Must check both hardcoded "Yes" AND custom side name
- No handling for tie scenario (users on both sides would lose)
- Cannot determine if market ended in tie

#### 3. User Positions

**File**: `src/hooks/use-position-belief.tsx`

```typescript
const status: IPositionBelief["status"] =
  market.status === "ACTIVE"
    ? "Ongoing"
    : market.status === "RESOLVED"
    ? // If resolved, mark Won if user holds the resolved side, else Loss
      (market.resolvedOption === "YES" && yes > 0) ||
      (market.resolvedOption === "NO" && no > 0)
      ? "Won"
      : "Loss"
    : "Ongoing";
```

**Issues**:

- Nested ternary operators
- Hardcoded uppercase "YES"/"NO" (inconsistent with database "Yes"/"No")
- Doesn't account for tie outcomes
- Complex logic to determine win/loss

**✅ FIXED (Oct 16, 2025)**:

- Now checks for both "Yes"/"YES" and custom side names
- Properly handles tie outcomes (sets status to "Loss" for all parties)
- Added `isResolved` and `hasWinningPosition` fields to `IPositionBelief` interface
- LP-only positions correctly marked as non-winning (can't claim)
- Position displays now show "Finalized" status with conditional colors in UI

#### 4. Trading Panel Context

**File**: `src/app/(site)/market/trading-panel/context/TradingPanelContext.tsx`

```typescript
useEffect(() => {
  if (market.resolvedOption === "Yes") {
    dispatch({ type: "SET_MARKET_RESULT", payload: "yes" });
  } else if (market.resolvedOption === "No") {
    dispatch({ type: "SET_MARKET_RESULT", payload: "no" });
  }
}, [market.resolvedOption]);
```

**Issues**:

- More string comparisons
- No tie handling
- Doesn't work with custom side names

---

## Complete Field Usage Map

**Note**: Notice how `isResolved` (7 files) and `status` (5 files) serve the exact same purpose - checking if a market is resolved. This is the core redundancy problem.

### Where Each Field is Used

| Field                | Files Using It | Purpose                                    |
| -------------------- | -------------- | ------------------------------------------ |
| `isResolved`         | 7 files        | ❌ Check if market is resolved (REDUNDANT) |
| `status`             | 5 files        | ❌ Check if market is resolved (REDUNDANT) |
| `resolvedOption`     | 8 files        | Determine winning side & display           |
| `isTie`              | 2 files        | Check if outcome was tie                   |
| `resolvedTime`       | 3 files        | ✅ Display resolution timestamp (keep)     |
| `resolutionEvidence` | 2 files        | ✅ Display curator evidence (keep)         |

**Files checking resolution state**:

1. `src/components/market/MarketCard.tsx`
2. `src/hooks/use-position-belief.tsx`
3. `src/app/(site)/market/trading-panel/index.tsx`
4. `src/app/(site)/market/[id]/MarketDetailClient.tsx`
5. `src/app/(site)/market/trading-panel/common/market-end.tsx`
6. `src/app/(site)/market/trading-panel/context/TradingPanelContext.tsx`
7. `src/app/(site)/api/markets/batch/route.ts`
8. `src/app/(site)/markets/page.tsx`
9. `src/services/marketService.ts`
10. `src/components/AIResult.tsx`

---

## The Core Problem: isResolved vs status Redundancy

### Where Each Field is Used

#### `isResolved` Boolean Field (7 files)

**Primary usage pattern**: `if (market.isResolved) { ... }`

1. **`src/components/market/MarketCard.tsx`** (line 42)

   ```typescript
   if (market.isResolved) {
     if (market.resolvedOption === "Yes") return "yes-won";
     else if (market.resolvedOption === "No") return "no-won";
   }
   ```

2. **`src/hooks/use-position-belief.tsx`** (line 137-145)

   ```typescript
   // Used indirectly through status check
   market.status === "RESOLVED" ? ... : "Ongoing"
   ```

3. **`src/app/(site)/markets/page.tsx`** (line 46)

   ```typescript
   if (market.isResolved !== isResolved) return false;
   ```

4. **`src/app/(site)/markets/ui.tsx`** (line 18)

   ```typescript
   if (market.isResolved !== isResolved) return false;
   ```

5. **`src/services/marketService.ts`** (line 42)

   ```typescript
   where.isResolved = filter.isResolved;
   ```

6. **`src/app/(site)/api/admin/markets/[id]/resolve/route.ts`** (line 52)

   ```typescript
   if (market.status === "RESOLVED" || market.isResolved) {
     return NextResponse.json({ error: "Market is already resolved" });
   }
   ```

7. **`src/interfaces/market.ts`** (line 17)
   ```typescript
   interface IMarketData {
     isResolved: boolean;
   }
   ```

#### `status` Enum Field (5 files)

**Primary usage pattern**: `if (market.status === "RESOLVED") { ... }`

1. **`src/app/(site)/api/admin/markets/[id]/resolve/route.ts`** (line 52, 79)

   ```typescript
   // Check if already resolved
   if (market.status === "RESOLVED" || market.isResolved) { ... }

   // Update on resolution
   status: MarketStatus.RESOLVED,
   ```

2. **`src/hooks/use-position-belief.tsx`** (line 137-145)

   ```typescript
   const status = market.status === "ACTIVE"
     ? "Ongoing"
     : market.status === "RESOLVED"
       ? /* determine win/loss */
       : "Ongoing";
   ```

3. **`src/app/(site)/creator/hook/use-creator-belief-active.tsx`** (line 61)

   ```typescript
   isRenounced: market.status === "RESOLVED";
   ```

4. **`src/interfaces/market.ts`** (line 40)

   ```typescript
   interface IMarketData {
     status: "ACTIVE" | "RESOLVED";
   }
   ```

5. **`prisma/schema.prisma`** (line 200)
   ```prisma
   status  MarketStatus  @default(ACTIVE)  // ACTIVE | RESOLVED enum
   ```

### The Problem Illustrated

**In the resolution API (line 52-56)**:

```typescript
// We check BOTH fields even though they mean the same thing!
if (market.status === "RESOLVED" || market.isResolved) {
  return NextResponse.json({ error: "Market is already resolved" });
}
```

**When we resolve (line 78-79)**:

```typescript
// We update BOTH fields to represent the same state
data: {
  isResolved: true,           // Boolean: market is resolved
  status: MarketStatus.RESOLVED,  // Enum: market is resolved (SAME INFORMATION!)
  // ...
}
```

**Impact**:

- Every query must check both fields OR risk inconsistency
- Database has two columns storing identical information
- Code must maintain both fields in sync
- New developers don't know which field to check

---

## Problems with Current System

### 1. **Redundancy (THE MAIN ISSUE)**

- `isResolved` and `status === "RESOLVED"` track the **exact same state**
- Both must be checked: `if (market.status === "RESOLVED" || market.isResolved)`
- Both must be updated when resolving
- Database wastes storage on duplicate data
- Risk of fields getting out of sync (e.g., `isResolved: true` but `status: "ACTIVE"`)

### 2. **Inconsistent String Values**

- Database stores: `"Yes"`, `"No"`, `"Tie"`, or custom names like `"Chiefs"`
- Code checks for: `"Yes"`, `"YES"`, `"No"`, `"NO"`, custom side names
- Case sensitivity issues (line 141 in `use-position-belief.tsx` checks `"YES"` uppercase)

### 3. **Complex Conditionals**

Every component must implement custom logic like:

```typescript
if (market.isResolved) {
  if (
    market.resolvedOption === "Yes" ||
    market.resolvedOption === market.yesSideName
  ) {
    // Yes won
  } else if (
    market.resolvedOption === "No" ||
    market.resolvedOption === market.noSideName
  ) {
    // No won
  } else if (market.resolvedOption === "Tie" || market.isTie) {
    // Tie
  }
}
```

### 4. **Tie Handling Inconsistency**

- Ties stored in TWO ways: `resolvedOption === "Tie"` OR `isTie === true`
- Most UI code doesn't handle ties properly
- Unclear what happens to user positions in a tie

### 5. **Database Query Limitations**

- Cannot easily query "all markets resolved as YES"
- Must parse dynamic strings in `resolvedOption`
- Cannot create database indexes on resolution outcome

### 6. **Unused Schema Model**

- `MarketResolution` model exists but is never populated
- Creates confusion about source of truth
- Wastes database resources

---

## Proposed Solution: Unified Resolution Enum

### Summary of Changes

**The main solve**: Combine the redundant `isResolved` (boolean) and `status` (enum) fields into a single enum that tracks both state and outcome.

**Key Changes**:

1. **Replace 2 redundant fields** (`isResolved` + `status`) with **1 enum field** (`resolutionOutcome`)
2. **Drop unused model** (`MarketResolution` - never implemented, zero references in code)
3. **Consolidate resolution logic** - replace string comparisons with type-safe enum checks
4. **Simplify codebase** - 17 files get cleaner, more maintainable code

### New Schema Design

```prisma
enum MarketResolutionOutcome {
  UNRESOLVED      // Market is still active
  RESOLVED_YES    // Yes side won
  RESOLVED_NO     // No side won
  RESOLVED_TIE    // Market ended in tie
  CANCELLED       // Market was cancelled/invalidated (future use)
}

model Market {
  // ... existing fields ...

  // REMOVE THESE:
  // isResolved          Boolean    @default(false)    ❌
  // status              MarketStatus                  ❌
  // resolvedOption      String?                       ❌
  // isTie               Boolean?                      ❌

  // REPLACE WITH SINGLE FIELD:
  resolutionOutcome   MarketResolutionOutcome        @default(UNRESOLVED)  ✅

  // KEEP THESE (metadata):
  resolvedTime        DateTime?
  resolutionEvidence  String?

  // ... other fields ...
}
```

### Migration Strategy

#### Phase 1: Add New Field (Non-Breaking)

**Schema Change**:

```prisma
// Add new enum
enum MarketResolutionOutcome {
  UNRESOLVED
  RESOLVED_YES
  RESOLVED_NO
  RESOLVED_TIE
}

// Add new field with default to Market model
resolutionOutcome   MarketResolutionOutcome  @default(UNRESOLVED)
```

**Data Backfill Requirements**:

You'll need to populate the new `resolutionOutcome` field based on existing data:

| Current State                                                         | New Value      |
| --------------------------------------------------------------------- | -------------- |
| `isResolved = false`                                                  | `UNRESOLVED`   |
| `isResolved = true` AND `isTie = true`                                | `RESOLVED_TIE` |
| `isResolved = true` AND `resolvedOption` = "Yes" or "YES"             | `RESOLVED_YES` |
| `isResolved = true` AND `resolvedOption` = "No" or "NO"               | `RESOLVED_NO`  |
| `isResolved = true` AND `resolvedOption` matches custom `yesSideName` | `RESOLVED_YES` |
| `isResolved = true` AND `resolvedOption` matches custom `noSideName`  | `RESOLVED_NO`  |

**Important**: Handle custom side names carefully. Some markets may have `resolvedOption = "Chiefs"` which needs to be matched against `yesSideName` or `noSideName` to determine if it's YES or NO.

#### Phase 2: Update Application Code

**Resolution API** (`src/app/(site)/api/admin/markets/[id]/resolve/route.ts`):

```typescript
// BEFORE (5 fields):
await prisma.market.update({
  where: { id },
  data: {
    isResolved: true,
    status: MarketStatus.RESOLVED,
    resolvedOption: isTie
      ? "Tie"
      : outcome === 0
      ? market.noSideName
      : market.yesSideName,
    resolvedTime: new Date(),
    resolutionEvidence: evidence || null,
    isTie: isTie,
  },
});

// AFTER (1 field):
await prisma.market.update({
  where: { id },
  data: {
    resolutionOutcome: isTie
      ? MarketResolutionOutcome.RESOLVED_TIE
      : outcome === 0
      ? MarketResolutionOutcome.RESOLVED_NO
      : MarketResolutionOutcome.RESOLVED_YES,
    resolvedTime: new Date(),
    resolutionEvidence: evidence || null,
  },
});
```

**Market Card Display** (`src/components/market/MarketCard.tsx`):

```typescript
// BEFORE:
const getDisplayType = () => {
  if (market.isResolved) {
    if (market.resolvedOption === "Yes") {
      return "yes-won";
    } else if (market.resolvedOption === "No") {
      return "no-won";
    }
  }
  return "buy";
};

// AFTER:
const getDisplayType = () => {
  switch (market.resolutionOutcome) {
    case "RESOLVED_YES":
      return "yes-won";
    case "RESOLVED_NO":
      return "no-won";
    case "RESOLVED_TIE":
      return "tie";
    case "UNRESOLVED":
    default:
      return "buy";
  }
};
```

**Market End Display** (`src/app/(site)/market/trading-panel/common/market-end.tsx`):

```typescript
// BEFORE:
const winningSide =
  market.resolvedOption === "Yes" ||
  market.resolvedOption === market.yesSideName
    ? "yes"
    : "no";

// AFTER:
const winningSide = market.resolutionOutcome === "RESOLVED_YES" ? "yes" : "no";
const isTie = market.resolutionOutcome === "RESOLVED_TIE";
```

**User Position Status** (`src/hooks/use-position-belief.tsx`):

```typescript
// BEFORE:
const status: IPositionBelief["status"] =
  market.status === "ACTIVE"
    ? "Ongoing"
    : market.status === "RESOLVED"
    ? (market.resolvedOption === "YES" && yes > 0) ||
      (market.resolvedOption === "NO" && no > 0)
      ? "Won"
      : "Loss"
    : "Ongoing";

// AFTER:
const status: IPositionBelief["status"] =
  market.resolutionOutcome === "UNRESOLVED"
    ? "Ongoing"
    : market.resolutionOutcome === "RESOLVED_TIE"
    ? "Tie"
    : (market.resolutionOutcome === "RESOLVED_YES" && yes > 0) ||
      (market.resolutionOutcome === "RESOLVED_NO" && no > 0)
    ? "Won"
    : "Loss";
```

#### Phase 3: Remove Old Fields (Breaking)

After all code is updated and tested:

**Fields to Remove from Market Model**:

```prisma
model Market {
  // ❌ REMOVE THESE FIELDS:
  // isResolved          Boolean
  // status              MarketStatus (or keep if repurposing for other states like DRAFT, CANCELLED, etc)
  // resolvedOption      String?
  // isTie               Boolean?

  // ✅ KEEP THIS - Single source of truth:
  resolutionOutcome   MarketResolutionOutcome  @default(UNRESOLVED)

  // ✅ KEEP THESE - Metadata about resolution:
  resolvedTime        DateTime?
  resolutionEvidence  String?
}
```

**Model to Drop Completely**:

```prisma
// ❌ DELETE THIS ENTIRE MODEL (never used):
model MarketResolution {
  // This was never implemented or used anywhere in the codebase
  // Can be safely dropped without any code changes needed
}
```

**Database Migration Steps**:

1. Remove `MarketResolution` model from schema
2. Remove `resolution` relation from `Market` model
3. Drop old fields: `isResolved`, `resolvedOption`, `isTie`
4. Optionally keep `status` if repurposing for other market states (DRAFT, CANCELLED, etc.)
5. Run `npx prisma migrate dev` to generate migration

---

## Benefits of Unified Enum Approach

### 1. **Type Safety**

```typescript
// Compile-time checks prevent typos
if (market.resolutionOutcome === 'RESOLVED_TIE') {  // ✅ TypeScript validates
if (market.resolvedOption === "Tie")                // ❌ Just a string, no validation
```

### 2. **Simplified Conditionals**

```typescript
// BEFORE: Multiple checks
if (
  market.isResolved &&
  (market.resolvedOption === "Yes" ||
    market.resolvedOption === market.yesSideName)
) {
  // ...
}

// AFTER: Single check
if (market.resolutionOutcome === "RESOLVED_YES") {
  // ...
}
```

### 3. **Database Query Power**

```sql
-- Easy aggregations
SELECT resolutionOutcome, COUNT(*)
FROM markets
GROUP BY resolutionOutcome;

-- Indexed lookups
CREATE INDEX idx_resolution_outcome ON markets(resolutionOutcome);

-- Business analytics
SELECT
  COUNT(*) FILTER (WHERE resolutionOutcome = 'RESOLVED_YES') as yes_count,
  COUNT(*) FILTER (WHERE resolutionOutcome = 'RESOLVED_NO') as no_count,
  COUNT(*) FILTER (WHERE resolutionOutcome = 'RESOLVED_TIE') as tie_count
FROM markets;
```

### 4. **Consistent UI Logic**

All components use the same enum, eliminating:

- String case mismatches
- Custom side name handling in display logic
- Redundant boolean checks

### 5. **Better Error Handling**

```typescript
// Exhaustive switch statements
switch (market.resolutionOutcome) {
  case "UNRESOLVED":
    return <ActiveMarketUI />;
  case "RESOLVED_YES":
    return <YesWonUI />;
  case "RESOLVED_NO":
    return <NoWonUI />;
  case "RESOLVED_TIE":
    return <TieUI />;
  case "CANCELLED":
    return <CancelledUI />;
  default:
    // TypeScript will error if we miss a case
    const exhaustiveCheck: never = market.resolutionOutcome;
    throw new Error(`Unhandled case: ${exhaustiveCheck}`);
}
```

### 6. **Future Extensibility**

Easy to add new resolution types:

```prisma
enum MarketResolutionOutcome {
  UNRESOLVED
  RESOLVED_YES
  RESOLVED_NO
  RESOLVED_TIE
  CANCELLED         // Market cancelled before resolution
  DISPUTED          // Resolution under review
  INVALID           // Market was invalid
}
```

---

## Implementation Checklist

### Phase 1: Preparation (Non-Breaking)

- [ ] Add `MarketResolutionOutcome` enum to Prisma schema
- [ ] Add `resolutionOutcome` field to `Market` model with default
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create and run migration: `npx prisma migrate dev`
- [ ] Write and run data backfill script
- [ ] Verify all existing markets have correct `resolutionOutcome` values

### Phase 2: Code Updates (Parallel with old system)

- [ ] Update TypeScript interfaces (`src/interfaces/market.ts`)
- [ ] Update admin resolution API (`src/app/(site)/api/admin/markets/[id]/resolve/route.ts`)
- [ ] Update market service (`src/services/marketService.ts`)
- [ ] Update admin service (`src/services/adminMarketService.ts`)
- [ ] Update all 10+ files that check resolution state
- [ ] Add helper utility functions:

  ```typescript
  // src/utils/marketResolution.ts
  export const isMarketResolved = (outcome: MarketResolutionOutcome) =>
    outcome !== MarketResolutionOutcome.UNRESOLVED;

  export const getWinningSide = (
    outcome: MarketResolutionOutcome
  ): "yes" | "no" | "tie" | null => {
    switch (outcome) {
      case MarketResolutionOutcome.RESOLVED_YES:
        return "yes";
      case MarketResolutionOutcome.RESOLVED_NO:
        return "no";
      case MarketResolutionOutcome.RESOLVED_TIE:
        return "tie";
      default:
        return null;
    }
  };
  ```

### Phase 3: Testing

- [ ] Test admin resolution flow (Yes/No/Tie)
- [ ] Test market card display for all outcomes
- [ ] Test trading panel for resolved markets
- [ ] Test user position calculations (win/loss/tie)
- [ ] Test market filtering (active vs resolved)
- [ ] Test database queries and aggregations
- [ ] Verify no regression in existing functionality

### Phase 4: Deprecation (Breaking)

- [ ] Remove old fields from Prisma schema
- [ ] Remove old fields from TypeScript interfaces
- [ ] Search codebase for any remaining references to old fields
- [ ] Run linter to catch any missed updates
- [ ] Create migration to drop old columns
- [ ] Update API documentation

### Phase 5: Cleanup

- [ ] **Drop `MarketResolution` model entirely** (never used, safe to remove)
- [ ] Remove `resolution` relation from `Market` model in schema
- [ ] Decide if `MarketStatus` enum should be kept or removed:
  - **Remove** if only used for ACTIVE/RESOLVED (now handled by `resolutionOutcome`)
  - **Keep** if repurposing for other states (DRAFT, CANCELLED, PAUSED, etc.)
- [ ] Update tests to use new enum values
- [ ] Update developer documentation and API docs

---

## Risk Assessment

### Low Risk Items

✅ Adding new field alongside existing ones (Phase 1)
✅ Backfilling data (read-only operation)
✅ Updating display components (UI only)

### Medium Risk Items

⚠️ Updating resolution API (affects admin workflow)
⚠️ Updating position win/loss calculations (affects user money)
⚠️ Database migration (requires testing)

### High Risk Items

🚨 Removing old fields (breaking change)
🚨 Tie resolution logic (affects user payouts)

### Mitigation Strategies

1. **Keep both systems running in parallel** during Phase 2
2. **Write comprehensive tests** for all resolution outcomes
3. **Use feature flags** to gradually roll out new logic
4. **Monitor error logs** after each phase deployment
5. **Have rollback plan** ready for each migration step

---

## Timeline Estimate

| Phase                       | Effort       | Timeline    |
| --------------------------- | ------------ | ----------- |
| Phase 1: Schema + Migration | 4 hours      | Day 1       |
| Phase 2: Code Updates       | 16 hours     | Day 2-3     |
| Phase 3: Testing            | 8 hours      | Day 4       |
| Phase 4: Deprecation        | 4 hours      | Day 5       |
| Phase 5: Cleanup            | 2 hours      | Day 5       |
| **Total**                   | **34 hours** | **~1 week** |

---

## Alternative: Computed Resolution Helper

If you want to avoid a large migration, you could create a computed property:

```typescript
// src/utils/marketResolution.ts
export type MarketResolutionOutcome =
  | "UNRESOLVED"
  | "RESOLVED_YES"
  | "RESOLVED_NO"
  | "RESOLVED_TIE";

export function getMarketResolutionOutcome(market: {
  isResolved: boolean;
  resolvedOption?: string;
  isTie?: boolean;
  yesSideName?: string;
  noSideName?: string;
}): MarketResolutionOutcome {
  if (!market.isResolved) {
    return "UNRESOLVED";
  }

  if (market.isTie || market.resolvedOption === "Tie") {
    return "RESOLVED_TIE";
  }

  if (
    market.resolvedOption === "Yes" ||
    market.resolvedOption === "YES" ||
    market.resolvedOption === market.yesSideName
  ) {
    return "RESOLVED_YES";
  }

  return "RESOLVED_NO";
}
```

**Pros**: No database migration, can implement immediately
**Cons**: Still checking multiple fields, doesn't solve root problem

---

## What Needs to Be Updated

### 1. Database Schema Changes

**Add**:

- New `MarketResolutionOutcome` enum with values: `UNRESOLVED`, `RESOLVED_YES`, `RESOLVED_NO`, `RESOLVED_TIE`
- New `resolutionOutcome` field to `Market` model

**Remove**:

- `isResolved` boolean field from `Market` model
- `status` enum field from `Market` model (or keep if repurposing)
- `resolvedOption` string field from `Market` model (outcome now in enum)
- `isTie` boolean field from `Market` model (now a specific enum value)
- **Entire `MarketResolution` model** (never used)
- `resolution` relation from `Market` model

**Backfill Data**:

- Map existing `isResolved`, `status`, `resolvedOption`, and `isTie` values to new `resolutionOutcome` enum
- Handle custom side names (e.g., "Chiefs" → `RESOLVED_YES` or `RESOLVED_NO`)

### 2. TypeScript Interface Updates

Update `IMarketData` and `AdminMarket` interfaces to:

- Remove: `isResolved`, `status`, `resolvedOption`, `isTie`
- Add: `resolutionOutcome: MarketResolutionOutcome`

### 3. API Route Updates (3 files)

Replace resolution checks and updates:

```typescript
// OLD:
if (market.status === "RESOLVED" || market.isResolved) { ... }
data: { isResolved: true, status: "RESOLVED", resolvedOption: ..., isTie: ... }

// NEW:
if (market.resolutionOutcome !== "UNRESOLVED") { ... }
data: { resolutionOutcome: "RESOLVED_YES" | "RESOLVED_NO" | "RESOLVED_TIE" }
```

### 4. Service Layer Updates (2 files)

Update business logic to use enum instead of multiple fields.

### 5. Component Updates (4 files)

Replace conditional logic:

```typescript
// OLD:
if (market.isResolved && market.resolvedOption === "Yes") { ... }

// NEW:
if (market.resolutionOutcome === "RESOLVED_YES") { ... }
```

### 6. Hook Updates (2 files)

Simplify win/loss calculations and state checks.

### 7. Context/State Updates (1 file)

Update trading panel state management.

### 8. Page Updates (2 files)

Update filtering and display logic.

### 9. Utility Functions (1 new file)

Create helper functions for common resolution checks.

---

## Additional Recommendations Based on Recent Fixes

### 1. Create Utility Functions for Common Patterns

**Immediate Need**: Based on the bugs we fixed, create centralized utility functions:

```typescript
// src/utils/marketResolution.ts

/**
 * Check if a market's resolved option matches the YES side
 * Handles: "Yes", "YES", and custom yesSideName
 */
export function isYesSideWinner(market: {
  resolvedOption?: string;
  yesSideName?: string;
}): boolean {
  return (
    market.resolvedOption === "Yes" ||
    market.resolvedOption === "YES" ||
    market.resolvedOption === market.yesSideName
  );
}

/**
 * Check if a market's resolved option matches the NO side
 * Handles: "No", "NO", and custom noSideName
 */
export function isNoSideWinner(market: {
  resolvedOption?: string;
  noSideName?: string;
}): boolean {
  return (
    market.resolvedOption === "No" ||
    market.resolvedOption === "NO" ||
    market.resolvedOption === market.noSideName
  );
}

/**
 * Check if market ended in a tie
 * Handles both isTie flag and "Tie" string
 */
export function isMarketTie(market: {
  resolvedOption?: string;
  isTie?: boolean;
}): boolean {
  return market.isTie === true || market.resolvedOption === "Tie";
}
```

**Benefit**: Prevents future bugs from inconsistent string matching logic.

### 2. Standardize Prisma Type Conversions

**Issue Found**: Prisma returns `boolean | null` but interfaces expect `boolean | undefined`.

**Solution**: Create a transformation helper in the API layer:

```typescript
// src/utils/prismaTransform.ts

export function transformMarketFromPrisma(market: PrismaMarket): IMarketData {
  return {
    ...market,
    isTie: market.isTie ?? undefined,
    resolvedTime: market.resolvedTime ?? undefined,
    resolutionEvidence: market.resolutionEvidence ?? undefined,
    // ... other null -> undefined conversions
  };
}
```

**Apply to**:

- `/api/markets/route.ts`
- `/api/markets/[id]/route.ts`
- `/api/markets/batch/route.ts`
- `marketService.ts`

### 3. Add Position Display Tests

Based on the complex logic we had to fix, add tests for:

```typescript
// tests/hooks/use-position-belief.test.ts

describe("use-position-belief", () => {
  it("should mark position as Won when user holds winning side", () => {
    // Test with standard "Yes"
    // Test with uppercase "YES"
    // Test with custom side name
  });

  it("should mark all positions as Loss in tie outcome", () => {
    // Test isTie flag
    // Test resolvedOption === "Tie"
  });

  it("should mark LP-only positions as non-winning", () => {
    // Test hasWinningPosition = false for LP
  });
});
```

### 4. Audit All String Comparisons

**Search for**: `resolvedOption ===`, `=== "Yes"`, `=== "No"`, `=== "YES"`, `=== "NO"`

**Potential issues in**:

- Trading panel components
- Admin resolution UI
- Market filters
- Analytics/reporting code

### 5. Document Custom Side Name Requirements

**Create**: `docs/CUSTOM_SIDE_NAMES.md` explaining:

- How to set custom side names in market creation
- Impact on resolution logic
- Requirements for display code
- Testing checklist for custom name markets

---

## Conclusion

The current market resolution system is **functional but fragile**. It relies on **redundant fields** (`isResolved` AND `status` both tracking resolution state), string comparisons, and complex conditionals scattered across the codebase.

**Recent fixes (October 2025)** addressed critical bugs in market card display, position status calculation, and claim functionality - but these were **symptoms of the deeper design issue**. The fixes required careful handling of:

- String case sensitivity (Yes vs YES)
- Custom side names (Chiefs vs Yes)
- Multiple tie indicators (isTie flag vs "Tie" string)
- Type mismatches (null vs undefined)

These problems create:

- **Maintenance burden**: Must keep two fields in sync, every new feature must duplicate complex logic
- **Inconsistency risk**: Fields can get out of sync (`isResolved: true` but `status: "ACTIVE"`)
- **Confusion**: Developers don't know which field to check (`isResolved` vs `status`)
- **Silent failures**: Case mismatches and custom names cause bugs that aren't immediately obvious
- **Wasted resources**: Database stores duplicate information
- **Poor performance**: Cannot efficiently query markets by outcome due to string-based `resolvedOption`

Moving to a **unified enum approach** provides:

- ✅ **Eliminates redundancy**: Single source of truth replaces `isResolved` + `status`
- ✅ **Type safety**: Compile-time checks prevent typos and invalid states
- ✅ **Simplified code**: 17+ files get cleaner, more maintainable logic
- ✅ **Better performance**: Indexed enum queries vs string comparisons
- ✅ **Future flexibility**: Easy to add new outcome types (CANCELLED, DISPUTED, etc.)
- ✅ **Reduced bugs**: Impossible to have out-of-sync fields or case mismatch issues
- ✅ **No custom name complexity**: Outcome is encoded in enum, display names are separate concern

**Additional cleanup**: Drop the unused `MarketResolution` model which was never implemented but adds schema complexity.

The migration can be done **safely in phases** without breaking existing functionality, and the long-term benefits far outweigh the short-term implementation cost. The recent bug fixes demonstrate the real-world pain of the current system and validate the need for this refactor.

---

## Appendix: Full File List Requiring Updates

### Files Already Fixed (October 2025)

✅ **Components (3 files)**:

1. `src/components/market/MarketCard.tsx` - Market display cards (custom side names, tie handling)
2. `src/components/icons/OngoingIcon.tsx` - SVG icon with proper sizing
3. `src/app/(site)/profile/common/table-row/belief-row.tsx` - Desktop position row (status, claim, formatting)
4. `src/app/(site)/profile/common/mobile-belief-card.tsx` - Mobile position card (status, claim, formatting)

✅ **Hooks (1 file)**: 5. `src/hooks/use-position-belief.tsx` - User position calculations (fixed status logic, added resolution fields)

✅ **Context/State (1 file)**: 6. `src/app/(site)/profile/common/position.tsx` - Position page (claim modal integration)

✅ **Interfaces (1 file)**: 7. `src/interfaces/market.ts` - TypeScript types (added `isTie` field)

✅ **API Routes (1 file)**: 8. `src/app/(site)/api/markets/batch/route.ts` - Batch market fetch (type conversion)

### Files Still Requiring Updates for Full Refactor

**API Routes (2 files)**: 9. `src/app/(site)/api/admin/markets/[id]/resolve/route.ts` - Resolution endpoint 10. `src/app/(site)/api/markets/route.ts` - Market listing

**Services (2 files)**: 11. `src/services/marketService.ts` - Market business logic 12. `src/services/adminMarketService.ts` - Admin operations

**Components (2 files)**: 13. `src/components/AIResult.tsx` - Resolution evidence display 14. `src/app/(admin)/admin/manage-markets/create/components/ResolveMarketModal.tsx` - Admin resolution UI

**Hooks (1 file)**: 15. `src/hooks/useMarket.ts` - Market data fetching

**Context (1 file)**: 16. `src/app/(site)/market/trading-panel/context/TradingPanelContext.tsx` - Trading state

**Pages (2 files)**: 17. `src/app/(site)/markets/page.tsx` - Market listing page 18. `src/app/(site)/market/[id]/MarketDetailClient.tsx` - Market detail page

**Interfaces (1 file)**: 19. `src/app/(admin)/admin/manage-markets/create/types.ts` - Admin types

**Utilities (1 file - to create)**: 20. `src/utils/marketResolution.ts` - Resolution helper functions (new)

**Trading Panel (1 file - may need updates)**: 21. `src/app/(site)/market/trading-panel/common/market-end.tsx` - Resolved market UI

**Total**: 8 files fixed, 13 files remaining for full enum migration

---

_Document created: 2025-10-15_  
_Last updated: 2025-10-16_  
_Author: AI Analysis of Simmibets Codebase_

**Changelog**:

- **2025-10-15**: Initial analysis of market resolution system, identified core redundancy issues
- **2025-10-16**: Added "Recent Fixes & Implementation Progress" section documenting bugs discovered and fixed during implementation work, including MarketCard display, profile positions, claim modal, currency formatting, TypeScript type mismatches, and UI improvements. Added "Additional Recommendations" section with immediate next steps.
