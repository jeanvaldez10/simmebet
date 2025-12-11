/*
  Warnings:

  - You are about to drop the column `image` on the `user_positions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `user_positions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_positions" DROP COLUMN "image",
DROP COLUMN "status",
ALTER COLUMN "bought" SET DEFAULT true;
