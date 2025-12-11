import { useQuery } from "@tanstack/react-query";
import { CarouselService } from "@/services/carouselService";

/**
 * Hook for fetching published carousel items (client-side)
 * Follows the same patterns as your other hooks (useMarket, useAuth, etc.)
 */
export function useCarousel() {
  return useQuery({
    queryKey: ["carousel", "published"],
    queryFn: () => CarouselService.getPublishedCarouselItems(),
    staleTime: 5 * 60 * 1000, // 5 minutes (same as your useAuth hook)
    gcTime: 10 * 60 * 1000, // 10 minutes (same as your useAuth hook)
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes (less frequent than markets)
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook for refetching carousel data manually
 */
export function useRefreshCarousel() {
  const { refetch } = useCarousel();
  return refetch;
}
