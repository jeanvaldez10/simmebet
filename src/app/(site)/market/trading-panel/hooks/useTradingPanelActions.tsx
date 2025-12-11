import { useAuthContext } from '@/context/AuthProvider';
import { IMarketData } from '@/interfaces/market';
import { betsService } from '@/services/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useTradingPanel } from '../context/TradingPanelContext';
import { useQueryClient } from '@tanstack/react-query';
import useMarketTokens from '@/hooks/useMarketTokens';
import { invalidateMarketCaches } from '@/utils/liquidityCacheUtils';

export const useTradingPanelActions = (market: IMarketData, marketAddress: string) => {
  const { state, dispatch } = useTradingPanel();
  const { dbUser } = useAuthContext();
  const queryClient = useQueryClient();
  const { refreshBalances } = useMarketTokens(marketAddress as `0x${string}`);

  const handlePlaceBetConfirm = async (option: string, betAmount: string) => {
    try {
      if (!dbUser?.id) return;
      const normalizedAmount = parseFloat(betAmount);

      if (
        isNaN(normalizedAmount) ||
        normalizedAmount <= 0 ||
        normalizedAmount > 1
      ) {
        throw new Error("Bet amount must be between 0 and 100");
      }

      const betRequest = {
        type: option.toLowerCase(),
        amountIn: normalizedAmount,
        slippage: state.slippageValue / 100,
        targetOdds: state.belief,
        persist: state.persist,
        idempotencyKey: uuidv4(),
      };

      const betResponse = await axios.post(
        `/api/bets/swap/${marketAddress}`,
        betRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (betResponse?.data?.txHash) {
        dispatch({ type: 'SET_TX_HASH', payload: betResponse.data.txHash });
      }

      // Refresh token balances and all data after successful bet placement
      await refreshBalances();
      await invalidateMarketCaches(queryClient, market.id, dbUser.id, market.contractAddress);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error placing bet:", error);
      toast.error(message || "Failed to place bet. Please try again.");
      throw error;
    } finally {
      dispatch({ type: 'SET_MODAL', payload: null });
    }
  };

  const handleCloseBetConfirm = async (option: string, amount: string) => {
    if (!dbUser?.id) return;
    try {
      const cashoutRequest = {
        type: option.toLowerCase(),
        amountIn: parseFloat(amount),
        marketAddress: market.contractAddress,
        idempotencyKey: uuidv4(),
      };

      const cashoutResponse = await betsService.cashoutFunds(cashoutRequest);
      if (cashoutResponse?.txHash) {
        dispatch({ type: 'SET_TX_HASH', payload: cashoutResponse.txHash });
      }
      
      await refreshBalances();
      // Invalidate all market caches including liquidity positions
      await invalidateMarketCaches(queryClient, market.id, dbUser.id);
      toast.success("Cash out successful!");
      
      return {
        txHash: cashoutResponse?.txHash,
        amountOut: cashoutResponse?.amountOut,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error cashing out:", error);
      toast.error(message || "Failed to cash out. Please try again.");
      throw error;
    }
  };

  const validateForm = () => {
    const numAmount = parseFloat(state.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    if (state.insufficientFunds) {
      toast.error("Insufficient funds");
      return false;
    }
    return true;
  };

  const handleUpdateBetConfirm = async (option: string, amount: string, beliefPercentage: number, persist: boolean) => {
    try {
      if (!dbUser?.id) return;

      const updateRequest = {
        beliefPercentage: beliefPercentage,
        amountIn: parseFloat(amount),
        slippage: state.slippageValue / 100,
        persist,
        idempotencyKey: uuidv4(),
      };

      const updateResponse = await axios.post(
        `/api/bets/update-belief/${market.id}`,
        updateRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (updateResponse?.data?.txHash) {
        dispatch({ type: 'SET_TX_HASH', payload: updateResponse.data.txHash });
      }

      await refreshBalances();
      // Invalidate all market caches including liquidity positions
      await invalidateMarketCaches(queryClient, market.id, dbUser.id);

      toast.success("Bet updated successfully!");
      
      return updateResponse;
    } catch (error: unknown) {
      console.error("Error updating bet:", error);
      toast.error("Failed to update bet. Please try again.");
      throw error;
    }
  };

  return {
    handlePlaceBetConfirm,
    handleUpdateBetConfirm,
    handleCloseBetConfirm,
    validateForm,
  };
};
