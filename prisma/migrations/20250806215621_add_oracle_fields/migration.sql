ALTER TABLE "markets" ADD COLUMN     "oracleMarketId" TEXT,
ADD COLUMN     "oracleType" TEXT,
ADD COLUMN     "tieIsPossible" BOOLEAN NOT NULL DEFAULT false;
