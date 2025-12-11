/*
  Warnings:

  - Added the required column `poolId` to the `market_swaps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swapId` to the `market_swaps` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "market_swaps_marketId_timestamp_idx";

-- AlterTable
ALTER TABLE "market_swaps" ADD COLUMN     "poolId" TEXT NOT NULL,
ADD COLUMN     "swapId" TEXT NOT NULL,
ALTER COLUMN "blockNumber" DROP NOT NULL,
ALTER COLUMN "amount0" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "amount1" SET DATA TYPE DECIMAL(65,30);

-- CreateIndex
CREATE INDEX "market_swaps_poolId_marketId_timestamp_idx" ON "market_swaps"("poolId", "marketId", "timestamp");
