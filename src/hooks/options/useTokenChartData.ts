import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface ChartData {
  timestamp: number;
  price: number;
  strikePrice: number;
}

const generateMockData = (): ChartData[] => {
  const basePrice = 18.67;
  const strikePrice = 46.53;
  const dataPoints = 200;
  const data = [];
  const now = new Date();
  let lastPrice = basePrice;

  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(
      now.getTime() - (dataPoints - i) * 24 * 60 * 60 * 1000
    );
    const randomVariation = (Math.random() - 0.5) * 2;
    const trendComponent = Math.sin(i / 20) * 1.5;
    const price = Math.max(10, lastPrice + randomVariation + trendComponent);
    lastPrice = Number(price?.toFixed(2));

    data.push({
      timestamp: date.getTime(),
      price,
      strikePrice: strikePrice,
    });
  }
  return data;
};

export function useTokenChartData(tokenId: string, timeframe: "1D" | "1W" | "1M" | "1Y"): UseQueryResult<ChartData[], Error> {
  return useQuery({
    queryKey: ["tokenChartData", tokenId, timeframe],
    queryFn: () => {
      console.log("refetching");
      return generateMockData()
    },
    refetchInterval: 15000,
    staleTime: 15000,
  });
}
