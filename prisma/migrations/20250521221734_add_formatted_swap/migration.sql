-- CreateTable
CREATE TABLE "formatted_swaps" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "txHash" TEXT NOT NULL,
    "rawPrice" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "amount0" DOUBLE PRECISION NOT NULL,
    "amount1" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formatted_swaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "formatted_swaps_txHash_key" ON "formatted_swaps"("txHash");

-- AddForeignKey
ALTER TABLE "formatted_swaps" ADD CONSTRAINT "formatted_swaps_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
