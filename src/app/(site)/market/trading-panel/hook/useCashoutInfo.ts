import { useMemo } from "react";
import { formatUnits } from "viem";
import useMarketTokens from "@/hooks/useMarketTokens";
import { IMarketData } from "@/interfaces/market";

export type CashoutSide = "yes" | "no";

export type UseCashoutInfoResult = {
  yesAmountRaw: number;
  noAmountRaw: number;
  totalTokens: number;
  yesPercentage: number;
  noPercentage: number;
  selectedAmountRaw: number;
  projectedCashoutUsd: number;
  refreshBalances: () => Promise<void>;
};

const DECIMALS = 18;

export default function useCashoutInfo(
  marketContractAddress: `0x${string}`,
  market: IMarketData,
  selectedOption: CashoutSide
): UseCashoutInfoResult {
  const { tokenABalance, tokenBBalance, refreshBalances } = useMarketTokens(marketContractAddress);

  // In our contracts, tokenA = NO, tokenB = YES
  const noAmountRaw = useMemo(() => {
    const formatted = tokenABalance ? formatUnits(tokenABalance, DECIMALS) : "0";
    return Number(formatted);
  }, [tokenABalance]);

  const yesAmountRaw = useMemo(() => {
    const formatted = tokenBBalance ? formatUnits(tokenBBalance, DECIMALS) : "0";
    return Number(formatted);
  }, [tokenBBalance]);

  const totalTokens = useMemo(() => yesAmountRaw + noAmountRaw, [yesAmountRaw, noAmountRaw]);

  const yesPercentage = useMemo(() => (totalTokens > 0 ? (yesAmountRaw / totalTokens) * 100 : 0), [yesAmountRaw, totalTokens]);
  const noPercentage = useMemo(() => (totalTokens > 0 ? (noAmountRaw / totalTokens) * 100 : 0), [noAmountRaw, totalTokens]);

  const selectedAmountRaw = selectedOption === "yes" ? yesAmountRaw : noAmountRaw;

  // Simple projection: token amount * current side price (USD)
  const projectedCashoutUsd = useMemo(() => {
    const price = selectedOption === "yes" ? market.yesPrice : market.noPrice;
    return (selectedAmountRaw || 0) * (price || 0);
  }, [selectedAmountRaw, selectedOption, market.yesPrice, market.noPrice]);

  return {
    yesAmountRaw,
    noAmountRaw,
    totalTokens,
    yesPercentage,
    noPercentage,
    selectedAmountRaw,
    projectedCashoutUsd,
    refreshBalances,
  };
} 
