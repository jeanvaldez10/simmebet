/*
  Warnings:

  - Made the column `address` on table `market_top_holders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE market_top_holders SET address = 'unknown' WHERE address IS NULL;
ALTER TABLE "market_top_holders" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address" SET DEFAULT 'unknown',
ALTER COLUMN "userName" SET DEFAULT 'Anonymous';
