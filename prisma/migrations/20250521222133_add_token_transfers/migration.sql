-- CreateTable
CREATE TABLE "TokenTransfers" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" TEXT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,

    CONSTRAINT "TokenTransfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenTransfers_transactionHash_key" ON "TokenTransfers"("transactionHash");
