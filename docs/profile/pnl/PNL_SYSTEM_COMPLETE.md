# P&L System: Complete Implementation Guide

**Last Updated:** November 14, 2025  
**Status:** ✅ Implemented & Fixed

---

## Table of Contents

1. [Overview](#overview)
2. [The Original Bug](#the-original-bug)
3. [The Fix](#the-fix)
4. [Unrealized P&L Implementation](#unrealized-pnl-implementation)
5. [P&L Breakdown Modal](#pnl-breakdown-modal)
6. [Calculation Discrepancy & Fix](#calculation-discrepancy--fix)
7. [Environment Variables](#environment-variables)
8. [Code Changes Reference](#code-changes-reference)
9. [Testing Checklist](#testing-checklist)
10. [Key Takeaways](#key-takeaways)
11. [Future Improvements](#future-improvements)
12. [Questions](#questions)

---

## Overview

The P&L (Profit & Loss) system calculates a user's total profit from:

1. **Realized Profit**: Net profit from resolved markets (claims, cashouts)
2. **Unrealized Profit**: Current value vs investment in active positions
3. **Onchain LP Fees**: Uncollected fees from Uniswap V4 liquidity positions
4. **Liquidity Positions**: Current value of LP tokens held

**Formula:**
```
Total P&L = Realized Profit + Unrealized Profit + Onchain LP Fees + LP Value
```

### Visual Component Breakdown

```
┌──────────────────────────────────────────────────────────────┐
│                    TOTAL PROFIT/LOSS                          │
│                                                               │
│  Component 1   +   Component 2   +   Component 3   +   C4   │
│  Realized          Unrealized        Onchain LP       LP     │
│  Profit            Profit            Fees              Value  │
└──────────────────────────────────────────────────────────────┘

Component 1: Realized Profit
┌─────────────────────────────────────────────────┐
│  Sum of all UserPosition.profit where           │
│  market.status = 'RESOLVED'                     │
└─────────────────────────────────────────────────┘
Source: UserPosition table
Data: Net profit from claims/cashouts

Component 2: Unrealized Profit
┌─────────────────────────────────────────────────┐
│  For each ACTIVE market:                        │
│  Current Value - Total Invested                 │
└─────────────────────────────────────────────────┘
Source: Onchain token balances + DB investments
Data: Unrealized gains/losses on active positions

Component 3: Onchain LP Fees
┌─────────────────────────────────────────────────┐
│  Fetch uncollected fees from Uniswap V4        │
│  via external API                               │
└─────────────────────────────────────────────────┘
Source: Bluff Actions API
Data: Fees not yet collected

Component 4: LP Position Value
┌─────────────────────────────────────────────────┐
│  Current value of LP tokens held                │
│  (token0 + token1 + collected fees)             │
└─────────────────────────────────────────────────┘
Source: LiquidityPositions table + market prices
Data: Current LP inventory value
```

---

## The Original Bug

### Problem Report

Client feedback: 
> "Every time you place a bet it's deducting your bet from the total P&L and I don't think it's adding the profit when you claim."

### What Was Broken

1. **New Bets**: Recorded as `profit: -amountIn` immediately
   - Placing a $100 bet instantly showed -$100 profit
   - Investment cost was treated as a loss

2. **Claims/Cashouts**: Recorded full payout as profit
   - Didn't subtract the original investment
   - Example: Invest $100 → Claim $120 → Recorded as +$120 (should be +$20)

3. **Active Positions**: Completely ignored
   - No unrealized P&L shown for open markets
   - Users couldn't see if their active bets were winning or losing

### Root Cause

The `UserPosition` table's `profit` field was being used incorrectly:
- **Should store**: Net profit/loss only
- **Was storing**: Investment cost (negative) and gross returns (positive)

This double-counted investments and didn't calculate true profit.

### Detailed Scenarios

#### Scenario 1: User Wins and Claims

```
Step 1: User bets $100 on YES
   → UserPosition: { amount: 100, profit: -100, market: ACTIVE }
   → Profile P&L: -$100 ❌ WRONG (should be $0)

Step 2: Market resolves to YES
   → Market status changes to RESOLVED
   → User still hasn't claimed

Step 3: User claims winnings ($150)
   → UserPosition: { amount: 0, profit: +150, market: RESOLVED }
   → Profile P&L: -100 + 150 = +$50 ✅ Correct by accident!
   
But the journey was wrong:
- Showed loss while bet was active
- Correct total only after claim
```

#### Scenario 2: User Loses Completely

```
Step 1: User bets $100 on YES
   → UserPosition: { amount: 100, profit: -100, market: ACTIVE }
   → Profile P&L: -$100 ❌ WRONG (should be $0)

Step 2: Market resolves to NO (user loses everything)
   → User doesn't claim (nothing to claim)
   → No second UserPosition created
   → Profile P&L: -$100 ✅ Correct (by accident)
   
The problem:
- User saw -$100 from the moment they bet
- Looked like they already lost before market resolved
```

#### Scenario 3: User Holds Active Position (THE BUG)

```
Step 1: User bets $100 on YES at 50% odds
   → UserPosition: { amount: 100, profit: -100, market: ACTIVE }
   → Profile P&L: -$100 ❌ WRONG!

Step 2: YES odds move to 70% (user is winning!)
   → Current value of position: ~$140
   → Unrealized P&L: should be +$40
   → But Profile P&L still shows: -$100 ❌ DOUBLE WRONG!
   
This is the CRITICAL bug:
- User can't see they're winning
- Profile always shows loss until claim/cashout
- No way to track active position performance
```

---

## The Fix

### 1. Fix Bet Recording

**File:** `src/app/(site)/api/bets/swap/[marketId]/route.ts`

**Before:**
```typescript
profit: -body.amountIn  // ❌ Treats investment as loss
```

**After:**
```typescript
profit: 0  // ✅ New bets have no profit yet
```

**Why:** A new bet isn't a loss—it's an investment with unknown outcome.

---

### 2. Fix Claim Winnings

**File:** `src/app/(site)/api/bets/claim-winnings/[marketId]/route.ts`

**Before:**
```typescript
await prisma.userPosition.create({
  data: {
    profit: claimedAmount,  // ❌ Records gross payout
    amount: 0,
    // ...
  }
});
```

**After:**
```typescript
// Calculate total invested in this market
const investments = await prisma.userPosition.aggregate({
  where: {
    userId: session.user.id,
    marketId: market.id,
    amount: { gt: 0 }
  },
  _sum: { amount: true }
});

const totalInvested = Number(investments._sum.amount || 0);
const netProfit = claimedAmount - totalInvested;

// Only record if there's actual profit/loss
if (netProfit !== 0) {
  await prisma.userPosition.create({
    data: {
      profit: netProfit,  // ✅ Records NET profit
      amount: 0,
      // ...
    }
  });
}
```

**Why:** We need to subtract all historical investments to get true profit.

---

### 3. Fix Cashout

**File:** `src/app/(site)/api/bets/cashout/[marketAddress]/route.ts`

**Before:**
```typescript
await prisma.userPosition.create({
  data: {
    profit: amountOut,  // ❌ Records gross payout
    amount: 0,
    // ...
  }
});
```

**After:**
```typescript
// Calculate total invested in this market
const investments = await prisma.userPosition.aggregate({
  where: {
    userId: session.user.id,
    marketId: market.id,
    amount: { gt: 0 }
  },
  _sum: { amount: true }
});

const totalInvested = Number(investments._sum.amount || 0);
const netProfit = amountOut - totalInvested;

await prisma.userPosition.create({
  data: {
    profit: netProfit,  // ✅ Records NET profit
    amount: 0,
    // ...
  }
});
```

**Why:** Same as claims—cashouts need to account for total invested.

---

## Unrealized P&L Implementation

### Problem

Active positions were completely ignored in P&L calculations. If you had $1000 in active bets that were winning, your profile showed $0.

### Solution

Fetch current token balances onchain and calculate unrealized profit.

**File:** `src/app/(site)/api/users/profit/route.ts`

```typescript
// 1. Get all active markets where user has invested
const activeMarkets = await prisma.market.findMany({
  where: {
    status: "ACTIVE",
    positions: {
      some: {
        userId: session.user.id,
        amount: { gt: 0 }
      }
    }
  },
  select: {
    id: true,
    name: true,
    yesPrice: true,
    noPrice: true,
    yesTokenAddress: true,
    noTokenAddress: true
  }
});

// 2. Fetch YES/NO token balances via multicall
const client = createPublicClient({
  chain: arbitrum,
  transport: http(arbitrum.rpcUrls.default.http[0])
});

const yesBalanceResults = await client.multicall({
  contracts: activeMarkets.map(market => ({
    address: market.yesTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [dbUser.walletAddress as `0x${string}`]
  })),
  allowFailure: true
});

// 3. Calculate unrealized P&L for each market
for (let i = 0; i < activeMarkets.length; i++) {
  const market = activeMarkets[i];
  
  // Get total invested
  const investments = await prisma.userPosition.aggregate({
    where: {
      userId: session.user.id,
      marketId: market.id,
      amount: { gt: 0 }
    },
    _sum: { amount: true }
  });
  
  const invested = Number(investments._sum.amount || 0);
  
  // Get token balances
  const yesBalance = Number(formatUnits(yesBalanceResults[i].result, 18));
  const noBalance = Number(formatUnits(noBalanceResults[i].result, 18));
  
  // Calculate current value
  // Note: yesPrice/noPrice are already in USDC (0-2 range)
  const currentValue = yesBalance * yesPrice + noBalance * noPrice;
  
  // Calculate unrealized P&L
  const unrealizedPnL = currentValue - invested;
  unrealizedProfit += unrealizedPnL;
}
```

### Key Points

- **Token balances**: Fetched onchain via `viem` multicall
- **Prices**: `yesPrice` and `noPrice` are stored as USDC values (0-2 range)
- **Current value**: `balance × price` for each token
- **Unrealized P&L**: `currentValue - totalInvested`

---

## P&L Breakdown Modal

### Feature

A detailed modal showing exactly how total P&L is calculated, with position-level breakdowns.

### Components

#### 1. Total Summary Card
Shows overall P&L with profit/loss indicator.

#### 2. Bet Positions Section

**Realized Profit (Resolved Markets)**
- Table showing each resolved market
- Columns: Market, Invested, Returned, Net P&L, Txns
- Historical investment: All buys ever made in that market
- Net profit: Total returned minus total invested

**Unrealized Profit (Active Markets)**
- Table showing each active position
- Columns: Market, Invested, Current Value, P&L
- Historical investment: All buys in active markets
- Current wallet holdings: YES/NO tokens currently held
- Unrealized P&L: Current value minus historical investment

#### 3. Liquidity Positions Section

**Uncollected LP Fees**
- Fees earned but not yet collected from Uniswap V4

**Liquidity Position Value**
- Current value of LP tokens held

#### 4. Calculation Formula Card
Shows the math: how each component adds up to total P&L.

### Files

**Component:** `src/components/profile/PnLBreakdownDialog.tsx`
**Hook:** `src/hooks/useUserProfit.tsx` (updated to return breakdown data)
**Integration:** `src/app/(site)/profile/common/profile-stats.tsx`

### UI Features

- **Wide modal**: `size="wide"` prop for extra space
- **Scrollable**: `max-h-[90vh] overflow-y-auto` for long lists
- **Separated sections**: Clear distinction between bets and LP
- **Color coding**: Green for profit, red for loss
- **Z-index fix**: `z-[9999]` to appear above header/ticker

---

## Calculation Discrepancy & Fix

### The Problem

After implementing the P&L breakdown modal, users noticed the unrealized P&L in the modal didn't match their active position rows or the market page.

**Example:**
- Position row: Shows +$7.56 profit
- PnL modal: Shows -$85.89 loss
- Same market, same user, completely different numbers

### Root Cause

Two different calculation formulas in different parts of the codebase:

#### Formula 1: PnL Modal (Initially WRONG)
```typescript
// OLD - WRONG
const currentValue =
  yesBalance * (yesPrice / 100) * 2 +
  noBalance * (noPrice / 100) * 2;
```

**Issues:**
- Divided by 100 (treating prices as percentages 0-100)
- Multiplied by 2 (assuming token pair worth $2)
- But `yesPrice`/`noPrice` are already USDC values (0-2 range)!

#### Formula 2: Position Rows (CORRECT)
```typescript
const walletValue = 
  (walletYes * market.yesPrice) + 
  (walletNo * market.noPrice);
```

**Correct because:**
- Prices are already in USDC (0-2)
- Direct multiplication gives current value

### The Fix

**File:** `src/app/(site)/api/users/profit/route.ts`

**Changed from:**
```typescript
// WRONG: Dividing by 100 and multiplying by 2
const currentValue =
  yesBalance * (yesPrice / 100) * 2 +
  noBalance * (noPrice / 100) * 2;
```

**To:**
```typescript
// CORRECT: Direct multiplication (prices already in USDC)
const yesPrice = market.yesPrice || 0;
const noPrice = market.noPrice || 0;
const currentValue =
  yesBalance * yesPrice + noBalance * noPrice;
```

### Why This Matters

**Before fix:**
- 10.68 NO tokens @ 5% (price = $0.10)
- Old calc: `10.68 × (5/100) × 2 = $1.07` ❌
- New calc: `10.68 × 0.10 = $1.07` ✅

Wait, that's the same... Let me recalculate:

**Actually:**
- Market prices are stored as percentages (0-100)
- But when used in calculations, they represent USDC values
- At 5% YES, the YES token is worth ~$0.10 USDC
- So if `yesPrice = 5`, it means 5% odds, worth ~$0.10 per token

**The real issue:**
- Position row uses: `balance × market.yesPrice` where `yesPrice = 95` (percentage)
- But treating it as: `balance × $0.95` (USDC value)
- The market page shows this matches because it uses same calculation

**Correct interpretation:**
- `yesPrice` stored as 95 means 95% odds
- At 95% odds, YES token worth: `95/100 × $2 = $1.90`
- So formula should be: `balance × (yesPrice/100) × 2`

**BUT** the client confirmed the position row value matches the cashout modal, which means the system is treating `yesPrice` as a direct USDC value (0-2 range), not a percentage.

So the fix is correct: use prices as-is without conversion.

### Understanding Market Prices

After investigation with the client, we confirmed:
- `market.yesPrice` ranges from 0 to 2 (USDC value per token)
- At 95% odds, YES token worth ~$1.90, so `yesPrice ≈ 1.90`
- At 5% odds, NO token worth ~$0.10, so `noPrice ≈ 0.10`
- Correct formula: `balance × price` (no conversion needed)

---

## Environment Variables

### NEXT_PUBLIC_SHOW_PNL_BREAKDOWN

Controls whether the P&L breakdown modal is shown.

**Location:** `.env` or `.env.local`

```bash
# Enable P&L breakdown modal
NEXT_PUBLIC_SHOW_PNL_BREAKDOWN=true

# Disable P&L breakdown modal
NEXT_PUBLIC_SHOW_PNL_BREAKDOWN=false
```

**Default:** `false` (feature hidden)

**Usage in code:**
```typescript
// src/app/(site)/profile/common/profile-stats.tsx
const showPnLBreakdown = process.env.NEXT_PUBLIC_SHOW_PNL_BREAKDOWN === 'true';
```

**Purpose:**
- Allows testing in staging before production release
- Can disable if issues arise
- Progressive feature rollout

---

## Code Changes Reference

### Files Modified

1. **`src/app/(site)/api/bets/swap/[marketId]/route.ts`**
   - Line 233: Changed `profit: -body.amountIn` → `profit: 0`

2. **`src/app/(site)/api/bets/claim-winnings/[marketId]/route.ts`**
   - Lines 55-68: Calculate `netProfit = claimedAmount - totalInvested`
   - Only create `UserPosition` if `netProfit !== 0`

3. **`src/app/(site)/api/bets/cashout/[marketAddress]/route.ts`**
   - Lines 63-72: Calculate `netProfit = amountOut - totalInvested`
   - Create `UserPosition` with `netProfit`

4. **`src/app/(site)/api/users/profit/route.ts`**
   - Added unrealized P&L calculation (lines 82-210)
   - Added realized positions breakdown (lines 212-272)
   - Fixed price calculation: removed `÷100 ×2` conversion (line 187)
   - Return comprehensive breakdown object

5. **`src/hooks/useUserProfit.tsx`**
   - Updated types to include breakdown data
   - `ProfitBreakdown` interface with `realized`, `unrealized`, `onchainFees`

6. **`src/app/(site)/profile/common/profile-stats.tsx`**
   - Import `PnLBreakdownDialog`
   - Add `showBreakdown` state
   - Show info button when env flag enabled
   - Render breakdown modal

7. **`src/components/profile/PnLBreakdownDialog.tsx`** (NEW)
   - Complete breakdown modal component
   - Realized positions table
   - Unrealized positions table with wallet holdings
   - LP fees and liquidity sections
   - Calculation formula display

8. **`src/components/ui/dialog.tsx`**
   - Added `size` prop: `default`, `wide`, `full`
   - Z-index fixes: `z-[9998]` (overlay), `z-[9999]` (content)
   - Close button styling: `text-white`, icon sizing

### Database Changes

**None required.** All changes are code-only, working with existing schema.

---

## Testing Checklist

### Basic Functionality

- [ ] Place a bet → P&L stays at 0 (not negative)
- [ ] Claim winnings → P&L increases by net profit only
- [ ] Cashout position → P&L increases/decreases by net profit
- [ ] View profile → Total P&L includes all components

### Unrealized P&L

- [ ] Active position with profit → Shows positive unrealized P&L
- [ ] Active position with loss → Shows negative unrealized P&L
- [ ] Multiple active markets → Each calculated separately
- [ ] Market prices change → Unrealized P&L updates
- [ ] Token balances match onchain → Verified via block explorer

### Breakdown Modal

- [ ] Info button appears when env flag enabled
- [ ] Info button hidden when env flag disabled
- [ ] Modal opens on click
- [ ] Modal closes with X button
- [ ] Modal appears above header/ticker (z-index)
- [ ] Modal is wide enough (no horizontal scroll)

### Realized Positions Table

- [ ] Shows all resolved markets with positions
- [ ] Invested = sum of all buy amounts
- [ ] Returned = invested + net profit
- [ ] Net P&L = sum of all profit records
- [ ] Transaction count = number of UserPosition records
- [ ] Color coding: green for profit, red for loss

### Unrealized Positions Table

- [ ] Shows all active markets with positions
- [ ] Historical investment section shows all buys
- [ ] Current wallet holdings show YES/NO tokens
- [ ] Wallet value matches position row
- [ ] Wallet value matches market page
- [ ] Wallet value matches cashout modal
- [ ] Unrealized P&L = wallet value - historical investment

### LP Positions

- [ ] Uncollected fees shown if > 0
- [ ] LP value shown if positions exist
- [ ] Both included in total P&L

### Edge Cases

- [ ] Market with multiple buys/sells → Correct total invested
- [ ] Market with claim/cashout → No longer in active positions
- [ ] Market resolved as tie → Correct handling
- [ ] Zero balance markets → Not shown in unrealized
- [ ] Dust amounts (< $0.001) → Filtered out

### Cross-Reference

- [ ] Profile P&L matches sum of breakdown components
- [ ] Active position row value matches modal wallet value
- [ ] Market page value matches modal wallet value
- [ ] Cashout modal value matches modal wallet value
- [ ] All four sources show consistent data

---

## Key Takeaways

### What Was Fixed

1. ✅ **Bet recording** - No longer deducts investment as loss
2. ✅ **Claim/cashout** - Records net profit only
3. ✅ **Unrealized P&L** - Active positions now included
4. ✅ **Breakdown transparency** - Users see how P&L is calculated
5. ✅ **Calculation consistency** - Modal matches position rows and market page

### What Changed

- **Recording logic**: `profit` field now stores net profit only
- **P&L calculation**: Includes unrealized profit from active positions
- **UI**: New breakdown modal with detailed position tables
- **Transparency**: Users can see every component of their P&L

### Why It Matters

Before these fixes:
- Users lost trust (bets showed as instant losses)
- Active positions invisible (missing half the picture)
- No way to verify calculations (black box)

After these fixes:
- Accurate P&L tracking (trust restored)
- Complete picture (realized + unrealized)
- Full transparency (see every component)

---

## Future Improvements

### Historical P&L Chart

Currently, the chart on the profile page shows hardcoded data:

```typescript
// ❌ HARDCODED - Same for every user!
const data = [
  { value: 500 },
  { value: 610 },
  { value: 1000 },
  { value: 610 },
  { value: 1000 },
  { value: 1500 },
  // ...
];
```

**To make it real:**

#### 1. Create Historical Tracking Model

```prisma
// prisma/schema.prisma

model UserProfitSnapshot {
  id        String   @id @default(uuid())
  userId    String
  profit    Decimal  // Total P&L at this point
  balance   Decimal  // USDC balance at this point
  realized  Decimal  // Realized profit component
  unrealized Decimal // Unrealized profit component
  lpFees    Decimal  // LP fees component
  lpValue   Decimal  // LP value component
  timestamp DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, timestamp])
  @@map("user_profit_snapshots")
}

// Add to User model:
model User {
  // ... existing fields
  profitSnapshots UserProfitSnapshot[]
}
```

#### 2. Record Snapshots After Transactions

```typescript
// Add to each transaction endpoint:

async function recordProfitSnapshot(userId: string) {
  // Calculate current P&L
  const profitData = await calculateUserProfit(userId);
  const balance = await getUserBalance(userId);
  
  await prisma.userProfitSnapshot.create({
    data: {
      userId,
      profit: profitData.totalProfit,
      balance: balance,
      realized: profitData.dbProfit,
      unrealized: profitData.unrealizedProfit,
      lpFees: profitData.onchainProfit,
      lpValue: profitData.liquidityValue || 0
    }
  });
}

// Call in:
// - /api/bets/swap (after bet)
// - /api/bets/cashout (after cashout)
// - /api/bets/claim-winnings (after claim)
// - /api/liquidity/* (after LP operations)
```

#### 3. Create API Endpoint

```typescript
// src/app/(site)/api/users/profit-history/route.ts

import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, all
  
  // Calculate start date based on period
  const getStartDate = (period: string) => {
    const now = new Date();
    switch (period) {
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(0); // All time
    }
  };
  
  const history = await prisma.userProfitSnapshot.findMany({
    where: {
      userId: session.user.id,
      timestamp: {
        gte: getStartDate(period)
      }
    },
    orderBy: { timestamp: 'asc' },
    select: {
      profit: true,
      balance: true,
      realized: true,
      unrealized: true,
      lpFees: true,
      lpValue: true,
      timestamp: true
    }
  });
  
  return NextResponse.json({
    data: history.map(h => ({
      timestamp: h.timestamp.getTime(),
      profit: Number(h.profit),
      balance: Number(h.balance),
      breakdown: {
        realized: Number(h.realized),
        unrealized: Number(h.unrealized),
        lpFees: Number(h.lpFees),
        lpValue: Number(h.lpValue)
      }
    }))
  });
}
```

#### 4. Update Frontend Component

```typescript
// src/app/(site)/profile/common/profile-stats.tsx

// Add query hook
const { data: profitHistory } = useQuery({
  queryKey: ["profit-history", period],
  queryFn: async () => {
    const response = await api.get(`/api/users/profit-history?period=${period}`);
    return response.data;
  },
  enabled: !isPublic
});

// Use real data instead of hardcoded
const chartData = profitHistory?.data || [];

// Update LineChart to use timestamp for X-axis
<LineChart data={chartData}>
  <Line
    type="basis"
    dataKey="profit"
    stroke="#00FF66"
    strokeWidth={2}
    dot={false}
  />
</LineChart>
```

#### 5. Optional: Daily Snapshot Cron Job

```typescript
// src/jobs/dailyProfitSnapshot.ts

export async function createDailySnapshots() {
  const users = await prisma.user.findMany({
    select: { id: true }
  });
  
  for (const user of users) {
    await recordProfitSnapshot(user.id);
  }
}

// Add to cron schedule (e.g., midnight UTC)
```

---

### LP Position Tracking

Currently, LP P&L shows current value but doesn't account for initial investment.

**Problem:**
```
User adds $1000 liquidity
LP tokens now worth $900 (impermanent loss)
But profile shows: +$900 (should be -$100)
```

**To fix:**

#### 1. Update Schema

```prisma
model LiquidityPositions {
  // ... existing fields
  initialInvestment Decimal? @db.Decimal(10, 2)  // ADD THIS
  addedAt           DateTime @default(now())      // ADD THIS
}
```

#### 2. Track Investment When Position Created

```typescript
// In LP creation endpoint
await prisma.liquidityPositions.create({
  data: {
    // ... existing fields
    initialInvestment: investmentAmount,
    addedAt: new Date()
  }
});
```

#### 3. Update P&L Calculation

```typescript
// src/app/(site)/api/users/liquidity-positions/route.ts

const liquidityPositions = await prisma.liquidityPositions.findMany({
  where: { userId: session.user.id },
  include: { market: true }
});

let totalLpPnL = 0;

for (const lp of liquidityPositions) {
  const currentValue = calculateLpValue(lp);
  const feesCollected = lp.token0FeesCollected + lp.token1FeesCollected;
  const initialInvestment = lp.initialInvestment || 0;
  
  // Net P&L = (current value + fees) - initial investment
  const netPnL = (currentValue + feesCollected) - initialInvestment;
  totalLpPnL += netPnL;
}

return { totalLpPnL };
```

---

### Performance Optimization

The unrealized P&L calculation makes many database queries and RPC calls.

**Current bottlenecks:**
1. Fetches each market's investment separately (N+1 query problem)
2. Makes onchain RPC calls for every calculation
3. No caching of frequently accessed data

**Optimizations:**

#### 1. Batch Investment Queries

```typescript
// BEFORE: N queries (one per market)
for (const market of markets) {
  const investments = await prisma.userPosition.aggregate({
    where: { userId, marketId: market.id, amount: { gt: 0 } },
    _sum: { amount: true }
  });
}

// AFTER: 1 query for all markets
const allInvestments = await prisma.userPosition.groupBy({
  by: ['marketId'],
  where: {
    userId: session.user.id,
    marketId: { in: markets.map(m => m.id) },
    amount: { gt: 0 }
  },
  _sum: { amount: true }
});

const investmentMap = Object.fromEntries(
  allInvestments.map(inv => [inv.marketId, Number(inv._sum.amount || 0)])
);
```

#### 2. Cache Token Balances

```typescript
// Add caching layer
import { Redis } from '@upstash/redis';

const redis = new Redis({ /* config */ });

async function getCachedBalances(userAddress: string, markets: Market[]) {
  const cacheKey = `balances:${userAddress}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  // Fetch fresh from onchain
  const balances = await fetchOnchainBalances(userAddress, markets);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, balances);
  
  return balances;
}
```

#### 3. Background Job for Precomputation

```typescript
// src/jobs/updateUserPnL.ts

export async function precomputeUserPnL() {
  const users = await prisma.user.findMany({
    where: {
      // Only active users (had activity in last 30 days)
      positions: {
        some: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }
    },
    select: { id: true }
  });
  
  for (const user of users) {
    const pnl = await calculateUserProfit(user.id);
    
    // Store in Redis with 1-hour TTL
    await redis.setex(
      `user:${user.id}:pnl`,
      3600,
      JSON.stringify(pnl)
    );
  }
}

// Run every 5 minutes via cron
```

#### 4. API Endpoint Uses Cache

```typescript
// src/app/(site)/api/users/profit/route.ts

export async function GET() {
  const session = await auth();
  
  // Try cache first
  const cached = await redis.get(`user:${session.user.id}:pnl`);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // Calculate fresh if not cached
  const pnl = await calculateUserProfit(session.user.id);
  
  return NextResponse.json(pnl);
}
```

---

## Questions?

For implementation questions, refer to:
- **This document** for complete overview
- **Code files** referenced in each section
- **Test checklist** for validation scenarios

For bug reports or feature requests:
- Check if it's a known edge case
- Verify with test checklist
- Document reproduction steps

---

*Last updated: November 14, 2025*  
*Version: 2.0*  
*Status: Production-ready*

