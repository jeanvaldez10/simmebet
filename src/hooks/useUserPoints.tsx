import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import api from "@/services/api/config";

interface UserPointsData {
  tradingVolume: number;
  tradingPoints: number;
  tradingBonus: number;
  referralPoints: number;
  totalPoints: number;
  tradeCount: number;
  hasReferralBonus: boolean;
  referredFriends: number;
}

export function useUserPoints() {
  const { dbUser } = useAuthContext();

  return useQuery<UserPointsData>({
    queryKey: ["user-points", dbUser?.id],
    queryFn: async () => {
      const response = await api.get("/api/users/points");
      return response.data;
    },
    enabled: !!dbUser?.id,
  });
}

