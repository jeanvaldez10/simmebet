-- CreateTable
CREATE TABLE "market_category_assignments" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_category_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_category_assignments_marketId_categoryId_key" ON "market_category_assignments"("marketId", "categoryId");

-- AddForeignKey
ALTER TABLE "market_category_assignments" ADD CONSTRAINT "market_category_assignments_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "market_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_category_assignments" ADD CONSTRAINT "market_category_assignments_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "markets" DROP CONSTRAINT "markets_categoryId_fkey";

-- AlterTable
ALTER TABLE "markets" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "markets" ADD COLUMN "noSideSymbol" TEXT;

-- AlterTable
ALTER TABLE "markets" ADD COLUMN "yesSideSymbol" TEXT;
