-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "BetType" AS ENUM ('PLACE_BET_YES', 'PLACE_BET_NO', 'CASH_OUT');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('HOURLY', 'DAILY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "supabaseUserId" TEXT NOT NULL,
    "twitterId" TEXT,
    "walletAddress" TEXT,
    "walletType" TEXT,
    "contractAddress" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL DEFAULT 'ETH',
    "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE',
    "name" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "image" TEXT,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rules" TEXT[],
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedOption" TEXT,
    "yesPrice" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "noPrice" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "totalLiquidity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yesTokenAddress" TEXT,
    "yesIcon" TEXT,
    "noTokenAddress" TEXT,
    "noIcon" TEXT,
    "currentRatio" DECIMAL(10,2),

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_top_holders" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "holderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "side" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_top_holders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_resolutions" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "results" JSONB NOT NULL,
    "outcome" BOOLEAN NOT NULL,
    "sources" TEXT[],
    "resultFile" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_activities" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "userId" TEXT,
    "betType" "BetType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_tweets" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "tweets" JSONB NOT NULL,
    "username" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tweetUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_data" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "dataType" "DataType" NOT NULL,
    "side" BOOLEAN NOT NULL,
    "odds" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_current_odds" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "yesOdds" DECIMAL(10,2) NOT NULL,
    "noOdds" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_current_odds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_positions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "image" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "bought" BOOLEAN NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_chart_data" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "yes" DECIMAL(10,2) NOT NULL,
    "no" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_chart_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidity_spread_data" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "percentage" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidity_spread_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseUserId_key" ON "users"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_twitterId_key" ON "users"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "users_contractAddress_key" ON "users"("contractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "markets_contractAddress_key" ON "markets"("contractAddress");

-- CreateIndex
CREATE UNIQUE INDEX "markets_poolAddress_key" ON "markets"("poolAddress");

-- CreateIndex
CREATE UNIQUE INDEX "markets_yesTokenAddress_key" ON "markets"("yesTokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "markets_noTokenAddress_key" ON "markets"("noTokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "market_resolutions_marketId_key" ON "market_resolutions"("marketId");

-- CreateIndex
CREATE INDEX "market_data_marketId_timestamp_idx" ON "market_data"("marketId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "market_current_odds_marketId_key" ON "market_current_odds"("marketId");

-- CreateIndex
CREATE INDEX "price_chart_data_marketId_date_idx" ON "price_chart_data"("marketId", "date");

-- CreateIndex
CREATE INDEX "liquidity_spread_data_marketId_idx" ON "liquidity_spread_data"("marketId");

-- AddForeignKey
ALTER TABLE "market_top_holders" ADD CONSTRAINT "market_top_holders_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_resolutions" ADD CONSTRAINT "market_resolutions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_activities" ADD CONSTRAINT "market_activities_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tweets" ADD CONSTRAINT "market_tweets_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_data" ADD CONSTRAINT "market_data_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_current_odds" ADD CONSTRAINT "market_current_odds_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_positions" ADD CONSTRAINT "user_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_chart_data" ADD CONSTRAINT "price_chart_data_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_spread_data" ADD CONSTRAINT "liquidity_spread_data_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
