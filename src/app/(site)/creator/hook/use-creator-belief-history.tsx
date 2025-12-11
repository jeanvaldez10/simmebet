import { useQuery } from "@tanstack/react-query";

export interface ICreatorBeliefHistory {
  id: number;
  title: string;
  image: string;
  volume: number;
  fees: number;
  duration: string;
  result: "yes" | "no";
}

const useCreatorBeliefHistory = (userId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["creator-belief-history", userId],
    queryFn: async () => {
      return await new Promise<ICreatorBeliefHistory[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                id: 1,
                title:
                  "Will Celtics beat Knicks on the NBA quarter finals 2025?",

                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "yes",
              },
              {
                id: 2,
                title:
                  "Will, Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "yes",
              },
              {
                id: 3,
                title:
                  "Will, Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "no",
              },
              {
                id: 4,
                title:
                  "Will Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "yes",
              },
              {
                id: 5,
                title:
                  "Will, Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "no",
              },
              {
                id: 6,
                title:
                  "Will, Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "no",
              },
              {
                id: 7,
                title:
                  "Will Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "yes",
              },
              {
                id: 8,
                title:
                  "Will, Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "yes",
              },
              {
                id: 9,
                title:
                  "Will, Celtics beat Knicks on the NBA quarter finals 2025?",
                image: "/images/cup.png",
                volume: 5000,
                fees: 192.3,
                duration: "7d",
                result: "no",
              },
            ]),
          1_000
        )
      );
    },
    staleTime: 30000,
    enabled: !!userId && enabled,
  });
};

export default useCreatorBeliefHistory;
