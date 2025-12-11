import apiClient from "@/lib/axios";
import { CarouselBannerItem } from "@/data/carouselData";

/**
 * Carousel API service following your application's patterns
 * Similar to marketsApi in services/api/markets.ts
 */
export const carouselApi = {
  /**
   * Get all published carousel items (public endpoint)
   */
  getPublishedItems: async (): Promise<{ items: CarouselBannerItem[] }> => {
    const response = await apiClient.get<
      { items: CarouselBannerItem[] },
      { items: CarouselBannerItem[] }
    >("/carousel/published");
    return response;
  },
};
