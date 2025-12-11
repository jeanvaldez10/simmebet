#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client";
import { carouselBanners } from "../src/data/carouselData";

const prisma = new PrismaClient();

async function populateCarousel() {
  console.log("🎠 Starting carousel data population...");

  try {
    // Clear existing carousel items
    console.log("🗑️  Clearing existing carousel items...");
    await prisma.carouselItem.deleteMany({});

    // Insert carousel items from carouselData.ts
    console.log("📝 Inserting carousel items...");

    for (let i = 0; i < carouselBanners.length; i++) {
      const banner = carouselBanners[i];

      const carouselItem = await prisma.carouselItem.create({
        data: {
          title: banner.title || null,
          subtitle: banner.subtitle || null,
          date: banner.date || null,
          betChance: banner.betChance || null,
          description: banner.description || null,
          imageSrc: banner.imageSrc,
          alignment: banner.alignment.toUpperCase() as "LEFT" | "CENTER",
          isVideo: banner.isVideo,
          primaryButtonText: banner.primaryButtonText || null,
          primaryButtonLink: banner.primaryButtonLink || null,
          secondaryButtonText: banner.secondaryButtonText || null,
          secondaryButtonLink: banner.secondaryButtonLink || null,
          status: "PUBLISHED", // Set all as published
          orderIndex: i, // Use array index for ordering
        },
      });

      console.log(
        `✅ Created carousel item: ${carouselItem.id} (${banner.imageSrc})`
      );
    }

    console.log(
      `🎉 Successfully populated ${carouselBanners.length} carousel items!`
    );

    // Verify the data
    const count = await prisma.carouselItem.count();
    console.log(`📊 Total carousel items in database: ${count}`);
  } catch (error) {
    console.error("❌ Error populating carousel data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateCarousel().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
