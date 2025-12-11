import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface IProfileNotification {
  id: number;
  message: string;
  when: string;
  type: "buy" | "deposit" | "withdraw" | "sell" | "win";
  amount: string;
  marketId?: string;
  marketName?: string;
  viewed: boolean;
  createdAt: string;
}

export default function useProfileNotification(
  userId: string
): UseQueryResult<IProfileNotification[], Error> {
  return useQuery({
    queryKey: ["profile-notification", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      const response = await fetch(`/api/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return await response.json();
    },
    staleTime: 30000,
    enabled: !!userId,
  });
}
