/*
  Warnings:

  - A unique constraint covering the columns `[transactionHash,blockNumber,logIndex]` on the table `token_transfers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "token_transfers_transactionHash_key";

-- CreateIndex
CREATE UNIQUE INDEX "token_transfers_transactionHash_blockNumber_logIndex_key" ON "token_transfers"("transactionHash", "blockNumber", "logIndex");
