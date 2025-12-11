/*
  Warnings:

  - Changed the type of `amount` on the `TokenTransfers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `blockNumber` on the `TokenTransfers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TokenTransfers" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(78,0) NOT NULL,
DROP COLUMN "blockNumber",
ADD COLUMN     "blockNumber" BIGINT NOT NULL;
