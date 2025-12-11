# Remove Liquidity Modal - Token Balance Calculations

## Overview

When a user removes liquidity from a market, their NFT position is burned and they receive the underlying tokens (YES and NO tokens) back to their wallet. This document explains how we calculate and display these token balances in the success modal.

## Token Structure

In the liquidity pool system:

- **token0** = NO tokens
- **token1** = YES tokens

This mapping is consistent across the entire system.

## Data Flow

### 1. Position Info API (`/api/liquidity/position-info`)

The position info is fetched from the external API and returns token balances in **wei** (10^18 decimals):

```typescript
interface PositionInfo {
  tokenId: number;
  token0Balance: number; // NO tokens in wei
  token1Balance: number; // YES tokens in wei
  token0Fees: number;
  token1Fees: number;
  lowerOdds: number;
  upperOdds: number;
}
```

### 2. Component Calculation (`ActiveLiquidityPosition.tsx`)

The component converts from wei to human-readable format:

```typescript
// Lines 131-135
const nftIdNumber = positionData?.nftId ? parseInt(positionData.nftId) : null;
const { data: positionInfo } = usePositionInfo(nftIdNumber);

const token0Balance = (positionInfo?.token0Balance || 0) / 1e18; // NO tokens
const token1Balance = (positionInfo?.token1Balance || 0) / 1e18; // YES tokens
```

### 3. Display in Modal

The modal displays the token balances that will be returned to the user's wallet:

```typescript
// Lines 613-620
<div className="flex justify-between items-center text-sm">
  <span className="text-[#36FD68]">{yesSideName}</span>
  <span className="text-white">{token1Balance.toFixed(2)}</span>  // YES tokens
</div>
<div className="flex justify-between items-center text-sm">
  <span className="text-[#D32B3F]">{noSideName}</span>
  <span className="text-white">{token0Balance.toFixed(2)}</span>  // NO tokens
</div>
```

## What Happens When Liquidity is Removed

1. **User clicks "Remove Liquidity"**

   - Transaction is sent to burn the NFT position

2. **On-chain transaction executes**

   - The NFT is burned
   - The underlying tokens (token0 and token1) are transferred back to the user's wallet
   - Any unclaimed fees are also transferred

3. **Modal displays the returned tokens**
   - Shows the exact amount of YES tokens the user will receive
   - Shows the exact amount of NO tokens the user will receive
   - These are the same balances that were in the NFT position

## Accuracy Verification

The token balances shown are **accurate** because:

1. ✅ They come directly from the blockchain via `position-info` API call
2. ✅ The conversion from wei is correct: `balance / 1e18`
3. ✅ The mapping is consistent: token0 = NO, token1 = YES
4. ✅ The values represent the actual tokens the user receives after burning

## Example Calculation

If `positionInfo` returns:

```json
{
  "token0Balance": "1840000000000000000", // 1.84 NO tokens in wei
  "token1Balance": "3220000000000000000" // 3.22 YES tokens in wei
}
```

The displayed values will be:

- **Yes**: 3.22 (from `token1Balance / 1e18`)
- **No**: 1.84 (from `token0Balance / 1e18`)

## Token Value Calculation (for reference)

While not displayed in the modal, the USD value of these tokens can be calculated:

```typescript
// Token value based on market prices
const noTokenValue = token0Balance * market.noPrice; // NO tokens × NO price
const yesTokenValue = token1Balance * market.yesPrice; // YES tokens × YES price
const totalValue = noTokenValue + yesTokenValue;
```

This calculation is used elsewhere in the app (PositionSummaryCard, etc.) but not in the remove liquidity modal.

## Width Issue Fix

The Yes/No section should have the same width as the content above it. This is achieved by:

1. Removing `w-full` class from the inner flex container (which was adding extra width)
2. Using `text-center` on the parent div to center align the label
3. Letting the flex items naturally take the container width

**Before (incorrect):**

```typescript
<div className="mt-4">  // No centering
  <p>...</p>
  <div className="w-full space-y-0">  // Extra width
    <div className="flex justify-between w-full">  // Double width spec
```

**After (correct):**

```typescript
<div className="mt-4 text-center">  // Centered parent
  <p>...</p>
  <div className="space-y-0">  // Natural width
    <div className="flex justify-between">  // Inherits parent width
```

## Related Files

- `src/components/common/ActiveLiquidityPosition.tsx` - Component that displays the modal
- `src/hooks/usePositionInfo.tsx` - Hook to fetch position info
- `src/app/(site)/api/liquidity/position-info/route.ts` - API route for position data
- `src/app/(site)/api/liquidity/[marketId]/close-position/route.ts` - API route for removing liquidity
- `src/services/api/liquidityService.ts` - Service layer for liquidity operations

## Testing Checklist

When testing the remove liquidity modal:

- [ ] Yes/No values match the actual token balances in the NFT position
- [ ] Values are displayed with 2 decimal places
- [ ] Yes/No section width matches the "Amount" section above it
- [ ] After clicking "Done", user's wallet balance reflects the received tokens
- [ ] Transaction link goes to correct Arbiscan transaction
- [ ] Values are consistent with what's shown in the liquidity summary before removal
