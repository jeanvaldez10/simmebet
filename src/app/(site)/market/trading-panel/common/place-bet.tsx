import BeliefSlider from "@/components/market/BeliefSlider";
import EstimatedWinnings from "@/components/market/EstimatedWinnings";
// import { Info } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTradingPanel } from "../context/TradingPanelContext";
import { roundDownToCent } from "@/utils/format";
import { useParams } from "next/navigation";
import { usePlaceEstimate } from "@/hooks/usePlaceEstimate";
import { useApproval } from "@/hooks/useApproval";
import BetOptionToggle from "../components/BetOptionToggle";
import { useAuthContext } from "@/context/AuthProvider";
import { useBalanceCheck } from "@/hooks/useBalanceCheck";
import { BalanceTooLowModal } from "@/components/modals/BalanceTooLowModal";
// import { Switch } from "@/components/ui/switch";
// import { CustomTooltip } from "@/components/shared/custom-tooltip";

export const getOptionTeamLabel = (
  team1: { name: string; teamPercent: string } | undefined,
  team2: { name: string; teamPercent: string } | undefined,
  selectedOption: string
) => {
  if (!team1 || !team2) return null;

  return team1.name ? (
    <div className=" flex items-center gap-2 justify-center">
      <span className="text-xs font-normal">{team1.name}</span>
      <span
        className={cn(
          "py-1 px-2 rounded-[80px] text-xs font-semibold",
          selectedOption === "yes" ? "bg-[#33E06E] " : "bg-[#FFFFFF29]"
        )}
      >
        {team1.teamPercent}%
      </span>
    </div>
  ) : (
    <div className=" flex items-center gap-2 justify-center">
      <span className="text-xs font-normal">{team2.name}</span>
      <span
        className={cn(
          "py-1 px-2 rounded-[80px] text-xs font-semibold",
          selectedOption === "no" ? "bg-[#D32B3F] " : "bg-[#FFFFFF29]"
        )}
      >
        {team2.teamPercent}%
      </span>
    </div>
  );
};

const PlaceBetContent = ({
  // team1,
  // team2,
  marketProbability,
  market,
}: {
  team1?: {
    name: string;
    teamPercent: string;
  };
  team2?: {
    name: string;
    teamPercent: string;
  };
  marketProbability:
    | {
        yes: number;
        no: number;
      }
    | null
    | undefined;
  market?: {
    yesSideName?: string;
    noSideName?: string;
  };
}) => {
  const { state, dispatch, updateSelectedOption } = useTradingPanel(); // togglePersist
  const { userBalance, isAuthenticated } = useAuthContext();
  const { checkBalanceForAction } = useBalanceCheck();
  const pathArgs = useParams();
  const marketAddress = pathArgs?.id;

  // Add state to track approval requests
  const [hasRequestedApproval, setHasRequestedApproval] = useState(false);
  const hasRequestedApprovalRef = useRef(false);
  
  // Add state for advanced dropdown
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Add state for balance too low modal
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);
  
  // Reset advanced state when market changes
  useEffect(() => {
    setShowAdvanced(false);
  }, [marketAddress]);

  // const { tokenABalance, tokenBBalance } = useMarketTokens(marketContractAddress);
  const { currency0Balance, currency1Balance, isEstimating, error } = usePlaceEstimate({
    marketContractAddress: marketAddress as `0x${string}`,
    amountUsd: state.amount,
    beliefPercentage: state.belief,
  });

  // Check approval status
  const { 
    hasApproval,
    requestApproval,
    checkMarketApproval,
    isRequestingApproval,
  } = useApproval();

  // Check market-specific approval and request if needed
  useEffect(() => {
    const checkAndRequestApproval = async () => {
      if (!hasApproval && !hasRequestedApprovalRef.current && !isRequestingApproval && marketAddress) {
        hasRequestedApprovalRef.current = true;
        setHasRequestedApproval(true);
        
        // First check if user is already approved for this specific market (synchronous cache check)
        const isMarketApproved = checkMarketApproval(marketAddress as `0x${string}`);
        
        // Only request approval if not already approved for this market
        if (!isMarketApproved) {
          try {
            await requestApproval(marketAddress as `0x${string}`);
          } catch (error) {
            console.error('Error requesting approval:', error);
            // Reset the flag so we can try again later
            hasRequestedApprovalRef.current = false;
            setHasRequestedApproval(false);
          }
        }
      }
    };

    checkAndRequestApproval();
  }, [hasApproval, hasRequestedApproval, isRequestingApproval, marketAddress]); // Removed requestApproval and checkMarketApproval from dependencies


  const initialValue = parseFloat(state.amount) || 0;

  return (
    <React.Fragment>
      <BetOptionToggle
        selectedOption={state.selectedOption}
        onSelectOption={(option) => updateSelectedOption(option)}
        marketProbability={marketProbability}
        yesSideName={market?.yesSideName}
        noSideName={market?.noSideName}
      />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)]">
          <span className="text-base font-semibold text-[#FFFFFFA3]]">
            Buy Amount
          </span>
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

              {state.insufficientFunds && isAuthenticated && (
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

        <EstimatedWinnings
          currency0Balance={currency0Balance || null}
          currency1Balance={currency1Balance || null}
          initialValue={initialValue}
          isEstimating={isEstimating}
          error={error ? true : false}
          marketOdds={marketProbability?.yes || null}
          belief={state.belief}
          persist={state.persist}
          showAdvanced={showAdvanced}
        />
      </div>

      {/* Place Bet Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            // PLATFORM_FEE_TODO: Check balance BEFORE opening modal
            const betAmount = parseFloat(state.amount || "0");
            const { canProceed } = checkBalanceForAction('PLACE_BET', betAmount);
            
            if (!canProceed) {
              setShowBalanceTooLowModal(true);
              return;
            }
            
            dispatch({ type: 'SET_MODAL', payload: 'place_bet' });
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
          Place Bet
        </button>
      </div>
      
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

export default PlaceBetContent;
