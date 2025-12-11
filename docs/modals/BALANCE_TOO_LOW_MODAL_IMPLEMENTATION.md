# Balance Too Low Modal - Implementation Plan

## Overview

Platform fees are charged to the user's Bluff wallet (USDC balance) for every transaction. Users may have active positions worth money but a $0 wallet balance, preventing them from performing actions. This document outlines the comprehensive implementation of a "Balance too low" modal that appears when users cannot afford platform fees.

## Key Concepts

### Platform Fee Structure

- **Platform fees are charged to the wallet**, NOT deducted from positions
- User may have $10 position value but $0 wallet balance = **cannot transact**
- Estimated platform fee: **~$0.02 - $0.05 per transaction** (based on gas + protocol fees)
- Fees cover: Gas costs + Protocol fees (charged by smart contracts)

### User Balance Source

```typescript
// From useAuth hook
const { usdBalance } = useAuth();
// Returns string format: "0.00", "10.50", etc.
// Source: useUSDCBalance hook -> reads from USDC contract on Arbitrum
```

## Actions Requiring Balance Check

### 1. **Place Bet**

- **Location**: `UnifiedModal`, `useTradingPanelActions`
- **API**: `/api/bets/swap/[marketAddress]`
- **Check**: Before opening confirmation modal

### 2. **Update Position**

- **Location**: `UnifiedModal`, `handleUpdateBetConfirm`
- **API**: `/api/bets/update-belief/[marketId]`
- **Check**: Before opening confirmation modal

### 3. **Cash Out**

- **Location**: `UnifiedModal`, `handleCloseBetConfirm`
- **API**: `/api/bets/cashout/[marketAddress]`
- **Check**: Before opening confirmation modal

### 4. **Claim Fees** (Liquidity)

- **Location**: `ActiveLiquidityPosition`
- **API**: `/api/liquidity/[marketId]/claim-fees`
- **Check**: Before initiating claim

### 5. **Remove Liquidity**

- **Location**: `ActiveLiquidityPosition`
- **API**: `/api/liquidity/[marketId]/close-position`
- **Check**: Before initiating removal

### 6. **Add Liquidity**

- **Location**: `AddLiquidityModal`
- **API**: `/api/liquidity/update-liquidity/[marketId]`
- **Check**: Before opening confirmation modal

### 7. **Claim Winnings** (Resolved Markets)

- **Location**: Various claim buttons
- **API**: `/api/bets/claim-winnings/[marketAddress]`
- **Check**: Before initiating claim

## Implementation Strategy

### Phase 1: Create Reusable Components

#### 1.1 Create BalanceTooLowModal Component

**File**: `src/components/modals/BalanceTooLowModal.tsx`

```typescript
interface BalanceTooLowModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType:
    | "bet"
    | "update"
    | "cashout"
    | "claim_fees"
    | "remove_liquidity"
    | "add_liquidity"
    | "claim_winnings";
  requiredAmount?: number; // Optional: show specific amount needed
}

export const BalanceTooLowModal: React.FC<BalanceTooLowModalProps> = ({
  isOpen,
  onClose,
  actionType,
  requiredAmount,
}) => {
  // Display the modal shown in the image
  // Title: "Balance too low"
  // Message: "Platform fees are charged to your Bluff wallet."
  // Subtext: "Please deposit more or reduce your bet size and try again."
  // Button: "Deposit" - opens deposit modal
};
```

**Features**:

- Error icon (red badge with exclamation)
- Clear messaging
- "Deposit" button that opens deposit modal
- Close button (X)
- Cannot be dismissed during pending transaction

#### 1.2 Create Balance Check Hook

**File**: `src/hooks/useBalanceCheck.ts`

```typescript
interface UseBalanceCheckReturn {
  hasMinimumBalance: (minRequired: number) => boolean;
  checkBalanceForAction: (actionType: ActionType) => {
    canProceed: boolean;
    balance: number;
    requiredFee: number;
  };
  platformFee: number;
  usdBalance: string;
}

export const useBalanceCheck = (): UseBalanceCheckReturn => {
  const { usdBalance } = useAuth();
  const PLATFORM_FEE = 0.05; // $0.05 - adjust based on actual gas costs

  const balanceNumber = parseFloat(usdBalance || "0");

  const hasMinimumBalance = (minRequired: number) => {
    return balanceNumber >= minRequired;
  };

  const checkBalanceForAction = (actionType: ActionType) => {
    const requiredFee = PLATFORM_FEE;
    return {
      canProceed: balanceNumber >= requiredFee,
      balance: balanceNumber,
      requiredFee,
    };
  };

  return {
    hasMinimumBalance,
    checkBalanceForAction,
    platformFee: PLATFORM_FEE,
    usdBalance,
  };
};
```

### Phase 2: Integration Points

#### 2.1 Place Bet - UnifiedModal

**File**: `src/app/(site)/market/trading-panel/components/UnifiedModal.tsx`

```typescript
const UnifiedModal = ({ type, ... }) => {
  const { checkBalanceForAction } = useBalanceCheck();
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);

  const handleConfirm = async () => {
    // BEFORE attempting transaction
    if (type === 'place_bet') {
      const { canProceed } = checkBalanceForAction('place_bet');
      if (!canProceed) {
        setShowBalanceTooLowModal(true);
        return; // Stop execution
      }
    }

    // ... existing transaction logic
  };

  return (
    <>
      {/* Existing modal */}
      <BalanceTooLowModal
        isOpen={showBalanceTooLowModal}
        onClose={() => setShowBalanceTooLowModal(false)}
        actionType="bet"
      />
    </>
  );
};
```

#### 2.2 Update Position - UnifiedModal

```typescript
const handleConfirm = async () => {
  if (type === "update_bet") {
    const { canProceed } = checkBalanceForAction("update_bet");
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }
  }
  // ... proceed with update
};
```

#### 2.3 Cash Out - UnifiedModal

```typescript
const handleConfirm = async () => {
  if (type === "close_bet") {
    const { canProceed } = checkBalanceForAction("cashout");
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }
  }
  // ... proceed with cashout
};
```

#### 2.4 Claim Fees - ActiveLiquidityPosition

**File**: `src/components/common/ActiveLiquidityPosition.tsx`

```typescript
const ActiveLiquidityPosition = ({ ... }) => {
  const { checkBalanceForAction } = useBalanceCheck();
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);

  const handleClaimFees = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check balance FIRST
    const { canProceed } = checkBalanceForAction('claim_fees');
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }

    // ... existing claim logic
  };

  return (
    <>
      {/* Existing component */}
      <BalanceTooLowModal
        isOpen={showBalanceTooLowModal}
        onClose={() => setShowBalanceTooLowModal(false)}
        actionType="claim_fees"
      />
    </>
  );
};
```

#### 2.5 Remove Liquidity - ActiveLiquidityPosition

```typescript
const handleRemoveLiquidity = async (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  // Check balance FIRST
  const { canProceed } = checkBalanceForAction("remove_liquidity");
  if (!canProceed) {
    setShowBalanceTooLowModal(true);
    return;
  }

  // ... existing remove logic
};
```

#### 2.6 Add Liquidity - AddLiquidityModal

**File**: `src/app/(site)/market/trading-panel/modal/add-liquidity.tsx`

```typescript
const AddLiquidityModal = ({ ... }) => {
  const { checkBalanceForAction } = useBalanceCheck();
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);

  const handleConfirm = async () => {
    // Check balance FIRST
    const { canProceed } = checkBalanceForAction('add_liquidity');
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }

    // ... existing add liquidity logic
  };
};
```

## Logic Flow Diagram

```
┌─────────────────────────────────┐
│ User Clicks Action Button       │
│ (Place Bet, Update, Cashout,    │
│  Claim Fees, Remove Liquidity)  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Check User USDC Balance         │
│ usdBalance >= PLATFORM_FEE?     │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    │         ▼
    │    ┌─────────────────────────┐
    │    │ Show "Balance Too Low"  │
    │    │ Modal                   │
    │    │                         │
    │    │ Options:                │
    │    │ 1. Deposit              │
    │    │ 2. Close & Cancel       │
    │    └─────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Proceed with Transaction        │
│ - Open confirmation modal       │
│ - Execute blockchain tx         │
│ - Show success/error            │
└─────────────────────────────────┘
```

## Determining When to Show Modal

### Rule: Check Balance BEFORE Action Execution

```typescript
// ✅ CORRECT: Check before action
const handleAction = async () => {
  const { canProceed } = checkBalanceForAction("action_type");
  if (!canProceed) {
    setShowBalanceTooLowModal(true);
    return; // STOP HERE
  }
  // Only proceed if balance check passed
  await executeAction();
};

// ❌ WRONG: Check after action started
const handleAction = async () => {
  await executeAction(); // Too late!
  if (!hasBalance) {
    // User already paid gas
    showError();
  }
};
```

### Special Cases

#### A. Place Bet with 100% of Balance

```typescript
const handlePlaceBet = async () => {
  const betAmount = parseFloat(state.amount);
  const balance = parseFloat(usdBalance);
  const { platformFee } = useBalanceCheck();

  // User needs: betAmount + platformFee
  const totalRequired = betAmount + platformFee;

  if (balance < totalRequired) {
    setShowBalanceTooLowModal(true);
    return;
  }

  // If user is betting 100% of balance, warn them about fees
  if (betAmount >= balance - platformFee) {
    // Automatically reduce bet amount to: balance - platformFee
    // OR show the balance too low modal
    setShowBalanceTooLowModal(true);
    return;
  }

  // Proceed with bet
};
```

#### B. User Has Position but $0 Balance

```typescript
// Example scenario:
// Position Value: $10.00
// Wallet Balance: $0.00
// Action: Update Position

const handleUpdate = async () => {
  // Even though position is worth $10, wallet has $0
  const { canProceed } = checkBalanceForAction("update");

  if (!canProceed) {
    // Show modal - user MUST deposit to wallet
    setShowBalanceTooLowModal(true);
    return;
  }
};
```

## Constants Configuration

**File**: `src/constants/fees.ts` (create new)

```typescript
export const PLATFORM_FEES = {
  PLACE_BET: 0.05, // $0.05
  UPDATE_POSITION: 0.05, // $0.05
  CASHOUT: 0.05, // $0.05
  CLAIM_FEES: 0.02, // $0.02 (lower for simple claim)
  REMOVE_LIQUIDITY: 0.05, // $0.05
  ADD_LIQUIDITY: 0.05, // $0.05
  CLAIM_WINNINGS: 0.02, // $0.02
} as const;

export const MIN_BALANCE_REQUIRED = 0.05; // Minimum to perform any action

// Get fee for specific action
export const getFeeForAction = (action: keyof typeof PLATFORM_FEES): number => {
  return PLATFORM_FEES[action];
};
```

## Testing Checklist

### Manual Testing Scenarios

- [ ] **Zero Balance Tests**

  - [ ] Try to place bet with $0 balance → Shows modal
  - [ ] Try to update position with $0 balance → Shows modal
  - [ ] Try to cashout with $0 balance → Shows modal
  - [ ] Try to claim fees with $0 balance → Shows modal
  - [ ] Try to remove liquidity with $0 balance → Shows modal

- [ ] **Insufficient Balance Tests**

  - [ ] Wallet: $0.03, Required: $0.05 → Shows modal
  - [ ] Wallet: $10.00, Bet: $9.98 → Should work ($0.02 left for fees)
  - [ ] Wallet: $10.00, Bet: $10.00 → Shows modal (nothing left for fees)

- [ ] **Modal Functionality**

  - [ ] "Deposit" button opens deposit modal
  - [ ] X button closes modal
  - [ ] Clicking outside closes modal
  - [ ] Modal shows correct message for each action type

- [ ] **Edge Cases**
  - [ ] User has $100 position but $0 wallet → Cannot update/cashout/claim
  - [ ] User deposits during modal → Modal closes, action proceeds
  - [ ] Network switch during balance check → Rechecks balance

### Automated Tests

```typescript
// tests/balance-check.test.ts
describe("Balance Check", () => {
  it("should prevent bet when balance too low", async () => {
    const balance = 0.02;
    const requiredFee = 0.05;
    expect(canProceed(balance, requiredFee)).toBe(false);
  });

  it("should allow bet when balance sufficient", async () => {
    const balance = 10.0;
    const requiredFee = 0.05;
    expect(canProceed(balance, requiredFee)).toBe(true);
  });

  it("should show modal when trying to use 100% of balance", async () => {
    const balance = 10.0;
    const betAmount = 10.0;
    const fee = 0.05;
    expect(balance >= betAmount + fee).toBe(false);
  });
});
```

## Implementation Order

### Sprint 1: Core Components (Week 1)

1. Create `BalanceTooLowModal` component
2. Create `useBalanceCheck` hook
3. Create constants file for fees
4. Write unit tests

### Sprint 2: Primary Actions (Week 2)

5. Integrate with Place Bet (UnifiedModal)
6. Integrate with Update Position (UnifiedModal)
7. Integrate with Cash Out (UnifiedModal)
8. Test primary flows

### Sprint 3: Liquidity Actions (Week 3)

9. Integrate with Claim Fees (ActiveLiquidityPosition)
10. Integrate with Remove Liquidity (ActiveLiquidityPosition)
11. Integrate with Add Liquidity (AddLiquidityModal)
12. Test liquidity flows

### Sprint 4: Polish & Edge Cases (Week 4)

13. Handle 100% balance bet scenario
14. Add balance refresh after deposit
15. UI polish and animations
16. Full regression testing

## API Changes (If Needed)

Currently, balance checks happen client-side before API calls. No API changes required, but we could optionally add server-side validation:

```typescript
// Optional: Add to all transaction endpoints
export async function POST(req: NextRequest) {
  const dbUser = await getUserById(session.user.id);

  // Server-side balance check (extra safety)
  const userBalance = await getUserUSDCBalance(dbUser.walletAddress);
  const requiredFee = PLATFORM_FEES.PLACE_BET;

  if (userBalance < requiredFee) {
    return NextResponse.json(
      { error: "INSUFFICIENT_BALANCE", requiredFee },
      { status: 400 }
    );
  }

  // Proceed with transaction
}
```

## Success Criteria

✅ **Phase 1 Complete When:**

- Modal component exists and matches design
- Balance check hook works correctly
- Unit tests pass

✅ **Phase 2 Complete When:**

- All 7 action types show modal when balance too low
- "Deposit" button correctly opens deposit modal
- No transactions can proceed with insufficient balance

✅ **Final Success When:**

- Zero failed transactions due to insufficient gas
- Users understand they need to deposit before actions
- Smooth user experience with clear messaging
- All edge cases handled gracefully

## Related Files

- `src/hooks/useAuth.ts` - User balance source
- `src/hooks/useUSDCBalance.ts` - USDC balance reader
- `src/components/WithdrawalModal.tsx` - Deposit modal
- `src/app/(site)/market/trading-panel/components/UnifiedModal.tsx` - Place/Update/Cashout
- `src/components/common/ActiveLiquidityPosition.tsx` - Liquidity actions
- `src/constants/index.ts` - Existing constants file

## Notes

- Platform fees are **approximate** - adjust based on actual gas costs
- Balance check is **client-side** for UX speed - server validates anyway
- Modal should be **non-dismissible** during pending transactions
- Consider adding **auto-refresh** of balance after deposit completes
