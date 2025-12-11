import React from "react";
import { cn } from "@/lib/utils";
import { formatBalance, formatTokenAmount } from "@/utils/format";
import HoldingsSummary from "./HoldingsSummary";
import useMarketTokens from "@/hooks/useMarketTokens";
import { useTradingPanel } from "../context/TradingPanelContext";
import { IMarketData } from "@/interfaces/market";

const CloseBetContent = ({
  marketContractAddress,
  market,
}: {
  marketContractAddress: `0x${string}`;
  market: IMarketData;
}) => {
  const { state, handleOpenModal } = useTradingPanel();
  const { tokenABalance, tokenBBalance } = useMarketTokens(marketContractAddress);

  const noBalance = parseFloat(formatTokenAmount(tokenABalance, 18));
  const yesBalance = parseFloat(formatTokenAmount(tokenBBalance, 18));
  const projectedTotalUsd = Math.max(Math.min(noBalance || 0, yesBalance || 0), 0);
  const minBalance = Math.min(noBalance || 0, yesBalance || 0);
  const maxBalance = Math.max(noBalance || 0, yesBalance || 0);
  const remainingAmount = Math.max(maxBalance - minBalance, 0);
  const remainingSide = yesBalance > noBalance ? "YES" : noBalance > yesBalance ? "NO" : "";
  
  const hasZeroBalance = noBalance === 0 || yesBalance === 0;
  return (
    <React.Fragment>
      <HoldingsSummary 
        marketContractAddress={marketContractAddress} 
        market={{
          yesPrice: market.yesPrice,
          noPrice: market.noPrice,
        }}
      />

      <div className="flex flex-col p-4 border rounded-[8px] border-[#FFFFFF29] gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[rgba(255,255,255,0.64)]">Cashout</p>
          <div className="text-[20px] text-white font-semibold">{formatBalance(projectedTotalUsd * 2)}</div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[rgba(255,255,255,0.64)]">Remaining</p>
          <div className="text-[20px] text-white font-semibold">
            {formatBalance(remainingAmount, { noDollarSign: true })} {remainingSide}
          </div>
        </div>
      </div>

      <button
        onClick={() => !hasZeroBalance && handleOpenModal("close_bet")}
        disabled={hasZeroBalance}
        className={cn(
          "w-full text-sm font-semibold px-8 py-[13px] rounded-[80px] border-[none]",
          hasZeroBalance 
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : state.selectedOption === "yes" 
              ? "bg-[#46FD84] text-[#070708] cursor-pointer" 
              : "bg-[#FF4D4D] text-[#070708] cursor-pointer"
        )}
      >
        Cash Out
      </button>
    </React.Fragment>
  );
};

export default CloseBetContent;
