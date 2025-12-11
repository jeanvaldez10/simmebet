-- DropForeignKey
ALTER TABLE "user_notifications" DROP CONSTRAINT "user_notifications_marketId_fkey";

-- AlterTable
ALTER TABLE "user_notifications" ALTER COLUMN "marketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
