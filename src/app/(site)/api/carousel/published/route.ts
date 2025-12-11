import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CarouselService } from "@/services/carouselService";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    console.log(
      `🔄 [${timestamp}] API: Fetching published carousel items from database`
    );

    const carouselItems = await prisma.carouselItem.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });

    console.log(
      `📊 [${timestamp}] Fetched ${carouselItems.length} published carousel items`
    );

    // Debug specific carousel item
    const debugItem = carouselItems.find(
      (item) =>
        item.id === "ab31c819-3b85-4ccb-bef6-891b237a331f" ||
        item.marketId === "6cf9893b-87bf-459e-b94c-cf4a0894f117"
    );
    if (debugItem) {
      console.log("🔍 [API] Debug carousel item (raw from DB):", {
        carouselId: debugItem.id,
        marketId: debugItem.marketId,
        useSocialImage: debugItem.useSocialImage,
        title: debugItem.title,
        subtitle: debugItem.subtitle,
        description: debugItem.description,
        primaryButtonText: debugItem.primaryButtonText,
        secondaryButtonText: debugItem.secondaryButtonText,
        imageSrc: debugItem.imageSrc?.substring(0, 80),
      });
    }

    // Enrich items with market social images where needed
    const enrichedItems = await Promise.all(
      carouselItems.map(async (item) => {
        if (item.marketId && item.useSocialImage) {
          try {
            const market = await prisma.market.findUnique({
              where: { id: item.marketId },
              select: { socialImage: true },
            });

            return {
              ...item,
              marketSocialImageUrl: market?.socialImage || null,
            };
          } catch (error) {
            console.error(
              `❌ [${timestamp}] Failed to fetch market ${item.marketId}:`,
              error
            );
            return {
              ...item,
              marketSocialImageUrl: null,
            };
          }
        }
        return {
          ...item,
          marketSocialImageUrl: null,
        };
      })
    );

    // Debug after enrichment
    const debugEnriched = enrichedItems.find(
      (item) =>
        item.id === "ab31c819-3b85-4ccb-bef6-891b237a331f" ||
        item.marketId === "6cf9893b-87bf-459e-b94c-cf4a0894f117"
    );
    if (debugEnriched) {
      console.log("🔍 [API] Debug carousel item (after enrichment):", {
        carouselId: debugEnriched.id,
        marketId: debugEnriched.marketId,
        useSocialImage: debugEnriched.useSocialImage,
        marketSocialImageUrl: debugEnriched.marketSocialImageUrl,
        title: debugEnriched.title,
        subtitle: debugEnriched.subtitle,
      });
    }

    // Convert to CarouselBannerItem format for public consumption
    const formattedItems = enrichedItems.map((item) => {
      try {
        return CarouselService.convertToCarouselBannerItem({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        });
      } catch (conversionError) {
        console.error(
          `❌ [${timestamp}] Failed to convert carousel item ${item.id}:`,
          {
            error: conversionError,
            item: {
              id: item.id,
              imageSrc: item.imageSrc,
              status: item.status,
              alignment: item.alignment,
            },
          }
        );
        throw conversionError;
      }
    });

    // Debug after conversion
    const debugFormatted = formattedItems.find(
      (item) =>
        item.id === "ab31c819-3b85-4ccb-bef6-891b237a331f" ||
        item.marketId === "6cf9893b-87bf-459e-b94c-cf4a0894f117"
    );
    if (debugFormatted) {
      console.log("🔍 [API] Debug carousel item (after conversion/final):", {
        carouselId: debugFormatted.id,
        marketId: debugFormatted.marketId,
        useSocialImage: debugFormatted.useSocialImage,
        marketSocialImageUrl: debugFormatted.marketSocialImageUrl,
        title: debugFormatted.title,
        subtitle: debugFormatted.subtitle,
        description: debugFormatted.description,
        primaryButtonText: debugFormatted.primaryButtonText,
        secondaryButtonText: debugFormatted.secondaryButtonText,
        imageSrc: debugFormatted.imageSrc?.substring(0, 80),
      });
    }

    // Validate image sources exist
    const invalidItems = formattedItems.filter((item) => !item.imageSrc);
    if (invalidItems.length > 0) {
      console.warn(
        `⚠️ [${timestamp}] Found carousel items with missing imageSrc:`,
        invalidItems.map((item) => ({ id: item.id, imageSrc: item.imageSrc }))
      );
    }

    console.log(`✅ [${timestamp}] Formatted items being returned:`, {
      totalFormatted: formattedItems.length,
      formattedDetails: formattedItems.map((item) => ({
        id: item.id,
        marketId: item.marketId,
        useSocialImage: item.useSocialImage,
        hasMarketId: !!item.marketId,
        hasUseSocialImageFlag: item.useSocialImage !== undefined,
      })),
    });

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch published carousel items",
        timestamp,
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
