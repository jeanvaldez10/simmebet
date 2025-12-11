import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface IWatchListOptions {
  id: number;
  tokenImage: string;
  token: string;
  position: "long" | "short";
  price: string;
  options: string;
  strike: string;
  expiry: string;
}

export default function useWatchListOptions(
  userId: string,
  enabled: boolean
): UseQueryResult<IWatchListOptions[], Error> {
  return useQuery({
    queryKey: ["watchlist-options", userId],
    queryFn: async () => {
      return await new Promise<IWatchListOptions[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                id: 1,
                token: "TKN",
                tokenImage: "/images/cup.png",
                position: "long",
                price: "12,30",
                options: "5000 of 10000",
                strike: "0.005",
                expiry: "7d",
              },
              {
                id: 2,
                token: "TKN",
                position: "long",
                tokenImage: "/images/cup.png",
                price: "12,30",
                options: "5000 of 10000",
                strike: "0.005",
                expiry: "7d",
              },
              {
                id: 3,
                token: "TKN",
                position: "long",
                tokenImage: "/images/cup.png",
                price: "12,30",
                options: "5000 of 10000",
                strike: "0.005",
                expiry: "7d",
              },
            ]),
          1_000
        )
      );
    },
    staleTime: 30000,
    enabled: !!userId && enabled,
  });
}
