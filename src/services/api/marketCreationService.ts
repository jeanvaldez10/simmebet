import api from "./config";

export interface CreateMarketRequest {
  marketName: string;
  additionalInfo: string;
  outcomes: Array<{
    name: string;
    symbol: string;
    icon: string;
  }>;
  collateralToken: string;
  collateralMultiplier: number;
  oracle: string;
  oracleType: number;
  creatorFeeBps: number;
  poolFee: number;
  liquidity: {
    initialOdds: number;
    tickSpacing: number;
    initialLiquidity: number;
    minTick: number;
    maxTick: number;
  };
  date: string;
  tieIsPossible: boolean;
  categoryIds: string[];
  image: string;
  imageSquare: string;
  socialImage: string;
  rules: string[];
}

export interface CreateMarketResponse {
  txHash: string;
  poolKey: string;
  marketAddress: string;
  yesTokenAddress: string;
  noTokenAddress: string;
  oracleMarketId: string;
}

export const marketCreationService = {
  createMarket: async (
    data: CreateMarketRequest
  ): Promise<CreateMarketResponse> => {
    try {
      console.log(
        "Creating market via external API:",
        JSON.stringify(data, null, 2)
      );

      const response = await api.post("/market/", data);
      return response.data;
    } catch (error) {
      console.error("Market creation failed:", error);

      // Log the response details for debugging
      //   if (error && typeof error === "object" && "response" in error) {
      //     const axiosError = error as any;
      //     console.error("Response status:", axiosError.response?.status);
      //     console.error("Response data:", axiosError.response?.data);
      //     console.error("Response headers:", axiosError.response?.headers);
      //   }

      throw error;
    }
  },
};
