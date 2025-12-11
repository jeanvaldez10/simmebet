# Referral System Implementation Plan

## 🎯 Current Status: Phase 2 Complete ✅

> **Quick Summary**: Users can sign up with referral codes and get a 10% trading bonus. Referrers can see who signed up, but don't yet EARN points from their referrals' trading volume. **Next**: Implement Layer 1 & Layer 2 referral earnings.

### ✅ What's Working (Ready to Test!)

1. **Referral Link System** - Links work: `callmybluff.io/referral/[username]`
2. **Signup Integration** - New users automatically linked to referrer
3. **Manual Code Entry** - Users can type referral codes with real-time validation
4. **Visual Validation** - Lucide icons (green checkmark, red X, spinner) for validation states
5. **10% Trading Bonus** - Referred users get bonus points applied automatically
6. **Database Schema** - UserReferral and ReferralStats tables created
7. **API Endpoints** - Validation, creation, and points endpoints functional
8. **Self-Referral Prevention** - Users cannot refer themselves
9. **Expiry Handling** - Referral codes expire after 30 days
10. **localStorage Caching** - Codes persist across page navigation (30 days)
11. **Referral Modal UI** - Points displayed in bright green (#00FFB8)
12. **Referred Friends Count** - Real-time count from database
13. **Points Breakdown** - Shows trading points, bonus, and referral points
14. **UI Polish** - Proper spacing, green accent colors, clean layout

### 🚧 What's Next (Phase 3)

1. **Referral Points Calculation** - Earn 10% of Layer 1 referrals' volume as points
2. **Layer 2 Points** - Earn 5% of indirect referrals' (Layer 2) volume
3. **Referral Volume Tracking** - Show total volume from your referrals
4. **Active Referrals** - Count users who have actually traded
5. **Stats Caching** - Populate ReferralStats table with volume/points data
6. **Admin Dashboard** - View all referral metrics system-wide

---

## 🎯 Original Goal

Build a 2-layer referral tracking system where:

- Users get unique username-based referral codes/links ✅
- New users who sign up with a code get 10% boost to their trading points ✅
- Referrers earn 10% of Layer 1 referrals' volume as points 🚧
- Referrers earn 5% of Layer 2 referrals' volume as points 🚧

---

## 📋 Requirements Summary

From `USER_VOLUME_POINTS_SYSTEM.md`:

### Core Features

1. **Username-based referral codes** (e.g., `grandpamf`)
2. **Referral links**: `https://callmybluff.io/referral/[username]`
3. **2-layer referral tracking** (direct + indirect)
4. **10% trading boost** for users who use a code
5. **Referral points**: 10% Layer 1, 5% Layer 2
6. **Custom signup flow** when clicking referral link
7. **Referral analytics** (signups, active users, points earned)

### Future Features (Phase 3+)

- Top 10 referrer bonus (10% boost to total points)
- KOL tier deals (custom multipliers for influencers)
- Automated cron job for point calculations
- Advanced referral analytics and leaderboards

---

## 🗄️ Database Schema

### 1. UserReferral Table

Tracks each user's referral relationship.

```prisma
model UserReferral {
  id                String   @id @default(uuid())
  userId            String   @unique // The user who this record is for
  referralCode      String   @unique // Their username (used as referral code)
  referredById      String?  // Who referred them (Layer 1)
  referredByCode    String?  // The code they used to sign up
  usedReferralBonus Boolean  @default(false) // Has 10% trading boost active
  signupDate        DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  user              User     @relation("UserReferrals", fields: [userId], references: [id], onDelete: Cascade)
  referredBy        User?    @relation("ReferredUsers", fields: [referredById], references: [id], onDelete: SetNull)

  @@index([referralCode])
  @@index([referredById])
  @@index([referredByCode])
  @@map("user_referrals")
}
```

**Key Fields**:

- `userId`: The user this record belongs to
- `referralCode`: Their username (used for sharing)
- `referredById`: User ID of who referred them (null if organic signup)
- `referredByCode`: The actual code/username they entered
- `usedReferralBonus`: Whether they get the 10% boost

### 2. ReferralStats Table

Aggregated stats for each referrer.

```prisma
model ReferralStats {
  id                  String   @id @default(uuid())
  userId              String   @unique

  // Layer 1 Stats (Direct Referrals)
  layer1Count         Int      @default(0)      // Total Layer 1 referrals
  layer1Active        Int      @default(0)      // Layer 1 who have traded
  layer1Volume        Decimal  @db.Decimal(18, 2) @default(0)
  layer1Points        Decimal  @db.Decimal(18, 2) @default(0)

  // Layer 2 Stats (Indirect Referrals)
  layer2Count         Int      @default(0)      // Total Layer 2 referrals
  layer2Active        Int      @default(0)      // Layer 2 who have traded
  layer2Volume        Decimal  @db.Decimal(18, 2) @default(0)
  layer2Points        Decimal  @db.Decimal(18, 2) @default(0)

  // Total Stats
  totalReferralPoints Decimal  @db.Decimal(18, 2) @default(0)

  lastCalculated      DateTime @default(now())
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([totalReferralPoints])
  @@map("referral_stats")
}
```

**Key Fields**:

- Separate tracking for Layer 1 and Layer 2
- Volume and points tracked separately per layer
- `layer1Active` / `layer2Active`: Users who have actually traded
- `lastCalculated`: Timestamp of last points calculation

### 3. Update User Model

```prisma
model User {
  // ... existing fields

  // Referral relationships
  referralInfo    UserReferral?  @relation("UserReferrals")    // Their own referral data
  referredUsers   UserReferral[] @relation("ReferredUsers")    // Users they referred
  referralStats   ReferralStats?                               // Their referral stats

  // ... existing relations
}
```

### 4. Database Migration

**Steps**:

1. Add the `UserReferral` and `ReferralStats` models to `prisma/schema.prisma`
2. Update the `User` model with referral relations
3. Run: `npx prisma migrate dev --name add_referral_system`
4. Run: `npx prisma generate` to update Prisma client

---

## 🔗 Referral Link System

### How It Works

**Link Format**:

```
https://callmybluff.io/referral/[username]
```

**Examples**:

- `https://callmybluff.io/referral/grandpamf`
- `https://callmybluff.io/referral/john_doe`
- `https://callmybluff.io/referral/cryptoking`

### URL Routing

Create a new route: `app/(site)/referral/[username]/page.tsx`

```typescript
// app/(site)/referral/[username]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  useEffect(() => {
    // Store referral code in localStorage
    if (username) {
      localStorage.setItem("referralCode", username);
      localStorage.setItem(
        "referralCodeExpiry",
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ); // 7 days
    }

    // Redirect to signup modal
    router.push("/?signup=true&referral=" + username);
  }, [username, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
```

### Referral Code Storage

**Option 1: localStorage (Client-side)**

```typescript
// Store referral code when user clicks link
localStorage.setItem("referralCode", username);
localStorage.setItem("referralCodeExpiry", timestamp);

// Retrieve on signup
const referralCode = localStorage.getItem("referralCode");
const expiry = localStorage.getItem("referralCodeExpiry");

if (expiry && Date.now() < parseInt(expiry)) {
  // Code is still valid
  applyReferralCode(referralCode);
}
```

**Option 2: URL Parameter**

```typescript
// Pass through URL
router.push("/?signup=true&ref=" + username);

// Read from URL in signup modal
const searchParams = useSearchParams();
const referralCode = searchParams.get("ref");
```

**Recommended: Use Both**

- URL parameter for immediate use
- localStorage as backup if user navigates away
- Clear localStorage after successful signup

---

## 👤 User Signup Flow

### Step 1: Detect Referral Code

```typescript
// components/modals/SignupModal.tsx
const [referralCode, setReferralCode] = useState<string>("");
const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);

useEffect(() => {
  // Check URL parameter first
  const urlRef = searchParams.get("ref");

  // Check localStorage as backup
  const storedRef = localStorage.getItem("referralCode");
  const expiry = localStorage.getItem("referralCodeExpiry");

  const code =
    urlRef || (expiry && Date.now() < parseInt(expiry) ? storedRef : null);

  if (code) {
    setReferralCode(code);
    fetchReferralInfo(code); // Validate and get referrer info
  }
}, [searchParams]);

async function fetchReferralInfo(code: string) {
  const response = await fetch(`/api/referral/validate?code=${code}`);
  if (response.ok) {
    const data = await response.json();
    setReferralInfo(data); // { username, avatar, isValid }
  }
}
```

### Step 2: Custom Signup UI

```typescript
// If referral code exists, show custom UI
{
  referralInfo && (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg mb-4">
      <Avatar src={referralInfo.avatar} size="lg" />
      <div>
        <p className="text-sm text-gray-600">
          You will receive a{" "}
          <span className="font-bold text-blue-600">10% boost</span> to your
          trading points for using{" "}
          <span className="font-bold">{referralInfo.username}'s</span> code!
        </p>
      </div>
    </div>
  );
}

{
  /* Pre-filled referral code input */
}
<Input
  label="Referral Code (Optional)"
  value={referralCode}
  onChange={(e) => setReferralCode(e.target.value)}
  placeholder="Enter referral code"
  disabled={!!referralInfo} // Disable if code was pre-filled
/>;
```

### Step 3: Store Referral on Signup

```typescript
// On successful signup
async function handleSignup(userData) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      ...userData,
      referralCode, // Include referral code
    }),
  });

  if (response.ok) {
    // Clear localStorage after successful signup
    localStorage.removeItem("referralCode");
    localStorage.removeItem("referralCodeExpiry");
  }
}
```

---

## 🔌 API Endpoints

### 1. Validate Referral Code

**Endpoint**: `GET /api/referral/validate?code=[username]`

```typescript
// app/(site)/api/referral/validate/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  // Find user by username (referral code)
  const referrer = await prisma.user.findUnique({
    where: { username: code },
    select: {
      id: true,
      username: true,
      avatar: true,
      image: true,
    },
  });

  if (!referrer) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  return NextResponse.json({
    isValid: true,
    username: referrer.username,
    avatar: referrer.avatar || referrer.image,
  });
}
```

### 2. Create User with Referral

**Endpoint**: `POST /api/auth/signup` (modify existing)

```typescript
// app/(site)/api/auth/signup/route.ts
export async function POST(request: NextRequest) {
  const { email, password, username, referralCode } = await request.json();

  // Create user (existing logic)
  const user = await prisma.user.create({
    data: { email, password, username },
  });

  // Handle referral if code provided
  if (referralCode) {
    await handleReferralSignup(user.id, username, referralCode);
  } else {
    // Create UserReferral without referredById (organic signup)
    await prisma.userReferral.create({
      data: {
        userId: user.id,
        referralCode: username,
        usedReferralBonus: false,
      },
    });
  }

  return NextResponse.json({ success: true, user });
}

async function handleReferralSignup(
  userId: string,
  username: string,
  referralCode: string
) {
  // Find referrer
  const referrer = await prisma.user.findUnique({
    where: { username: referralCode },
    include: { referralInfo: true },
  });

  if (!referrer) {
    throw new Error("Invalid referral code");
  }

  // Create UserReferral for new user
  await prisma.userReferral.create({
    data: {
      userId: userId,
      referralCode: username, // Their own code (their username)
      referredById: referrer.id,
      referredByCode: referralCode,
      usedReferralBonus: true, // They get 10% boost
    },
  });

  // Update referrer's Layer 1 stats
  await prisma.referralStats.upsert({
    where: { userId: referrer.id },
    update: {
      layer1Count: { increment: 1 },
    },
    create: {
      userId: referrer.id,
      layer1Count: 1,
    },
  });

  // Check if referrer was also referred (Layer 2)
  if (referrer.referralInfo?.referredById) {
    await prisma.referralStats.upsert({
      where: { userId: referrer.referralInfo.referredById },
      update: {
        layer2Count: { increment: 1 },
      },
      create: {
        userId: referrer.referralInfo.referredById,
        layer2Count: 1,
      },
    });
  }
}
```

### 3. Get User Referral Stats

**Endpoint**: `GET /api/users/referral-stats`

```typescript
// app/(site)/api/users/referral-stats/route.ts
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await prisma.referralStats.findUnique({
    where: { userId: session.user.id },
  });

  const referralInfo = await prisma.userReferral.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    referralCode: referralInfo?.referralCode,
    usedReferralBonus: referralInfo?.usedReferralBonus,
    layer1Count: stats?.layer1Count || 0,
    layer1Active: stats?.layer1Active || 0,
    layer1Points: stats?.layer1Points || 0,
    layer2Count: stats?.layer2Count || 0,
    layer2Active: stats?.layer2Active || 0,
    layer2Points: stats?.layer2Points || 0,
    totalReferralPoints: stats?.totalReferralPoints || 0,
  });
}
```

### 4. Calculate Referral Points (On-Demand)

**Endpoint**: `GET /api/users/referral-points`

For initial implementation, we'll calculate referral points on-demand (similar to how volume is currently calculated). This avoids the need for a cron job.

```typescript
// app/(site)/api/users/referral-points/route.ts
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get users who were referred by this user (Layer 1)
  const layer1Referrals = await prisma.userReferral.findMany({
    where: {
      referredById: session.user.id,
    },
    include: {
      user: {
        include: {
          positions: {
            where: { amount: { gt: 0 } },
          },
        },
      },
    },
  });

  // Calculate Layer 1 stats
  let layer1Volume = 0;
  let layer1Active = 0;

  for (const referral of layer1Referrals) {
    const userVolume =
      referral.user.positions.reduce((sum, pos) => sum + pos.amount, 0) * 2;
    layer1Volume += userVolume;
    if (referral.user.positions.length > 0) {
      layer1Active++;
    }
  }

  const layer1Points = layer1Volume * 0.1; // 10% of Layer 1 volume

  // Get Layer 2 referrals (users referred by my referrals)
  const layer1UserIds = layer1Referrals.map((r) => r.userId);
  const layer2Referrals = await prisma.userReferral.findMany({
    where: {
      referredById: {
        in: layer1UserIds,
      },
    },
    include: {
      user: {
        include: {
          positions: {
            where: { amount: { gt: 0 } },
          },
        },
      },
    },
  });

  // Calculate Layer 2 stats
  let layer2Volume = 0;
  let layer2Active = 0;

  for (const referral of layer2Referrals) {
    const userVolume =
      referral.user.positions.reduce((sum, pos) => sum + pos.amount, 0) * 2;
    layer2Volume += userVolume;
    if (referral.user.positions.length > 0) {
      layer2Active++;
    }
  }

  const layer2Points = layer2Volume * 0.05; // 5% of Layer 2 volume

  const totalReferralPoints = layer1Points + layer2Points;

  return NextResponse.json({
    layer1Count: layer1Referrals.length,
    layer1Active,
    layer1Volume,
    layer1Points,
    layer2Count: layer2Referrals.length,
    layer2Active,
    layer2Volume,
    layer2Points,
    totalReferralPoints,
  });
}
```

**Note**: For better performance at scale, this can be replaced with a cron job in future (see Phase 3+ section).

---

## 📊 Points Calculation with Referrals

### Updated Points Endpoint

**Endpoint**: `GET /api/users/points` (Enhanced from existing `/api/users/volume`)

```typescript
// app/(site)/api/users/points/route.ts
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get trading volume (existing logic)
  const volumeData = await prisma.userPosition.aggregate({
    where: {
      userId: session.user.id,
      amount: { gt: 0 },
    },
    _sum: { amount: true },
    _count: true,
  });

  const tradingVolume = Number(volumeData._sum.amount || 0) * 2;
  let tradingPoints = tradingVolume * 1.0;
  let tradingBonus = 0;

  // 2. Check if user has referral bonus (10% boost)
  const referralInfo = await prisma.userReferral.findUnique({
    where: { userId: session.user.id },
  });

  if (referralInfo?.usedReferralBonus) {
    tradingBonus = tradingVolume * 0.1; // 10% boost
    tradingPoints += tradingBonus;
  }

  // 3. Get referral points (call the referral points endpoint)
  const referralResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/users/referral-points`,
    {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    }
  );

  let referralPoints = 0;
  if (referralResponse.ok) {
    const referralData = await referralResponse.json();
    referralPoints = referralData.totalReferralPoints || 0;
  }

  // 4. Calculate total
  const totalPoints = tradingPoints + referralPoints;

  return NextResponse.json({
    tradingVolume,
    tradingPoints: tradingPoints - tradingBonus, // Base trading points
    tradingBonus,
    referralPoints,
    totalPoints,
    tradeCount: volumeData._count,
  });
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/referral-system.test.ts

describe("Referral System", () => {
  test("validates referral code", async () => {
    const response = await fetch("/api/referral/validate?code=grandpamf");
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.isValid).toBe(true);
  });

  test("creates user with referral", async () => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        referralCode: "grandpamf",
      }),
    });
    expect(response.status).toBe(200);

    // Check UserReferral was created
    const referral = await prisma.userReferral.findFirst({
      where: { referralCode: "newuser" },
    });
    expect(referral?.referredByCode).toBe("grandpamf");
    expect(referral?.usedReferralBonus).toBe(true);
  });

  test("calculates Layer 1 points correctly", async () => {
    // User A refers User B
    // User B trades $1,000
    // User A should get 100 points (10%)

    await createUserTrade("userB", 500); // Creates $1,000 volume
    await calculateReferralPoints();

    const stats = await prisma.referralStats.findUnique({
      where: { userId: "userA" },
    });

    expect(stats?.layer1Points).toBe(100);
  });

  test("calculates Layer 2 points correctly", async () => {
    // User A refers User B
    // User B refers User C
    // User C trades $1,000
    // User A should get 50 points (5%)

    await createUserTrade("userC", 500);
    await calculateReferralPoints();

    const stats = await prisma.referralStats.findUnique({
      where: { userId: "userA" },
    });

    expect(stats?.layer2Points).toBe(50);
  });

  test("applies 10% trading boost", async () => {
    // User signed up with referral code
    // Trades $1,000
    // Should get 1,100 points (1,000 + 10%)

    const points = await calculateUserPoints("userId");
    expect(points.tradingBonus).toBe(100);
    expect(points.totalPoints).toBe(1100);
  });
});
```

### Manual Testing Checklist

- [ ] Create user A with username "usera"
- [ ] Visit `/referral/usera` link
- [ ] Verify localStorage stores referral code
- [ ] Sign up as user B
- [ ] Verify user B's `UserReferral.referredById` = user A's ID
- [ ] Verify user A's `ReferralStats.layer1Count` = 1
- [ ] User B makes a trade ($100)
- [ ] Run referral points calculation
- [ ] Verify user A gets 10 points (10% of $200 volume)
- [ ] Verify user B gets 110 points (100 base + 10 bonus)
- [ ] User B refers user C
- [ ] User C trades $100
- [ ] Verify user B gets 10 points
- [ ] Verify user A gets 5 points (Layer 2)

---

## 📅 Implementation Timeline

### Phase 1: Database & Basic Tracking ✅ COMPLETE

**Tasks**:

1. ✅ Create database migration
2. ✅ Add tables: `UserReferral`, `ReferralStats`
3. ✅ Update `User` model with relations
4. ✅ Run migration and test
5. ⏭️ Backfill existing users (deferred - will happen organically)

**Deliverables**:

- ✅ Database schema in place
- ✅ Migration applied successfully
- ✅ Ready for signup integration

**Files Created**:

- `prisma/schema.prisma` (UserReferral & ReferralStats models)
- `prisma/migrations/20251027000001_add_referral_system/`

---

### Phase 2: Signup Flow & Trading Bonus ✅ COMPLETE

**Tasks**:

1. ✅ Create `/referral/[username]` route
2. ✅ Add referral code detection to signup modal (localStorage + URL params)
3. ✅ Add referral code input field with validation
4. ✅ Implement real-time code validation (shows checkmark/X)
5. ✅ Replace SVG icons with Lucide icons (CheckCircle2, XCircle, Loader2)
6. ✅ Update signup API to handle referrals
7. ✅ Create `/api/referrals/validate` endpoint
8. ✅ Create `/api/referrals/create` endpoint
9. ✅ Implement 10% trading bonus logic
10. ✅ Create `/api/users/points` endpoint
11. ✅ Update `useUserPoints` hook
12. ✅ Update referral modal with real points data
13. ✅ Change points display color to green (#00FFB8)
14. ✅ Add "Referred Friends" count from database
15. ✅ Fix signup modal spacing issues
16. ✅ Test signup flow end-to-end

**Deliverables**:

- ✅ Referral links work (`callmybluff.io/referral/[username]`)
- ✅ Signup captures referral relationships
- ✅ 10% trading bonus automatically applied
- ✅ Self-referral prevention working
- ✅ 30-day referral code expiry
- ✅ Clean UI with Lucide icons and green accents
- ✅ Real-time referred friends count

**Files Created**:

- `src/app/(site)/referral/[username]/page.tsx`
- `src/app/(site)/api/referrals/validate/route.ts`
- `src/app/(site)/api/referrals/create/route.ts`
- `src/app/(site)/api/users/points/route.ts`

**Files Modified**:

- `src/app/(site)/api/auth/signup/route.ts`
- `src/components/used-components/auth/signup/auth-modal.tsx`
- `src/hooks/useUserPoints.tsx`
- `src/app/(site)/profile/common/modal/referral.tsx`

---

### Phase 3: Referral Points & Analytics 🚧 TODO

**Current State**: Users can see how many friends they've referred, but referrers don't yet earn points from their referrals' trading volume.

**Tasks**:

1. ❌ Create `/api/users/referral-points` endpoint (Layer 1 & Layer 2 calculation)
2. ❌ Implement Layer 1 points calculation (10% of direct referrals' volume)
3. ❌ Implement Layer 2 points calculation (5% of indirect referrals' volume)
4. ❌ Update `/api/users/points` to include referral earnings
5. ❌ Calculate total referral volume (sum of all referred users' trading)
6. ❌ Track "active referrals" (referred users who have traded)
7. ❌ Populate ReferralStats table with volume/points data
8. ❌ Test Layer 1 and Layer 2 calculations
9. ❌ Add referral points to admin dashboard

**Deliverables**:

- ⏳ Referrers earn 10% of Layer 1 volume as points
- ⏳ Referrers earn 5% of Layer 2 volume as points
- ⏳ 2-layer referral chain working end-to-end
- ⏳ ReferralStats table populated with real data
- ⏳ Admin dashboard shows all referral metrics

**Estimated Effort**: 1-2 days

---

### Phase 4: Advanced UI & Analytics 🔜 TODO

**Current State**: Basic UI is complete with referred friends count. Need to add volume/earnings breakdown.

**Tasks**:

1. ✅ Show referral link and code (done)
2. ✅ Display referred friends count (done)
3. ❌ Display Layer 1 and Layer 2 volume breakdown
4. ❌ Show Layer 1 and Layer 2 points earned breakdown
5. ❌ Add "active referrals" count (users who have traded)
6. ❌ Show total referral volume in modal
7. ❌ Create referral leaderboard (optional)
8. ❌ Add admin view for referral stats

**Deliverables**:

- ⏳ Users can see detailed referral performance
- ⏳ Layer 1 & Layer 2 breakdown displayed
- ⏳ Referral volume and earnings visible
- ⏳ Admins can monitor referral system
- ⏳ Complete referral system launched!

**Estimated Effort**: 1-2 days (dependent on Phase 3)

---

## 🔧 Maintenance & Optimization

### Performance Optimization

1. **Index Strategy**:

   - Index on `referralCode` (fast lookups)
   - Index on `referredById` (fast joins)
   - Index on `totalReferralPoints` (leaderboards)

2. **Query Optimization**:

   - Use `groupBy` for aggregations
   - Batch update operations
   - Use database transactions for consistency

3. **Future: Caching with Cron Job** (Phase 3+):
   - Current: Calculate on-demand (works well for initial launch)
   - Future: Cache referral stats with daily cron job
   - Update `ReferralStats` table automatically
   - Provides faster queries at scale

---

## 🚨 Edge Cases & Considerations

### Username Changes

**Problem**: User changes username, breaks referral links

**Solutions**:

- Option 1: Don't allow username changes (simplest)
- Option 2: Keep old username in `referralCode` field
- Option 3: Generate UUID-based codes (not username-based)

**Recommendation**: Keep `referralCode` separate from `username`, but initialize with username on signup.

### Duplicate Referrals

**Problem**: User tries to use multiple codes

**Solution**: Only allow referral code on signup, store in `UserReferral.referredByCode`, immutable.

### Self-Referral

**Problem**: User tries to refer themselves

**Solution**: Check `referredById !== userId` on signup.

### Referral Loop Prevention

**Problem**: User A refers User B, User B refers User A

**Solution**: Check for circular references before allowing referral.

### Deleted Users

**Problem**: Referrer deletes account

**Solution**: `ON DELETE SET NULL` for `referredById`, preserve stats history.

---

## 🎯 Key Technical Decisions

**Referral Code = Username**:

- Simple and memorable
- User-friendly sharing
- Stored separately in case of username changes

**2-Table Design**:

- `UserReferral`: Relationship data (who referred whom)
- `ReferralStats`: Aggregated metrics (for future caching)

**Calculation Strategy (Phase 2)**:

- On-demand calculation (like current volume endpoint)
- Calculate when user views their stats
- No cron job needed initially
- Future: Can optimize with cron job (Phase 3+)

**Storage Strategy**:

- localStorage (7-day expiry) + URL parameters
- Survives page navigation
- Works for both direct links and manual entry

---

## 🚀 Future Enhancements (Phase 3+)

### Automated Cron Job for Point Calculation

**Why**: The on-demand approach works well initially, but at scale a cron job is more efficient.

**Implementation**:

1. Create `/api/cron/calculate-referral-points` endpoint
2. Run daily/hourly to update `ReferralStats` table
3. Cache all referral points in database
4. API endpoints read from cached data instead of calculating

**Benefits**:

- Faster API responses
- Reduces database load
- Supports larger user base
- Enables historical tracking

### KOL Tier System

**Features**:

- Bronze/Silver/Gold tiers with custom multipliers
- Special referral rates for influencers
- Custom agreements per KOL
- Admin panel to assign tiers

**Database**:

Add to `ReferralStats`:

```prisma
kolTier       String?  // "bronze", "silver", "gold"
kolMultiplier Decimal? @db.Decimal(5, 2) // 1.10, 1.15, 1.20
```

### Top 10 Referrer Bonuses

**Features**:

- Automatic 10% boost for top 10 referrers
- Weekly/monthly leaderboard updates
- Rank tracking over time
- Bonus points distribution

**Database**:

Add to `ReferralStats`:

```prisma
isTopReferrer   Boolean @default(false)
topReferrerRank Int?
```

### Advanced Analytics

- Referral conversion rates
- Average referred user value
- Referral funnel metrics
- Geographic referral data
- Time-based referral trends

---

## 📖 Implementation Status Summary

### ✅ Completed (Ready for Production)

1. ✅ **Complete database schema** with Layer 1 & Layer 2 tracking
2. ✅ **Referral link system** with username-based codes (`/referral/[username]`)
3. ✅ **Signup flow** with referral code detection (localStorage + 30-day expiry)
4. ✅ **Manual code entry** with real-time validation and Lucide icons
5. ✅ **10% Trading Bonus** automatically applied to referred users
6. ✅ **API endpoints** for validation, creation, and points
7. ✅ **Self-referral prevention** and edge case handling
8. ✅ **Points endpoint** with bonus calculation (`/api/users/points`)
9. ✅ **Referral modal UI** with green accents (#00FFB8)
10. ✅ **Referred friends count** showing real-time data
11. ✅ **Points breakdown** (trading, bonus, referral)
12. ✅ **Clean UI** with proper spacing and visual feedback
13. ✅ **No cron job required** for initial launch

**Production Ready**: The core referral signup system is functional and ready for testing!

### 🚧 Next Up (Phase 3) - Referral Earnings

**What's Missing**: Referrers can track who signed up with their code, but they don't yet EARN points from their referrals' trading volume.

1. ❌ **Layer 1 Points** - Earn 10% of direct referrals' volume as points
2. ❌ **Layer 2 Points** - Earn 5% of indirect referrals' volume as points
3. ❌ **Referral Volume** - Calculate total volume from all referred users
4. ❌ **Active Referrals** - Track which referred users have traded
5. ❌ **Stats Caching** - Populate ReferralStats table with data
6. ❌ **Admin Dashboard** - View all referral metrics system-wide

**Estimated Time**: 1-2 days

### 🔜 Later (Phase 4) - Advanced Analytics UI

**Dependencies**: Requires Phase 3 completion

1. ✅ **Basic UI** - Referral link, code, and friends count (done)
2. ❌ **Volume Breakdown** - Show Layer 1 & Layer 2 volume in modal
3. ❌ **Points Breakdown** - Display Layer 1 & Layer 2 earnings
4. ❌ **Active Stats** - Show how many referrals are actively trading
5. ❌ **Referral Leaderboard** - Optional competitive element

**Estimated Time**: 1-2 days

---

### 🔮 Future Enhancements (Beyond Phase 4)

1. ❌ **Twitter OAuth Signup Support** - Preserve referral codes when signing up via Twitter
2. ❌ **Referral Email Campaigns** - Automated email notifications for referral activity
3. ❌ **Cron Job Optimization** - Cache referral points for better performance
4. ❌ **KOL Tier System** - Custom referral rates for influencers
5. ❌ **Top 10 Referrer Bonuses** - Competitive leaderboard rewards

---

## 🧪 Testing Checklist

### ✅ Can Test Now

#### Basic Referral Flow

- [ ] Visit `http://localhost:3000/referral/[your-username]`
- [ ] Verify localStorage stores referral code
- [ ] Sign up as new user
- [ ] Check database: `UserReferral` record created
- [ ] Check `hasReceivedBonus = true` in User table
- [ ] Make a trade and verify 10% bonus in points
- [ ] Try self-referral (should fail)
- [ ] Test referral code expiry (30 days)

#### Manual Referral Code Entry

- [ ] Open signup form without referral link
- [ ] Enter a valid username in "Referral Code" field
- [ ] Wait for validation (should show green checkmark)
- [ ] Enter invalid username (should show red X)
- [ ] Complete signup with valid code
- [ ] Verify bonus applied correctly

#### How Referral Code Caching Works

**Storage Mechanism**: `localStorage` (30-day expiry)

**When a user clicks a referral link** (`/referral/[username]`):

1. The page captures the `username` from the URL
2. Stores two items in `localStorage`:
   - `referralCode`: The username (e.g., "grandpamf")
   - `referralCodeExpiry`: Date 30 days in the future (ISO string)
3. Redirects user to signup page

**How to Test Caching**:

1. Open browser DevTools (F12)
2. Go to "Application" tab → "Local Storage" → `localhost:3000`
3. Visit `/referral/testuser`
4. Check localStorage - should see:
   ```
   referralCode: "testuser"
   referralCodeExpiry: "2024-11-26T12:00:00.000Z"
   ```
5. Close tab and reopen signup page
6. Signup form should pre-fill with "testuser" in referral field
7. If you wait >30 days, the code is auto-cleared on next visit

**Expiry Validation**:

- On signup form load, the code checks if `referralCodeExpiry > new Date()`
- If expired: clears localStorage and doesn't pre-fill
- If valid: pre-fills input and validates the code via API

**Manual Entry**:

- Users can also type a referral code directly
- Validation happens `onBlur` (when they click away from the field)
- Shows green checkmark (✓) if valid, red X if invalid
- Pre-filled codes from links are also validated on load

### ⏳ Cannot Test Yet (Phase 3)

- [ ] Verify referrer receives Layer 1 points
- [ ] Verify Layer 2 referral chain
- [ ] View referral analytics in modal
- [ ] Check referral stats in admin dashboard

---

## 🚀 Next Steps

**Immediate (Production Ready)**:

1. Test the current implementation end-to-end
2. Deploy referral link system to production
3. Monitor signup conversion with referral codes
4. Collect initial referral data

**Phase 3 (1-2 days)**:

1. Implement `/api/users/referral-points` endpoint
2. Calculate Layer 1 & Layer 2 earnings
3. Populate ReferralStats table
4. Add admin dashboard view

**Phase 4 (1-2 days)**:

1. Update referral modal UI with real stats
2. Show Layer 1 & Layer 2 breakdown
3. Display active referrals count
4. Launch complete referral system!

---

## 🎯 Future Improvements (Beyond Phase 4)

### Twitter OAuth Signup Integration

**Challenge**: When users sign up via Twitter OAuth, the signup flow bypasses the traditional form, so referral codes stored in localStorage need to be captured and applied.

**Solution**:

1. Update Twitter OAuth callback to check localStorage for `referralCode`
2. Pass referral code to the account creation logic
3. Create UserReferral record after Twitter signup completes
4. Clear localStorage after successful signup

**Implementation Notes**:

- Modify `/api/auth/callback/twitter` or equivalent OAuth handler
- Check for `localStorage.getItem('referralCode')` before redirect
- Store in session or pass as URL parameter through OAuth flow
- Apply same validation and bonus logic as email signup

### Other Future Features

- **Cron job for caching** (better performance at scale)
- **KOL tier system** (custom influencer deals)
- **Top 10 referrer bonuses** (competitive leaderboard)
- **Advanced analytics and tracking**
- **Referral email campaigns** (notify referrers of new signups)
