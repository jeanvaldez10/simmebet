/*
  Warnings:

  - A unique constraint covering the columns `[swapId]` on the table `market_swaps` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "market_swaps_poolId_marketId_timestamp_idx";

-- CreateIndex
CREATE UNIQUE INDEX "market_swaps_swapId_key" ON "market_swaps"("swapId");

-- CreateIndex
CREATE INDEX "market_swaps_swapId_marketId_timestamp_idx" ON "market_swaps"("swapId", "marketId", "timestamp");
