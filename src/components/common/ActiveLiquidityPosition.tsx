import React, { useState, useRef, useEffect } from 'react';
import { Calendar } from '@/components/ui/calender';
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePositionInfo } from '@/hooks/usePositionInfo';
import { liquidityService } from '@/services/api/liquidityService';
import { useAuthContext } from '@/context/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateLiquidityPositionCaches } from '@/utils/liquidityCacheUtils';
import PositionSelector from './PositionSelector';
import type { MarketLiquidityPosition } from '@/hooks/useMarketLiquidityPosition';
import type { LiquidityPositionData } from '@/hooks/useLiquidityPositionData';
import CommonModal from '@/components/modals';
import SuccessModal from '@/app/(site)/options/common/success-modal';
import Button from '@/components/Button';
import type { IMarketData } from '@/interfaces/market';
import { useBalanceCheck } from '@/hooks/useBalanceCheck';
import { BalanceTooLowModal } from '@/components/modals/BalanceTooLowModal';

interface PositionData {
  token0Balance: number;
  token1Balance: number;
  feesCollected: number;
  timeElapsed: string;
  holdingNo: number;
  holdingYes: number;
  yourLp: number;
  nftId?: string;
  autoclose: boolean;
  autocloseTime?: Date;
}

interface ActiveLiquidityPositionProps {
  noSideName?: string;
  yesSideName?: string;
  positionData?: PositionData;
  hasOpenPosition: boolean;
  marketId?: string;
  market?: IMarketData;
  // For multiple positions support
  positions?: MarketLiquidityPosition[];
  positionsData?: LiquidityPositionData[];
  selectedPositionIndex?: number;
  onPositionSelect?: (index: number) => void;
  onClose?: () => void;
}

const ActiveLiquidityPosition: React.FC<ActiveLiquidityPositionProps> = ({
  noSideName = "no",
  yesSideName = "yes",
  positionData,
  hasOpenPosition,
  marketId,
  market,
  positions,
  positionsData,
  selectedPositionIndex,
  onPositionSelect,
  onClose,
}) => {
  const { dbUser } = useAuthContext();
  const queryClient = useQueryClient();
  const { checkBalanceForAction } = useBalanceCheck();
  const [autoClose, setAutoClose] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimingFees, setIsClaimingFees] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Balance check modal
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);
  
  // Modal states for remove liquidity
  const [removeLiquidityModalState, setRemoveLiquidityModalState] = useState<"none" | "pending" | "success" | "error">("none");
  const [removeLiquidityData, setRemoveLiquidityData] = useState<{ txHash: string; amount: number } | null>(null);
  
  // Modal states for claim fees
  const [claimFeesModalState, setClaimFeesModalState] = useState<"none" | "pending" | "success" | "error">("none");
  const [claimFeesData, setClaimFeesData] = useState<{ txHash: string; amount: number } | null>(null);

  // Handler for closing remove liquidity modal
  const handleRemoveLiquidityModalClose = async () => {
    setRemoveLiquidityModalState("none");
    
    // Invalidate caches after closing modal
    if (marketId && dbUser?.id) {
      await invalidateLiquidityPositionCaches(queryClient, marketId, dbUser.id);
      queryClient.invalidateQueries({ queryKey: ["positionBelief"] });
    }
    
    // Close parent modal
    if (onClose) onClose();
  };

  // Handler for closing claim fees modal
  const handleClaimFeesModalClose = async () => {
    setClaimFeesModalState("none");
    
    // Invalidate caches after closing modal
    if (marketId && dbUser?.id && positionData?.nftId) {
      await invalidateLiquidityPositionCaches(queryClient, marketId, dbUser.id);
      queryClient.invalidateQueries({ queryKey: ["positionInfo", parseInt(positionData.nftId)] });
      queryClient.invalidateQueries({ queryKey: ["positionBelief"] });
    }
    
    // Don't close parent modal for claim fees - just refresh the data
  };

  // Initialize autoclose state from position data
  useEffect(() => {
    if (positionData) {
      // You might want to get this from the database position data
      // For now, we'll keep it as false by default
      setAutoClose(positionData.autoclose);
      if (positionData.autocloseTime) {
        const date = new Date(positionData.autocloseTime);
        setSelectedDate(date);
        setSelectedTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
      } else {
        setSelectedDate(undefined);
        setSelectedTime('12:00');
      }
    }
  }, [positionData]);

  // Default to current date and time when calendar is opened without a preset date
  useEffect(() => {
    if (showCalendar && !selectedDate) {
      const now = new Date();
      setSelectedDate(now);
      setSelectedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [showCalendar, selectedDate]);

  // Get real position info from API
  const nftIdNumber = positionData?.nftId ? parseInt(positionData.nftId) : null;
  const { data: positionInfo, isLoading: positionInfoLoading } = usePositionInfo(nftIdNumber);

  const token0Balance = (positionInfo?.token0Balance || 0) / 1e18;
  const token1Balance = (positionInfo?.token1Balance || 0) / 1e18;
  const token0Percentage = token0Balance / (token0Balance + token1Balance);
  const token1Percentage = token1Balance / (token0Balance + token1Balance);

  // Handle clicking outside the calendar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Handle remove liquidity
  const handleRemoveLiquidity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dbUser?.id || !positionData?.nftId || !marketId) return;
    
    // PLATFORM_FEE_TODO: Check if user has sufficient balance for platform fees
    const { canProceed } = checkBalanceForAction('REMOVE_LIQUIDITY');
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }
    
    setIsLoading(true);
    setRemoveLiquidityModalState("pending");
    
    try {
      const response = await liquidityService.closePosition(marketId, parseInt(positionData.nftId));
      
      // Validate response
      if (!response || !response.txHash) {
        console.error('Invalid response from closePosition:', response);
        throw new Error('Invalid response: missing txHash');
      }
      
      // Calculate total amount removed (current LP position value)
      const totalAmount = positionData.yourLp || 0;
      
      // Set modal data and show success modal
      setRemoveLiquidityData({
        txHash: response.txHash,
        amount: totalAmount,
      });
      setRemoveLiquidityModalState("success");
      
      // Don't invalidate caches here - do it when modal closes
      // to prevent parent component from unmounting while modal is showing
    } catch (error) {
      console.error('Error closing position:', error);
      setRemoveLiquidityModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle claim fees
  const handleClaimFees = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dbUser?.id || !positionData?.nftId || !marketId) return;

    // PLATFORM_FEE_TODO: Check if user has sufficient balance for platform fees
    const { canProceed } = checkBalanceForAction('CLAIM_FEES');
    if (!canProceed) {
      setShowBalanceTooLowModal(true);
      return;
    }

    setIsClaimingFees(true);
    setClaimFeesModalState("pending");
    
    try {
      const response = await liquidityService.claimFees(marketId, parseInt(positionData.nftId));
      
      // Validate response
      if (!response || !response.txHash) {
        console.error('Invalid response from claimFees:', response);
        throw new Error('Invalid response: missing txHash');
      }
      
      // Calculate total fees claimed
      const totalFees = (response.amountToken0Claimed + response.amountToken1Claimed) / 1e18;
      
      // Set modal data and show success modal
      setClaimFeesData({
        txHash: response.txHash,
        amount: totalFees,
      });
      setClaimFeesModalState("success");
      
      // Don't invalidate caches here - do it when modal closes
      // to prevent stale data from showing in the modal
    } catch (error) {
      console.error('Error claiming fees:', error);
      setClaimFeesModalState("error");
    } finally {
      setIsClaimingFees(false);
    }
  };

  const handleSliderToggle = async (enabled: boolean) => {
    setAutoClose(enabled);
    
    if (!dbUser?.id || !positionData?.nftId) return;

    try {
      // If disabling, clear the selected date and time
      let dateToSet = null;
      if (enabled && selectedDate) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const combinedDateTime = new Date(selectedDate);
        combinedDateTime.setHours(hours, minutes, 0, 0);
        dateToSet = combinedDateTime;
      }
      
      await liquidityService.updateAutoclose(
        marketId!,
        parseInt(positionData.nftId),
        dateToSet
      );
      
      // Clear selected date and time if disabling
      if (!enabled) {
        setSelectedDate(undefined);
        setSelectedTime('12:00');
      }
    } catch (error) {
      console.error('Error updating autoclose:', error);
      // Revert slider state on error
      setAutoClose(!enabled);
    }
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    // Don't close calendar immediately - let user select time first
    if (!date) {
      setShowCalendar(false);
    }
    
    if (!dbUser?.id || !positionData?.nftId) return;

    // Only update if we have both date and time
    if (date) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(hours, minutes, 0, 0);
      
      try {
        await liquidityService.updateAutoclose(
          marketId!,
          parseInt(positionData.nftId),
          combinedDateTime
        );
        // TODO: Show success message
      } catch (error) {
        console.error('Error updating autoclose:', error);
        // TODO: Show error message
      }
    }
  };

  const handleTimeChange = async (time: string) => {
    setSelectedTime(time);
    
    // Only make API call if we have both date and time
    if (!dbUser?.id || !positionData?.nftId || !selectedDate) return;

    const [hours, minutes] = time.split(':').map(Number);
    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);
    
    try {
      await liquidityService.updateAutoclose(
        marketId!,
        parseInt(positionData.nftId),
        combinedDateTime
      );
      // TODO: Show success message
    } catch (error) {
      console.error('Error updating autoclose:', error);
      // TODO: Show error message
    }
  };

  const handleConfirmDateTime = () => {
    setShowCalendar(false);
  };

  if (!hasOpenPosition || !positionData) {
    return null;
  }

  // TODO: Verify calculation accuracy before re-enabling
  // // Calculate estimated APY based on fees collected and time elapsed
  // const calculateAPY = () => {
  //   if (!positionData.yourLp || positionData.yourLp === 0) return 0;
  //   
  //   const fees = positionInfo 
  //     ? ((positionInfo.token0Fees + positionInfo.token1Fees) / 1e18)
  //     : positionData.feesCollected;
  //   
  //   // Parse time elapsed (format: "HH:MM" or similar)
  //   const timeStr = positionData.timeElapsed;
  //   const [hours, minutes] = timeStr.split(':').map(Number);
  //   const totalHours = hours + (minutes / 60);
  //   
  //   if (totalHours === 0) return 0;
  //   
  //   // Calculate hourly rate and extrapolate to yearly
  //   const hourlyRate = fees / positionData.yourLp / totalHours;
  //   const yearlyRate = hourlyRate * 24 * 365;
  //   
  //   return yearlyRate * 100; // Convert to percentage
  // };

  // const estimatedAPY = calculateAPY();

  // TODO: Verify calculation accuracy before re-enabling
  // // Calculate exposure range from position info
  // const exposureRange = positionInfo 
  //   ? {
  //       lower: ((1 - positionInfo.lowerOdds) * 100).toFixed(0),
  //       upper: ((1 - positionInfo.upperOdds) * 100).toFixed(0)
  //     }
  //   : {
  //       lower: (positionData.holdingNo * 100).toFixed(0),
  //       upper: (positionData.holdingYes * 100).toFixed(0)
  //     };

  // Calculate position mix percentages from token balances
  const noPercentage = token0Percentage * 100;
  const yesPercentage = token1Percentage * 100;

  return (
    <>
      {/* Position Mix Section */}
      <div className="border border-[#FFFFFF29] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#FFFFFFA3] text-sm font-semibold">Position Mix</span>
          <span className="text-sm font-semibold">
            {yesPercentage >= noPercentage ? (
              <>
                <span className="text-[#36FD68]">{yesSideName}</span> <span className="text-white">{yesPercentage.toFixed(0)}%</span>
              </>
            ) : (
              <>
                <span className="text-[#D32B3F]">{noSideName}</span> <span className="text-white">{noPercentage.toFixed(0)}%</span>
              </>
            )}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-[#2E3144] border border-[#4F5262] rounded-full p-1 flex gap-1 mb-2">
          {noPercentage > 0 && (
            <div 
              className="h-1.5 bg-[#ef4444] rounded-full transition-all duration-300"
              style={{ width: `${noPercentage}%` }}
            />
          )}
          {yesPercentage > 0 && (
            <div 
              className="h-1.5 bg-[#22c55e] rounded-full transition-all duration-300"
              style={{ width: `${yesPercentage}%` }}
            />
          )}
        </div>
        
        {/* Progress Bar Labels */}
        <div className="text-xs text-[#FFFFFFA3] flex justify-between">
          <span>{noPercentage.toFixed(0)}% {noSideName}</span>
          <span>{yesPercentage.toFixed(0)}% {yesSideName}</span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="border border-[#FFFFFF0F] rounded-xl p-3 mb-4">
      {/* Top Row: Your LP / NFT ID and Auto Close */}
      <div className="flex items-start justify-between mb-3">
        {/* Left: LP Badge or Position Selector */}
        {positions && positions.length > 1 && positionsData && selectedPositionIndex !== undefined && onPositionSelect ? (
          <PositionSelector
            positions={positions}
            positionsData={positionsData}
            selectedPositionIndex={selectedPositionIndex}
            onPositionSelect={onPositionSelect}
          />
        ) : (
          <div className="flex items-center gap-2 border border-[#FFFFFF29] rounded-[80px] px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6] flex-shrink-0"></div>
            <span className="text-white text-xs font-semibold leading-none">Your LP: ${positionData?.yourLp.toFixed(2)}</span>
          </div>
        )}

        {/* Right: Auto Close - Stacked Vertically */}
        <div className="flex flex-col items-end gap-1 relative">
          <span className="text-[#FFFFFFA3] text-xs">Auto Close:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSliderToggle(!autoClose)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                autoClose ? 'bg-[#05B9FC]' : 'bg-[#2E3144]'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  autoClose ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              disabled={!autoClose}
              className="disabled:opacity-30"
            >
              <svg className="w-4 h-4 text-[#FFFFFFA3] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          {/* Selected Date and Time Display */}
          {selectedDate && (
            <span className="text-[#FFFFFFA3] text-[10px] text-right mt-0.5">
              {selectedDate.toLocaleDateString()} at {selectedTime}
            </span>
          )}
          
          {/* Calendar Popup */}
          {showCalendar && autoClose && (
            <div ref={calendarRef} className="absolute z-10 bg-[#1F2937] border border-[#374151] rounded-lg p-3 shadow-lg w-[320px] right-0 top-full mt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="bg-transparent"
              />
              
              <div className="mt-3 pt-3 border-t border-[#374151]">
                <label className="block text-[#FFFFFFA3] text-xs mb-2">
                  Select Time:
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full bg-[#2E3144] border border-[#4F5262] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#05B9FC]"
                />
                {!selectedDate && (
                  <p className="text-[#FFFFFFA3] text-xs mt-1">Please select a date first</p>
                )}
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleConfirmDateTime}
                  disabled={!selectedDate}
                  className="flex-1 bg-[#05B9FC] hover:bg-[#05B9FC]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="flex-1 bg-[#2E3144] hover:bg-[#2E3144]/90 text-[#FFFFFFA3] hover:text-white px-3 py-2 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stacked Information */}
      <div className="space-y-2.5">
        {/* TODO: Verify calculation accuracy before re-enabling */}
        {/* Estimated Yield */}
        {/* <div>
          <span className="text-[#FFFFFFA3] text-sm">Estimated Yield: </span>
          <span className="text-white text-sm">~{estimatedAPY.toFixed(1)}% APY</span>
        </div> */}

        {/* TODO: Verify calculation accuracy before re-enabling */}
        {/* Exposure Range */}
        {/* <div>
          <span className="text-[#FFFFFFA3] text-sm">Exposure Range: </span>
          <span className="text-white text-sm">{exposureRange.upper}% - {exposureRange.lower}%</span>
        </div> */}

        {/* Fees Collected */}
        <div>
          <span className="text-[#FFFFFFA3] text-sm">Fees collected: </span>
          <span className="text-white text-sm">
            {positionInfoLoading ? 'Loading...' : 
              positionInfo ? `$${((positionInfo.token0Fees + positionInfo.token1Fees) / 1e18).toFixed(2)}` : 
              `$${positionData.feesCollected.toFixed(2)}`}
          </span>
        </div>

        {/* Time Elapsed */}
        <div>
          <span className="text-[#FFFFFFA3] text-sm">Time elapsed: </span>
          <span className="text-white text-sm">{positionData.timeElapsed}</span>
        </div>
      </div>
    </div>

    {/* Buttons - Outside the card */}
    <div className="flex gap-2 w-full">
      <button 
        type="button"
        onClick={handleClaimFees}
        disabled={isClaimingFees || isLoading || !positionInfo || ((positionInfo.token0Fees + positionInfo.token1Fees) / 1e18) === 0 || claimFeesModalState === "pending"}
        className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#16171E] px-4 py-[13px] rounded-[999px] text-sm font-semibold transition-colors"
      >
        Claim Fees
      </button>
      
      <button 
        type="button"
        onClick={handleRemoveLiquidity}
        disabled={isLoading || removeLiquidityModalState === "pending"}
        className="flex-1 bg-[#FD3748] hover:bg-[#FD3748]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#15161D] px-4 py-[13px] rounded-[999px] text-sm font-semibold transition-colors"
      >
        Remove Liquidity
      </button>
    </div>

    {/* Remove Liquidity Modal */}
    {removeLiquidityModalState !== "none" && (
      <CommonModal 
        onClose={removeLiquidityModalState === "pending" ? () => {} : () => setRemoveLiquidityModalState("none")} 
        className="w-[364px]"
      >
        {/* Pending State */}
        {removeLiquidityModalState === "pending" && (
          <SuccessModal
            type="option_pending"
            title="Pending transaction"
            subtitle="It might take a couple minutes to complete your transaction."
            isPositive={true}
            buttonText="Please wait..."
            onButtonClick={() => {}}
            onClose={() => {}}
            width="w-[300px]"
          />
        )}

        {/* Success State */}
        {removeLiquidityModalState === "success" && removeLiquidityData && (
          <SuccessModal
            type="option"
            title="Liquidity Removed"
            subtitle={market ? `Liquidity removed from:\n${market.question}` : "Liquidity removed"}
            isPositive={true}
            buttonText="Done"
            onButtonClick={handleRemoveLiquidityModalClose}
            onClose={handleRemoveLiquidityModalClose}
            width="w-[300px]"
          >
            <div className="w-full">
              <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
                Liquidity Removed
              </h2>
              <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
                Liquidity removed from:<br />{market?.question || 'Market'}
              </p>
              
              <div className="mt-4 space-y-1 text-center">
                <p className="text-[#F2F2FD] text-sm">
                  <span className="text-[#FFFFFFA3]">Amount</span>{' '}
                  <span className="text-[#36FD68] font-semibold">+${removeLiquidityData.amount.toFixed(2)}</span>
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-[#F2F2FD] text-sm font-semibold mb-2">You now hold a Belief position of:</p>
                <div className="space-y-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#36FD68] font-normal">{yesSideName}</span>
                    <span className="text-white font-normal">{token1Balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#D32B3F] font-normal">{noSideName}</span>
                    <span className="text-white font-normal">{token0Balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {removeLiquidityData.txHash && (
                <p className="text-[#05B9FC] text-sm font-semibold mt-4 text-center">
                  <a href={`https://arbiscan.io/tx/${removeLiquidityData.txHash}`} target="_blank" rel="noopener noreferrer">
                    View on Arbiscan →
                  </a>
                </p>
              )}
              
              <div className="w-full mt-5">
                <Button onClick={handleRemoveLiquidityModalClose} fullWidth>Done</Button>
              </div>
            </div>
          </SuccessModal>
        )}

        {/* Error State */}
        {removeLiquidityModalState === "error" && (
          <SuccessModal
            type="option_fail"
            title="Something went wrong"
            subtitle="Your liquidity removal didn't work."
            isPositive={false}
            buttonText="Go back"
            onButtonClick={() => setRemoveLiquidityModalState("none")}
            onClose={() => setRemoveLiquidityModalState("none")}
            width="w-[300px]"
          >
            <div className="w-full">
              <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
                Something went wrong
              </h2>
              <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
                Your liquidity removal didn&apos;t work.
              </p>
              <p className="text-[#FFFFFFA3] text-sm mt-2 text-center">
                Please try again.
              </p>
              
              <div className="w-full mt-5">
                <Button onClick={() => setRemoveLiquidityModalState("none")} fullWidth>Go back</Button>
              </div>
            </div>
          </SuccessModal>
        )}
      </CommonModal>
    )}

    {/* Claim Fees Modal */}
    {claimFeesModalState !== "none" && (
      <CommonModal 
        onClose={claimFeesModalState === "pending" ? () => {} : () => setClaimFeesModalState("none")} 
        className="w-[364px]"
      >
        {/* Pending State */}
        {claimFeesModalState === "pending" && (
          <SuccessModal
            type="option_pending"
            title="Pending transaction"
            subtitle="It might take a couple minutes to complete your transaction."
            isPositive={true}
            buttonText="Please wait..."
            onButtonClick={() => {}}
            onClose={() => {}}
            width="w-[300px]"
          />
        )}

        {/* Success State */}
        {claimFeesModalState === "success" && claimFeesData && (
          <SuccessModal
            type="option"
            title="Fees Claimed"
            subtitle={market ? `Fees claimed from:\n${market.question}` : "Fees claimed"}
            isPositive={true}
            buttonText="Done"
            onButtonClick={handleClaimFeesModalClose}
            onClose={handleClaimFeesModalClose}
            width="w-[300px]"
          >
            <div className="w-full">
              <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
                Fees Claimed
              </h2>
              <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
                Fees claimed from:<br />{market?.question || 'Market'}
              </p>
              
              <div className="mt-4 space-y-1 text-center">
                <p className="text-[#F2F2FD] text-sm">
                  <span className="text-[#FFFFFFA3]">Amount</span>{' '}
                  <span className="text-[#36FD68] font-semibold">+${claimFeesData.amount.toFixed(2)}</span>
                </p>
                <p className="text-[#FFFFFFA3] text-sm mt-2">
                  Credited to your wallet.
                </p>
              </div>
              
              {claimFeesData.txHash && (
                <p className="text-[#05B9FC] text-sm font-semibold mt-4 text-center">
                  <a href={`https://arbiscan.io/tx/${claimFeesData.txHash}`} target="_blank" rel="noopener noreferrer">
                    View on Arbiscan →
                  </a>
                </p>
              )}
              
              <div className="w-full mt-5">
                <Button onClick={handleClaimFeesModalClose} fullWidth>Done</Button>
              </div>
            </div>
          </SuccessModal>
        )}

        {/* Error State */}
        {claimFeesModalState === "error" && (
          <SuccessModal
            type="option_fail"
            title="Something went wrong"
            subtitle="Your fee claim didn't work."
            isPositive={false}
            buttonText="Go back"
            onButtonClick={() => setClaimFeesModalState("none")}
            onClose={() => setClaimFeesModalState("none")}
            width="w-[300px]"
          >
            <div className="w-full">
              <h2 className="text-[#F2F2FD] font-semibold text-xl text-center">
                Something went wrong
              </h2>
              <p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">
                Your fee claim didn&apos;t work.
              </p>
              <p className="text-[#FFFFFFA3] text-sm mt-2 text-center">
                Please try again.
              </p>
              
              <div className="w-full mt-5">
                <Button onClick={() => setClaimFeesModalState("none")} fullWidth>Go back</Button>
              </div>
            </div>
          </SuccessModal>
        )}
      </CommonModal>
    )}

    {/* Balance Too Low Modal */}
    <BalanceTooLowModal
      isOpen={showBalanceTooLowModal}
      onClose={() => setShowBalanceTooLowModal(false)}
      onDeposit={() => {
        // TODO: Open deposit modal
        setShowBalanceTooLowModal(false);
      }}
    />
  </>
  );
};

export default ActiveLiquidityPosition;
