/*
  Warnings:

  - You are about to drop the column `market` on the `user_positions` table. All the data in the column will be lost.
  - Added the required column `marketId` to the `user_positions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_positions" DROP COLUMN "market",
ADD COLUMN     "marketId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "user_positions" ADD CONSTRAINT "user_positions_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
