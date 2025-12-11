-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "noSideIcon" TEXT DEFAULT '/images/cup.png',
ADD COLUMN     "noSideName" TEXT DEFAULT 'No',
ADD COLUMN     "yesSideIcon" TEXT DEFAULT '/images/cup.png',
ADD COLUMN     "yesSideName" TEXT DEFAULT 'Yes';
