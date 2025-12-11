import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface IProfileFriends {
  id: number;
  image: string;
  name: string;
  profitLoss: string;
  volume: string;
  trades: string;
}

export default function useProfileFriends(
  userId: string
): UseQueryResult<IProfileFriends[], Error> {
  return useQuery({
    queryKey: ["profile-friends", userId],
    queryFn: async () => {
      return await new Promise<IProfileFriends[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                id: 1,
                name: "Alice",
                image: "/images/Ellipse 1631.png",
                profitLoss: "1,200",
                volume: "25,000",
                trades: "12",
              },
              {
                id: 2,
                name: "Alice",
                image: "/images/Ellipse 1631.png",
                profitLoss: "1,200",
                volume: "25,000",
                trades: "12",
              },
              {
                id: 3,
                name: "Alice",
                image: "/images/Ellipse 1631.png",
                profitLoss: "1,200",
                volume: "25,000",
                trades: "12",
              },
            ]),
          1_000
        )
      );
    },
    staleTime: 30000,
    enabled: !!userId,
  });
}
