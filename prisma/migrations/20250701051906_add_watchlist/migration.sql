-- CreateEnum
CREATE TYPE "WatchlistItemType" AS ENUM ('MARKET', 'OPTION');

-- CreateTable
CREATE TABLE "watchlist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" "WatchlistItemType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "watchlist_items_userId_idx" ON "watchlist_items"("userId");

-- CreateIndex
CREATE INDEX "watchlist_items_itemId_itemType_idx" ON "watchlist_items"("itemId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_items_userId_itemId_itemType_key" ON "watchlist_items"("userId", "itemId", "itemType");

-- AddForeignKey
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
