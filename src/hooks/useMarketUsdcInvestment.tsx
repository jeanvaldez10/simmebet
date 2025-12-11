import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import api from "@/services/api/config";

export function useMarketUsdcInvestment(marketId?: string) {
  const { dbUser } = useAuthContext();

  return useQuery({
    queryKey: ["market-usdc-investment", dbUser?.id, marketId],
    queryFn: async () => {
      const response = await api.get(`/api/users/market-usdc-investment?marketId=${marketId}`);
      return response.data.usdcInvestment;
    },
    enabled: !!dbUser?.id && !!marketId,
  });
}
