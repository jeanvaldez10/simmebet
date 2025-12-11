/*
  Warnings:

  - You are about to drop the `TokenTransfers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TokenTransfers";

-- CreateTable
CREATE TABLE "token_transfers" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,

    CONSTRAINT "token_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_transfers_transactionHash_key" ON "token_transfers"("transactionHash");
