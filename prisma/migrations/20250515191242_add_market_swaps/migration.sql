-- CreateTable
CREATE TABLE "indexer_state" (
    "id" TEXT NOT NULL,
    "lastBlockNumber" BIGINT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexer_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_swaps" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "amount0" DECIMAL(27,18) NOT NULL,
    "amount1" DECIMAL(27,18) NOT NULL,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,

    CONSTRAINT "market_swaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "market_swaps_marketId_timestamp_idx" ON "market_swaps"("marketId", "timestamp");

-- AddForeignKey
ALTER TABLE "market_swaps" ADD CONSTRAINT "market_swaps_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
