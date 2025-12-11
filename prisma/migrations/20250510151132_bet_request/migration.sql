-- AlterTable
ALTER TABLE "user_notifications" ADD COLUMN     "message" TEXT,
ADD COLUMN     "status" TEXT;

-- CreateTable
CREATE TABLE "bet_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountIn" DOUBLE PRECISION NOT NULL,
    "slippage" DOUBLE PRECISION NOT NULL,
    "errorMessage" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bet_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bet_requests_idempotencyKey_key" ON "bet_requests"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "bet_requests" ADD CONSTRAINT "bet_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bet_requests" ADD CONSTRAINT "bet_requests_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
