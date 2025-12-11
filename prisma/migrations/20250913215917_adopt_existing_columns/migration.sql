-- AlterTable
ALTER TABLE "flex_snapshots"
  ADD COLUMN IF NOT EXISTS "marketImage" TEXT,
  ADD COLUMN IF NOT EXISTS "potentialLossAmount" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "potentialWinAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false;