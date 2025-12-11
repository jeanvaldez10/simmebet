-- CreateTable
CREATE TABLE "liquidity_events" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "poolManagerAddress" TEXT NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "marketId" TEXT,
    "poolKey" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "tickLower" INTEGER NOT NULL,
    "tickUpper" INTEGER NOT NULL,
    "liquidityDelta" BIGINT NOT NULL,
    "salt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidity_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "liquidity_events_txHash_blockNumber_sender_idx" ON "liquidity_events"("txHash", "blockNumber", "sender");
