-- DropIndex
DROP INDEX "users_supabaseUserId_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "supabaseUserId" DROP NOT NULL;
