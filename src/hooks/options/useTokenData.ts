import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type TTokenData = {
  name: string;
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
};

export const useTokenData = (): UseQueryResult<TTokenData, Error> => {
  return useQuery({
    queryKey: ["tokenData"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        name: "Token Name",
        symbol: "TKN",
        price: 0.0010832,
        volume: 5000,
        change24h: 10.6,
      };
    },
  });
};
