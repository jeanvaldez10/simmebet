"use client";

import React from "react";
import { erc20Abi } from "viem";
import { arbitrum } from "viem/chains";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import AIResult from "@/components/AIResult";
import marketBase from "@/abis/ConditionalTokenMarketBase.json";
import { formatTokenAmount } from "@/utils/format";
import { useAuthContext } from "@/context/AuthProvider";
import { useReadContracts } from "wagmi";
import { MarketInfo } from "@/components/market/MarketInfo";
import { PriceChart } from "@/components/common/PriceChart";
import { MarketRules } from "@/components/market/MarketRules";
import { MarketTweets } from "@/components/market/MarketTweets";
import { LiquiditySpread } from "@/components/common/LiquiditySpread";
import { TradingPanel } from "../trading-panel";
import { useMarket } from "@/hooks/useMarket";
import { useMarketSwaps } from "@/hooks/useMarketSwaps";
import { useInitialBelief } from "@/hooks/useInitialBelief";

interface MarketDetailClientProps {
  marketId: string;
}

const MarketDetailClient = ({ marketId }: MarketDetailClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const option = searchParams?.get("option");
  const marketBaseAbi = marketBase.abi;

  const [persist, setPersist] = useState(true); // default persist to true
  const [viewer] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const { dbUser } = useAuthContext();

  // Determine if the identifier is a contract address or market ID
  const isContractAddress = marketId?.startsWith('0x') && marketId?.length === 42;

  const { data: marketData, isLoading: marketLoading } = useMarket(marketId, isContractAddress);
  const market = marketData?.market;

  // Get swaps data for PriceChart
  const { data: swapsData, isLoading: swapsLoading } = useMarketSwaps(market?.id, marketId, isContractAddress);
  const swaps = swapsData?.swaps || [];

  // Use the new hook for initial belief calculation (now self-contained)
  const { initialBelief, marketProbability, isLoading: beliefLoading } = useInitialBelief({ 
    option, 
    marketId: market?.id, 
    marketIdentifier: marketId, 
    isContractAddress 
  });

  useEffect(() => {
    const hasData = !!market && swaps;
    
    if (!hasData && (marketLoading || swapsLoading || beliefLoading)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [marketLoading, swapsLoading, beliefLoading, market, swaps]);

  const { data: outcomeTokens } = useReadContracts({
    contracts: [
      {
        address: market?.contractAddress as `0x${string}`,
        abi: marketBaseAbi,
        functionName: "outcomeTokens",
        args: [BigInt(0)],
        chainId: arbitrum.id,
      },
      {
        address: market?.contractAddress as `0x${string}`,
        abi: marketBaseAbi,
        functionName: "outcomeTokens",
        args: [BigInt(1)],
        chainId: arbitrum.id,
      },
    ],
  });

  const { data: tokenBalances } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: outcomeTokens?.[0]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [dbUser?.walletAddress as `0x${string}`],
      },
      {
        address: outcomeTokens?.[1]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [dbUser?.walletAddress as `0x${string}`],
      },
    ],
  });

  const formattedTokenABalance = formatTokenAmount(tokenBalances?.[0]);
  const formattedTokenBBalance = formatTokenAmount(tokenBalances?.[1]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="text-red-500 text-center py-4">
        Error: {error || "Market not found"}
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto px-4 md:px-6" style={{ paddingTop: '140px', paddingBottom: '40px' }}>
      {/* Back to Markets button */}
      <button
        onClick={() => router.push('/markets')}
        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors my-3"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-md font-medium">Back to Markets</span>
      </button>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column for chart and data */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Chart section */}
          <div className="w-full bg-[#16171E52] border border-[#FFFFFF29] rounded-[16px] backdrop-blur-sm p-4">
            <MarketInfo
              market={market}
              marketQuestion={market?.question as string}
              marketProbability={marketProbability}
              isRenounced={false}
              teamInfo={{
                team2: {
                  name: market?.noSideName || "No",
                  imageUrl: market?.noSideIcon || "/images/cup.png",
                },
                team1: {
                  name: market?.yesSideName || "Yes",
                  imageUrl: market?.yesSideIcon || "/images/cup.png",
                },
              }}
            />
            <PriceChart swaps={swaps} />
          </div>

          {/* TradingPanel appears here on mobile, only visible on small screens */}
          <div className="lg:hidden">
            <TradingPanel
              market={market}
              initialOption={option as string}
              marketProbability={marketProbability}
              marketAddress={market.contractAddress}
              formattedTokenABalance={formattedTokenABalance}
              formattedTokenBBalance={formattedTokenBBalance}
              initialBelief={initialBelief}
              persist={persist}
              togglePersist={() => setPersist(!persist)}
            />
            <div className="mt-4">
              <MarketRules rules={market.rules} creatorName={market.creatorName} creatorAvatar={market.creatorAvatar} />
            </div>
          </div>

          {/* Chart filter and liquidity/AI section */}
          <div className="flex flex-col gap-4">
            {market.isResolved ? (
              <AIResult 
                viewer={viewer} 
                curatorName={market.creatorName}
                curatorAvatar={market.creatorAvatar}
                resolvedOption={market.resolvedOption}
                resolutionEvidence={market.resolutionEvidence}
              />
            ) : (
              <LiquiditySpread
                poolAddress={market.poolAddress as `0x${string}`}
                market={market}
              />
            )}
          </div>

          {/* Market Tweets section */}
          <div className="w-full mt-4">
            <MarketTweets market={market} />
          </div>
        </div>

        {/* Right column for trading panel and rules - hidden on mobile */}
        <div className="hidden lg:flex flex-col gap-6 w-[400px]">
          <TradingPanel
            market={market}
            initialOption={option as string}
            marketProbability={marketProbability}
            marketAddress={market.contractAddress}
            formattedTokenABalance={formattedTokenABalance}
            formattedTokenBBalance={formattedTokenBBalance}
            initialBelief={initialBelief}
            persist={persist}
            togglePersist={() => setPersist(!persist)}
          />
          <MarketRules rules={market.rules} creatorName={market.creatorName} creatorAvatar={market.creatorAvatar} />
        </div>
      </div>
    </div>
  );
};

export default MarketDetailClient;