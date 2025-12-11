import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface PortfolioOption {
  id: number;
  token: string;
  odds: string;
  tokenImage: string;
  tokenPrice: string;
  strike: number;
  expiry: number;
  expiryDays: number;
  amount: number;
  side: "Short" | "Long";
  type: "Listed" | "Holding";
  listedPrice: number | null;
  tokenName: string;
}

export default function usePortfolioOptions(
  userId: string,
  enabled: boolean
): UseQueryResult<PortfolioOption[], Error> {
  return useQuery({
    queryKey: ["portfolioOptions", userId],
    queryFn: async () => {
      // TODO: Replace this mocked data with real API call to fetch user's portfolio options
      return await new Promise<PortfolioOption[]>((resolve) =>
        setTimeout(() => {
          const mockData: PortfolioOption[] = [
            {
              id: 1,
              type: "Listed",
              side: "Short",
              listedPrice: 10,
              token: "TKN",
              tokenName: "Token name here",
              odds: "$19.30",
              tokenImage: "/images/cup.png",
              tokenPrice: "$19.30",
              strike: 3.23,
              expiry: 10,
              expiryDays: 10,
              amount: 958,
            },
            {
              id: 2,
              side: "Long",
              type: "Holding",
              listedPrice: null,
              token: "TKN",
              tokenName: "Token name here",

              odds: "$19.30",
              tokenImage: "/images/cup.png",
              tokenPrice: "$19.30",
              strike: 2.56,
              expiry: 7,
              expiryDays: 7,
              amount: 321,
            },
            {
              id: 3,
              side: "Long",
              token: "TKN",
              listedPrice: 10,
              type: "Listed",
              odds: "$19.30",
              tokenName: "Token name here",
              tokenImage: "/images/cup.png",
              tokenPrice: "$19.30",
              strike: 1.4,
              expiry: 7,
              expiryDays: 7,
              amount: 1234,
            },
          ];

          resolve(mockData);
        }, 1_000)
      );
    },
    staleTime: 30000, // Refetch after 30 seconds
    enabled: !!userId && enabled,
  });
}
