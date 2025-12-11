import { useEffect, useState } from "react";
import BeliefSlider from "@/components/market/BeliefSlider";
import EstimatedWinnings from "@/components/market/EstimatedWinnings";
// import { Switch } from "@/components/ui/switch";
// import { Info } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
// import { CustomTooltip } from "@/components/shared/custom-tooltip";
import { formatTokenAmount, roundDownToCent } from "@/utils/format";
import useRebalanceEstimate from "@/hooks/useRebalanceEstimate";
import useCashoutInfo from "../hook/useCashoutInfo";
import { useTradingPanel } from "../context/TradingPanelContext";
import { IMarketData } from "@/interfaces/market";
import { useApproval } from "@/hooks/useApproval";
import BetOptionToggle from "../components/BetOptionToggle";
import { useAuthContext } from "@/context/AuthProvider";
import { useBalanceCheck } from "@/hooks/useBalanceCheck";
import { BalanceTooLowModal } from "@/components/modals/BalanceTooLowModal";

const UpdateBetContent = ({
  marketProbability,
  market,
}: {
  market: IMarketData;
  marketProbability:
    | {
        yes: number;
        no: number;
      }
    | null
    | undefined;
}) => {
  const { state, dispatch, handleOpenModal, updateSelectedOption } = useTradingPanel(); // togglePersist
  const { userBalance } = useAuthContext();
  const { checkBalanceForAction } = useBalanceCheck();
  const marketContractAddress = market.contractAddress as `0x${string}`;
  
  // Add state for advanced dropdown
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Add state for balance too low modal
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);
  
  // Reset advanced state when market changes
  useEffect(() => {
    setShowAdvanced(false);
  }, [market.id]);

  // Check approval status
  const { 
    hasApproval,
    requestApproval,
    checkMarketApproval,
    isRequestingApproval,
  } = useApproval();

  useEffect(() => {
    const checkAndRequestApproval = async () => {
      if (!hasApproval && !isRequestingApproval) {
        // First check if user is already approved for this specific market (synchronous cache check)
        const isMarketApproved = checkMarketApproval(marketContractAddress);
        
        // Only request approval if not already approved for this market
        if (!isMarketApproved) {
          try {
            await requestApproval(marketContractAddress);
          } catch (error) {
            console.error('Error requesting approval:', error);
          }
        }
      }
    };

    checkAndRequestApproval();
  }, [hasApproval, isRequestingApproval, marketContractAddress]); // Removed requestApproval and checkMarketApproval from dependencies
  
  const cashoutInfo = useCashoutInfo(marketContractAddress, market, 'yes');
  const yesAmountRaw = cashoutInfo?.yesAmountRaw || 0;
  const noAmountRaw = cashoutInfo?.noAmountRaw || 0;
  const { token0Out, token1Out, isEstimating, error } = useRebalanceEstimate({
    marketContractAddress,
    amountUsd: state.amount,
    beliefPercentage: state.belief,
    selectedSide: (state.selectedOption as "yes" | "no"),
  });

  // Calculate effective prices using the final token amounts from rebalancing estimate
  // The price represents the effective market price after rebalancing, including price impact
  // const token0Price = (() => {
  //   if (token0Out) {
  //     if (parseFloat(state.amount) > 0) {
  //       // When adding USD: price = USD amount / token amount out
  //       return parseFloat(state.amount) / parseFloat(formatTokenAmount(token0Out, 18));
  //     } else {
  //       // When rebalancing without USD: effective price based on actual swap ratio
  //       const currentBalance = tokenABalance ? parseFloat(formatTokenAmount(tokenABalance, 18)) : 0;
  //       const finalBalance = parseFloat(formatTokenAmount(token0Out, 18));
  //       const netChange = finalBalance - currentBalance;
        
  //       if (netChange > 0) {
  //         // Buying tokens - calculate price based on what you're giving up (YES tokens)
  //         const yesTokensSold = tokenBBalance ? parseFloat(formatTokenAmount(tokenBBalance, 18)) - (token1Out ? parseFloat(formatTokenAmount(token1Out, 18)) : 0) : 0;
  //         const yesValueSold = yesTokensSold * market.yesPrice;
  //         return yesValueSold / netChange; // Price per NO token = YES value given up / NO tokens received
  //       } else if (netChange < 0) {
  //         // Selling tokens - calculate price based on what you're receiving (YES tokens)
  //         const yesTokensReceived = tokenBBalance ? (token1Out ? parseFloat(formatTokenAmount(token1Out, 18)) : 0) - parseFloat(formatTokenAmount(tokenBBalance, 18)) : 0;
  //         const yesValueReceived = yesTokensReceived * market.yesPrice;
  //         return yesValueReceived / Math.abs(netChange); // Price per NO token = YES value received / NO tokens sold
  //       } else {
  //         // No change
  //         return market.noPrice;
  //       }
  //     }
  //   } else {
  //     // Handle case where token0Out is 0 (sold all NO tokens)
  //     if (tokenABalance) {
  //       const currentBalance = parseFloat(formatTokenAmount(tokenABalance, 18));
  //       const yesTokensReceived = token1Out ? parseFloat(formatTokenAmount(token1Out, 18)) - (tokenBBalance ? parseFloat(formatTokenAmount(tokenBBalance, 18)) : 0) : 0;
        
  //       if (yesTokensReceived > 0 && currentBalance > 0) {
  //         const price = yesTokensReceived * market.yesPrice / currentBalance;
  //         return price; // Value received per NO token sold
  //       }
  //       // If no YES tokens received, show the market price as fallback
  //       return market.noPrice;
  //     }
  //   }
  //   return 0;
  // })();
    
  // const token1Price = (() => {
  //   if (token1Out) {
  //     if (parseFloat(state.amount) > 0) {
  //       // When adding USD: price = USD amount / token amount out
  //       const price = parseFloat(state.amount) / parseFloat(formatTokenAmount(token1Out, 18));
  //       return price;
  //     } else {
  //       // When rebalancing without USD: effective price based on actual swap ratio
  //       const currentBalance = tokenBBalance ? parseFloat(formatTokenAmount(tokenBBalance, 18)) : 0;
  //       const finalBalance = parseFloat(formatTokenAmount(token1Out, 18));
  //       const netChange = finalBalance - currentBalance;
        
  //       if (netChange > 0) {
  //         // Buying tokens - calculate price based on what you're giving up (NO tokens)
  //         const noTokensSold = tokenABalance ? parseFloat(formatTokenAmount(tokenABalance, 18)) - (token0Out ? parseFloat(formatTokenAmount(token0Out, 18)) : 0) : 0;
  //         const noValueSold = noTokensSold * market.noPrice;
  //         const price = noValueSold / netChange;
  //         return price; // Price per YES token = NO value given up / YES tokens received
  //       } else if (netChange < 0) {
  //         // Selling tokens - calculate price based on what you're receiving (NO tokens)
  //         const noTokensReceived = tokenABalance ? (token0Out ? parseFloat(formatTokenAmount(token0Out, 18)) : 0) - parseFloat(formatTokenAmount(tokenABalance, 18)) : 0;
  //         const noValueReceived = noTokensReceived * market.noPrice;
  //         const price = noValueReceived / Math.abs(netChange);
  //         return price; // Price per YES token = NO value received / YES tokens sold
  //       } else {
  //         // No change
  //         return market.yesPrice;
  //       }
  //     }
  //   } else {
  //     // Handle case where token1Out is 0 (sold all YES tokens)
  //     if (tokenBBalance) {
  //       const currentBalance = parseFloat(formatTokenAmount(tokenBBalance, 18));
  //       const noTokensReceived = token0Out ? parseFloat(formatTokenAmount(token0Out, 18)) - (tokenABalance ? parseFloat(formatTokenAmount(tokenABalance, 18)) : 0) : 0;
        
  //       if (noTokensReceived > 0 && currentBalance > 0) {
  //         const price = noTokensReceived * market.noPrice / currentBalance;
  //         return price; // Value received per YES token sold
  //       }
        
  //       return market.yesPrice;
  //     }
      
  //     return 0;
  //   }
    
  //   return 0;
  // })();


  const initialValue = parseFloat(state.amount) || 0;


  return (
    <React.Fragment>
      <BetOptionToggle
        selectedOption={state.selectedOption}
        onSelectOption={(option) => updateSelectedOption(option)}
        marketProbability={marketProbability}
        yesSideName={market.yesSideName}
        noSideName={market.noSideName}
      />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)]">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#FFFFFFA3]">
              Add Amount
            </span>
            <span className="text-sm text-[#FFFFFFA3]">
              Current: ${(() => {
                const yesPositionValue = yesAmountRaw * market.yesPrice;
                const noPositionValue = noAmountRaw * market.noPrice;
                return (yesPositionValue + noPositionValue).toFixed(2);
              })()}
            </span>
          </div>
          <div>
            <div className="text-[40px] font-semibold text-[#F2F2FD] flex items-center relative">
              <span>$</span>
              <input
                type="text"
                value={state.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  const decimalCount = (value.match(/\./g) || []).length;
                  if (decimalCount <= 1) {
                    dispatch({ type: 'SET_AMOUNT', payload: value });
                  }
                }}
                className="w-full bg-transparent text-[40px] font-semibold text-[#F2F2FD] outline-none"
                placeholder="0.00"
              />
              
              {state.insufficientFunds && (
                <div className="text-red-500 text-xs text-center absolute bottom-[-8px] left-0">
                  {parseFloat(state.amount) < 0
                    ? "Amount cannot be negative"
                    : "Insufficient funds"}
                </div>
              )}
            </div>
            
            {/* Quick Bet Buttons */}
            <div className="flex gap-2 mt-3">
              {[10, 25, 50].map((amount) => {
                const currentAmount = parseFloat(state.amount || "0");
                const isActive = Math.abs(currentAmount - amount) < 0.01;
                
                return (
                  <button
                    key={amount}
                    onClick={() => {
                      dispatch({ type: 'SET_AMOUNT', payload: amount.toFixed(2) });
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
                      isActive
                        ? "bg-white text-[#16171E] border-white"
                        : "bg-transparent text-[#FFFFFFA3] border-[#FFFFFF52] hover:bg-[#FFFFFF40]"
                    )}
                  >
                    ${amount}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  const amount = roundDownToCent(userBalance || 0);
                  dispatch({ type: 'SET_AMOUNT', payload: amount });
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
                  Math.abs(parseFloat(state.amount || "0") - parseFloat(roundDownToCent(userBalance || 0))) < 0.01
                    ? "bg-white text-[#16171E] border-white"
                    : "bg-transparent text-[#FFFFFFA3] border-[#FFFFFF52] hover:bg-[#FFFFFF40]"
                )}
              >
                Max
              </button>
            </div>
          </div>

          {/* Advanced Slider */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[#FFFFFFA3] text-normal text-sm select-none">
              Advanced Mode
            </span>
            <div 
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors",
                showAdvanced ? "bg-[#05B9FC]" : "bg-[#2E3144]"
              )}
                onClick={() => {
                  const newState = !showAdvanced;
                  setShowAdvanced(newState);
                  
                  // Reset belief when turning off advanced
                  if (!newState) {
                    const newBelief = state.selectedOption === "yes" ? 100 : 0;
                    dispatch({ type: 'SET_BELIEF', payload: newBelief });
                  }
                  
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('tradingPanelAdvancedOpen', newState.toString());
                    // Dispatch custom event for same-window updates
                    window.dispatchEvent(new Event('tradingPanelAdvancedChange'));
                  }
                }}
            >
              <div 
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                  showAdvanced ? "translate-x-6" : "translate-x-1"
                )}
              />
            </div>
          </div>

          {/* Advanced Section with Belief Slider */}
          {showAdvanced && (
            <div className="space-y-2 pt-2">
              <BeliefSlider
                belief={state.belief}
                updateBelief={(value) => dispatch({ type: 'SET_BELIEF', payload: value })}
                selectedOption={state.selectedOption}
                isUpdate="true"
                marketProbability={marketProbability}
              />

              {/* Persist toggle hidden but state remains true by default */}
              {/* <div className="flex items-center gap-2">
                <Switch
                  thumbClassName="data-[state=unchecked]:bg-white data-[state=checked]:bg-[#05B9FC]"
                  className="data-[state=checked]:bg-[#2E3144]"
                  checked={state.persist}
                  onCheckedChange={togglePersist}
                />
                <span className="text-[#FFFFFFA3] text-normal text-sm">
                  Persist
                </span>
                <CustomTooltip
                  className="max-w-[320px] w-fit text-xs"
                  name="Turning on Persist makes you a liquidity provider for the bet,
                    and keeps your belief active as a liquidity position. Instead of
                    placing a one-time bet, you become an LP provider within your
                    belief range - earning fees as others trade the bet."
                >
                  <Info className="w-5 h-5 text-[#FFFFFF52] hover:text-white pointer" />
                </CustomTooltip>
              </div> */}
            </div>
          )}
        </div>

        {/* <div className="flex flex-col gap-3 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[rgba(255,255,255,0.64)]">
              Estimated No Out
            </span>
            <span className="text-sm font-medium text-[rgba(255,255,255,0.64)]">
              Estimated Yes Out
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col justify-between rounded-md bg-[rgba(255,255,255,0.04)] p-2 border border-[rgba(255,255,255,0.08)] h-[100px]">
              <div>
                <div className="text-[28px] leading-none font-semibold text-white h-[32px] flex items-center">
                  {isEstimating ? (
                    <span className="text-[rgba(255,255,255,0.48)] text-sm">Calculating…</span>
                  ) : error ? (
                    <span className="text-[rgba(255,96,96,0.9)]">—</span>
                  ) : (
                    formatTokenAmount(token0Out, 18)
                  )}
                </div>
                <span className="text-xs text-[rgba(255,255,255,0.48)]">Token0</span>
              </div>
              <div className="text-xs text-[rgba(255,255,255,0.64)] h-[14px]">
                {!isEstimating && !error ? (
                  `Price: $${token0Price > 0 ? token0Price.toFixed(4) : '0.0000'}`
                ) : (
                  <span className="invisible">Price: $0.0000</span>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-md bg-[rgba(255,255,255,0.04)] p-2 border border-[rgba(255,255,255,0.08)] h-[100px]">
              <div>
                <div className="text-[28px] leading-none font-semibold text-white h-[32px] flex items-center">
                  {isEstimating ? (
                    <span className="text-[rgba(255,255,255,0.48)] text-sm">Calculating…</span>
                  ) : error ? (
                    <span className="text-[rgba(255,96,96,0.9)]">—</span>
                  ) : (
                    formatTokenAmount(token1Out, 18)
                  )}
                </div>
                <span className="text-xs text-[rgba(255,255,255,0.48)]">Token1</span>
              </div>
              <div className="text-xs text-[rgba(255,255,255,0.64)] h-[14px]">
                {!isEstimating && !error ? (
                  `Price: $${token1Price > 0 ? token1Price.toFixed(4) : '0.0000'}`
                ) : (
                  <span className="invisible">Price: $0.0000</span>
                )}
              </div>
            </div>
          </div>
          {error && (
            <div className="text-[11px] text-[rgba(255,255,255,0.56)]">
              Estimation unavailable. Try adjusting amount or belief.
            </div>
          )}
        </div> */}
        <EstimatedWinnings
          currency0Balance={token0Out ? formatTokenAmount(token0Out, 18) : "0"}
          currency1Balance={token1Out ? formatTokenAmount(token1Out, 18) : "0"}
          initialValue={initialValue}
          isEstimating={isEstimating}
          error={error ? true : false}
          marketOdds={marketProbability?.yes || null}
          belief={state.belief}
          persist={state.persist}
          showAdvanced={showAdvanced}
        />
      </div>

      <button
        onClick={() => {
          // PLATFORM_FEE_TODO: Check balance BEFORE opening modal
          const additionalBetAmount = parseFloat(state.amount || "0");
          const { canProceed } = checkBalanceForAction('UPDATE_POSITION', additionalBetAmount);
          
          if (!canProceed) {
            setShowBalanceTooLowModal(true);
            return;
          }
          
          handleOpenModal("update_bet");
        }}
        disabled={!state.amount || parseFloat(state.amount) < 0 || isEstimating || state.insufficientFunds}
        className={cn(
          "w-full text-sm font-semibold text-[#070708] cursor-pointer px-8 py-[13px] rounded-[80px] border-[none] transition-all",
          !state.amount || parseFloat(state.amount) < 0 || isEstimating || state.insufficientFunds
            ? "bg-[#FFFFFF29] text-[#FFFFFF52] cursor-not-allowed"
            : state.selectedOption === "yes"
              ? "bg-[#36FD68] hover:bg-[#36FD68]/90"
              : "bg-[#FD3748] hover:bg-[#FD3748]/90"
        )}
      >
        Update Bet
      </button>
      
      {/* Balance Too Low Modal */}
      <BalanceTooLowModal
        isOpen={showBalanceTooLowModal}
        onClose={() => setShowBalanceTooLowModal(false)}
        onDeposit={() => {
          // TODO: Open deposit modal
          // For now, just close this modal
          setShowBalanceTooLowModal(false);
        }}
      />
    </React.Fragment>
  );
};

export default UpdateBetContent;
