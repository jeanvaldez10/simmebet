/*
  Warnings:

  - The `amount` column on the `market_top_holders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "market_top_holders" DROP COLUMN "amount",
ADD COLUMN     "amount" BIGINT NOT NULL DEFAULT 0;
