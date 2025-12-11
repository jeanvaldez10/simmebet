import React from "react";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatTokenAmount } from "@/utils/format";
import { probabilityToAmericanOdds } from "@/utils/odds";

const HoldingsSummary = ({
  marketContractAddress,
  market,
}: {
  marketContractAddress: `0x${string}`;
  market?: {
    yesPrice: number;
    noPrice: number;
  };
}) => {
  const { tokenABalance, tokenBBalance } = useMarketTokens(marketContractAddress);

  // Always show extended info (American odds and $ values)
  const shouldShowExtended = true;

  const noBalance = formatTokenAmount(tokenABalance, 18);
  const yesBalance = formatTokenAmount(tokenBBalance, 18);

  // Calculate American odds and $ value per token
  const yesProbability = market ? market.yesPrice / 2 : 0;
  const noProbability = market ? market.noPrice / 2 : 0;
  const yesAmericanOdds = market ? probabilityToAmericanOdds(yesProbability) : "N/A";
  const noAmericanOdds = market ? probabilityToAmericanOdds(noProbability) : "N/A";
  
  const yesValuePerToken = market ? market.yesPrice : 0;
  const noValuePerToken = market ? market.noPrice : 0;

  // Calculate total USD value of holdings
  const yesFloat = parseFloat(yesBalance || "0");
  const noFloat = parseFloat(noBalance || "0");
  const yesTotalValue = yesFloat * yesValuePerToken;
  const noTotalValue = noFloat * noValuePerToken;

  return (
    <div className="flex flex-col p-4 border rounded-[8px] border-[#FFFFFF29]">
      <div className="flex items-center justify-between">
        <p className="text-[#FFFFFFA3] font-semibold text-base">Your Holdings</p>
      </div>

      <div className="flex flex-col whitespace-nowrap mt-3 text-sm">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1">
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center justify-center h-6 w-[64px] rounded-[6px] bg-[rgba(249,115,115,0.12)] text-[#F97373] text-xs font-medium">No</span>
            {shouldShowExtended && (
              <span className="text-[10px] text-[rgba(255,255,255,0.56)] mt-1">
                {noAmericanOdds}
              </span>
            )}
          </div>
          <span className="" />
          <div className="flex flex-col items-end">
            <span className="text-white text-base leading-tight">{noBalance}</span>
            {shouldShowExtended && (
              <>
                <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">
                  ${noTotalValue.toFixed(4)}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="h-px bg-[rgba(255,255,255,0.08)] my-1" />
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1">
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center justify-center h-6 w-[64px] rounded-[6px] bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-medium">Yes</span>
            {shouldShowExtended && (
              <span className="text-[10px] text-[rgba(255,255,255,0.56)] mt-1">
                {yesAmericanOdds}
              </span>
            )}
          </div>
          <span className="" />
          <div className="flex flex-col items-end">
            <span className="text-white text-base leading-tight">{yesBalance}</span>
            {shouldShowExtended && (
              <>
                <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">
                  ${yesTotalValue.toFixed(4)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoldingsSummary; 

