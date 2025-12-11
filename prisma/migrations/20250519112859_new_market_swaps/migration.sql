-- CreateTable
CREATE TABLE "market_swaps" (
    "id" TEXT NOT NULL,
    "swapId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "amount0" BIGINT NOT NULL,
    "amount1" BIGINT NOT NULL,
    "sender" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "poolManagerAddress" TEXT NOT NULL,
    "txIndex" INTEGER NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "liquidity" BIGINT NOT NULL,
    "fee" INTEGER NOT NULL,
    "tick" INTEGER NOT NULL,
    "sqrtPriceX96" BIGINT NOT NULL,

    CONSTRAINT "market_swaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_swaps_txHash_key" ON "market_swaps"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "market_swaps_logIndex_key" ON "market_swaps"("logIndex");

-- CreateIndex
CREATE INDEX "market_swaps_txHash_swapId_blockNumber_sender_idx" ON "market_swaps"("txHash", "swapId", "blockNumber", "sender");

-- AddForeignKey
ALTER TABLE "market_swaps" ADD CONSTRAINT "market_swaps_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
