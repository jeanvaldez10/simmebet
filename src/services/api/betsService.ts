import api from "./config";

export interface PlaceBetRequest {
  type: string;
  amountIn: number;
  slippage: number;
  idempotencyKey: string;
}

export interface CashoutRequest {
  type: string;
  amountIn: number;
  marketAddress: string;
  idempotencyKey: string;
}

export interface SettleRequest {
  idempotencyKey: string;
}

export interface ClaimWinningsRequest {
  idempotencyKey: string;
}

export interface RedeemTokensRequest {
  tokenAmount: number;
  idempotencyKey: string;
}

export interface SettlementResponse {
  txHash: string | null;
  success: boolean | null;
  message: string | null;
}

export const betsService = {
  placeBet: async (userId: string, marketAddress: string, data: PlaceBetRequest) => {
    try {
      console.log("POST BET", `/bets/${userId}/swap/${marketAddress}`, data)
      
      const response = await api.post(`/bets/${userId}/swap/${marketAddress}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cashoutFunds: async (data: CashoutRequest) => {
    const response = await api.post(`/api/bets/cashout/${data.marketAddress}`, data);
    return response.data;
  },

  updateBelief: async (marketId: string, data: {
    beliefPercentage: number;
    amountIn: number;
    idempotencyKey: string;
    persist: boolean;
  }) => {
    try {
      console.log("UPDATE BELIEF", `/bets/update-belief/${marketId}`, data)
      const response = await api.post(`/bets/update-belief/${marketId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  settleMarket: async (userId: string, marketAddress: string, data: SettleRequest) => {
    try {
      const response = await api.post(`/bets/${userId}/settle/${marketAddress}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  claimWinnings: async (userId: string, marketAddress: string, data: ClaimWinningsRequest) => {
    try {
      const response = await api.post(`/api/bets/claim-winnings/${marketAddress}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  redeemTokens: async (userId: string, marketAddress: string, data: RedeemTokensRequest) => {
    try {
      const response = await api.post(`/bets/${userId}/redeem-tokens/${marketAddress}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  mintTokens: async (userId: string, marketAddress: string, data: {
    collateralAmount: number;
    idempotencyKey?: string;
  }) => {
    try {
      const response = await api.post(`/bets/${userId}/mint/${marketAddress}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default betsService;
