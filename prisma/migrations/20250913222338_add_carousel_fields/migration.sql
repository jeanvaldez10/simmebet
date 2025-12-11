-- CreateEnum
CREATE TYPE "CarouselAlignment" AS ENUM ('LEFT', 'CENTER');

-- CreateEnum
CREATE TYPE "CarouselStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "carousel_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "betChance" INTEGER,
    "description" TEXT NOT NULL,
    "imageSrc" TEXT NOT NULL,
    "alignment" "CarouselAlignment" NOT NULL DEFAULT 'LEFT',
    "isVideo" BOOLEAN NOT NULL DEFAULT false,
    "primaryButtonText" TEXT,
    "primaryButtonLink" TEXT,
    "secondaryButtonText" TEXT,
    "secondaryButtonLink" TEXT,
    "status" "CarouselStatus" NOT NULL DEFAULT 'DRAFT',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carousel_items_pkey" PRIMARY KEY ("id")
);
