import React from "react";
import { MarketCard } from "./MarketCard";
import { IMarketData } from "@/interfaces/market";

interface MarketCardWithBatchProps {
  market: IMarketData;
  marketIds: string[]; // All market IDs for batch fetching
}

export function MarketCardWithBatch({ market }: MarketCardWithBatchProps) {
  // Note: MarketCard handles its own data fetching through useMarketProbabilityFromPool
  // The batch fetching is handled at a higher level

  return <MarketCard market={market} />;
}
