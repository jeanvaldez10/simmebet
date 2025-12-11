import { CarouselBannerItem } from "@/data/carouselData";

export interface CarouselItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  date: string | null;
  betChance?: number | null;
  description: string | null;
  imageSrc: string;
  marketId?: string | null;
  useSocialImage?: boolean;
  marketSocialImageUrl?: string | null;
  mobileBannerSrc?: string | null;
  alignment: "LEFT" | "CENTER";
  isVideo: boolean;
  primaryButtonText?: string | null;
  primaryButtonLink?: string | null;
  secondaryButtonText?: string | null;
  secondaryButtonLink?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing carousel items with proper admin authentication
 */
export class CarouselService {
  private static getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminToken");
  }

  private static getAuthHeaders(): HeadersInit {
    const token = this.getAdminToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get all carousel items (admin only)
   */
  static async getCarouselItems(): Promise<CarouselItem[]> {
    const response = await fetch("/api/admin/carousel", {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch carousel items");
    }

    const data = await response.json();
    return data.items;
  }

  /**
   * Get a single carousel item by ID (admin only)
   */
  static async getCarouselItem(id: string): Promise<CarouselItem> {
    const response = await fetch(`/api/admin/carousel/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch carousel item");
    }

    const data = await response.json();
    return data.item;
  }

  /**
   * Create a new carousel item (admin only)
   */
  static async createCarouselItem(
    item: Omit<CarouselItem, "id" | "createdAt" | "updatedAt">
  ): Promise<CarouselItem> {
    const response = await fetch("/api/admin/carousel", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create carousel item");
    }

    const data = await response.json();
    return data.item;
  }

  /**
   * Update an existing carousel item (admin only)
   */
  static async updateCarouselItem(
    id: string,
    updates: Partial<CarouselItem>
  ): Promise<CarouselItem> {
    const response = await fetch(`/api/admin/carousel/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update carousel item");
    }

    const data = await response.json();
    return data.item;
  }

  /**
   * Delete a carousel item (admin only)
   */
  static async deleteCarouselItem(id: string): Promise<void> {
    const response = await fetch(`/api/admin/carousel/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete carousel item");
    }
  }

  /**
   * Get published carousel items for public display (no auth required)
   * Server-side only - uses direct database access like your other server components
   */
  static async getPublishedCarouselItemsServer(): Promise<
    CarouselBannerItem[]
  > {
    const timestamp = new Date().toISOString();

    try {
      console.log(
        `🔄 [${timestamp}] Fetching published carousel items directly from database (server-side)`
      );

      // Import prisma only on server-side to avoid bundle issues
      const { prisma } = await import("@/lib/prisma");

      const carouselItems = await prisma.carouselItem.findMany({
        where: {
          status: "PUBLISHED",
        },
        orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
      });

      console.log(`📊 [${timestamp}] Database query results:`, {
        totalItems: carouselItems.length,
        itemIds: carouselItems.map((item) => item.id),
        orderIndexes: carouselItems.map((item) => item.orderIndex),
      });

      // Convert to CarouselBannerItem format
      const formattedItems = carouselItems.map((item) => {
        try {
          return this.convertToCarouselBannerItem({
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

      // Validate image sources exist
      const invalidItems = formattedItems.filter((item) => !item.imageSrc);
      if (invalidItems.length > 0) {
        console.warn(
          `⚠️ [${timestamp}] Found carousel items with missing imageSrc:`,
          invalidItems.map((item) => ({ id: item.id, imageSrc: item.imageSrc }))
        );
      }

      return formattedItems;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `❌ [${timestamp}] CarouselService.getPublishedCarouselItemsServer failed:`,
        {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp,
          databaseUrl: process.env.DATABASE_URL ? "configured" : "missing",
        }
      );
      throw error;
    }
  }

  /**
   * Get published carousel items for client-side use (follows your app patterns)
   */
  static async getPublishedCarouselItems(): Promise<CarouselBannerItem[]> {
    const timestamp = new Date().toISOString();

    try {
      console.log(
        `🔄 [${timestamp}] Fetching published carousel items from API (client-side)`
      );

      // Use relative URL for client-side requests (like your other APIs)
      const response = await fetch("/api/carousel/published");

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        const errorMessage =
          errorData.error || "Failed to fetch published carousel items";

        console.error(`❌ [${timestamp}] API request failed:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          headers: Object.fromEntries(response.headers.entries()),
        });

        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        console.error(`❌ [${timestamp}] Invalid API response format:`, {
          data,
          hasItems: !!data.items,
          itemsType: typeof data.items,
          isArray: Array.isArray(data.items),
        });
        throw new Error(
          "Invalid API response format: missing or invalid items array"
        );
      }

      console.log(
        `✅ [${timestamp}] Successfully fetched ${data.items.length} carousel items`
      );
      return data.items;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `❌ [${timestamp}] CarouselService.getPublishedCarouselItems failed:`,
        {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp,
        }
      );
      throw error;
    }
  }

  /**
   * Convert database CarouselItem to CarouselBannerItem format
   */
  static convertToCarouselBannerItem(item: CarouselItem): CarouselBannerItem {
    return {
      id: item.id,
      title: item.title || "",
      subtitle: item.subtitle || "",
      date: item.date || "",
      betChance: item.betChance ?? undefined,
      description: item.description || "",
      imageSrc: item.imageSrc,
      marketId: item.marketId ?? undefined,
      useSocialImage: item.useSocialImage ?? undefined,
      marketSocialImageUrl: item.marketSocialImageUrl ?? undefined,
      mobileBannerSrc: item.mobileBannerSrc ?? undefined,
      alignment: item.alignment.toLowerCase() as "left" | "center",
      isVideo: item.isVideo,
      primaryButtonText: item.primaryButtonText ?? undefined,
      primaryButtonLink: item.primaryButtonLink ?? undefined,
      secondaryButtonText: item.secondaryButtonText ?? undefined,
      secondaryButtonLink: item.secondaryButtonLink ?? undefined,
    };
  }

  /**
   * Convert CarouselBannerItem to database CarouselItem format
   */
  static convertFromCarouselBannerItem(
    item: CarouselBannerItem
  ): Omit<CarouselItem, "id" | "createdAt" | "updatedAt"> {
    return {
      title: item.title,
      subtitle: item.subtitle,
      date: item.date,
      betChance: item.betChance,
      description: item.description,
      imageSrc: item.imageSrc,
      marketId: item.marketId,
      useSocialImage: item.useSocialImage,
      mobileBannerSrc: item.mobileBannerSrc,
      alignment: item.alignment.toUpperCase() as "LEFT" | "CENTER",
      isVideo: item.isVideo,
      primaryButtonText: item.primaryButtonText,
      primaryButtonLink: item.primaryButtonLink,
      secondaryButtonText: item.secondaryButtonText,
      secondaryButtonLink: item.secondaryButtonLink,
      status: "PUBLISHED",
      orderIndex: 0,
    };
  }
}
