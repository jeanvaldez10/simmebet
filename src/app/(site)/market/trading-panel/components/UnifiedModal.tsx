// @refresh reset
import React, { useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMarketData } from "@/interfaces/market";
import { useTradingPanel } from "../context/TradingPanelContext";
import { useTradingPanelActions } from "../hooks/useTradingPanelActions";
import useMarketTokens from "@/hooks/useMarketTokens";
import useRebalanceEstimate from "@/hooks/useRebalanceEstimate";
import usePlaceEstimate from "@/hooks/usePlaceEstimate";
import { formatBalance, formatTokenAmount } from "@/utils/format";
import useCashoutInfo from "../hook/useCashoutInfo";
import { useMarketUsdcInvestment } from "@/hooks/useMarketUsdcInvestment";
import SuccessModal from "@/app/(site)/options/common/success-modal";
import SuccessModalContent from "../modal/success-modal-content";
import FlexModal from "@/app/(site)/profile/common/modal/flex-modal";
import { generateFlexCard, getAccuratePositionValue } from "../utils/flexCardGenerator";
import { useAuthContext } from "@/context/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateMarketCaches } from "@/utils/liquidityCacheUtils";
import { parseAbiItem } from 'viem';
import { useReadContract } from 'wagmi';
import { CASHOUT_HELPER_ADDRESS } from "@/constants";
import { useBalanceCheck } from "@/hooks/useBalanceCheck";
import { BalanceTooLowModal } from "@/components/modals/BalanceTooLowModal";

interface UnifiedModalProps {
  type: 'place_bet' | 'update_bet' | 'close_bet';
  onClose: () => void;
  market: IMarketData;
  marketAddress: string;
  imageSrc?: string;
  teamName?: string;
  walletAddress?: string;
  onCashOutSuccess?: () => void;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
}

export const UnifiedModal: React.FC<UnifiedModalProps> = ({ 
  type, 
  onClose, 
  market, 
  marketAddress,
  imageSrc = "/images/cup.png",
  teamName,
  onCashOutSuccess,
}) => {
  const { state, dispatch } = useTradingPanel();
  const { handleUpdateBetConfirm, handleCloseBetConfirm } = useTradingPanelActions(market, marketAddress);
  const { dbUser } = useAuthContext();
  const queryClient = useQueryClient();
  const { refreshBalances } = useMarketTokens(marketAddress as `0x${string}`);
  const { checkBalanceForAction } = useBalanceCheck();
  const [showBalanceTooLowModal, setShowBalanceTooLowModal] = useState(false);
  
  // Use refs to persist state across hot reloads
  const flexModalStateRef = useRef<string>("");
  const flexTypeRef = useRef<"flex10" | "flex12" | "flex15">("flex12");
  const [isFlexModalOpen, setIsFlexModalOpen] = useState<string>(flexModalStateRef.current);
  const [flexType, setFlexType] = useState<"flex10" | "flex12" | "flex15">(flexTypeRef.current);
  
  
  // Determine the correct image based on selected option
  const getImageSrc = () => {
    if (state.selectedOption === "yes" && market.yesSideIcon) {
      return market.yesSideIcon;
    } else if (state.selectedOption === "no" && market.noSideIcon) {
      return market.noSideIcon;
    }
    return imageSrc; // fallback to provided imageSrc or default
  };

  // Get appropriate alt text based on selected option
  const getAltText = () => {
    if (state.selectedOption === "yes" && market.yesSideName) {
      return market.yesSideName;
    } else if (state.selectedOption === "no" && market.noSideName) {
      return market.noSideName;
    }
    return state.selectedOption === "yes" ? "Yes" : "No";
  };
  
  const { tokenABalance, tokenBBalance } = useMarketTokens(marketAddress as `0x${string}`);
  const { token0Out, token1Out, isEstimating, error } = useRebalanceEstimate({
    marketContractAddress: marketAddress as `0x${string}`,
    amountUsd: state.amount,
    beliefPercentage: state.belief,
    selectedSide: state.selectedOption as "yes" | "no",
  });

  // Add place estimate for calculating potential winnings (for flex12)
  const { currency0Balance, currency1Balance } = usePlaceEstimate({
    marketContractAddress: marketAddress as `0x${string}`,
    amountUsd: state.amount,
    beliefPercentage: state.belief,
  });
  
  const cashoutInfo = useCashoutInfo(marketAddress as `0x${string}`, market, state.selectedOption as "yes" | "no");
  
  // Get the actual Net USDC Invested for this market (same as PositionSummaryCard)
  const { data: usdcInvestment } = useMarketUsdcInvestment(market.id);
  const totalUsdcInvestment = Number(usdcInvestment) || 0;
  
  const yesBalRaw = cashoutInfo ? cashoutInfo.yesAmountRaw : 0;
  const noBalRaw = cashoutInfo ? cashoutInfo.noAmountRaw : 0;
  const burnAmount = Math.max(Math.min(yesBalRaw || 0, noBalRaw || 0), 0);
  const projectedCashoutUsd = burnAmount;
  
  // Get accurate redeemable amount from contract (same as PositionSummaryCard)
  const { data: estimateRedeemableAmount, isLoading: isEstimatingRedeemableAmount } = useReadContract({
    address: CASHOUT_HELPER_ADDRESS,
    abi: [parseAbiItem("function estimateRedeemableAmount(address market, uint256 token0Amount, uint256 token1Amount) returns (uint256,uint256,uint256,uint256)")],
    functionName: "estimateRedeemableAmount",
    args: [market.contractAddress as `0x${string}`, BigInt(noBalRaw * 1e18), BigInt(yesBalRaw * 1e18)],
    chainId: 42161,
    query: {
      enabled: !!noBalRaw && !!yesBalRaw && type === 'close_bet',
    },
  });

  // Calculate redeemable amount and cashout display
  const redeemableAmount = (estimateRedeemableAmount?.[0] ? Number(estimateRedeemableAmount?.[0]) / 1e18 : 0) * 2;
  const cashedOutDisplay = type === 'close_bet' ? formatBalance(redeemableAmount) : formatBalance(projectedCashoutUsd * 2);
    
  const [modalState, setModalState] = useState<
    "none" | "success" | "error" | "pending"
  >("none");
  const [isLoading, setIsLoading] = useState(false);
  const [requestResponse, setRequestResponse] = useState<{ yes?: string, no?: string } | null>(null);
  const [cashoutAmount, setCashoutAmount] = useState<number | null>(null);
  const [liquidityNftId, setLiquidityNftId] = useState<string | null>(null);
  const [preCashoutBetAmount, setPreCashoutBetAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setShowAdvanced] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('betModalAdvancedOpen') === 'true';
    }
    return false;
  });

  // const gradient =
  //   state.selectedOption === "yes"
  //     ? "linear-gradient(#36FD68 5%, #16171E 0%)"
  //     : "linear-gradient(#D32B3F 5%, #16171E 0%)";

  const getModalTitle = () => {
    switch (type) {
      case 'place_bet': return 'Place Bet';
      case 'update_bet': return 'Update Bet';
      case 'close_bet': return 'Cashout';
    }
  };


  const handleConfirm = async () => {
    try {
      // PLATFORM_FEE_TODO: Balance check for all transaction types
      // Check if user has sufficient balance BEFORE initiating transaction
      if (type === 'place_bet') {
        // For place_bet, need to check bet amount + fee
        const betAmount = parseFloat(state.amount || "0");
        const { canProceed } = checkBalanceForAction('PLACE_BET', betAmount);
        if (!canProceed) {
          setShowBalanceTooLowModal(true);
          return;
        }
      } else if (type === 'update_bet') {
        // For update_bet, need to check additional bet amount + fee
        const additionalBetAmount = parseFloat(state.amount || "0");
        const { canProceed } = checkBalanceForAction('UPDATE_POSITION', additionalBetAmount);
        if (!canProceed) {
          setShowBalanceTooLowModal(true);
          return;
        }
      } else if (type === 'close_bet') {
        // For cashout, only need fee (not selling anything, just claiming)
        const { canProceed } = checkBalanceForAction('CASHOUT');
        if (!canProceed) {
          setShowBalanceTooLowModal(true);
          return;
        }
      }
      
      setIsLoading(true);
      setModalState("pending");
      
      if (type === 'place_bet') {
        const response = await fetch(`/api/bets/swap/${market.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountIn: state.amount,
            targetOdds: state.belief,
            idempotencyKey: crypto.randomUUID(),
            persist: state.persist,
          }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to place bet");
        }
        
      if (data.txHash) {
        dispatch({ type: 'SET_TX_HASH', payload: data.txHash });
      }
      if (data.tokenAmounts) {
        setRequestResponse({
          yes: data.tokenAmounts.yes,
          no: data.tokenAmounts.no
        });
      }
      if (data.liquidityNftId) {
        setLiquidityNftId(data.liquidityNftId.toString());
      }
      
        
        // Invalidate all market caches including liquidity positions after placing bet
        await invalidateMarketCaches(queryClient, market.id, dbUser?.id, market.contractAddress);
        
        // Refresh token balances to update UI state
        await refreshBalances();
      } else if (type === 'update_bet') {
        const response = await handleUpdateBetConfirm(state.selectedOption, state.amount, state.belief, state.persist);
        if (response?.data?.txHash) {
          dispatch({ type: 'SET_TX_HASH', payload: response.data.txHash });
        }
        if (response?.data?.tokenAmounts) {
          setRequestResponse({
            yes: response.data.tokenAmounts.yes,
            no: response.data.tokenAmounts.no
          });
        }
        if (response?.data?.liquidityNftId) {
          setLiquidityNftId(response.data.liquidityNftId.toString());
        }
        
      } else if (type === 'close_bet') {
        // Capture the original bet amount BEFORE cashout
        // Use max of totalUsdcInvestment or token-based calculation
        const tokenBasedBetAmount = burnAmount * 2;
        const capturedBetAmount = Math.max(totalUsdcInvestment, tokenBasedBetAmount);
        setPreCashoutBetAmount(capturedBetAmount);
        
        const amountToSell = String(burnAmount || 0);
        const cashoutResponse = await handleCloseBetConfirm(state.selectedOption, amountToSell);
        if (cashoutResponse?.txHash) {
          dispatch({ type: 'SET_TX_HASH', payload: cashoutResponse.txHash });
        }
        if (cashoutResponse?.amountOut) {
          setCashoutAmount(parseFloat(cashoutResponse.amountOut));
        }
        await cashoutInfo?.refreshBalances();
        
        // Call success callback if provided
        if (onCashOutSuccess) {
          onCashOutSuccess();
        }
      }
      
      setModalState("success");
    } catch (error) {
      console.error(error);
      
      // Extract error message from axios response or regular error
      let errorMsg = "An unknown error occurred";
      if (error && typeof error === 'object' && 'response' in error) {
        // Axios error with response
        const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
        errorMsg = axiosError.response?.data?.error || axiosError.message || errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setModalState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState("none");
    setRequestResponse(null);
    setCashoutAmount(null);
    setLiquidityNftId(null);
    setPreCashoutBetAmount(null);
    setErrorMessage(null);
    setShowAdvanced(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('betModalAdvancedOpen', 'false');
    }
    
    // Reset the amount field when closing after a successful bet
    if (type === 'place_bet' || type === 'update_bet') {
      dispatch({ type: 'SET_AMOUNT', payload: '' });
    }
    
    onClose();
  };

  const handleFlexClick = async () => {
    if (!dbUser?.id) return;
    
    flexModalStateRef.current = "loading";
    setIsFlexModalOpen("loading");
    
    try {
      const balanceToUse0: string | number | undefined | null = currency0Balance;
      const balanceToUse1: string | number | undefined | null = currency1Balance;
      let currentValueOverride: number | null = null;
      
      // For update_bet, refresh balances and get accurate position value from contract
      if (type === "update_bet") {
        await refreshBalances();
        // Small delay to ensure balances are updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const noBalRaw = tokenABalance ? Number(tokenABalance) / 1e18 : 0;
        const yesBalRaw = tokenBBalance ? Number(tokenBBalance) / 1e18 : 0;
        
        // Get accurate position value using utility function
        currentValueOverride = await getAccuratePositionValue(
          market.contractAddress,
          noBalRaw,
          yesBalRaw
        );
      }
      
      const result = await generateFlexCard({
        type,
        state,
        market,
        dbUser,
        totalUsdcInvestment,
        preCashoutBetAmount,
        cashoutAmount: currentValueOverride !== null ? currentValueOverride * 1e6 : cashoutAmount,
        burnAmount,
        requestResponse,
        currency0Balance: balanceToUse0,
        currency1Balance: balanceToUse1,
      });
      
      flexTypeRef.current = result.flexType;
      setFlexType(result.flexType);
      flexModalStateRef.current = result.imageUrl;
      setIsFlexModalOpen(result.imageUrl);
    } catch (error) {
      console.error('Error creating bet snapshot:', error);
      flexModalStateRef.current = "";
      setIsFlexModalOpen("");
    }
  };

  const renderModalContent = () => {
    if (type === 'close_bet') {
      const newToken0Balance = estimateRedeemableAmount?.[1] ? Number(estimateRedeemableAmount?.[1]) / 1e18 : 0;
      const newToken1Balance = estimateRedeemableAmount?.[2] ? Number(estimateRedeemableAmount?.[2]) / 1e18 : 0;
      const remainingNo = newToken0Balance;
      const remainingYes = newToken1Balance;
      const noSellAmount = noBalRaw - newToken0Balance;
      const yesSellAmount = yesBalRaw - newToken1Balance;
    
      const yesBal = yesBalRaw ?? 0;
      const noBal = noBalRaw ?? 0;
      const total = yesBal + noBal;

      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-[12px] shrink-0">
              <Image
                src={getImageSrc()}
                alt={getAltText()}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[#F2F2FD] truncate">
                {market.question}
              </h3>
            </div>
          </div>

          <div className="flex flex-col p-4 border rounded-[8px] border-[#FFFFFF29]">
            <div className="flex items-center justify-between">
              <p className="text-[#FFFFFFA3] font-semibold text-base">Your Holdings</p>
              <p className="text-[#FFFFFF80] text-xs font-medium">{total.toFixed(4)} total</p>
            </div>

            <div className="flex flex-col whitespace-nowrap mt-3 text-sm">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1">
                <span className="inline-flex items-center justify-center h-6 w-[64px] rounded-[6px] bg-[rgba(249,115,115,0.12)] text-[#F97373] text-xs font-medium">
                  {market.noSideName}
                </span>
                <span />
                <div className="flex flex-col items-end">
                  <span className="text-white text-base leading-tight">{noBal.toFixed(4)}</span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">
                    {noSellAmount < 0 ? '+ ' : '- '}{Math.abs(noSellAmount).toFixed(4)} = {remainingNo.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="h-px bg-[rgba(255,255,255,0.08)] my-1" />
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1">
                <span className="inline-flex items-center justify-center h-6 w-[64px] rounded-[6px] bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-medium">
                  {market.yesSideName}
                </span>
                <span />
                <div className="flex flex-col items-end">
                  <span className="text-white text-base leading-tight">{yesBal.toFixed(4)}</span>
                  <span className="text-[11px] text-[rgba(255,255,255,0.56)] leading-tight">
                    {yesSellAmount < 0 ? '+ ' : '- '}{Math.abs(yesSellAmount).toFixed(4)} = {remainingYes.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-4 border rounded-[8px] border-[#FFFFFF29] gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[rgba(255,255,255,0.64)]">Cashout Amount</p>
              <div className="text-[20px] text-white font-semibold">
                {isEstimatingRedeemableAmount ? 'Estimating...' : cashedOutDisplay}
              </div>
            </div>
            <div className="h-px bg-[rgba(255,255,255,0.08)]" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[rgba(255,255,255,0.64)]">Remaining Tokens</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center h-6 px-2 rounded-[6px] bg-[rgba(249,115,115,0.12)] text-[#F97373] text-xs font-medium">
                  {market.noSideName}
                </span>
                <span className="text-white font-medium">{remainingNo.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center h-6 px-2 rounded-[6px] bg-[rgba(34,197,94,0.12)] text-[#22C55E] text-xs font-medium">
                  {market.yesSideName}
                </span>
                <span className="text-white font-medium">{remainingYes.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'update_bet') {
      const previousYes = formatTokenAmount(tokenBBalance, 18);
      const previousNo = formatTokenAmount(tokenABalance, 18);
      const displayedYesOut = isEstimating || error ? "—" : formatTokenAmount(token1Out, 18);
      const displayedNoOut = isEstimating || error ? "—" : formatTokenAmount(token0Out, 18);
      
      return (
        <div>
          <div className="flex items-center gap-4 my-4">
            <div className="h-15 w-15 overflow-hidden rounded-[16px] shrink-0">
              <Image
                src={getImageSrc()}
                alt={getAltText()}
                width={60}
                height={60}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2F2FD]">{market.question}</h3>
            </div>
          </div>

          <div className="border border-[#FFFFFF29] p-4 rounded-[16px] my-4">
            <h4 className="text-sm font-semibold text-[#FFFFFFA3] mb-2">Position Impact</h4>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#FFFFFFA3] text-sm font-semibold">Previous</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#36FD68] border border-[#36FD68]/30 rounded px-2 py-1">
                  Yes {previousYes}
                </span>
                <span className="text-xs font-semibold text-[#D32B3F] border border-[#D32B3F]/30 rounded px-2 py-1">
                  No {previousNo}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#FFFFFFA3] text-sm font-semibold">USD Added</span>
              <span className="text-[#FFFFFF] text-sm font-semibold">+${Number(state.amount || "0").toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#FFFFFFA3] text-sm font-semibold">Belief</span>
              <span className="text-[#FFFFFF] text-sm font-semibold">{state.belief}%</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#FFFFFFA3] text-sm font-semibold">Gas Fee</span>
              {/* PLATFORM_FEE_TODO: Hardcoded fee - update when gas cost changes */}
              <span className="text-[#FFFFFF] text-sm font-semibold">$0.02</span>
            </div>

            <div className="relative my-2 h-8">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#FFFFFF29]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center justify-center w-[32px] h-[32px] rounded-full border border-[#FFFFFF29] bg-[#16171E] backdrop-blur-md">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#FFFFFFA3] text-sm font-semibold">Estimated Out</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#36FD68] border border-[#36FD68]/30 rounded px-2 py-1">
                  Yes {displayedYesOut}
                </span>
                <span className="text-xs font-semibold text-[#D32B3F] border border-[#D32B3F]/30 rounded px-2 py-1">
                  No {displayedNoOut}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#FFFFFF80] mt-1">Estimates shown for preview. Final settlement may vary.</p>
          </div>
        </div>
      );
    }

    // Simple design for place_bet with gradient
    const gradient =
      state.selectedOption === "yes"
        ? "linear-gradient(#36FD68 5%, #16171E 0%)"
        : "linear-gradient(#D32B3F 5%, #16171E 0%)";

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-[12px] shrink-0">
            <Image
              src={getImageSrc()}
              alt={"TKN"}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#F2F2FD] truncate">
              {market.question}
            </h3>
          </div>
        </div>

        <div className="border border-[#FFFFFF29] p-4 rounded-[16px] relative overflow-hidden">
          <div
            className="w-[366px] h-[366px] blur-[80px] absolute top-[-17%]"
            style={{ background: gradient }}
          />
          <div className="relative z-10 space-y-3">
            <div className="border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
              <span
                className={cn(
                  "font-semibold text-base",
                  state.selectedOption === "yes" ? "text-[#36FD68]" : "text-[#D32B3F]"
                )}
              >
                {teamName ? teamName : state.selectedOption === "yes" ? "Yes" : "No"}
              </span>
              <span className="text-[#FFFFFF] text-base font-normal">
                ${state.amount}
              </span>
            </div>
            <div className="border border-[#FFFFFF29] p-3 rounded-[8px] flex items-center justify-between">
              <span className="text-[#FFFFFFA3] font-semibold text-base">
                Belief
              </span>
              <span className="text-[#FFFFFF] text-base font-normal">
                {state.belief}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop with blur effect */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="bg-[#16171E] rounded-2xl p-6 w-[364px] max-w-[90vw] max-h-[90vh] overflow-y-auto relative z-10">
        {modalState === "success" && type === 'update_bet' && (
          <SuccessModal
            type="option"
            title="Update confirmed"
            subtitle={`Bet confirmed for ${teamName || market.question}`}
            isPositive={true}
            buttonText="Close"
            onButtonClick={handleModalClose}
            onClose={handleModalClose}
            width="w-[300px]"
          >
            <SuccessModalContent
              title="Update Confirmed"
              desc={`Bet confirmed for ${teamName || market.question}`}
              amount={parseFloat(state.amount || "0")}
              onClick={handleModalClose}
              onFlexClick={handleFlexClick}
              txHash={state.txHash}
              requestResponse={requestResponse ?? undefined}
              flexButtonText="Flex"
              flexType="flex12"
              liquidityNftId={liquidityNftId}
            />
          </SuccessModal>
        )}

        {modalState === "success" && type === 'close_bet' && (
          <SuccessModal
            type="option"
            title="Bet Closed"
            subtitle={`Cashed out from market`}
            isPositive={true}
            buttonText="Close"
            onButtonClick={handleModalClose}
            onClose={handleModalClose}
            width="w-[300px]"
            txHash={state.txHash}
          >
            <SuccessModalContent
              title="Bet Closed"
              desc=""
              amount={parseFloat(state.amount || "0")}
              amountNode={<p className="text-[#F2F2FD] text-sm font-semibold mt-3 text-center">Cashed out {(() => {
                return cashoutAmount !== null ? formatBalance(cashoutAmount / 1e6) : cashedOutDisplay;
              })()}</p>}
              onClick={handleModalClose}
              onFlexClick={handleFlexClick}
              txHash={state.txHash}
              flexType="flex10"
            />
          </SuccessModal>
        )}

        {modalState === "success" && type === 'place_bet' && (
          <SuccessModal
            type="option"
            title="Order confirmed"
            subtitle={`Order confirmed for "${teamName || market.question}"`}
            isPositive={true}
            buttonText="Close"
            onButtonClick={handleModalClose}
            onClose={handleModalClose}
            width="w-[300px]"
            txHash={state.txHash}
          >
            <SuccessModalContent
              title="Bet Confirmed"
              desc={`Order confirmed for "${teamName || market.question}"`}
              amount={parseFloat(state.amount || "0")}
              onClick={handleModalClose}
              onFlexClick={handleFlexClick}
              txHash={state.txHash}
              requestResponse={requestResponse ?? undefined}
              flexButtonText="Flex"
              flexType="flex12"
              liquidityNftId={liquidityNftId}
            />
          </SuccessModal>
        )}

        {modalState === "pending" && (
          <SuccessModal
            type="option_pending"
            title="Pending transaction"
            subtitle="It may take a few seconds to complete your transaction."
            isPositive={true}
            buttonText="Done"
            onButtonClick={() => {}}
            onClose={() => {}}
            width="w-[300px]"
          />
        )}
        
        {modalState === "error" && (
          <SuccessModal
            type="option_fail"
            title="Something went wrong"
            subtitle={errorMessage || "Please try again or contact our support for further help."}
            isPositive={false}
            buttonText="Try again"
            onButtonClick={handleModalClose}
            onClose={handleModalClose}
            width="w-[300px]"
          />
        )}

        {modalState === "none" && (
          <div>
            <h2 className="text-2xl font-semibold text-[#F2F2FD] mb-4">{getModalTitle()}</h2>

            {renderModalContent()}

            <div className="border-t border-[#FFFFFF29] my-4"></div>

            <div className="flex gap-2 my-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-[46px] px-4 py-2 bg-transparent border border-[#FFFFFF29] text-white rounded-lg hover:bg-[#FFFFFF10] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 h-[46px] px-4 py-2 text-[#070708] rounded-lg disabled:opacity-50 font-semibold",
                  state.selectedOption === "yes"
                    ? "bg-[#36FD68] hover:bg-[#36FD68]/90"
                    : "bg-[#D32B3F] hover:bg-[#D32B3F]/90"
                )}
              >
                {isLoading ? "Confirming..." : getModalTitle()}
              </button>
            </div>

          </div>
        )}
        </div>
      </div>
      
      {/* Flex Modal - rendered outside to avoid conflicts */}
      {isFlexModalOpen && (
        <FlexModal
          isLoading={isFlexModalOpen === "loading"}
          image={isFlexModalOpen}
          type={flexType}
          onClose={() => {
            flexModalStateRef.current = "";
            setIsFlexModalOpen("");
          }}
        />
      )}
      
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
    </>
  );
};
