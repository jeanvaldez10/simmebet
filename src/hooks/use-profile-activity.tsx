import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";


export interface IProfileActivity {
  id: string;
  message: string;
  amount: string;
  when: string;
  type: string;
  txHash: string | null;
  marketId: string | null;
}

export interface ActivityResponse {
  activities: IProfileActivity[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export default function useProfileActivity(
  userId: string,
  page: number = 1,
  limit: number = 10
): UseQueryResult<ActivityResponse, Error> {
  return useQuery({
    queryKey: ["activity-profile", userId, page, limit],
    queryFn: async () => {
      const response = await fetch(`/api/users/activities?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
    staleTime: 30000,
    enabled: !!userId,
  });
}

export function useProfileActivityInfinite(userId: string) {
  const [page, setPage] = useState(1);
  const [allActivities, setAllActivities] = useState<IProfileActivity[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading, isError, refetch } = useProfileActivity(userId, page);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllActivities(data.activities);
      } else {
        setAllActivities(prev => [...prev, ...data.activities]);
      }
      setHasMore(data.pagination.hasMore);
      setIsLoadingMore(false);
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  const reset = useCallback(() => {
    setPage(1);
    setAllActivities([]);
    setHasMore(true);
    refetch();
  }, [refetch]);

  return {
    activities: allActivities,
    isLoading: isLoading && page === 1,
    isError,
    isLoadingMore,
    hasMore,
    loadMore,
    reset,
  };
}
