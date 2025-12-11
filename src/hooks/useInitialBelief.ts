import { useMemo } from "react";
import { useMarketProbability, useMarketProbabilityFromPool } from "./useMarket";

interface UseInitialBeliefParams {
  option: string | null;
  marketId: string | undefined;
  marketIdentifier: string | undefined;
  isContractAddress: boolean | undefined;
  usePoolPrice?: boolean; // New parameter to choose data source
}

export function useInitialBelief({ 
  option, 
  marketId, 
  marketIdentifier, 
  isContractAddress,
  usePoolPrice = true // Default to using pool price for real-time data
}: UseInitialBeliefParams) {
  // Always call both hooks, but only use the result from the selected one
  const poolResult = useMarketProbabilityFromPool(marketId || marketIdentifier, isContractAddress);
  const regularResult = useMarketProbability(marketId || marketIdentifier, isContractAddress);
  
  // Use the selected data source
  const { data: marketProbability, isLoading } = usePoolPrice ? poolResult : regularResult;

  // Calculate initial belief based on option and market probability
  const initialBelief = useMemo(() => {
    if (!marketProbability) return 50; // Default to 50 if no data
    
    if (option === "yes" || option === null) {
      return marketProbability.yes;
    } else {
      return marketProbability.no;
    }
  }, [option, marketProbability]);

  return {
    initialBelief,
    marketProbability,
    isLoading,
  };
}
