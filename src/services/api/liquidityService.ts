import apiClient from "@/lib/axios";

export interface PositionInfo {
  tokenId: number;
  token0Balance: number;
  token1Balance: number;
  token0Fees: number;
  token1Fees: number;
  lowerOdds: number;
  upperOdds: number;
}

export interface ClosePositionResponse {
  txHash: string;
}

export interface ClaimFeesResponse {
  txHash: string;
  amountToken0Claimed: number;
  amountToken1Claimed: number;
}

export interface UpdateAutocloseResponse {
  success: boolean;
  autoclose: boolean;
  autocloseTime: string | null;
}

export const liquidityService = {
  // Get position information
  getPositionInfo: async (tokenId: number): Promise<PositionInfo> => {
    const response = await apiClient.post("/liquidity/position-info", {
      tokenId,
    });
    // @ts-expect-error - apiClient response interceptor extracts data
    return response;
  },

  // Close position
  closePosition: async (
    marketId: string,
    tokenId: number
  ): Promise<ClosePositionResponse> => {
    const response = await apiClient.post(
      `/liquidity/${marketId}/close-position`,
      {
        tokenId,
      }
    );
    // @ts-expect-error - apiClient response interceptor extracts data
    return response;
  },

  // Claim fees
  claimFees: async (
    marketId: string,
    tokenId: number
  ): Promise<ClaimFeesResponse> => {
    const response = await apiClient.post(`/liquidity/${marketId}/claim-fees`, {
      tokenId,
    });
    // @ts-expect-error - apiClient response interceptor extracts data
    return response;
  },

  // Update autoclose date
  updateAutoclose: async (
    marketId: string,
    nftId: number,
    autocloseTime: Date | null
  ): Promise<UpdateAutocloseResponse> => {
    const response = await apiClient.post(
      `/liquidity/${marketId}/update-autoclose`,
      {
        nftId,
        autocloseTime: autocloseTime?.toISOString() || null,
      }
    );
    // @ts-expect-error - apiClient response interceptor extracts data
    return response;
  },
};
