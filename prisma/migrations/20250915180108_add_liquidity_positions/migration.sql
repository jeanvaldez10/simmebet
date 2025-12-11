-- CreateTable
CREATE TABLE "liquidity_positions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "nftId" TEXT,
    "isBurnt" BOOLEAN NOT NULL DEFAULT false,
    "autoclose" BOOLEAN NOT NULL DEFAULT false,
    "autocloseTime" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token0FeesCollected" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "token1FeesCollected" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "liquidity_positions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "liquidity_positions" ADD CONSTRAINT "liquidity_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidity_positions" ADD CONSTRAINT "liquidity_positions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
