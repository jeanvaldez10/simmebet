import { useQuery } from "@tanstack/react-query";
export interface ICreatorOPtionsHistory {
  id: number;

  name: string;
  ticker: string;
  contractMax: number;
  contractCurrent: number;
  image: string;
  optionPrice: number;
  strike: number;
  expiry: string;
}

const useCreatorOptionsHistory = (userId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["creator-options-history", userId],
    queryFn: async () => {
      return await new Promise<ICreatorOPtionsHistory[]>((resolve) =>
        setTimeout(
          () =>
            resolve([
              {
                id: 1,
                name: "Token Name Here",
                ticker: "TKN",
                contractMax: 10000,
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 2,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 3,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 4,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 5,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 6,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 7,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 8,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
              },
              {
                id: 9,
                name: "Token Name Here",
                contractMax: 10000,
                ticker: "TKN",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "Jun 20th 2025",
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

export default useCreatorOptionsHistory;
