/*
  Warnings:

  - A unique constraint covering the columns `[userId,marketId,txHash]` on the table `user_positions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_positions" ADD COLUMN     "txHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_positions_userId_marketId_txHash_key" ON "user_positions"("userId", "marketId", "txHash");
