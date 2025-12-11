import React from "react";
import { useParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { marketsApi } from "@/services/api/markets";
import type { IMarketData } from "@/interfaces/market";
import { useMarketHolderCount } from "@/hooks/useMarketHolderCount";

import HorizontalLine from "./HorizontalLine";
// import { LPCard } from "./LPCard";
import V4LiquidityViewer from "@/components/liquidity/LiquidityViewer";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatTokenAmount } from "@/utils/format";

interface LiquiditySpreadProps {
  className?: string;
  poolAddress: `0x${string}`;
  market: IMarketData;
  data?: {
    totalYes: number;
    totalNo: number;
    yesPercent: number;
    noPercent: number;
    bets: number;
    fees: number;
    time: string;
    totalLp: number;
  };
}

export const LiquiditySpread: React.FC<LiquiditySpreadProps> = ({
  className = "",
  market,
  poolAddress,
}) => {
  const { id } = useParams();
  
  const { data: holderCountData, isLoading: holderCountLoading } = useMarketHolderCount(market.id);
  const { tokenATotalSupply, tokenBTotalSupply } = useMarketTokens(market.contractAddress);

  const { data: binsData, isLoading: binsLoading } = useQuery({
    queryKey: ["bins", id],
    queryFn: () => marketsApi.getMarketBins(id as string),
  });
  const bins = binsData?.bins || [];

  if (binsLoading || holderCountLoading) {
    return (
      <div
        className={`flex flex-col gap-4 bg-[#16171E] p-4 sm:p-6 rounded-2xl ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Liquidity Spread
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-[#FFFFFFA3]">Total Liquidity:</span>
            <span className="text-white">${market.totalLiquidity}</span>
          </div>
        </div>
        <div className="h-[200px] sm:h-[240px] flex items-center justify-center">
          <div className="text-white text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (bins.length === 0) {
    return (
      <div
        className={`flex flex-col gap-4 bg-[#16171E] p-4 sm:p-6 rounded-2xl ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Liquidity Spread
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-[#FFFFFFA3]">Total Liquidity:</span>
            <span className="text-white">${market.totalLiquidity}</span>
          </div>
        </div>
        <div className="h-[200px] sm:h-[240px] flex items-center justify-center">
          <div className="text-white text-sm">No swap data available</div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div
        className={`flex flex-col gap-4 bg-[#16171E] p-4 sm:p-6 rounded-2xl ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Liquidity Spread
          </h2>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-[#FFFFFFA3]">Total Liquidity:</span>
            <span className="text-white">${market.totalLiquidity.toFixed(2)}</span>
          </div>
        </div>

        <div className="relative h-[260px] overflow-hidden -ml-2 sm:-ml-4 lg:-ml-6 -mr-2 sm:-mr-4">
          <V4LiquidityViewer
            poolId={poolAddress}
            rpcUrl={process.env.NEXT_PUBLIC_ARB_RPC_URL}
            wordsAround={20}
            height={260}
            width={undefined}
            initialCenterOnCurrent={false}
            showVisibleRange={false}
          />
        </div>


        <HorizontalLine />
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#FFFFFF29]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D]"></div>
            <div className="text-[#FFFFFFA3] text-xs">{formatTokenAmount(tokenATotalSupply)} {market.noSideName}</div>
          </div>

          <div className="text-xs flex items-center gap-1 flex-shrink-0">
            <span className="text-[#FFFFFFA3]">Total Bets:</span>
            <span className="text-[#FFFFFF]">{holderCountData?.totalHolders}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#FFFFFF29]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#46FD84]"></div>
            <div className="text-[#FFFFFFA3] text-xs">{formatTokenAmount(tokenBTotalSupply)} {market.yesSideName}</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
