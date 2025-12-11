-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "creatorAvatar" TEXT DEFAULT '/images/avatar.png',
ADD COLUMN     "creatorName" TEXT DEFAULT 'Anonymous';
