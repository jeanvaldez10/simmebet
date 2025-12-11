# Flex Card Generation System Documentation

> **Last Updated:** January 27, 2025  
> **Recent Changes:**
>
> - ✅ **Added dev environment flex type indicator** - FlexModal now shows flex card type (FLEX10, FLEX12, etc.) badge in development mode for easier debugging
> - ✅ **All flex cards now use square images** - Prefer `imageSquare` over regular `image` with fallback chain
> - ✅ **Changed ALL flex cards to show total payout** - Both Flex 10 (cashout) and Flex 12 (what if) now display total payout instead of net profit, ensuring values are always positive/green
> - ✅ **Fixed belief display for cashouts** - Hidden for Flex 10 (cashout) cards since original belief not stored in database
> - ✅ Made belief optional - Only shown for new bets (Flex 12), removed "50%" fallback
> - ✅ Conditional UI rendering - Belief column only shows when valid data available

---

## Quick Reference: All Flex Card Types

| Card Type   | Name               | State/Trigger                 | Purpose                                 | Active    |
| ----------- | ------------------ | ----------------------------- | --------------------------------------- | --------- |
| **Flex 9**  | Profile Stats Card | User clicks flex on profile   | Display overall trading performance     | ✅        |
| **Flex 10** | Completed Bet Card | After closing/cashing out bet | Show results of completed bet           | ✅        |
| **Flex 12** | "What If" Card     | After placing new bet         | Show potential outcomes for ongoing bet | ✅        |
| **Flex 12** | "What If" Card     | After updating existing bet   | Show updated potential outcomes         | ✅        |
| **Flex 11** | LP Position Card   | Not implemented               | Liquidity provider position             | ❌ Unused |
| **Flex 13** | Short Options Card | From options page             | Display short options position          | 🔮 Future |
| **Flex 14** | Long Options Card  | From options page             | Display long options position           | 🔮 Future |

### Card States Explained

**Flex 12 (What If Card)** appears in two contexts:

- **Place Bet State**: Shows potential winnings for a newly placed bet
- **Update Bet State**: Shows updated potential winnings after adding to an existing position

Both use the same card design but calculate amounts differently based on whether it's a new bet or an update to existing position.

---

## Table of Contents

- [Overview](#overview)
- [Flex Card Types](#flex-card-types)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Data Calculation Details](#data-calculation-details)
- [Implementation Files](#implementation-files)
- [Known Limitations and Issues](#known-limitations-and-issues)
- [Recommendations](#recommendations)
- [Development Features](#development-features)
- [Future Implementation](#future-implementation)

---

## Overview

The Flex Card system allows users to generate shareable social media cards showcasing their trading activities, bets, and profile statistics. These cards are dynamically generated images that can be shared on Twitter/X and other platforms.

**Purpose:**

- Social proof and community engagement
- Share betting outcomes and predictions
- Display user trading statistics
- Increase platform visibility through viral sharing

**Technology Stack:**

- Next.js ImageResponse API (for server-side OG image generation)
- Prisma ORM (database storage)
- React components (client-side rendering - legacy)
- Google Fonts (Geist font family)

---

## Flex Card Types

The system currently supports **6 different flex card types**, though only **4 are actively used**:

### **Active Card Types**

#### **Flex 9 - Profile Stats Card**

- **Purpose:** Display user's overall trading performance
- **Triggered From:** Profile page stats section
- **Data Displayed:**
  - ~~Level: Hardcoded as "1"~~ (Commented out as of Jan 2025)
  - ~~Tier: Hardcoded as "BETA"~~ (Commented out as of Jan 2025)
  - ~~Win Ratio: Hardcoded as "65%"~~ (Commented out as of Jan 2025)
  - Lifetime PNL (Profit/Loss): Calculated from user positions + liquidity positions
  - Volume Traded: Sum of all position amounts
  - Username and avatar

#### **Flex 10 - Completed Bet Card**

- **Purpose:** Show results of a closed/completed bet
- **Triggered From:** Market trading panel after closing a bet (cash out)
- **Data Displayed:**
  - Market category (e.g., "SPORTS")
  - Market question (truncated to 100 chars)
  - Amount Won (**total cashout amount**, not profit - always positive/green)
  - Bet Amount (initial investment)
  - Side (YES/NO)
  - ~~Belief percentage~~ (Hidden for cashouts - original belief not stored)
  - Market image
  - Username and avatar

#### **Flex 12 - "What If" Card (Ongoing Bet)**

- **Purpose:** Show potential outcomes for an active bet
- **Triggered From:** Market trading panel after placing or updating a bet
- **Data Displayed:**
  - Market category (e.g., "SPORTS")
  - Market question (truncated to 100 chars)
  - "You Could Win" amount (**total payout**, not profit - always positive/green)
  - Bet Amount (total investment)
  - Side (YES/NO)
  - Belief percentage (from trading panel state, hidden if unavailable)
  - Potential Win/Loss amounts
  - Market image
  - Username and avatar

### **Future Implementation**

#### **Flex 13 & 14 - Options Cards**

- **Purpose:** Display exercised options positions
- **Triggered From:** Options page (exercise-card and listed-card components)
- **Flex 13:** Short options positions (red theme)
- **Flex 14:** Long options positions (green theme)
- **Status:** ⚠️ Currently triggers but uses generic profile data - needs options-specific implementation
- **Intended Data Display:**
  - Position type (Long/Short)
  - Token name (e.g., "ETHEREUM")
  - Profit exercised
  - Amount staked
  - Number of options
  - Strike price
  - Expiration date
  - Username and avatar

### **Legacy/Unused Card Types**

#### **Flex 11 - LP Position Card**

- **Status:** Component exists but not actively triggered
- **Intended Purpose:** Liquidity Provider position details
- **Data:** Staked amount, belief, time staked

---

## System Architecture

### **Three-Layer Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    1. USER INTERACTION                       │
│  (Flex Button Click on Profile, Market, or Options Page)    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 2. SNAPSHOT CREATION                         │
│         POST /api/flex/snapshot                              │
│  • Collects user data (balance, profit, volume)             │
│  • Collects bet/market data (if applicable)                 │
│  • Stores snapshot in FlexSnapshot database table           │
│  • Returns snapshotId + shareUrl                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              3. OG IMAGE GENERATION                          │
│         GET /api/og/flex?snapshotId={id}                     │
│  • Fetches snapshot data from database                      │
│  • Routes to appropriate generator:                         │
│    - flex10 → generateBetCard()                             │
│    - flex12 → generateWhatIfCard()                          │
│    - others → generateProfileCard()                         │
│  • Loads Google Fonts (Geist 600, 800, 900)                │
│  • Renders ImageResponse (1500x750px)                       │
│  • Caches for 1 hour (Cache-Control header)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  4. SHARING FLOW                             │
│  • FlexModal displays preview of generated image            │
│  • User clicks "Share on X"                                 │
│  • Opens Twitter intent with share page URL:                │
│    /share/flex/{snapshotId}                                 │
│  • Share page displays the OG image with metadata           │
│  • Twitter scraper fetches OG tags for card preview         │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### **Profile Flex Card (Flex 9)**

**Trigger:** User clicks flex button on profile stats card

**Flow:**

1. `ProfileStats` component (`src/app/(site)/profile/common/profile-stats.tsx`)
2. Calls `handleShareProfile()` which:
   - Fetches current user data:
     - `profit`: from `useUserProfit()` hook + liquidity PnL
     - `volumeTraded`: from `useUserVolumeTraded()` hook
     - `balance`: from component props
   - Calls `createFlexSnapshot("flex9", undefined, profileData)`
3. API route creates snapshot with user stats
4. Returns OG image URL: `/api/og/flex?snapshotId={id}`
5. Modal displays image
6. User can share to Twitter/X

**Data Sources:**

- User balance: `UserBalance.balance` table
- Profit/Loss: `SUM(UserPosition.profit) + SUM(LiquidityPositions.pnl)`
- Volume: `SUM(UserPosition.amount)`

---

### **Bet Flex Cards (Flex 10 & 12)**

**Trigger:** User completes bet action in market trading panel

**Flow:**

1. `UnifiedModal` component (`src/app/(site)/market/trading-panel/components/UnifiedModal.tsx`)
2. User clicks "Flex" button in success modal
3. `handleFlexClick()` determines card type:
   - If `type === 'close_bet'` → Flex 10 (completed bet)
   - If `type === 'place_bet' || 'update_bet'` → Flex 12 (ongoing bet)
4. Calculates bet data based on modal type
5. Calls `createFlexSnapshot(determinedFlexType, betData)`
6. API creates snapshot with bet details
7. Returns OG image URL
8. Modal displays image for sharing

---

## Cashout Modal & Flex 10 Card Generation

### **Complete Walkthrough: From Cashout to Flex Card**

This section documents the entire flow of cashing out a bet and generating a Flex 10 (Completed Bet) card, including all mathematical calculations.

---

### **Phase 1: Pre-Cashout State**

**User Has Active Position:**

```
Example Position:
- YES tokens: 1.5 tokens
- NO tokens: 1.5 tokens
- Original Investment: $3.00 USDC
- Market: "Will BTC hit $100k?"
- Side: YES (user bet on YES)
- Belief: 80%
```

**Key Data Available:**

- `totalUsdcInvestment`: User's total USDC invested in this market (from DB)
- `yesBalRaw`: User's YES token balance (from blockchain)
- `noBalRaw`: User's NO token balance (from blockchain)
- `burnAmount`: `Math.min(yesBalRaw, noBalRaw)` - tokens that will be burned for cashout
- `estimateRedeemableAmount`: Contract call to get accurate cashout value

**Location:** `UnifiedModal.tsx:100-122`

```javascript
// Get user's total USDC investment from database
const { data: usdcInvestment } = useMarketUsdcInvestment(market.id);
const totalUsdcInvestment = Number(usdcInvestment) || 0;

// Get token balances from cashout info hook
const yesBalRaw = cashoutInfo ? cashoutInfo.yesAmountRaw : 0;
const noBalRaw = cashoutInfo ? cashoutInfo.noAmountRaw : 0;

// Calculate burn amount (minimum of both token balances)
const burnAmount = Math.max(Math.min(yesBalRaw || 0, noBalRaw || 0), 0);

// Get accurate redeemable amount from CashoutHelper contract
const { data: estimateRedeemableAmount } = useReadContract({
  address: CASHOUT_HELPER_ADDRESS,
  functionName: "estimateRedeemableAmount",
  args: [marketAddress, BigInt(noBalRaw * 1e18), BigInt(yesBalRaw * 1e18)],
});

// Calculate display amount
const redeemableAmount =
  (estimateRedeemableAmount?.[0]
    ? Number(estimateRedeemableAmount?.[0]) / 1e18
    : 0) * 2;
```

**What User Sees:**

```
Cashout Modal:
┌─────────────────────────────┐
│ Market Image                │
│ "Will BTC hit $100k?"       │
│                             │
│ Current Holdings:           │
│   YES: 1.5 tokens           │
│   NO:  1.5 tokens           │
│                             │
│ You'll Receive:             │
│   $3.20 USDC               │
│                             │
│   [Confirm Cashout]         │
└─────────────────────────────┘
```

---

### **Phase 2: Cashout Transaction**

**User Clicks "Confirm Cashout"**

**Location:** `UnifiedModal.tsx:212-233`

```javascript
else if (type === 'close_bet') {
  // STEP 1: Capture the original bet amount BEFORE cashout
  // This is critical because after cashout, totalUsdcInvestment becomes 0
  const tokenBasedBetAmount = burnAmount * 2;
  const capturedBetAmount = Math.max(totalUsdcInvestment, tokenBasedBetAmount);
  setPreCashoutBetAmount(capturedBetAmount);

  // STEP 2: Execute the cashout transaction
  const amountToSell = String(burnAmount || 0);
  const cashoutResponse = await handleCloseBetConfirm(state.selectedOption, amountToSell);

  // STEP 3: Capture the actual cashout amount from response
  if (cashoutResponse?.txHash) {
    dispatch({ type: 'SET_TX_HASH', payload: cashoutResponse.txHash });
  }
  if (cashoutResponse?.amountOut) {
    setCashoutAmount(parseFloat(cashoutResponse.amountOut));
  }

  // STEP 4: Refresh balances to update UI
  await cashoutInfo?.refreshBalances();
}
```

**Why We Capture `preCashoutBetAmount`:**

- After cashing out, `totalUsdcInvestment` becomes 0 (position closed in DB)
- We need the original bet amount to calculate profit/loss
- We capture it BEFORE the transaction to ensure accuracy

**Calculation:**

```javascript
// Method 1: Token-based calculation
tokenBasedBetAmount = burnAmount * 2
                    = 1.5 * 2
                    = $3.00

// Method 2: Database-tracked investment
totalUsdcInvestment = $3.00 (from DB)

// Use the maximum of both methods for accuracy
capturedBetAmount = Math.max($3.00, $3.00) = $3.00
```

**Cashout API Call:**
**Location:** `useTradingPanelActions.tsx:68-91`

```javascript
const handleCloseBetConfirm = async (option: string, amount: string) => {
  const cashoutRequest = {
    type: option.toLowerCase(), // "yes" or "no"
    amountIn: parseFloat(amount), // burnAmount (1.5 tokens)
    marketAddress: market.contractAddress,
    idempotencyKey: uuidv4(),
  };

  const cashoutResponse = await betsService.cashoutFunds(cashoutRequest);

  return {
    txHash: cashoutResponse?.txHash,
    amountOut: cashoutResponse?.amountOut, // e.g., "3200000" (3.2 USDC in wei)
  };
};
```

**What Happens On-Chain:**

1. User burns 1.5 YES + 1.5 NO tokens
2. Contract returns USDC based on current liquidity and market state
3. Actual amount received: $3.20 USDC (1e6 format: 3200000)

---

### **Phase 3: Success Modal Displays**

**What User Sees:**

```
Success Modal:
┌─────────────────────────────┐
│ ✓ Cashout Successful!       │
│                             │
│ Market: "Will BTC hit..."   │
│ Amount: $3.20               │
│                             │
│   [Flex]  [Close]          │
└─────────────────────────────┘
```

---

### **Phase 4: User Clicks "Flex" Button**

**Flex Card Type Determination:**
**Location:** `UnifiedModal.tsx:378-382`

```javascript
// Determine flex type based on bet status
// flex10: completed bet with result (close_bet)
// flex12: ongoing bet with potential outcomes (place_bet, update_bet)
const isBetCompleted = type === "close_bet" && cashoutAmount !== null;
determinedFlexType = isBetCompleted ? "flex10" : "flex12";
```

Since `type === 'close_bet'` and `cashoutAmount` exists → **Flex 10** is generated

---

### **Phase 5: Calculate Flex Card Data**

**Location:** `UnifiedModal.tsx:293-318, 333-346`

#### **5.1: Bet Amount Calculation**

```javascript
if (type === "close_bet") {
  // Use the pre-cashout bet amount that was captured before transaction
  if (preCashoutBetAmount !== null && preCashoutBetAmount > 0) {
    betAmount = preCashoutBetAmount; // ✅ $3.00
  } else if (totalUsdcInvestment > 0) {
    // Fallback: current DB investment (but this is 0 after cashout)
    betAmount = totalUsdcInvestment;
  } else {
    // Last resort: calculate from burn amount
    betAmount = burnAmount * 2;
  }
}
```

**Result:** `betAmount = $3.00`

#### **5.2: Side Determination**

```javascript
side = state.selectedOption || "YES"; // "YES"
```

#### **5.3: Belief Calculation**

**For Close Bet (Cashout):**

Belief is hidden since the original bet's belief isn't stored in the database:

```javascript
if (type === "close_bet") {
  // For cashouts, hide belief since we can't retrieve the original bet's belief
  // (UserPosition doesn't store belief percentage)
  belief = null;
}
```

**Result for this example:**

- `belief = null` (will be hidden on Flex 10 card)

**Why hide it?**

- The `UserPosition` table doesn't store the original belief percentage
- Current token balance doesn't represent the original bet's conviction
- Better to hide than show inaccurate data

#### **5.4: Amount Won Calculation (CRITICAL)**

**Location:** `flexCardGenerator.ts:95-98`

```javascript
if (type === "close_bet" && cashoutAmount) {
  // For closed bets, show total cashout amount (not net profit)
  // cashoutAmount is in wei (1e6), so divide to get USDC
  amountWon = cashoutAmount / 1e6; // Total payout
}
```

**Math:**

```
cashoutAmount = 3200000 (from API, in wei format)
betAmount = $3.00 (shown separately on card)

amountWon = 3200000 / 1,000,000
          = +$3.20  ✅ (total cashout amount - always positive)
```

**Note:** The card now shows the **total cashout amount** received, not the net profit. This keeps the value always positive/green and consistent with Flex 12 "What If" cards.

#### **5.5: Format Data for Display**

**Location:** `UnifiedModal.tsx:395-414`

```javascript
const betData: BetData = {
  question: "Will BTC hit $100k?",
  amountWon: `${amountWon >= 0 ? "+" : ""}$${amountWon.toFixed(2)}`, // "+$0.20"
  betAmount: `$${betAmount.toFixed(2)}`, // "$3.00"
  side: String(side), // "YES"
  // Only include belief if available (null for equal token holdings)
  ...(belief !== null &&
    !isNaN(belief) && { belief: `${Math.round(belief)}%` }), // Optional
  user: {
    name: userName,
    level: "88",
  },
  timestamp: "Bet Placed 11:22:00 UTC via @Simmi on X",
  marketId: marketId,
  status: "Closed", // ✅ Closed for flex10
  marketImage: marketImage,
};
```

---

### **Phase 6: Create Snapshot & Generate OG Image**

```javascript
// Create snapshot using server-side generation
const result = await createFlexSnapshot("flex10", betData);

// Get the OG image URL
const imageUrl = `/api/og/flex?snapshotId=${result.snapshotId}`;
```

**Snapshot Stored in Database:**

```javascript
{
  id: "uuid-1234-5678",
  type: "flex10",
  username: "user123",
  marketQuestion: "Will BTC hit $100k?",
  betAmount: 3.00,
  betSide: "YES",
  beliefPercentage: null, // ✅ Hidden for cashouts (original belief not stored)
  amountWon: 0.20,  // ✅ Positive profit
  betStatus: "Closed",
  marketImage: "/images/btc-market.jpg",
  createdAt: "2025-01-27T10:00:00Z"
}
```

**OG Image Generated (Flex 10 - Cashout):**

```
┌────────────────────────────────────┐
│  [BTC Image]  "Will BTC hit..."    │
│                                    │
│  Amount won                        │
│  +$0.20                           │ ← Green with glow
│                                    │
│  Bet: $3.00  Side: YES             │ ← Belief column hidden
│                                    │
│  @user123          [Bluff Logo]   │
└────────────────────────────────────┘
```

**Note:** Belief is always hidden for Flex 10 (cashout) cards since the original bet's belief isn't stored in the database

---

### **Key Calculation Components**

#### **Burn Amount**

```javascript
// Minimum of YES and NO tokens
burnAmount = Math.min(yesBalRaw, noBalRaw);
```

#### **Cashout Value**

```javascript
// From CashoutHelper contract
(estimateRedeemableAmount[0] / 1e18) * 2;
```

#### **Pre-Cashout Bet Amount Capture**

```javascript
// Use max of DB investment or token-based calculation
const tokenBasedBetAmount = burnAmount * 2;
const capturedBetAmount = Math.max(totalUsdcInvestment, tokenBasedBetAmount);
```

#### **Amount Won Formula**

```javascript
// Show total cashout amount (not net profit)
amountWon = cashoutAmount / 1e6;
```

---

### **Edge Cases & Fallbacks**

#### **Edge Case 1: `preCashoutBetAmount` Not Captured**

If for some reason the pre-cashout amount isn't captured:

```javascript
betAmount = totalUsdcInvestment || burnAmount * 2;
```

**Issue:** After cashout, `totalUsdcInvestment` is 0, so it falls back to `burnAmount * 2`

#### **Edge Case 2: `cashoutAmount` Not Returned**

If API doesn't return cashout amount:

```javascript
// Fallback to estimated redeemable amount
amountWon = redeemableAmount - betAmount;
```

#### **Edge Case 3: Partial Cashout**

User cashes out part of position:

- `burnAmount` represents only the portion being cashed out
- Remaining tokens stay in wallet
- Flex card shows only the cashed-out portion

#### **Edge Case 4: Zero or Negative Amounts**

```javascript
if (cashoutAmount <= 0) {
  // Should never happen, but handled gracefully
  amountWon = 0; // No cashout received
}
```

**Note:** Since we now show total cashout amount (not net profit), the value will be 0 if no funds are received, rather than showing a negative loss.

---

### **Data Sources Summary**

| Data Point                 | Source                     | Timing                     |
| -------------------------- | -------------------------- | -------------------------- |
| `totalUsdcInvestment`      | Database (`UserPosition`)  | Before cashout             |
| `yesBalRaw` / `noBalRaw`   | Blockchain (user wallet)   | Real-time                  |
| `burnAmount`               | Calculated (min of YES/NO) | Pre-transaction            |
| `preCashoutBetAmount`      | Captured in state          | Before transaction ✅      |
| `cashoutAmount`            | API response               | After transaction ✅       |
| `estimateRedeemableAmount` | Contract call              | Pre-transaction (estimate) |

---

### **Why This Approach Works**

1. **Captures bet amount BEFORE cashout** - Ensures accurate original investment display
2. **Uses actual cashout amount FROM transaction** - Real received amount, not estimate
3. **Shows total payout** - Always positive, consistent with Flex 12 cards
4. **Handles edge cases** - Multiple fallbacks for missing data
5. **Accurate to the cent** - Uses actual blockchain/API values
6. **Better UX** - Users see total money received, not confusing profit/loss calculations

---

### **Common Issues & Solutions**

#### **Issue:** Wrong bet amount showing on flex card

**Cause:** `preCashoutBetAmount` not captured or totalUsdcInvestment already 0
**Solution:** Always capture before cashout transaction

#### **Issue:** Amount won shows $0

**Cause:** `cashoutAmount` null or not returned from API
**Solution:** Check API response and ensure `cashoutAmount` is properly set

#### **Issue:** Amount won doesn't match what user received

**Cause:** Using estimate instead of actual cashout amount
**Solution:** Use `cashoutResponse.amountOut` from transaction

**Note:** As of Jan 2025, "Amount Won" now shows **total cashout amount** (not net profit), so it will always be positive and match the total received.

#### **Issue:** Belief shows "50%" or inaccurate values for cashouts

**Cause:** Original bet belief not stored in `UserPosition` table, using fallback or stale state
**Solution:** Hide belief entirely for cashouts since original value is unavailable (line 302-310)

---

## Place Bet & Update Bet (Flex 12)

For **Flex 12** cards (ongoing bets), the calculations differ:

**Bet Amount Calculation:**

```javascript
if (type === "place_bet") {
  betAmount = parseFloat(state.amount || "0");
} else if (type === "update_bet") {
  betAmount = totalUsdcInvestment + parseFloat(state.amount || "0");
}
```

**Amount Won Calculation (Total Payout):**

```javascript
// For new/ongoing bets (Flex 12), show total payout instead of net profit
// This ensures the "You Could Win" value is always positive and green
const noValue = (Number(currency0Balance) || 0) * 2;
const yesValue = (Number(currency1Balance) || 0) * 2;

// Use the winning side's value based on which side they bet on
const totalPayout = side.toUpperCase() === "YES" ? yesValue : noValue;
amountWon = totalPayout; // Show total payout, not profit (totalPayout - betAmount)
```

**Note:** Both Flex 10 and Flex 12 cards now consistently show **total payout** (not net profit), ensuring values are always positive and green.

**Potential Win/Loss Calculation (Flex 12 only):**

```javascript
const multiplier = 100 / belief;
const potentialReturn = betAmount * multiplier;
const potentialProfit = potentialReturn - betAmount;

potentialWinAmount = potentialProfit;
potentialLossAmount = -betAmount;
```

---

## Data Calculation Details

### **Profile Data Collection**

**Location:** `src/app/(site)/api/flex/snapshot/route.ts`

```javascript
// User lookup
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
  include: {
    balance: true,
    positions: true,
    marketProfits: true,
  },
});

// Balance calculation
const balance =
  profileData?.balance ??
  (user.balance?.balance ? Number(user.balance.balance) : 0);

// Profit/Loss calculation
const profitLoss =
  profileData?.profit ??
  user.positions.reduce((total, position) => {
    return total + Number(position.profit || 0);
  }, 0);

// Volume calculation
const volumeTraded =
  profileData?.volumeTraded ??
  user.positions.reduce((total, position) => {
    return total + Number(position.amount);
  }, 0);
```

### **Bet Side Determination**

**Location:** `src/app/(site)/market/trading-panel/components/UnifiedModal.tsx:320-330`

```javascript
if (requestResponse) {
  const yesTokens = parseFloat(requestResponse.yes || "0");
  const noTokens = parseFloat(requestResponse.no || "0");
  if (yesTokens > 0 && noTokens === 0) {
    side = "YES";
  } else if (noTokens > 0 && yesTokens === 0) {
    side = "NO";
  }
  // If both sides have tokens, use state.selectedOption
}
```

### **Market Question Truncation**

**Location:** `src/app/(site)/api/og/flex/route.tsx:128-131`

```javascript
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};
const truncatedQuestion = truncateText(
  snapshot.marketQuestion || "Unknown Market",
  100
);
```

---

## Implementation Files

### **Core Components**

| File Path                                          | Purpose                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| `src/components/flex-cards/parent-flex.tsx`        | Wrapper component with background and footer   |
| `src/components/flex-cards/flex-card-9.tsx`        | Profile stats card layout                      |
| `src/components/flex-cards/flex-card-10.tsx`       | Completed bet card layout                      |
| `src/components/flex-cards/flex-card-11.tsx`       | LP position card layout (unused)               |
| `src/components/flex-cards/flex-card-13.tsx`       | Short options card layout                      |
| `src/components/flex-cards/flex-card-14.tsx`       | Long options card layout                       |
| `src/components/flex-cards/utils.tsx`              | Legacy client-side screenshot capture (unused) |
| `src/components/flex-cards/flex-button.tsx`        | Flex button with Lottie animation              |
| `src/components/flex-cards/circle-flex-button.tsx` | Circular flex button variant                   |

### **API Routes**

| File Path                                   | Purpose                                 |
| ------------------------------------------- | --------------------------------------- |
| `src/app/(site)/api/flex/snapshot/route.ts` | Creates FlexSnapshot database entry     |
| `src/app/(site)/api/og/flex/route.tsx`      | Generates OG images using ImageResponse |

### **Utility Functions**

| File Path                   | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `src/utils/flexSnapshot.ts` | Helper functions for snapshot creation and sharing |

### **Integration Points**

| File Path                                                         | Purpose                                     |
| ----------------------------------------------------------------- | ------------------------------------------- |
| `src/app/(site)/profile/common/profile-stats.tsx`                 | Profile flex card trigger                   |
| `src/app/(site)/market/trading-panel/components/UnifiedModal.tsx` | Bet flex cards trigger                      |
| `src/app/(site)/options/common/exercise-card.tsx`                 | Options flex card trigger                   |
| `src/app/(site)/options/common/listed-card.tsx`                   | Options flex card trigger                   |
| `src/app/(site)/profile/common/modal/flex-modal.tsx`              | Modal for displaying and sharing flex cards |

### **Database Schema**

**Table:** `FlexSnapshot` (`flex_snapshots`)

```prisma
model FlexSnapshot {
  id                  String   @id @default(uuid())
  userId              String
  type                String   // flex9, flex10, flex11, flex12, flex13, flex14
  username            String
  avatar              String?
  profitLoss          Decimal  @db.Decimal(10, 2)
  volumeTraded        Decimal  @db.Decimal(10, 2)
  balance             Decimal  @db.Decimal(10, 2)
  createdAt           DateTime @default(now())

  // Bet-specific fields
  amountWon           Decimal? @db.Decimal(10, 2)
  beliefPercentage    Decimal? @db.Decimal(5, 2)
  betAmount           Decimal? @db.Decimal(10, 2)
  betData             Json?
  betSide             String?
  betStatus           String?
  marketId            String?
  marketQuestion      String?
  marketImage         String?

  // What-if card fields
  potentialLossAmount Decimal? @db.Decimal(10, 2)
  potentialWinAmount  Decimal? @db.Decimal(10, 2)

  user                User     @relation(fields: [userId], references: [id])
}
```

---

## Known Limitations and Issues

### **1. ~~Belief Calculation Fallback to 50%~~ (FIXED ✅)**

**Severity:** ~~High~~ → **RESOLVED**  
**Location:** `src/app/(site)/market/trading-panel/components/UnifiedModal.tsx:287-327`, `src/utils/flexSnapshot.ts:29`, `src/app/(site)/api/og/flex/route.tsx`

**Status:** ✅ **Fixed (Jan 2025)**

**Previous Issues:**

1. Belief would fallback to "50%" when actual value couldn't be determined
2. For cashouts (close_bet), belief used stale state data instead of calculating from actual token holdings
3. Inaccurate belief percentages shown on flex cards
4. No way to distinguish between actual 50% belief and a fallback value

**Fixes Implemented:**

**Part 1: Hide Belief for Cashouts**

Since the original bet's belief isn't stored in the database, we now hide it entirely for cashouts:

```javascript
if (type === "place_bet" || type === "update_bet") {
  // For new bets, use the belief from the trading panel state
  belief = state.belief;
} else if (type === "close_bet") {
  // For cashouts, hide belief since we can't retrieve the original bet's belief
  // (UserPosition doesn't store belief percentage)
  belief = null;
}
```

**Part 2: Made Belief Optional**

- Changed `belief` from required string to optional string in `BetData` interface
- Removed "50%" fallback entirely
- Belief is now `null` when unavailable

**Part 3: Conditional UI Rendering**

OG images now conditionally render the belief column:

```javascript
{
  snapshot.beliefPercentage != null &&
    !isNaN(Number(snapshot.beliefPercentage)) && (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <p>Belief</p>
        <p>{Number(snapshot.beliefPercentage).toFixed(0)}%</p>
      </div>
    );
}
```

**Belief Display Logic:**

- **place_bet** (Flex 12): Shows trading panel `state.belief` ✅
- **update_bet** (Flex 12): Shows trading panel `state.belief` ✅
- **close_bet** (Flex 10): Hidden (original belief not stored in DB) ✅
- **Missing data**: Hidden instead of showing "50%" ✅

**User Experience:**

**Before Fix:**

```
Cashout (Flex 10):
- User cashes out bet
- Card shows "Belief: 50%" ❌ (incorrect fallback)
```

**After Fix:**

```
Cashout (Flex 10):
- User cashes out bet
- Belief column hidden ✅ (original belief not available)

New Bet (Flex 12):
- User places bet with 80% belief
- Card shows "Belief: 80%" ✅ (from trading panel state)
```

**Future Improvement:**
To show belief on cashout cards, add a `belief` field to the `UserPosition` table to store the original bet's belief percentage.

---

### **2. ~~Hardcoded Profile Stats~~ (FIXED ✅)**

**Severity:** ~~Medium~~ → **RESOLVED**  
**Location:** `src/app/(site)/api/og/flex/route.tsx:492-510`, `src/app/(site)/profile/common/profile-stats.tsx`

**Status:** ✅ **Fixed (Jan 2025)**

**Previous Issues:**

1. Profile cards displayed hardcoded values (Level, Tier, Win Ratio)
2. Flex button could be clicked before data loaded, creating cards with wrong values
3. UI showed intermediate values (0 → 0.54 → actual value) during loading

**Fixes Implemented:**

**Part 1: Removed Hardcoded Values**

- ~~Level: Always shows "1"~~ → **Commented out**
- ~~Tier: Always shows "BETA"~~ → **Commented out**
- ~~Win Ratio: Always shows "65%"~~ → **Commented out**
- Lifetime PNL: ✅ Shows real data
- Volume Traded: ✅ Shows real data
- Username & Avatar: ✅ Shows real data

**Part 2: Fixed Loading State Issues** (Jan 2025)

- ✅ Flex button now disabled until all data (profit, volume, liquidity) is loaded
- ✅ Button shows reduced opacity (50%) and is non-interactive while loading
- ✅ All values display "..." instead of showing intermediate zero values
- ✅ Balance shows "..." (not "$0.00") during loading
- ✅ Profit/Loss shows "..." (not "$0.00") during loading
- ✅ Volume traded shows "..." (not "$0.00") during loading
- ✅ Safety check prevents snapshot creation if data is still loading

**Implementation Details:**

```javascript
// Extract loading states from hooks
const { data: profit, isLoading: isProfitLoading } = useUserProfit();
const { data: volumeTraded, isLoading: isVolumeLoading } = useUserVolumeTraded();
const { data: liquidityData, isLoading: isLiquidityLoading } = useUserLiquidityPositionsDetailed();

// Combined loading check
const isDataLoading = isProfitLoading || isVolumeLoading || isLiquidityLoading;

// Only calculate profit when data is available (not during loading)
const totalProfit = isDataLoading
  ? null
  : (profit || 0) + (liquidityData?.summary.totalPnL || 0);

// Display loading state in UI
value: isDataLoading ? "..." : formatBalance(balance)
value: isDataLoading ? "..." : formatBalance(totalProfit)

// Disable flex button while loading
<div className={isDataLoading ? "opacity-50 pointer-events-none" : ""}>
  <FlexLottieButton
    text="Flex"
    onClick={isDataLoading ? undefined : handleShareProfile}
  />
</div>
```

**User Experience Flow:**

**Before Fix:**

```
Page Load → Show $0.00 → Show $0.54 → Show $42.28
           ↓ (button active)
           User clicks → Wrong data in card ❌
```

**After Fix:**

```
Page Load → Show "..." → Show $42.28
           ↓ (button disabled)   ↓ (button enabled)
           Can't click ❌        User clicks → Correct data ✅
```

**Visual Card Changes:**

- Card dimensions reduced from 580px to 320px height for better visual balance
- PNL font size increased from 88px to 100px to emphasize the main metric
- Layout uses centered content with consistent 40px gaps
- The commented-out code is preserved for future implementation

**Remaining Work (Future Enhancement):**
When ready to add Level, Tier, Win Ratio back with real data:

```javascript
// Calculate from database
const level = calculateUserLevel(user.positions.length, user.volumeTraded);
const tier = calculateUserTier(user.profitLoss, user.volumeTraded);
const winRatio = calculateWinRatio(user.positions);
const betsCount = user.positions.length;
const optionsCount = user.optionHoldings.length;
```

---

### **3. Inconsistent Data Timing**

**Severity:** High  
**Location:** `UnifiedModal.tsx:276-418`

**Issue:**
For `place_bet` and `update_bet` actions, the flex card uses state data before database updates. This can cause discrepancies between:

- What the user sees in the UI
- What gets saved to the database
- What appears on the flex card

**Example Scenario:**

1. User places a bet with 80% belief
2. Transaction succeeds
3. Flex card is generated immediately
4. Database hasn't updated yet
5. If user refreshes, they might see different numbers

**Impact:**

- Potential data inconsistencies
- Confusion for users
- Trust issues

**Fix:**
Wait for database confirmation before generating flex card:

```javascript
// After successful transaction
await refreshUserPositions(); // Wait for DB sync
await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay
// Then generate flex card
```

---

### **4. Bet Amount Calculation Complexity**

**Severity:** Medium  
**Location:** `UnifiedModal.tsx:328-350`

**Issue:**
The bet amount calculation has multiple fallbacks and edge cases:

- Different logic for `place_bet`, `update_bet`, `close_bet`
- Relies on `preCashoutBetAmount` state variable
- Fallback to `burnAmount * 2` as last resort
- No clear error handling if all sources fail

**Impact:**

- Difficult to debug when amounts are wrong
- Maintenance complexity
- Potential for incorrect amounts on flex cards

**Fix:**
Simplify and centralize bet amount logic:

```javascript
const getBetAmount = async (type, marketAddress, userAddress) => {
  // Always fetch from authoritative source (blockchain or database)
  const position = await fetchUserPosition(marketAddress, userAddress);
  return position.totalInvestment;
};
```

---

### **5. Font Loading Performance**

**Severity:** Low  
**Location:** `src/app/(site)/api/og/flex/route.tsx:6-25`

**Issue:**
Each OG image generation:

- Fetches font CSS from Google Fonts
- Downloads 3 font weight files (600, 800, 900)
- Loads all characters (not just used ones)
- No font file caching

**Impact:**

- Slow image generation (adds 500-1000ms)
- Increased Google Fonts API usage
- Potential rate limiting

**Fix:**

1. Cache font files locally or in CDN
2. Use subset fonts with only needed characters
3. Consider using Next.js built-in font optimization

---

### **6. Market Image Handling**

**Severity:** Low  
**Location:** `src/app/(site)/api/og/flex/route.tsx:211-224`

**Issue:**
Market images use conditional URL construction:

```javascript
src={snapshot.marketImage.startsWith('http')
  ? snapshot.marketImage
  : `${process.env.NEXT_PUBLIC_APP_URL}${snapshot.marketImage}`
}
```

**Concerns:**

- No validation if image exists
- No fallback for broken images
- Missing images appear as gray boxes
- External URLs might fail or be slow

**Impact:**

- Unprofessional appearance with broken images
- Slow loading for external images

**Fix:**

1. Validate image URLs before saving to snapshot
2. Use placeholder image as fallback
3. Proxy external images through your CDN
4. Optimize/resize images at upload time

---

### **7. No Error Recovery in Modal**

**Severity:** Medium  
**Location:** `UnifiedModal.tsx:423-429`

**Issue:**
When flex card generation fails:

```javascript
catch (error) {
  console.error('Error creating bet snapshot:', error);
  flexModalStateRef.current = "";
  setIsFlexModalOpen("");
}
```

**Problems:**

- Modal silently closes
- No user feedback about the error
- No retry mechanism
- User doesn't know what went wrong

**Impact:**

- Poor user experience
- Lost sharing opportunities
- User frustration

**Fix:**
Add proper error handling:

```javascript
catch (error) {
  console.error('Error creating bet snapshot:', error);
  toast.error('Failed to generate flex card. Please try again.');
  setIsFlexModalOpen("error");
  // Show error state in modal with retry button
}
```

---

### **8. Snapshot Data Redundancy**

**Severity:** Low  
**Location:** `src/app/(site)/api/flex/snapshot/route.ts:58-98`

**Issue:**
FlexSnapshot stores both:

- Individual fields (`betAmount`, `betSide`, `beliefPercentage`, etc.)
- Full JSON blob (`betData`)

**Problems:**

- Data duplication
- Risk of inconsistency between JSON and individual fields
- Wastes database storage
- Unclear which is source of truth

**Impact:**

- Database bloat over time
- Maintenance confusion

**Fix:**
Choose one approach:

```javascript
// Option A: Use only individual fields (recommended)
const snapshotData = {
  ...baseSnapshotData,
  betAmount: parseFloat(betData.betAmount.replace("$", "")),
  betSide: betData.side,
  // ... etc
  // Remove: betData JSON field
};

// Option B: Use only JSON blob
const snapshotData = {
  ...baseSnapshotData,
  betData: JSON.stringify(betData),
  // Remove individual fields, parse from betData in OG generator
};
```

---

### **9. Missing Analytics**

**Severity:** Low  
**Location:** All flex card flows

**Issue:**
No tracking of:

- How many flex cards are generated
- Which card types are most popular
- Share success rate (did user actually share?)
- Click-through rate from shared cards
- Conversion from shared cards

**Impact:**

- Can't optimize the feature
- Don't know ROI
- Can't identify bugs from usage patterns

**Fix:**
Add analytics events:

```javascript
// When snapshot is created
trackEvent("flex_card_generated", { type: flexType, userId });

// When user clicks share button
trackEvent("flex_card_share_initiated", { type: flexType, snapshotId });

// On share page load (from external source)
trackEvent("flex_card_viewed", { snapshotId, referrer });
```

---

### **10. Cache Invalidation Issues**

**Severity:** Medium  
**Location:** `src/app/(site)/api/og/flex/route.tsx:425-427`

**Issue:**
OG images are cached for 1 hour:

```javascript
headers: {
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
}
```

**Problems:**

- If user data changes (e.g., profit updates), old image is served
- Can't manually invalidate cache
- Twitter/X might cache even longer
- Snapshots are immutable but data displayed should reflect creation time

**Impact:**

- Stale data on shared cards
- Confusion when numbers don't match current profile

**Current Behavior:**
Actually correct - snapshots are point-in-time captures, so caching is appropriate.

**Clarification:**
This is working as designed. Snapshots capture a specific moment and shouldn't change. The issue is more about user expectations - they might expect the card to always show current data.

**Recommendation:**
Add timestamp/date to cards to make it clear this is a historical snapshot:

```javascript
<p style={{ fontSize: 14, color: "#93A29B" }}>
  Snapshot from {formatDate(snapshot.createdAt)}
</p>
```

---

### **11. Security: No Rate Limiting**

**Severity:** High  
**Location:** `src/app/(site)/api/flex/snapshot/route.ts`

**Issue:**
Anyone can spam snapshot creation:

- No rate limiting on API endpoint
- Each snapshot costs database storage
- Could be used for DoS attack
- No cleanup of old snapshots

**Impact:**

- Database bloat
- Potential service disruption
- Storage costs

**Fix:**
Implement rate limiting:

```javascript
// Add rate limiting middleware
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  const identifier = session?.user?.id || request.ip;
  const remaining = await limiter.check(identifier, 5); // 5 requests per minute

  if (remaining <= 0) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  // ... rest of handler
}
```

Add cleanup job:

```javascript
// Cron job to delete old snapshots
async function cleanupOldSnapshots() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.flexSnapshot.deleteMany({
    where: { createdAt: { lt: thirtyDaysAgo } },
  });
}
```

---

### **12. Legacy Client-Side Code**

**Severity:** Low  
**Location:** `src/components/flex-cards/utils.tsx`

**Issue:**
The `captureComponentScreenshot` function uses `html2canvas` for client-side image generation, but this is no longer used. The system now uses server-side OG image generation.

**Problems:**

- Dead code in codebase
- Dependencies still imported (`html2canvas`, `ReactDOM`)
- Confusing for new developers
- Increases bundle size

**Impact:**

- Code maintainability
- Build size

**Fix:**
Remove unused code and dependencies:

```bash
npm uninstall html2canvas
# Delete src/components/flex-cards/utils.tsx
# Or comment out with clear deprecation notice
```

---

## Recommendations

### **Short-Term (High Priority)**

1. **~~Add Real Profile Statistics & Fix Loading States~~** ✅ **COMPLETED** (Issue #1)

   - ~~Calculate actual level, tier, win ratio~~ → **Commented out for now**
   - ~~Display real bets/options counts~~ → **Deferred to future**
   - ✅ Real PNL and Volume working correctly
   - ✅ Fixed loading states - no more intermediate values
   - ✅ Disabled flex button until data is ready
   - ✅ Prevents creating cards with incorrect data
   - Time spent: 1 hour

2. **Implement Rate Limiting** (Issue #11)

   - Prevent API abuse
   - Add snapshot cleanup
   - Estimated effort: 3-4 hours

3. **Improve Error Handling** (Issue #7)

   - Add user-friendly error messages
   - Implement retry mechanism
   - Estimated effort: 2 hours

4. **Add Analytics Tracking** (Issue #9)
   - Track generation, shares, views
   - Measure feature success
   - Estimated effort: 2-3 hours

### **Medium-Term (Should Fix)**

5. **Fix Data Timing Issues** (Issue #2)

   - Ensure database consistency before flex card generation
   - Estimated effort: 4-5 hours

6. **Simplify Bet Amount Calculation** (Issue #3)

   - Centralize logic
   - Add clear error handling
   - Estimated effort: 3-4 hours

7. **Remove Dead Code** (Issue #12)
   - Clean up legacy client-side code
   - Estimated effort: 1 hour

### **Long-Term (Nice to Have)**

9. **Optimize Font Loading** (Issue #5)

   - Cache fonts locally
   - Use font subsets
   - Estimated effort: 3-4 hours

10. **Improve Image Handling** (Issue #6)

    - Add image validation
    - Implement fallbacks
    - Proxy external images
    - Estimated effort: 5-6 hours

11. **Refactor Snapshot Data Structure** (Issue #8)

    - Remove redundancy
    - Use consistent approach
    - Estimated effort: 4-5 hours (requires migration)

12. **Add Timestamps to Cards** (Issue #10 clarification)
    - Make snapshot nature clear to users
    - Estimated effort: 1 hour

### **Testing Recommendations**

1. **Add Integration Tests**

   - Test snapshot creation for all card types
   - Test OG image generation
   - Test share flow end-to-end

2. **Add Visual Regression Tests**

   - Ensure card designs remain consistent
   - Catch layout bugs early

3. **Load Testing**
   - Test concurrent snapshot creation
   - Test OG image generation under load

### **Monitoring Recommendations**

1. **Add Error Tracking**

   - Monitor OG image generation failures
   - Track snapshot creation errors
   - Alert on high error rates

2. **Performance Monitoring**

   - Track OG image generation time
   - Monitor font loading performance
   - Track database query performance

3. **Usage Metrics**
   - Monitor snapshot creation rate
   - Track share completion rate
   - Measure viral coefficient (shares → new users)

---

## Development Features

### **Flex Type Indicator Badge**

**Location:** `src/app/(site)/profile/common/modal/flex-modal.tsx`

In development mode (`NODE_ENV === 'development'`), the FlexModal displays a badge showing the current flex card type.

**Visual Appearance:**

- Blue badge next to "Flex Card" title
- Displays type in uppercase: "FLEX9", "FLEX10", "FLEX12", etc.
- Styling: `bg-blue-500/20 text-blue-400 border border-blue-500/40`

**Implementation:**

```javascript
{
  process.env.NODE_ENV === "development" && (
    <span className="px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded">
      {type.toUpperCase()}
    </span>
  );
}
```

**Purpose:**

- Quickly identify which flex card type is being generated
- Debug card type routing issues
- Verify correct card type for different user actions
- No visible indicator in production mode

**Use Cases:**

- Testing cashout flow → Should show "FLEX10"
- Testing place bet flow → Should show "FLEX12"
- Testing profile stats → Should show "FLEX9"
- Testing update bet flow → Should show "FLEX12"

---

## Summary

The Flex Card system is a powerful social sharing feature that works well for its primary use case but has several areas for improvement:

**Strengths:**

- ✅ Clean separation of concerns (snapshot creation → OG generation → sharing)
- ✅ Server-side rendering for better performance and SEO
- ✅ Proper caching for generated images
- ✅ Support for multiple card types

**Weaknesses:**

- ✅ ~~Hardcoded statistics reduce user engagement~~ → **FIXED** (commented out + loading states)
- ✅ ~~Data timing issues on profile page~~ → **FIXED** (disabled button until data loads)
- ❌ No rate limiting creates security risk
- ❌ Data timing issues can cause inconsistencies (in trading panel)
- ❌ Poor error handling hurts UX
- ❌ No analytics to measure success

**Priority Fixes:**

1. ~~Add real profile statistics~~ ✅ **COMPLETED**
2. ~~Fix profile loading states~~ ✅ **COMPLETED**
3. Implement rate limiting (3-4 hrs)
4. Improve error messages (2 hrs)
5. Add analytics (2-3 hrs)

**Total Estimated Effort for Remaining Priority Fixes:** ~7-9 hours

---

## Future Implementation

### **Options Cards Enhancement (Flex 13 & 14)**

**Current State:**

- Options cards (flex 13/14) are implemented but use generic profile data
- Missing actual options-specific information

**Required Implementation:**

1. **Data Collection**

   - Pass option details to `createFlexSnapshot()`
   - Add option-specific fields to `FlexSnapshot` schema

2. **Display Fields Needed:**

   - Position type (Long/Short)
   - Token symbol and name
   - Current price vs Strike price
   - Expiration date
   - Profit exercised (actual option P&L)
   - Number of options held
   - Amount staked

3. **Implementation Changes:**

**Location:** `exercise-card.tsx:141`, `listed-card.tsx:107`

```javascript
// Add option data collection
const optionData = {
  tokenSymbol,
  tokenName,
  currentPrice,
  strikePrice,
  expiryDate,
  profitExercised,
  optionsCount,
  amountStaked,
  position, // Long/Short
};

const result = await createFlexSnapshot(
  flexType,
  undefined,
  undefined,
  optionData
);
```

**Location:** `src/app/(site)/api/og/flex/route.tsx`

```javascript
// Add options-specific card generator
async function generateOptionsCard(snapshot: FlexSnapshot) {
  // Use snapshot.optionData to display actual option details
  // Similar structure to bet cards but with options-specific fields
}
```

**Estimated Effort:** 6-8 hours

- Schema changes: 1 hour
- Data collection: 2 hours
- OG image generation: 3-4 hours
- Testing: 1-2 hours

---

_Last Updated: January 2025_  
_Document Version: 1.1_
