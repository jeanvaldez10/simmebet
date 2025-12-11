import React from "react";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatTokenAmount } from "@/utils/format";

const HoldingsSummaryUpdated = ({
  marketContractAddress,
  market,
}: {
  marketContractAddress: `0x${string}`;
  market?: {
    yesPrice: number;
    noPrice: number;
    noSideName: string;
    yesSideName: string;
  };
}) => {
  const { tokenABalance, tokenBBalance } = useMarketTokens(marketContractAddress);

  const noBalance = formatTokenAmount(tokenABalance, 18);
  const yesBalance = formatTokenAmount(tokenBBalance, 18);
  
  const yesValuePerToken = market ? market.yesPrice : 0;
  const noValuePerToken = market ? market.noPrice : 0;

  // Calculate total USD value of holdings
  const yesFloat = parseFloat(yesBalance || "0");
  const noFloat = parseFloat(noBalance || "0");
  const yesTotalValue = yesFloat * yesValuePerToken;
  const noTotalValue = noFloat * noValuePerToken;
  const totalHoldings = yesTotalValue + noTotalValue;

  // Calculate percentages for progress bar (based on USD value)
  const yesPercentage = totalHoldings > 0 ? (yesTotalValue / totalHoldings) * 100 : 0;
  const noPercentage = totalHoldings > 0 ? (noTotalValue / totalHoldings) * 100 : 0;

  // If no holdings, don't show the component
  if (totalHoldings === 0 || !market) {
    return null;
  }

  return (
    <div className="mb-2">
      {/* Title */}
      <div className="text-[#FFFFFFA3] text-base mb-1">Holding</div>
      
      {/* Progress Bar with percentages */}
      <div className="flex items-center justify-between text-lg font-medium text-white">
        <span className="text-sm font-semibold text-white">{noBalance} {market.noSideName.slice(0, 8)}</span>
        
        <div className="bg-[#2E3144] border border-[#4F5262] rounded-full p-1 flex gap-1 flex-1 mx-4">
          {/* No Progress Bar */}
          <div 
            className="h-1.5 bg-[#ef4444] rounded-full transition-all duration-300"
            style={{ 
              width: `${noPercentage}%`
            }}
          />
          {/* Yes Progress Bar */}
          <div 
            className="h-1.5 bg-[#22c55e] rounded-full transition-all duration-300"
            style={{ 
              width: `${yesPercentage}%`
            }}
          />
        </div>
        
        <span className="text-sm font-semibold text-white">{yesBalance} {market.yesSideName.slice(0, 8)}</span>
      </div>
    </div>
  );
};

export default HoldingsSummaryUpdated;
