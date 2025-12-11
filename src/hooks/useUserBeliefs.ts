import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface UserBelief {
  marketId: string;
  belief: number;
  lastUpdated: Date;
  action: string;
}

export function useUserBeliefs(): UseQueryResult<UserBelief[], Error> {
  return useQuery({
    queryKey: ["userBeliefs"],
    queryFn: async () => {
      const response = await fetch("/api/users/beliefs");
      if (!response.ok) {
        throw new Error("Failed to fetch user beliefs");
      }
      return response.json();
    },
    staleTime: 30000,
  });
}
