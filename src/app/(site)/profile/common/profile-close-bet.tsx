import React from "react";
import { cn } from "@/lib/utils";
import { formatBalance } from "@/utils/format";
import useCashoutInfo from "@/app/(site)/market/trading-panel/hook/useCashoutInfo";
import { useTradingPanel } from "@/app/(site)/market/trading-panel/context/TradingPanelContext";
import { IMarketData } from "@/interfaces/market";
import { useMarketUsdcInvestment } from "@/hooks/useMarketUsdcInvestment";
import { CustomTooltip } from "@/components/shared/custom-tooltip";
import { Info } from "lucide-react";
import { parseAbiItem } from "viem";
import { useReadContract } from "wagmi";
import { CASHOUT_HELPER_ADDRESS } from "@/constants";

const ProfileCloseBetContent = ({
  marketContractAddress,
  market,
}: {
  marketContractAddress: `0x${string}`;
  market: IMarketData;
}) => {
  const { handleOpenModal } = useTradingPanel();
  const cashoutInfo = useCashoutInfo(marketContractAddress, market, "yes");
  
  const yesAmountRaw = cashoutInfo?.yesAmountRaw || 0;
  const noAmountRaw = cashoutInfo?.noAmountRaw || 0;
  
  // Get USDC investment for this market
  const { data: usdcInvestment } = useMarketUsdcInvestment(market.id);
  const totalUsdcInvestment = Number(usdcInvestment) || 0;
  
  // Calculate current position value (market value of tokens - NO LP)
  const yesPositionValue = yesAmountRaw * market.yesPrice;
  const noPositionValue = noAmountRaw * market.noPrice;
  const totalPositionValue = yesPositionValue + noPositionValue;

  // Get estimated cash out amount from contract (same as market page)
  const { data: estimateRedeemableAmount, isLoading: isEstimatingRedeemableAmount } = useReadContract({
    address: CASHOUT_HELPER_ADDRESS,
    abi: [parseAbiItem("function estimateRedeemableAmount(address market, uint256 token0Amount, uint256 token1Amount) returns (uint256,uint256,uint256,uint256)")],
    functionName: "estimateRedeemableAmount",
    args: [market.contractAddress as `0x${string}`, BigInt(noAmountRaw * 1e18), BigInt(yesAmountRaw * 1e18)],
    chainId: 42161,
    query: {
      enabled: !!noAmountRaw || !!yesAmountRaw,
    },
  });
  
  const redeemableAmount = (estimateRedeemableAmount?.[0] ? Number(estimateRedeemableAmount?.[0]) / 1e18 : 0) * 2;
  
  const hasBalancedPosition = yesAmountRaw > 0 && noAmountRaw > 0;
  
  return (
    <React.Fragment>
      {/* Position Summary */}
      <div className="border border-[#FFFFFF29] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#FFFFFFA3] text-sm">Position Value</span>
          <span className="text-[#F2F2FD] font-semibold">{formatBalance(totalPositionValue)}</span>
        </div>
        
        <div className="h-px bg-[#FFFFFF29] mb-3"></div>
        
        <div className="flex items-center justify-between">
          <span className="text-[#FFFFFFA3] text-sm">Net USDC Invested</span>
          <span className="text-[#F2F2FD] font-semibold">{formatBalance(totalUsdcInvestment)}</span>
        </div>
      </div>

      {/* Estimated Cash Out */}
      <div className="border border-[#FFFFFF29] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#FFFFFFA3] text-sm">Estimated Cash Out</span>
          <CustomTooltip 
            className="max-w-[250px] w-fit text-xs"
            name="You can cash out equal amounts of each token for the underlying collateral"
          >
            <Info className="w-4 h-4 text-[#FFFFFF52] hover:text-white cursor-help" />
          </CustomTooltip>
        </div>
        <div className="text-[#F2F2FD] text-5xl font-bold">
          {isEstimatingRedeemableAmount ? "..." : formatBalance(redeemableAmount)}
        </div>
      </div>

      <button
        onClick={() => handleOpenModal("close_bet")}
        disabled={isEstimatingRedeemableAmount}
        className={cn(
          "w-full text-base font-semibold px-8 py-4 rounded-full border-none",
          isEstimatingRedeemableAmount
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-[#00D1FF] text-black cursor-pointer hover:bg-[#00B8E6]"
        )}
      >
        {isEstimatingRedeemableAmount ? "Estimating..." : "Cash Out"}
      </button>

      {/* Info Text */}
      {!hasBalancedPosition && (
        <p className="text-[#FFFFFF80] text-xs text-center mt-2">
          You need both Yes and No tokens to cash out. Place additional bets to balance your position.
        </p>
      )}
    </React.Fragment>
  );
};

export default ProfileCloseBetContent;

