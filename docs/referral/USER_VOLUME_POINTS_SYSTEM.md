# User Volume & Points System

## 🎯 How It Works

### Volume Calculation (Current Implementation)

**Data Source**: `UserPosition` table  
**Formula**:

```typescript
totalVolume = (sum of all UserPosition.amount where amount > 0) × 2
userPoints = totalVolume × 1.0  // 1 point per $1 traded
```

**What's Included**:

- ✅ ALL historical trades (active + closed positions)
- ✅ Every market the user has traded on
- ✅ All time periods (no date restrictions)
- ✅ Only counts actual trade amounts (filters out negative amounts)

**The × 2 Multiplier**:

- Accounts for both sides of each trade (input + output)
- Example: User buys $50 of YES tokens → Volume = $100 ($50 in + $50 worth out)

**Live Endpoints**:

- User: `/api/users/volume` (returns single user's volume)
- Admin: `/api/admin/users/points` (returns all users ranked by points)

---

## 📊 Current Status

### ✅ What's Working NOW

**Infrastructure**:

- ✅ Volume tracking fully operational
- ✅ Historical data from all trades in `UserPosition` table
- ✅ API endpoints deployed and tested
- ✅ Admin leaderboard page at `/admin/user-points`

**Calculation**:

- ✅ Simple 1:1 ratio (1 point = $1 volume)
- ✅ Includes all historical positions
- ✅ Real-time calculation (no caching)
- ✅ Ranking system working

---

## 🚀 Quick Implementation Guide

### Already Completed ✅

1. **Volume Tracking**: `/api/users/volume`
2. **Admin Points Endpoint**: `/api/admin/users/points`
3. **Admin Dashboard**: `/admin/user-points`
4. **Frontend Hook**: `useUserVolumeTraded`

### To Launch Public Points (30 min - 2 hours)

#### Option A: On-Demand (Fastest - 30 mins)

```typescript
// Create: /api/users/points/route.ts
export async function GET() {
  const session = await auth();
  const volumeData = await prisma.userPosition.aggregate({
    where: { userId: session.user.id, amount: { gt: 0 } },
    _sum: { amount: true },
  });

  const totalVolume = Number(volumeData._sum.amount || 0) * 2;
  const points = totalVolume * 1.0;

  // Calculate rank by comparing to all users
  return NextResponse.json({ points, totalVolume, rank });
}
```

#### Option B: With Storage (Recommended - 2-3 hours)

1. Add `UserPoints` table to database
2. Create cron job to calculate points daily
3. Query from stored points (faster for leaderboards)

---

## 📋 Database Schema

### Existing (No Changes Needed)

```prisma
model UserPosition {
  id        String   @id
  userId    String
  amount    Float    // Trade amount
  marketId  String
  txHash    String?
  timestamp DateTime
  // ... other fields
}
```

### Optional: For Stored Points

```prisma
model UserPoints {
  id            String   @id @default(uuid())
  userId        String
  period        String   // "all-time", "2025-01", etc.
  tradingVolume Decimal  @db.Decimal(18, 2)
  tradeCount    Int      @default(0)
  tradingPoints Decimal  @db.Decimal(18, 2) @default(0)
  referralPoints Decimal @db.Decimal(18, 2) @default(0)
  bonusPoints   Decimal  @db.Decimal(18, 2) @default(0)
  totalPoints   Decimal  @db.Decimal(18, 2)
  rank          Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])

  @@unique([userId, period])
  @@index([period, totalPoints])
}
```

### Referral System Tables (Phase 2)

```prisma
model UserReferral {
  id                String   @id @default(uuid())
  userId            String   // The user who owns this referral relationship
  referralCode      String   // Username-based code (e.g. "grandpamf")
  referredById      String?  // Layer 1: Who referred this user
  referredByCode    String?  // The code they used to sign up
  usedReferralBonus Boolean  @default(false) // Has 10% trading boost
  createdAt         DateTime @default(now())

  user              User     @relation("UserReferrals", fields: [userId], references: [id])
  referredBy        User?    @relation("ReferredUsers", fields: [referredById], references: [id])

  @@unique([userId])
  @@unique([referralCode])
  @@index([referredById])
  @@index([referralCode])
  @@map("user_referrals")
}

model ReferralStats {
  id                  String   @id @default(uuid())
  userId              String
  totalReferred       Int      @default(0) // Layer 1 count
  activeReferred      Int      @default(0) // Layer 1 active (have traded)
  layer2Count         Int      @default(0) // Layer 2 count
  layer1Points        Decimal  @db.Decimal(18, 2) @default(0)
  layer2Points        Decimal  @db.Decimal(18, 2) @default(0)
  totalReferralPoints Decimal  @db.Decimal(18, 2) @default(0)
  isTopReferrer       Boolean  @default(false) // Top 10 status
  kolTier             String?  // "bronze", "silver", "gold", null
  kolMultiplier       Decimal? @db.Decimal(5, 2) // 1.10, 1.15, 1.20
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user                User     @relation(fields: [userId], references: [id])

  @@unique([userId])
  @@index([totalReferralPoints])
  @@map("referral_stats")
}
```

**User Model Updates**:

```prisma
model User {
  // ... existing fields

  // Referral relationships
  referralInfo    UserReferral?  @relation("UserReferrals")
  referredUsers   UserReferral[] @relation("ReferredUsers")
  referralStats   ReferralStats?

  // ... existing relations
}
```

---

## ⚠️ Current Limitations

### Phase 1 Scope (Current Implementation)

**Includes**:

- ✅ Trading volume from market positions
- ✅ Trade count
- ✅ All-time historical data
- ✅ Simple ranking

**Excludes** (Add in Phase 2 & 3):

- ❌ Referral system (see Phase 2 section below)
- ❌ Liquidity Provider (LP) fees/rewards
- ❌ Options trading volume
- ❌ Bonus multipliers or streaks
- ❌ Weekly/monthly leaderboards (only all-time)
- ❌ Point history tracking
- ❌ Real-time point awards on trade

### Why × 2?

The current implementation doubles volume because:

- Each trade involves an input (USDC spent) and output (tokens received)
- The `UserPosition.amount` field captures one side
- Multiplying by 2 approximates total capital flow

**Example**:

```
User trades $100 USDC for YES tokens worth $100
UserPosition.amount = 100
totalVolume = 100 × 2 = 200
points = 200
```

---

## 🎮 Future Enhancements

### Phase 2: Referral System & Multi-Activity Points

**Priority: Referral System**

- 2-layer referral tracking (10% Layer 1, 5% Layer 2)
- Username-based referral codes
- 10% trading boost for users who use a code
- Custom signup flow with referrer profile
- Referral analytics dashboard

**Additional Features**:

- Add LP fee rewards (higher point multiplier)
- Include options trading volume
- Add bonus multipliers for:
  - High volume traders
  - Market makers
  - Trading streaks
  - Early adopters

### Phase 3: Advanced Features & Referral Bonuses

**Referral Bonuses** (see detailed section above):

- Top 10 referrer bonus (10% boost to total points)
- KOL tier deals (Bronze/Silver/Gold: +10%/+15%/+20%)
- Advanced referral analytics
- Referral leaderboards

**System Enhancements**:

- Real-time point awards on each trade
- Point transaction history
- Weekly/monthly/seasonal leaderboards
- Achievement badges and milestones
- Point redemption system
- Per-market leaderboards

---

## 📝 Key Files

### Current Implementation

- `/src/app/(site)/api/users/volume/route.ts` - User volume endpoint
- `/src/app/(site)/api/admin/users/points/route.ts` - Admin points endpoint
- `/src/app/(admin)/admin/user-points/page.tsx` - Admin leaderboard page
- `/src/hooks/useUserVolumeTraded.tsx` - Volume React hook

### To Create for Public Launch

- `/src/app/(site)/api/users/points/route.ts` - Public points endpoint
- `/src/hooks/useUserPoints.tsx` - Points React hook
- `/src/services/pointsService.ts` - Points calculation logic (if using storage)

---

## 🔧 Configuration

### Current Points Formula

```typescript
const POINT_MULTIPLIER = 1.0; // 1 point per $1 traded

function calculatePoints(tradingVolume: number): number {
  return tradingVolume * POINT_MULTIPLIER;
}
```

### Example Calculations

| Trading Volume | Points Earned |
| -------------- | ------------- |
| $100           | 100 points    |
| $1,000         | 1,000 points  |
| $10,000        | 10,000 points |

---

## 🤝 Referral System (Phase 2)

### Points Distribution Breakdown

**Base Formula**:

```typescript
tradingPoints = tradingVolume × 1.0  // $1 volume = 1 point
```

**Referral Rewards** (for referrers):

```typescript
// You earn points from your referrals' trading
referralPoints = referredUserVolume × 0.10  // 10% of their volume as points
```

**Using a Referral Code** (for new users):

```typescript
// Users who sign up with a code get a boost
boostedTradingPoints = tradingVolume × 1.10  // 10% boost to YOUR trading points
```

**Important**:

- Both trading volume points and referral points contribute to your total points balance
- They are the same point type, just earned differently
- Referral bonus applies to trading volume points, NOT to referral points earned

### Referral Layers (2-Layer System)

To prevent infinite daisy chains, referral rewards are capped at 2 layers:

**Layer 1 - Direct Referrals**:

```
You refer User A → You get 10% of User A's trading volume as points
```

**Layer 2 - Indirect Referrals**:

```
User A refers User B → You get 5% of User B's trading volume as points
```

**Example Calculation**:

```
Your trading: $1,000 volume = 1,000 points

Layer 1 Referrals:
- User A trades $500 → You earn 50 points (10%)
- User B trades $300 → You earn 30 points (10%)

Layer 2 Referrals:
- User A referred User C who trades $200 → You earn 10 points (5%)
- User B referred User D who trades $400 → You earn 20 points (5%)

Your Total Points = 1,000 + 50 + 30 + 10 + 20 = 1,110 points
```

### Using a Referral Code (New User Bonus)

When a new user signs up with a referral code:

**Benefit to New User**:

```typescript
// 10% boost to all their trading volume points
baseTradingPoints = tradingVolume × 1.0
bonusPoints = tradingVolume × 0.10
totalUserPoints = tradingVolume × 1.10
```

**Example**:

- User signs up with referral code "grandpamf"
- User trades $1,000 volume
- Without code: 1,000 points
- With code: 1,100 points (10% boost)

**Note**: This 10% boost is NOT added to referral points earned from others.

### Referral Links & UX Flow

**Link Format**:

```
https://www.callmybluff.io/referral/[username]
Code: [username]

Example:
Link: https://www.callmybluff.io/referral/grandpamf
Code: grandpamf
```

**Signup Flow Requirements**:

1. **"Enter referral code" field on standard signup**

   - Available on regular signup modal
   - Optional field for users

2. **Custom signup flow when clicking referral link**:

   - Link click → Opens Bluff signup modal directly
   - Left-hand modal graphic replaced with:
     - Referrer's profile picture
     - Text: "You will receive a 10% boost to your trading points for using [referrer's username]'s code!"
   - Referral code pre-filled automatically
   - User only needs to:
     - Add email/password, OR
     - Connect via X (Twitter)

3. **Frictionless experience**:
   - No extra steps for user
   - Code already applied
   - Visual confirmation of bonus

**Referral Analytics** (for referrers):

Track and display:

- Total users signed up using your code
- Number of active users (have made trades)
- Total referral points earned
- Layer 1 vs Layer 2 breakdown

**Example Dashboard**:

```
Your Referral Stats:
- 5 users signed up (3 active)
- 250 referral points earned
  - Layer 1: 200 points (from 3 direct referrals)
  - Layer 2: 50 points (from 2 indirect referrals)
```

---

## 🏆 Referral Bonus Features (Phase 3 - Later Implementation)

### Top Referrer Bonus

**Top 10 Referrers**: Receive an additional 10% boost to their TOTAL points accumulation

```typescript
// If you're in top 10 referrers
basePoints = tradingPoints + referralPoints
topReferrerBonus = basePoints × 0.10
totalPoints = basePoints + topReferrerBonus
```

**Example**:

- You have 10,000 points (5,000 trading + 5,000 referral)
- You're #8 on referrer leaderboard
- You get 1,000 bonus points (10% of 10,000)
- New total: 11,000 points

### KOL (Key Opinion Leader) Deals

Negotiable tier-based referral point boosts for influencers/partners:

**Bronze Tier**: +10% referral points multiplier

```typescript
referralPoints = referredUserVolume × 0.10 × 1.10  // 11% effective rate
```

**Silver Tier**: +15% referral points multiplier

```typescript
referralPoints = referredUserVolume × 0.10 × 1.15  // 11.5% effective rate
```

**Gold Tier**: +20% referral points multiplier

```typescript
referralPoints = referredUserVolume × 0.10 × 1.20  // 12% effective rate
```

**Example (Gold Tier KOL)**:

- Standard referrer: User trades $1,000 → Earn 100 referral points
- Gold KOL: User trades $1,000 → Earn 120 referral points (20% bonus)

**Use Cases**:

- Partner with crypto influencers
- Reward community leaders
- Incentivize high-quality user acquisition
- Customizable per agreement

---

## ✅ Testing

**Admin Dashboard Available Now**:

1. Navigate to `/admin-login`
2. Log in with admin credentials
3. Click "User Points" in sidebar
4. View all users ranked by points with:
   - Total points
   - Trading volume
   - Trade count
   - Rank badges for top performers

**What You'll Verify**:

- ✅ Volume calculation is working correctly
- ✅ Points match expected 1:1 ratio with volume
- ✅ All historical trades are counted
- ✅ Rankings are accurate
- ✅ User data displays properly

---

## 📖 Summary

**Current State**:

- Volume tracking is **fully operational**
- Points can be calculated from existing data
- Admin dashboard is live for testing
- No database changes needed to launch basic points

**Next Step**:

- Add public-facing points endpoint
- Display points on user profiles
- Launch basic leaderboard

**Timeline**:

- MVP: 30 minutes (on-demand calculation)
- Production: 2-3 hours (with database storage)

**Future**:

- Phase 2: Referral system (2-layer, username-based), LP, Options
- Phase 3: Referral bonuses (top 10, KOL deals), real-time tracking, advanced gamification
