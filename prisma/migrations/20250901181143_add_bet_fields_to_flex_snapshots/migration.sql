-- AlterTable
ALTER TABLE "flex_snapshots" ADD COLUMN     "amountWon" DECIMAL(10,2),
ADD COLUMN     "beliefPercentage" DECIMAL(5,2),
ADD COLUMN     "betAmount" DECIMAL(10,2),
ADD COLUMN     "betData" JSONB,
ADD COLUMN     "betSide" TEXT,
ADD COLUMN     "betStatus" TEXT,
ADD COLUMN     "marketId" TEXT,
ADD COLUMN     "marketQuestion" TEXT;
