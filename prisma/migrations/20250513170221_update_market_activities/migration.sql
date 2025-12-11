/*
  Warnings:

  - You are about to drop the `market_activities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "market_activities" DROP CONSTRAINT "market_activities_marketId_fkey";

-- DropTable
DROP TABLE "market_activities";

-- CreateTable
CREATE TABLE "MarketActivity" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketActivity_marketId_idx" ON "MarketActivity"("marketId");

-- CreateIndex
CREATE INDEX "MarketActivity_userId_idx" ON "MarketActivity"("userId");

-- AddForeignKey
ALTER TABLE "MarketActivity" ADD CONSTRAINT "MarketActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketActivity" ADD CONSTRAINT "MarketActivity_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
