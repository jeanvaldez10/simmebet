import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import api from "@/services/api/config";

export interface ProfitBreakdown {
  realized: {
    value: number;
    description: string;
    count: number;
    positions: Array<{
      marketId: string;
      marketName: string;
      totalInvested: number;
      totalReturned: number;
      netProfit: number;
      transactionCount: number;
    }>;
  };
  onchainFees: {
    value: number;
    description: string;
    count: number;
  };
  unrealized: {
    value: number;
    description: string;
    count: number;
    positions: Array<{
      marketId: string;
      marketName: string;
      invested: number;
      currentValue: number;
      unrealizedPnL: number;
      yesBalance: number;
      noBalance: number;
      yesPrice: number;
      noPrice: number;
    }>;
  };
}

export interface UserProfitResponse {
  totalProfit: number;
  dbProfit: number;
  onchainProfit: number;
  unrealizedProfit: number;
  positionCount: number;
  onchainPositionsCount: number;
  activePositionsCount: number;
  breakdown: ProfitBreakdown;
}

export function useUserProfit() {
  const { dbUser } = useAuthContext();

  return useQuery<UserProfitResponse>({
    queryKey: ["user-profit", dbUser?.id],
    queryFn: async () => {
      const response = await api.get('/api/users/profit');
      return response.data;
    },
    enabled: !!dbUser?.id,
  });
}
