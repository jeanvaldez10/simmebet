import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface IWatchListBelief {
  id: number;
  tokenImage: string;
  name: string;
  status: "Ongoing" | "resolved" | "rejected";
  bet: string;
  yesBet: number;
  noBet: number;
}

export default function useWatchListBelief(
  userId: string,
  enabled: boolean
): UseQueryResult<IWatchListBelief[], Error> {
  return useQuery({
    queryKey: ["watchlist-belief", userId],
    queryFn: async () => {
      return await new Promise<IWatchListBelief[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                id: 1,
                name: "Who will win UEFA this year?",
                tokenImage: "/images/cup.png",
                status: "Ongoing",
                bet: "Yes at $50.50",
                yesBet: 70,
                noBet: 30,
              },
              {
                id: 2,
                name: "Who will win UEFA this year?",
                status: "resolved",
                tokenImage: "/images/cup.png",
                bet: "Yes at $50.50",
                yesBet: 70,
                noBet: 30,
              },
              {
                id: 3,
                name: "Who will win UEFA this year?",
                status: "rejected",
                tokenImage: "/images/cup.png",
                bet: "Yes at $50.50",
                yesBet: 70,
                noBet: 30,
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
