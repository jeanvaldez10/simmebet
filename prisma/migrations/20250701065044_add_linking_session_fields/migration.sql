-- AlterTable
ALTER TABLE "users" ADD COLUMN     "linkingSession" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkingSessionExpires" TIMESTAMP(3);
