# Ongoing Position Flex Card - Implementation Plan

> **Status:** Planning  
> **Created:** January 27, 2025  
> **Purpose:** Unified flex card type for sharing ongoing bet positions

---

## Table of Contents

- [Overview](#overview)
- [Current State Analysis](#current-state-analysis)
- [Proposed Solution](#proposed-solution)
- [Data Requirements](#data-requirements)
- [Implementation Steps](#implementation-steps)
- [Edge Cases & Considerations](#edge-cases--considerations)
- [Testing Strategy](#testing-strategy)

---

## Overview

### Problem Statement

Currently, we have **inconsistent flex card behavior** for ongoing positions:

1. **Update Bet Flow** → Uses Flex 12 ("What If" card) showing potential outcomes
2. **Profile Position Sharing** → Uses Flex 10 (Completed Bet card) even though position is still ongoing
3. **No unified representation** of an active position's current state

### Proposed Solution

Create a **new unified flex card type** (Flex 15) specifically for ongoing bet positions that:

- Shows the **current state** of an active position
- Displays **total current value** (what they'd get if they cashed out now)
- Used consistently across **all ongoing position sharing scenarios**
- Calculates fresh values at time of sharing (not stale data)

---

## Current State Analysis

### Current Flex Card Usage

| Scenario                           | Current Flex Type | Issues                                        |
| ---------------------------------- | ----------------- | --------------------------------------------- |
| **Place New Bet**                  | Flex 12           | ✅ Works well - shows potential outcomes      |
| **Update Bet**                     | Flex 12           | ❌ Shows incremental data, not total position |
| **Share from Profile (Ongoing)**   | Flex 10           | ❌ Wrong - Flex 10 is for completed bets      |
| **Share from Profile (Completed)** | Flex 10           | ✅ Correct - shows cashout result             |

### Flex 10 vs Flex 12 vs Proposed Flex 15

| Feature          | Flex 10 (Completed)    | Flex 12 (What If)         | **Flex 15 (Ongoing Position)** |
| ---------------- | ---------------------- | ------------------------- | ------------------------------ |
| **Status**       | Closed/Completed       | New/Updating              | **Ongoing**                    |
| **Label**        | "Amount won"           | "You Could Win"           | **"Current Value"**            |
| **Amount Shown** | Total cashout received | Potential if wins         | **Current cashout value**      |
| **Bet Amount**   | Original investment    | New/additional investment | **Total invested to date**     |
| **Side**         | Winning side           | Selected side             | **Current position side**      |
| **Belief**       | Hidden (not stored)    | Current market belief     | **Current market belief**      |
| **Use When**     | Bet closed/cashed out  | Placing/updating bet      | **Sharing ongoing position**   |

---

## Proposed Solution

### Flex 15 - Ongoing Position Card

#### Visual Design

```
┌─────────────────────────────────────────────┐
│  SPORTS                                      │
│  Will the interstellar object 3I/ATLAS be   │
│  identified as an alien spacecraft in 2025?  │
│                                              │
│  Current Value                               │
│  +$42.50                    [Always green]   │
│                                              │
│  ┌──────────┬─────────┬──────────┐          │
│  │ Total Bet│  Side   │  Belief  │          │
│  │  $35.00  │   YES   │   75%    │          │
│  └──────────┴─────────┴──────────┘          │
│                                              │
│  👤 @username                        Bluff   │
│  🟢 Ongoing Position                         │
└─────────────────────────────────────────────┘
```

#### Key Differences from Flex 12

1. **Label**: "Current Value" (not "You Could Win")
2. **Status**: "Ongoing Position" (not "Bet Placed")
3. **Bet Amount**: Shows **total invested** across all adds, not just latest
4. **Current Value**: Shows **real-time cashout value** from `estimateRedeemableAmount`
5. **Always Positive**: Shows current value, never negative (even if losing)

---

## Data Requirements

### Required Data Points

```typescript
interface OngoingPositionFlexData {
  // Market Info
  marketQuestion: string;
  marketImage: string; // Use imageSquare with fallback
  marketCategory: string;
  marketId: string;

  // Position Details
  totalBetAmount: number; // Sum of all investments in this position
  currentValue: number; // Real-time cashout value
  side: "YES" | "NO"; // Current position side
  belief: number; // Current market belief percentage

  // Token Holdings
  yesTokenBalance: number;
  noTokenBalance: number;

  // User Info
  username: string;
  avatar?: string;

  // Status
  status: "Ongoing"; // Always "Ongoing" for Flex 15
}
```

### Data Sources

| Field             | Source                                     | Notes                                   |
| ----------------- | ------------------------------------------ | --------------------------------------- |
| `totalBetAmount`  | `UserPosition.usdcInvestment`              | Total USDC invested                     |
| `currentValue`    | `estimateRedeemableAmount()` contract call | Real-time cashout value                 |
| `yesTokenBalance` | `useMarketTokens().tokenBBalance`          | From wallet                             |
| `noTokenBalance`  | `useMarketTokens().tokenABalance`          | From wallet                             |
| `side`            | Calculated from token balances             | Which side has more tokens              |
| `belief`          | Current market probability                 | From trading panel state or market data |

---

## Implementation Steps

### Phase 1: Create Flex 15 Type

#### Step 1.1: Update Type Definitions

**File:** `src/utils/flexSnapshot.ts`

```typescript
// Update BetData interface to support ongoing positions
export interface BetData {
  question: string;
  amountWon: string; // For Flex 15: "Current Value"
  betAmount: string; // For Flex 15: Total invested
  side: string;
  belief?: string;
  user: {
    name: string;
    level: string;
  };
  timestamp: string;
  marketId: string;
  status: string; // "Ongoing", "Closed"
  marketImage: string;
  marketCategory?: string;
  // ... existing fields
}

// Update FlexType to include flex15
export type FlexType =
  | "flex9"
  | "flex10"
  | "flex11"
  | "flex12"
  | "flex13"
  | "flex14"
  | "flex15";
```

#### Step 1.2: Update Database Schema

**File:** `prisma/schema.prisma`

```prisma
model FlexSnapshot {
  // ... existing fields
  type String // Add "flex15" as valid type
}
```

No migration needed - `type` is already a string field.

#### Step 1.3: Create OG Image Generator for Flex 15

**File:** `src/app/(site)/api/og/flex/route.tsx`

```typescript
async function generateOngoingPositionCard(snapshot: FlexSnapshot) {
  // Similar to generateWhatIfCard but with:
  // 1. Label: "Current Value" instead of "You Could Win"
  // 2. Status indicator: "🟢 Ongoing Position"
  // 3. Always show positive green values
  // 4. Show total bet amount (not incremental)
  // ... implementation
}

export async function GET(request: NextRequest) {
  // ... existing code

  switch (snapshot.type) {
    case "flex10":
      return generateBetCard(snapshot);
    case "flex12":
      return generateWhatIfCard(snapshot);
    case "flex15": // NEW
      return generateOngoingPositionCard(snapshot);
    default:
      return generateProfileCard(snapshot);
  }
}
```

### Phase 2: Update Bet Update Flow

#### Step 2.1: Modify `flexCardGenerator.ts`

**File:** `src/app/(site)/market/trading-panel/utils/flexCardGenerator.ts`

```typescript
export async function generateFlexCard(params: FlexCardParams): Promise<{
  snapshotId: string;
  shareUrl: string;
  imageUrl: string;
  flexType: "flex10" | "flex12" | "flex15"; // Add flex15
}> {
  // ... existing code

  // NEW LOGIC: Use Flex 15 for update_bet
  let determinedFlexType: "flex10" | "flex12" | "flex15";

  if (type === "close_bet" && cashoutAmount !== null) {
    determinedFlexType = "flex10"; // Completed bet
  } else if (type === "update_bet") {
    determinedFlexType = "flex15"; // Ongoing position update
  } else if (type === "place_bet") {
    determinedFlexType = "flex12"; // New bet "What If"
  }

  // Calculate data based on flex type
  if (determinedFlexType === "flex15") {
    // Get TOTAL position value, not incremental
    betAmount = totalUsdcInvestment; // Total invested

    // Get current cashout value from contract
    const { data: estimateRedeemable } = await useReadContract({
      address: CASHOUT_HELPER_ADDRESS,
      functionName: "estimateRedeemableAmount",
      args: [market.contractAddress, noBalRaw * 1e18, yesBalRaw * 1e18],
    });

    const currentValue =
      (estimateRedeemable?.[0] ? Number(estimateRedeemable[0]) / 1e18 : 0) * 2;
    amountWon = currentValue; // Show current total value

    // Determine side from token balances
    side = yesBalRaw > noBalRaw ? "YES" : "NO";

    // Use current market belief
    belief = state.belief || marketProbability.yes; // Current market state
  }

  // ... rest of implementation
}
```

### Phase 3: Update Profile Position Sharing

#### Step 3.1: Modify Profile Belief Row

**File:** `src/app/(site)/profile/common/table-row/belief-row.tsx`

```typescript
const handleShareBet = async () => {
  // ... existing setup

  // Determine flex type based on position status
  const flexType = status === "resolved" ? "flex10" : "flex15"; // NEW

  // For ongoing positions (flex15), fetch fresh data
  if (flexType === "flex15") {
    // Get current token balances
    const { tokenABalance, tokenBBalance } = await fetchTokenBalances();

    // Get current cashout value
    const currentValue = await estimateRedeemableAmount(
      market.contractAddress,
      tokenABalance,
      tokenBBalance
    );

    betData = {
      question: market.question,
      amountWon: `+$${currentValue.toFixed(2)}`, // Current value (always positive)
      betAmount: `$${totalBetAmount.toFixed(2)}`, // Total invested
      side: winningSide,
      belief: `${marketProbability.yes}%`, // Current market belief
      status: "Ongoing", // NEW
      marketImage: market.imageSquare || market.image,
      // ... other fields
    };
  } else {
    // Keep existing Flex 10 logic for completed bets
    // ... existing code
  }

  const result = await createFlexSnapshot(flexType, betData);
  // ... rest of implementation
};
```

#### Step 3.2: Modify Mobile Belief Card

**File:** `src/app/(site)/profile/common/mobile-belief-card.tsx`

Apply same logic as Step 3.1 for mobile view.

---

## Data Calculation Details

### Total Bet Amount Calculation

For Flex 15, we need the **cumulative total** of all investments:

```typescript
// Get from UserPosition table
const totalBetAmount = userPosition.usdcInvestment; // Already tracked in DB

// OR calculate from position history
const totalBetAmount = positionHistory.reduce((sum, entry) => {
  return sum + entry.amount;
}, 0);
```

### Current Value Calculation

Use real-time contract call for accurate value:

```typescript
// Call CashoutHelper contract
const { data: estimateRedeemable } = await useReadContract({
  address: CASHOUT_HELPER_ADDRESS,
  abi: [
    parseAbiItem(
      "function estimateRedeemableAmount(address,uint256,uint256) returns (uint256,uint256,uint256,uint256)"
    ),
  ],
  functionName: "estimateRedeemableAmount",
  args: [
    market.contractAddress,
    BigInt(noBalRaw * 1e18),
    BigInt(yesBalRaw * 1e18),
  ],
});

// Calculate current value
const currentValue =
  (estimateRedeemable?.[0] ? Number(estimateRedeemable[0]) / 1e18 : 0) * 2;
```

### Side Determination

Determine which side they're positioned on:

```typescript
// Compare token balances
const side = yesTokenBalance > noTokenBalance ? "YES" : "NO";

// OR use the side with non-zero investment
const side = yesTokenBalance > 0 && noTokenBalance === 0 ? "YES" : "NO";
```

### Belief Calculation

Use **current market probability** (not original):

```typescript
// From trading panel state
const belief = state.belief;

// OR from market data
const belief = marketProbability.yes;

// Always show current market state for Flex 15
```

---

## Edge Cases & Considerations

### 1. Negative Current Value

**Issue:** Position currently worth less than invested  
**Solution:** Still show as positive with green color (represents current value, not profit/loss)

```typescript
// Always show current value (never negative)
const displayValue = Math.max(currentValue, 0);
amountWon = `+$${displayValue.toFixed(2)}`; // Always positive
```

### 2. Zero Token Balance

**Issue:** User has no tokens (shouldn't happen for ongoing position)  
**Solution:** Don't show flex button if no position exists

```typescript
// Check before showing flex button
const hasPosition = yesTokenBalance > 0 || noTokenBalance > 0;
if (!hasPosition) return null; // Don't show flex option
```

### 3. Resolved Markets

**Issue:** Position is technically "ongoing" but market is resolved  
**Solution:** Use Flex 10 (completed) for resolved markets

```typescript
const flexType = market.isResolved ? "flex10" : "flex15";
```

### 4. LP Positions Impact

**Issue:** User may have both bet position AND LP position  
**Current Approach:** LP positions are tracked separately, don't mix with bet positions

```typescript
// Only include bet position tokens, not LP tokens
const betYesBalance = userPosition.yesTokens;
const betNoBalance = userPosition.noTokens;
// Exclude LP position tokens from this calculation
```

### 5. Stale Data on Update

**Issue:** After updating bet, data might not be immediately fresh  
**Solution:** Fetch fresh data at time of flex card generation

```typescript
// For update_bet flow, refresh all data before generating flex
await refreshBalances(); // Get latest token balances
await refreshMarketData(); // Get latest market state
// Then generate flex with fresh data
```

### 6. Multiple Positions on Same Market

**Issue:** User has multiple separate positions  
**Current System:** We only track one position per user per market  
**No Change Needed:** System already handles this correctly

---

## Testing Strategy

### Unit Tests

1. **Flex Type Determination**

   - Test `place_bet` → returns `flex12`
   - Test `update_bet` → returns `flex15`
   - Test `close_bet` → returns `flex10`

2. **Data Calculation**

   - Test total bet amount includes all investments
   - Test current value calculation from contract
   - Test side determination from token balances
   - Test belief uses current market state

3. **Edge Cases**
   - Test with zero token balance
   - Test with resolved market
   - Test with negative current value
   - Test with missing data points

### Integration Tests

1. **Update Bet Flow**

   ```
   1. User has existing position
   2. User adds to position (update_bet)
   3. Flex button appears
   4. Click flex → generates Flex 15
   5. Verify shows total investment (not incremental)
   6. Verify shows current total value
   7. Verify shows "Ongoing Position" status
   ```

2. **Profile Sharing Flow**

   ```
   1. User has ongoing position visible in profile
   2. Click flex/share button
   3. Verify generates Flex 15 (not Flex 10)
   4. Verify shows fresh current value
   5. Verify shows correct total investment
   ```

3. **Completed Position Flow**
   ```
   1. User has cashed out position (status = resolved)
   2. View in profile
   3. Click share
   4. Verify generates Flex 10 (not Flex 15)
   5. Verify shows cashout result
   ```

### Visual Regression Tests

1. Compare Flex 15 rendering with Flex 10 and Flex 12
2. Verify "Current Value" label renders correctly
3. Verify "Ongoing Position" status indicator
4. Verify green color even for losing positions

### E2E Tests

Full user flow testing:

```
1. Place initial bet → Flex 12 generated
2. Update bet → Flex 15 generated
3. Share from profile → Flex 15 generated
4. Cash out → Flex 10 generated
5. Share cashed out position → Flex 10 generated
```

---

## Migration Path

### Phase 1: Backend Updates (1-2 days)

- [ ] Add `flex15` support to type definitions
- [ ] Create `generateOngoingPositionCard()` function
- [ ] Update routing logic in `/api/og/flex/route.tsx`
- [ ] Test OG image generation

### Phase 2: Trading Panel Updates (1-2 days)

- [ ] Update `flexCardGenerator.ts` to use Flex 15 for `update_bet`
- [ ] Fetch fresh position data before generating
- [ ] Calculate total investment correctly
- [ ] Calculate current value from contract
- [ ] Update tests

### Phase 3: Profile Updates (1-2 days)

- [ ] Update `belief-row.tsx` to use Flex 15 for ongoing positions
- [ ] Update `mobile-belief-card.tsx` similarly
- [ ] Add position status check (ongoing vs completed)
- [ ] Fetch fresh data at share time
- [ ] Update tests

### Phase 4: Testing & Refinement (1-2 days)

- [ ] Unit tests for all new logic
- [ ] Integration tests for flows
- [ ] Visual regression tests
- [ ] E2E testing
- [ ] Bug fixes and polish

### Phase 5: Deprecation (Optional, future)

- [ ] Remove or repurpose Flex 11 (LP Position - unused)
- [ ] Clean up old Flex 12 usage for updates
- [ ] Update documentation

**Total Estimated Time:** 5-8 days

---

## Success Criteria

✅ **Correct Card Types:**

- Place bet → Flex 12 ("What If")
- Update bet → Flex 15 ("Ongoing Position")
- Share ongoing from profile → Flex 15
- Cash out → Flex 10 ("Amount Won")
- Share completed from profile → Flex 10

✅ **Accurate Data:**

- Shows total invested amount (not incremental)
- Shows real-time current value
- Shows current market belief
- Always positive green values

✅ **Consistent UX:**

- Same card design for all ongoing position shares
- Clear "Ongoing Position" indicator
- Easy to understand current state

✅ **No Regressions:**

- Flex 10 (cashout) still works correctly
- Flex 12 (new bet) still works correctly
- Flex 9 (profile) unchanged
- All existing flows continue working

---

## Open Questions

1. **Should we show profit/loss in addition to current value?**

   - Current plan: No, just show current value (keep it simple)
   - Could add as secondary metric if desired

2. **Should we show a breakdown of investments?**

   - e.g., "Originally bet $10, added $5, added $3 → Total $18"
   - Current plan: No, just show total

3. **How to handle partial cashouts?**

   - User cashes out 50% of position
   - Remaining position is still "ongoing"
   - Current plan: Flex 15 shows remaining position value

4. **Should we store original belief for each add?**
   - Would enable showing "Your average belief: 65%"
   - Current plan: No, just show current market belief

---

## Summary

This plan creates a unified, consistent system for sharing ongoing bet positions:

| Current State                        | New State                              |
| ------------------------------------ | -------------------------------------- |
| ❌ Update bet → Flex 12 (confusing)  | ✅ Update bet → Flex 15 (clear)        |
| ❌ Profile ongoing → Flex 10 (wrong) | ✅ Profile ongoing → Flex 15 (correct) |
| ❌ Inconsistent data calculations    | ✅ Fresh, accurate, total values       |
| ❌ Negative values possible          | ✅ Always positive current value       |

**Benefits:**

- Clear distinction between "ongoing" and "completed" positions
- Consistent sharing experience across all touchpoints
- Accurate, real-time position values
- Better user understanding of their current position state
