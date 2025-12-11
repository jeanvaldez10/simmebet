import React from 'react';
import useCashoutInfo from '../hook/useCashoutInfo';
import { IMarketData } from '@/interfaces/market';
import { useTradingPanel } from '../context/TradingPanelContext';
import { useMarketUsdcInvestment } from '@/hooks/useMarketUsdcInvestment';
import { CustomTooltip } from '@/components/shared/custom-tooltip';
import { parseAbiItem } from 'viem';
import { useReadContract } from 'wagmi';
import { Info } from 'lucide-react';
import { formatBalance } from '@/utils/format';
import { CASHOUT_HELPER_ADDRESS } from '@/constants';
import { useLiquidityPositionsData } from '@/hooks/useLiquidityPositionData';

interface PositionSummaryCardProps {
  marketAddress: string;
  market: IMarketData;
  isLoading?: boolean;
  showAdvanced?: boolean;
}

export default function PositionSummaryCard({
  marketAddress,
  market,
  isLoading = false,
  showAdvanced = false
}: PositionSummaryCardProps) {
  const { handleOpenModal } = useTradingPanel();
  const cashoutInfo = useCashoutInfo(marketAddress as `0x${string}`, market, 'yes');
  
  const yesAmountRaw = cashoutInfo?.yesAmountRaw || 0;
  const noAmountRaw = cashoutInfo?.noAmountRaw || 0;
    
  // Check if user has a balanced position (both Yes and No tokens)
  const hasBalancedPosition = yesAmountRaw > 0 && noAmountRaw > 0;
  
  // Get USDC investment for this market
  const { data: usdcInvestment } = useMarketUsdcInvestment(market.id);
  const totalUsdcInvestment = Number(usdcInvestment) || 0;
  
  // Calculate what user will get if they win for each side
  // Each side pays out: token amount * 2 (since they get both tokens back)
  const yesWinPayout = yesAmountRaw * 2;
  const noWinPayout = noAmountRaw * 2;
  
  // Get LP positions data
  const { data: lpPositionsData } = useLiquidityPositionsData(market.id);
  
  // Calculate total LP value from all positions
  const totalLpValue = lpPositionsData?.reduce((sum, pos) => sum + (pos.yourLp || 0), 0) || 0;
  
  // Calculate current position value (market value of tokens + LP value)
  const yesPositionValue = yesAmountRaw * market.yesPrice;
  const noPositionValue = noAmountRaw * market.noPrice;
  const totalPositionValue = yesPositionValue + noPositionValue + totalLpValue;

  const handleCashOut = () => {
    // Use the same modal system as close_bet
    handleOpenModal("close_bet");
  };

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
  
  // Calculate position mix percentages using market values (not raw token counts)
  const noPercentage = totalPositionValue > 0 ? (noPositionValue / totalPositionValue) * 100 : 0;
  const yesPercentage = totalPositionValue > 0 ? (yesPositionValue / totalPositionValue) * 100 : 0;
  const lpPercentage = totalPositionValue > 0 ? (totalLpValue / totalPositionValue) * 100 : 0;
  
  return (
    <div className="bg-[#16171E] rounded-2xl p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-[#F2F2FD] mb-4">Position Summary</h3>
      
      {/* Position Mix Section - Only show when advanced is toggled */}
      {showAdvanced && <div className="border border-[#FFFFFF29] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#FFFFFFA3] text-sm font-semibold">Position Mix</span>
          <span className="text-sm font-semibold">
            {yesPercentage >= noPercentage ? (
              <>
                <span className="text-[#36FD68]">{market.yesSideName || "Yes"}</span> <span className="text-white">{yesPercentage.toFixed(0)}%</span>
              </>
            ) : (
              <>
                <span className="text-[#D32B3F]">{market.noSideName || "No"}</span> <span className="text-white">{noPercentage.toFixed(0)}%</span>
              </>
            )}
          </span>
        </div>
        
        {/* Progress Bar */}
        <CustomTooltip
          className="max-w-[400px] w-fit text-xs"
          name={
            <div className="space-y-3">
              {/* No Position */}
              {noAmountRaw > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#D32B3F] rounded-full"></div>
                    <span className="text-white font-semibold">{market.noSideName || "No"}</span>
                  </div>
                  <div className="ml-4 space-y-0.5">
                    <div className="text-[#FFFFFFA3]">Tokens: {noAmountRaw.toFixed(2)}</div>
                    <div className="text-[#FFFFFFA3]">Current: ${noPositionValue.toFixed(2)}</div>
                    <div className="text-[#FFFFFFA3]">If Won: {noWinPayout.toFixed(2)}</div>
                  </div>
                </div>
              )}
              
              {/* LP Position */}
              {totalLpValue > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#05B9FC] rounded-full"></div>
                    <span className="text-white font-semibold">LP</span>
                  </div>
                  <div className="ml-4 space-y-0.5">
                    <div className="text-[#FFFFFFA3]">Current: ${totalLpValue.toFixed(2)}</div>
                    <div className="text-[#FFFFFFA3]">Liquidity</div>
                  </div>
                </div>
              )}
              
              {/* Yes Position */}
              {yesAmountRaw > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-[#36FD68] rounded-full"></div>
                    <span className="text-white font-semibold">{market.yesSideName || "Yes"}</span>
                  </div>
                  <div className="ml-4 space-y-0.5">
                    <div className="text-[#FFFFFFA3]">Tokens: {yesAmountRaw.toFixed(2)}</div>
                    <div className="text-[#FFFFFFA3]">Current: ${yesPositionValue.toFixed(2)}</div>
                    <div className="text-[#FFFFFFA3]">If Won: {yesWinPayout.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>
          }
        >
          <div className="bg-[#2E3144] border border-[#4F5262] rounded-full p-1 flex gap-1 mb-2 cursor-help">
            {totalPositionValue > 0 ? (
              <>
                {noPercentage > 0 && (
                  <div 
                    className="h-1.5 bg-[#ef4444] rounded-full transition-all duration-300"
                    style={{ width: `${noPercentage}%` }}
                  />
                )}
                {lpPercentage > 0 && (
                  <div 
                    className="h-1.5 bg-[#05B9FC] rounded-full transition-all duration-300"
                    style={{ width: `${lpPercentage}%` }}
                  />
                )}
                {yesPercentage > 0 && (
                  <div 
                    className="h-1.5 bg-[#22c55e] rounded-full transition-all duration-300"
                    style={{ width: `${yesPercentage}%` }}
                  />
                )}
              </>
            ) : (
              <div className="h-1.5 bg-gray-500 rounded-full flex-1"></div>
            )}
          </div>
        </CustomTooltip>
        
        {/* Progress Bar Labels */}
        <div className="text-xs text-[#FFFFFFA3] flex justify-between">
          {(() => {
            const labels = [];
            if (noPercentage > 0) {
              labels.push(<span key="no" className="text-left">{noPercentage.toFixed(0)}% {market.noSideName || "No"}</span>);
            }
            if (lpPercentage > 0) {
              labels.push(<span key="lp" className="text-right">{lpPercentage.toFixed(0)}% LP</span>);
            }
            if (yesPercentage > 0) {
              labels.push(<span key="yes" className="text-right">{yesPercentage.toFixed(0)}% {market.yesSideName || "Yes"}</span>);
            }
            
            // If only one label, keep it left aligned
            if (labels.length === 1) {
              return labels[0];
            }
            
            // If multiple labels, show first on left, last on right
            return (
              <>
                {labels[0]}
                {labels[labels.length - 1]}
              </>
            );
          })()}
        </div>
      </div>}
      
      {/* Holdings Summary Section */}
      <div className="border border-[#FFFFFF29] rounded-lg p-4 mb-4">
        {/* Position Value */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#FFFFFFA3] text-sm">Position Value</span>
          <span className="text-[#F2F2FD] font-semibold">${totalPositionValue.toFixed(2)}</span>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-[#FFFFFF29] mb-3"></div>

        {/* Net USDC Invested */}
        <div className="flex items-center justify-between">
          <span className="text-[#FFFFFFA3] text-sm">Net USDC Invested</span>
          <span className="text-[#F2F2FD] font-semibold">${totalUsdcInvestment.toFixed(2)}</span>
        </div>
      </div>

      {/* Estimated Cash Out Section */}
      <div className="border border-[#FFFFFF29] rounded-lg p-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[#FFFFFFA3]">Estimated Cash Out</span>
            <CustomTooltip 
              className="max-w-[250px] w-fit text-xs"
              name="You can cash out equal amounts of each token for the underlying collateral"
            >
              <Info className="w-4 h-4 text-[#FFFFFF52] hover:text-white cursor-help" />
            </CustomTooltip>
          </div>
          <div className="text-4xl font-semibold text-white">
            {formatBalance(redeemableAmount)}
          </div>
        </div>

        {/* Percentage Buttons */}
        {/* <div className="flex gap-2 mb-4">
          {percentageOptions.map((percentage) => (
            <button
              key={percentage}
              onClick={() => hasBalancedPosition && setSelectedPercentage(percentage)}
              disabled={!hasBalancedPosition}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !hasBalancedPosition
                  ? 'border border-[#FFFFFF29] bg-transparent text-[#FFFFFF40] cursor-not-allowed'
                  : selectedPercentage === percentage
                    ? 'bg-[#F2F2FD] text-[#16171E]'
                    : 'border border-[#FFFFFF52] bg-transparent text-[#FFFFFFA3] hover:bg-[#FFFFFF40]'
              }`}
            >
              {percentage}%
            </button>
          ))}
          <button
            onClick={() => hasBalancedPosition && setSelectedPercentage(100)}
            disabled={!hasBalancedPosition}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !hasBalancedPosition
                ? 'border border-[#FFFFFF29] bg-transparent text-[#FFFFFF40] cursor-not-allowed'
                : selectedPercentage === 100
                  ? 'bg-[#F2F2FD] text-[#16171E]'
                  : 'border border-[#FFFFFF52] bg-transparent text-[#FFFFFFA3] hover:bg-[#FFFFFF40]'
            }`}
          >
            Max
          </button>
        </div> */}
      </div>

      {/* Cash Out Button */}
      <button
        onClick={handleCashOut}
        disabled={isLoading}
        className={`w-full text-sm font-semibold cursor-pointer px-8 py-[13px] rounded-[80px] border-[none] transition-colors ${
          isLoading
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-[#05B9FC] text-[#070708] hover:bg-[#0EA5E9]'
        }`}
      >
        {isEstimatingRedeemableAmount ? 'Estimating...' : 'Cash Out'}
      </button>
      
      {!hasBalancedPosition && showAdvanced && (
        <p className="text-[#FFFFFF80] text-xs text-center mt-2">
          You need both Yes and No tokens to cash out. Place additional bets to balance your position.
        </p>
      )}
    </div>
  );
}
