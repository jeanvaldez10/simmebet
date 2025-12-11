-- CreateTable
CREATE TABLE "whitelist_entries" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "twitterId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whitelist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whitelist_entries_email_key" ON "whitelist_entries"("email");

-- CreateIndex
CREATE UNIQUE INDEX "whitelist_entries_twitterId_key" ON "whitelist_entries"("twitterId");
