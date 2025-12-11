# Profile Page P&L Documentation

Complete documentation for the Profile Page P&L (Profit & Loss) system.

---

## 📄 Main Document

### [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md) ⚡ **READ THIS**

**The definitive guide** covering the entire P&L system from bug discovery to implementation.

**Everything you need:**

- 📊 Visual component breakdown with ASCII diagrams
- 🐛 Original bug explanation with detailed scenarios
- ✅ Complete fix implementation (code + line numbers)
- 🔄 Unrealized P&L for active positions
- 📋 P&L breakdown modal with position tables
- 🔧 Calculation discrepancy analysis and fix
- ⚙️ Environment variables configuration
- 📝 All code changes with file paths
- ✅ Comprehensive testing checklist
- 🚀 Future improvements with implementation code
  - Historical P&L chart (Prisma schema, API endpoints, frontend)
  - LP position tracking (initial investment)
  - Performance optimization (caching, batching, background jobs)

**When to use:**

- ✅ You're implementing the P&L fix
- ✅ You're debugging P&L issues
- ✅ You're adding new P&L features
- ✅ You need to understand how P&L works
- ✅ You're onboarding to the project

---

## 🎯 Quick Reference

### The P&L Formula

```
Total P&L = Realized Profit + Unrealized Profit + Onchain LP Fees + LP Value
```

### Components

1. **Realized Profit**: Net profit from resolved markets (claims/cashouts)
2. **Unrealized Profit**: Current value minus investment in active positions
3. **Onchain LP Fees**: Uncollected fees from Uniswap V4 positions
4. **LP Value**: Current value of liquidity position tokens

### Key Files

**Backend:**

- `src/app/(site)/api/users/profit/route.ts` - Main P&L calculation
- `src/app/(site)/api/bets/swap/[marketId]/route.ts` - Bet recording (profit: 0)
- `src/app/(site)/api/bets/claim-winnings/[marketId]/route.ts` - Claim recording (net profit)
- `src/app/(site)/api/bets/cashout/[marketAddress]/route.ts` - Cashout recording (net profit)

**Frontend:**

- `src/app/(site)/profile/common/profile-stats.tsx` - Profile P&L display
- `src/components/profile/PnLBreakdownDialog.tsx` - Breakdown modal
- `src/hooks/useUserProfit.tsx` - P&L data hook

---

## 🔑 Critical Changes Made

### ✅ Fixed Issues

1. **Bet recording bug** - Changed `profit: -amountIn` → `profit: 0`
2. **Claim/cashout bug** - Now records `netProfit = received - totalInvested`
3. **Missing unrealized P&L** - Added active position tracking via onchain balances
4. **Calculation discrepancy** - Fixed price formula (removed incorrect ÷100 ×2)
5. **Missing transparency** - Added breakdown modal showing all components

### 🎉 New Features

1. **Unrealized P&L** - Shows profit/loss on active positions
2. **P&L Breakdown Modal** - Detailed view with:
   - Realized positions table (resolved markets)
   - Unrealized positions table (active markets)
   - Historical investment vs current wallet holdings
   - LP fees and liquidity sections
   - Calculation formula display
3. **Environment Flag** - `NEXT_PUBLIC_SHOW_PNL_BREAKDOWN=true` to enable modal

---

## 🚀 Common Tasks

### Understanding P&L Calculation

→ See [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md) - Section 1 (Overview)

### Implementing The Fix

→ See [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md) - Section 3 (The Fix)

### Debugging P&L Issues

→ See [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md) - Section 9 (Testing Checklist)

### Adding New Features

→ See [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md) - Section 11 (Future Improvements)

### Enabling P&L Breakdown Modal

→ See [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md) - Section 7 (Environment Variables)

---

## 📊 Data Flow

```
User Transaction
      ↓
Record in UserPosition
      ↓
Calculate Components:
  • Realized (DB query on RESOLVED markets)
  • Unrealized (Onchain balances + DB investments)
  • LP Fees (External API)
  • LP Value (DB + market prices)
      ↓
Sum All Components
      ↓
Display in Profile
```

---

## ⚙️ Configuration

### Enable P&L Breakdown Modal

```bash
# .env or .env.local
NEXT_PUBLIC_SHOW_PNL_BREAKDOWN=true
```

This shows an info button on the P&L card that opens the detailed breakdown modal.

---

## 📞 Need Help?

**Everything is in one place:**  
→ [PNL_SYSTEM_COMPLETE.md](./PNL_SYSTEM_COMPLETE.md)

**Specific questions:**

- How does P&L work? → Section 1
- What was the bug? → Section 2
- How do I fix it? → Section 3
- How do I test it? → Section 9
- How do I add features? → Section 11

---

_Last updated: November 14, 2025_  
_Version: 3.0 - Consolidated single document_
