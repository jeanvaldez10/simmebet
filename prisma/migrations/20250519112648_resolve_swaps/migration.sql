/*
  Warnings:

  - You are about to drop the `market_swaps` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "market_swaps" DROP CONSTRAINT "market_swaps_marketId_fkey";

-- DropTable
DROP TABLE "market_swaps";
