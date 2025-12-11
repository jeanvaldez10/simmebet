-- CreateEnum
CREATE TYPE "AuthenticatedType" AS ENUM ('manual', 'social');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authenticatedType" "AuthenticatedType" NOT NULL DEFAULT 'manual',
ADD COLUMN     "password" TEXT;
