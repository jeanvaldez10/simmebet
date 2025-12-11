import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";
import { calculateComprehensiveOdds } from "@/utils/odds";
import { usePoolPrice } from "./usePoolPrice";
import { IMarketData } from "@/interfaces/market";

export interface MarketOdds {
  probabilities: {
    yes: number;
    no: number;
    yesPercentage: number;
    noPercentage: number;
  };
  decimalOdds: {
    yes: number;
    no: number;
  };
  fractionalOdds: {
    yes: string;
    no: string;
  };
  americanOdds: {
    yes: string;
    no: string;
  };
  logOdds: {
    yes: number;
    no: number;
  };
  priceRatio: number;
}

export function useMarket(marketIdentifier: string | undefined, isContractAddress: boolean | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ["market", marketIdentifier, isContractAddress],
    queryFn: () => {
      if (isContractAddress) {
        return marketsApi.getMarketByContractAddress(marketIdentifier as string);
      } else {
        return marketsApi.getMarketById(marketIdentifier as string);
      }
    },
    enabled: enabled && !!marketIdentifier,
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

export function useMarketOdds(marketIdentifier: string | undefined, isContractAddress: boolean | undefined, enabled: boolean = true) {
  const { data: market, isLoading: marketLoading } = useMarket(marketIdentifier, isContractAddress, enabled);
  
  const { data: lastPrice, isLoading: priceLoading } = useQuery({
    queryKey: ["market-last-price", marketIdentifier],
    queryFn: async () => {
      const response = await marketsApi.getMarketLastPrice(marketIdentifier as string);
      return response?.price || 0;
    },
    enabled: enabled && !!marketIdentifier,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds (reduced from 25)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Calculate odds immediately when we have either market data or last price
  const odds = useQuery<MarketOdds>({
    queryKey: ["market-odds", marketIdentifier, lastPrice, market?.market?.yesPrice, market?.market?.noPrice],
    queryFn: () => {
      let priceRatio = 1; // Default to 50/50

      // Prioritize lastPrice if available (most recent data)
      if (lastPrice && lastPrice > 0) {
        // lastPrice is actually the YES probability (0-1), convert to price ratio
        // If YES probability is 0.4483, then NO probability is 0.5517
        // Price ratio R = NO/YES = 0.5517/0.4483 = 1.23
        const yesProb = lastPrice;
        const noProb = 1 - lastPrice;
        priceRatio = noProb / yesProb;
      } else if (market?.market?.yesPrice && market?.market?.noPrice) {
        // Fallback to market's stored prices (these are already percentages 0-100)
        const yesProb = market.market.yesPrice / 100;
        const noProb = market.market.noPrice / 100;
        priceRatio = noProb / yesProb;
      }

      return calculateComprehensiveOdds(priceRatio);
    },
    enabled: !!marketIdentifier && (!!market?.market || lastPrice !== undefined),
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 10000, // Refetch every 10 seconds (reduced from 25)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return {
    market,
    odds: odds.data,
    isLoading: marketLoading || priceLoading || odds.isLoading,
    error: odds.error,
  };
}

// Legacy hook for backward compatibility
export function useMarketProbability(marketIdentifier: string | undefined, isContractAddress: boolean | undefined) {
  const { odds, isLoading } = useMarketOdds(marketIdentifier, isContractAddress);
  
  return {
    data: odds ? {
      yes: odds.probabilities.yesPercentage,
      no: odds.probabilities.noPercentage,
      loading: isLoading,
    } : undefined,
    isLoading,
  };
}

// New hook that uses real-time pool price as primary source
export function useMarketProbabilityFromPool(
  marketIdentifier: string | undefined, 
  isContractAddress: boolean | undefined,
  lastPriceData?: { price: number; timestamp: Date } | null,
  marketData?: { market: IMarketData } | null,
  batchMarketsError?: Error | null,
  batchLastPricesError?: Error | null
) {
  const hasBatchData = lastPriceData || marketData;
  const hasBatchError = batchMarketsError || batchLastPricesError;
  
  // Only call individual hooks if:
  // 1. Batch has actually failed (not just loading or not available yet)
  const shouldUseIndividual = Boolean(hasBatchError);
  
  
  const individualMarket = useMarket(
    marketIdentifier, 
    isContractAddress,
    shouldUseIndividual // Only enable individual query if batch failed
  );
  
  // Use batch data if available, otherwise use individual market data
  const finalMarket = marketData?.market || individualMarket.data?.market;
  
  const { 
    data: poolPriceData, 
    isLoading: poolPriceLoading 
  } = usePoolPrice({
    poolId: finalMarket?.poolAddress as `0x${string}`,
    enabled: !!finalMarket?.poolAddress && !hasBatchData, // Only load pool data if no batch data
  });

  // Only call individual odds hook if batch failed
  const individualOdds = useMarketOdds(
    marketIdentifier, 
    isContractAddress,
    shouldUseIndividual // Only enable individual query if batch failed
  );
  
  // If we have batch data, we don't need to wait for individual calls
  const isLoading = hasBatchData ? false : (individualMarket.isLoading || poolPriceLoading || individualOdds.isLoading);
  
  // Calculate probability data with priority: pool > batch market data > individual odds
  // Skip batch last price calculation to avoid data inconsistency issues
  const probabilityData: { yes: number; no: number } | undefined = (() => {
    if (poolPriceData) {
      return {
        yes: poolPriceData.yesProbability * 100, // Convert to percentage
        no: poolPriceData.noProbability * 100,   // Convert to percentage
      };
    }
    
    if (finalMarket && finalMarket.yesPercentage !== undefined && finalMarket.noPercentage !== undefined) {
      // Use batch market data percentages (more reliable than last price)
      return {
        yes: finalMarket.yesPercentage,
        no: finalMarket.noPercentage,
      };
    }
    
    if (individualOdds.odds) {
      return {
        yes: individualOdds.odds.probabilities.yesPercentage,
        no: individualOdds.odds.probabilities.noPercentage,
      };
    }
    
    return undefined;
  })();


  return {
    data: probabilityData,
    isLoading,
    source: poolPriceData ? 'pool' : lastPriceData ? 'batch' : 'odds',
  };
}
