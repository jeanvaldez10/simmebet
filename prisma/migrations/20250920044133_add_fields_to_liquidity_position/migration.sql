-- AlterTable
ALTER TABLE "liquidity_positions" ADD COLUMN     "last_updated" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lowerOdds" DECIMAL(5,2),
ADD COLUMN     "token0Balance" DECIMAL(10,2),
ADD COLUMN     "token1Balance" DECIMAL(10,2),
ADD COLUMN     "upperOdds" DECIMAL(5,2);
