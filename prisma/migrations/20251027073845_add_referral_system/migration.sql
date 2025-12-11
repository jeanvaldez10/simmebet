-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hasReceivedBonus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralBonusApplied" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_referrals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referredBy" TEXT NOT NULL,
    "referredById" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "activeReferrals" INTEGER NOT NULL DEFAULT 0,
    "layer1Volume" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "layer2Volume" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "layer1Points" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "layer2Points" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalReferralPoints" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referral_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_referrals_userId_key" ON "user_referrals"("userId");

-- CreateIndex
CREATE INDEX "user_referrals_referredById_idx" ON "user_referrals"("referredById");

-- CreateIndex
CREATE INDEX "user_referrals_referredBy_idx" ON "user_referrals"("referredBy");

-- CreateIndex
CREATE UNIQUE INDEX "referral_stats_userId_key" ON "referral_stats"("userId");

-- AddForeignKey
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_referrals" ADD CONSTRAINT "user_referrals_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_stats" ADD CONSTRAINT "referral_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
