import { useQuery } from "@tanstack/react-query";
export interface ICreatorOPtionsActive {
  id: number;

  name: string;
  ticker: string;
  contractMax: number;
  contractCurrent: number;
  image: string;
  optionPrice: number;
  strike: number;
  expiry: string;

  type: "call" | "put";

  tokensPerOption: number;
}

const useCreatorOptionsActive = (userId: string) => {
  return useQuery({
    queryKey: ["creator-options-active", userId],
    queryFn: async () => {
      return await new Promise<ICreatorOPtionsActive[]>((resolve) =>
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
                expiry: "7 days",
                type: "call",
                tokensPerOption: 10,
              },
              {
                id: 2,
                name: "Bitcoin",
                contractMax: 20000,
                ticker: "BTC",
                image: "/images/football.png",
                contractCurrent: 1000,
                optionPrice: 12.3,
                strike: 0.005,
                expiry: "7 days",
                type: "call",
                tokensPerOption: 0.1,
              },
              {
                id: 3,
                name: "Ethereum",
                contractMax: 7000,
                ticker: "ETH",
                image: "/images/cup.png",
                contractCurrent: 5000,
                optionPrice: 10.3,
                strike: 0.005,
                expiry: "7 days",
                type: "put",
                tokensPerOption: 0.01,
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
                expiry: "7 days",
                type: "call",
                tokensPerOption: 10,
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
                expiry: "7 days",
                type: "put",
                tokensPerOption: 10,
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
                expiry: "7 days",
                type: "put",
                tokensPerOption: 10,
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
                expiry: "7 days",
                type: "put",
                tokensPerOption: 10,
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
                expiry: "7 days",
                type: "call",
                tokensPerOption: 10,
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
                expiry: "7 days",
                type: "call",
                tokensPerOption: 10,
              },
            ]),
          1_000
        )
      );
    },
    staleTime: 30000,
    enabled: !!userId,
  });
};

export default useCreatorOptionsActive;
