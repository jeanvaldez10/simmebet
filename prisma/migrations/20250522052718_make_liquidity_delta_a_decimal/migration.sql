-- DropIndex
DROP INDEX "liquidity_events_txHash_blockNumber_sender_idx";

-- AlterTable
ALTER TABLE "liquidity_events" ALTER COLUMN "liquidityDelta" SET DATA TYPE DECIMAL(78,0);

-- CreateIndex
CREATE INDEX "liquidity_events_txHash_blockNumber_logIndex_idx" ON "liquidity_events"("txHash", "blockNumber", "logIndex");
