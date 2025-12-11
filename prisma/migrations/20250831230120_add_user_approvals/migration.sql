-- CreateTable
CREATE TABLE "user_approvals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "spenderAddress" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "amount" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalHash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_approvals_userId_contractAddress_spenderAddress_tokenA_key" ON "user_approvals"("userId", "contractAddress", "spenderAddress", "tokenAddress");

-- AddForeignKey
ALTER TABLE "user_approvals" ADD CONSTRAINT "user_approvals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
