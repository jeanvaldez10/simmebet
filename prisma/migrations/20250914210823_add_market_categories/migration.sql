-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "market_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#6366f1',
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_categories_name_key" ON "market_categories"("name");

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "market_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
