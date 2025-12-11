/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axios";
import { IMarketData, IMarketFilter } from "@/interfaces/market";
import type { MarketSwap as PrismaMarketSwap, FormattedSwap } from "@/generated/prisma";
import { BarChartTick } from "@/utils/liquidity/interfaces";

export interface PriceChartData {
  date: string;
  yes: number;
  no: number;
}

export interface LiquiditySpreadData {
  value: number;
  percentage: number;
  type: "yes" | "no";
}

export type MarketSwap = PrismaMarketSwap;

type ApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
};

export const marketsApi = {
  getAllMarkets: async (filter?: IMarketFilter) => {
    const response = await apiClient.get<
      ApiResponse<{ markets: IMarketData[] }>,
      { markets: IMarketData[] }
    >("/markets", {
      params: filter,
    });
    return response;
  },

  getMarketById: async (id: string): Promise<{ market: IMarketData }> => {
    const response = await apiClient.get<
      ApiResponse<{ market: IMarketData }>,
      { market: IMarketData }
    >(`/markets/${id}`);
    return response;
  },

  getMarketByContractAddress: async (contractAddress: string): Promise<{ market: IMarketData }> => {
    // Use the unified endpoint that handles both contract addresses and market IDs
    const response = await apiClient.get<
      ApiResponse<{ market: IMarketData }>,
      { market: IMarketData }
    >(`/markets/${contractAddress}`);
    return response;
  },

  getMarketSwapsByContractAddress: async (contractAddress: string): Promise<{ swaps: FormattedSwap[] }> => {
    // Use the unified endpoint that handles both contract addresses and market IDs
    const response = await apiClient.get<
      ApiResponse<{ swaps: FormattedSwap[] }>,
      { swaps: FormattedSwap[] }
    >(`/markets/${contractAddress}/swaps`);
    return response;
  },

  getMarketTweets: async (marketId: string) => {
    const response = await apiClient.get<
      ApiResponse<{ tweets: any[] }>,
      { tweets: any[] }
    >(`/markets/${marketId}/tweets`);
    return response;
  },

  getMarketActivities: async (marketId: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<
      ApiResponse<{ activities: any[]; pagination: any }>,
      { activities: any[]; pagination: any }
    >(`/markets/${marketId}/activities?page=${page}&limit=${limit}`);
    return response;
  },

  getMarketHolders: async (marketId: string) => {
    const response = await apiClient.get<
      ApiResponse<{ holders: any[] }>,
      { holders: any[] }
    >(`/markets/${marketId}/holders`);
    return response;
  },

  getPriceChartData: async (marketId: string, period: string = "6h") => {
    try {
      const response = await apiClient.get<ApiResponse<PriceChartData[]>>(
        `/markets/${marketId}/price-chart`,
        {
          params: {
            period,
          },
        }
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching price chart data:", error);
      return [];
    }
  },

  getLiquiditySpreadData: async (marketId: string) => {
    try {
      const response = await apiClient.get<ApiResponse<LiquiditySpreadData[]>>(
        `/markets/${marketId}/liquidity-spread`
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching liquidity spread data:", error);
      return [];
    }
  },

  getMarketSwaps: async (marketId: string) => {
    const response = await apiClient.get<
      ApiResponse<{ swaps: FormattedSwap[] }>,
      { swaps: FormattedSwap[] }
    >(`/markets/${marketId}/swaps`);
    return response;
  },

  getMarketBins: async (marketId: string) => {
    const response = await apiClient.get<
      ApiResponse<{ bins: BarChartTick[] }>,
      { bins: BarChartTick[] }
    >(`/markets/${marketId}/bins`);
    return response;
  },

  getMarketLastPrice: async (marketId: string) => {
    try {
      const response = await apiClient.get<
        ApiResponse<{ price: number }>,
        { price: number }
      >(`/markets/${marketId}/last-price`);
      return response;
    } catch (error) {
      console.error("Error fetching last price:", error);
      return { price: 0 };
    }
  },

  getMarketsLastPrices: async (marketIds: string[]) => {
    try {
      const response = await apiClient.post<
        ApiResponse<Record<string, { price: number; timestamp: Date } | null>>,
        Record<string, { price: number; timestamp: Date } | null>
      >(`/markets/last-prices`, { marketIds });
      return response;
    } catch (error) {
      console.error("Error fetching last prices:", error);
      return {};
    }
  },

  getMarketsBatch: async (marketIds: string[]) => {
    try {
      const response = await apiClient.post<
        ApiResponse<Record<string, { market: any } | null>>,
        Record<string, { market: any } | null>
      >(`/markets/batch`, { marketIds });
      return response;
    } catch (error) {
      console.error("Error fetching market details:", error);
      return {};
    }
  },

  createMarket: async (
    data: Omit<IMarketData, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await apiClient.post<
      ApiResponse<{ market: IMarketData }>,
      { market: IMarketData }
    >("/markets", data);
    return response;
  },

  updateMarket: async (id: string, data: Partial<IMarketData>) => {
    const response = await apiClient.put<
      ApiResponse<{ market: IMarketData }>,
      { market: IMarketData }
    >(`/markets/${id}`, data);
    return response;
  },

  deleteMarket: async (id: string) => {
    const response = await apiClient.delete<
      ApiResponse<{ success: boolean }>,
      { success: boolean }
    >(`/markets/${id}`);
    return response;
  },
};
