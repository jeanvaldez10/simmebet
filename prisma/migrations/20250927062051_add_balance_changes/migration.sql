-- CreateTable
CREATE TABLE "balance_changes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT,
    "tokenAddress" TEXT NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL,
    "txHash" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_changes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "balance_changes" ADD CONSTRAINT "balance_changes_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_changes" ADD CONSTRAINT "balance_changes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
