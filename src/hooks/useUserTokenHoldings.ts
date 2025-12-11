import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";

export interface UserTokenHolding {
  marketId: string;
  yesTokenBalance: number;
  noTokenBalance: number;
  yesTokenAddress: string;
  noTokenAddress: string;
}

export function useUserTokenHoldings() {
  const { dbUser } = useAuthContext();
  
  return useQuery({
    queryKey: ["userTokenHoldings", dbUser?.id],
    queryFn: async (): Promise<UserTokenHolding[]> => {
      return [
        {
          marketId: "market-1",
          yesTokenBalance: 150.5,
          noTokenBalance: 0,
          yesTokenAddress: "0x1234567890123456789012345678901234567890",
          noTokenAddress: "0x2345678901234567890123456789012345678901",
        },
        {
          marketId: "market-2", 
          yesTokenBalance: 0,
          noTokenBalance: 75.25,
          yesTokenAddress: "0x3456789012345678901234567890123456789012",
          noTokenAddress: "0x4567890123456789012345678901234567890123",
        },
        {
          marketId: "market-3",
          yesTokenBalance: 200.0,
          noTokenBalance: 100.0,
          yesTokenAddress: "0x5678901234567890123456789012345678901234",
          noTokenAddress: "0x6789012345678901234567890123456789012345",
        },
      ];
    },
    gcTime: 5 * 60 * 1000,
    enabled: !!dbUser?.id,
  });
}
