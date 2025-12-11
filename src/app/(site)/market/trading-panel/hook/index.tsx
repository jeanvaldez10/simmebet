import { useAuthContext } from "@/context/AuthProvider";
import { IMarketData } from "@/interfaces/market";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import useMarketTokens from "@/hooks/useMarketTokens";
import { formatUnits } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { createNotification, createActivities } from "@/services/userService";
import { invalidateMarketCaches } from "@/utils/liquidityCacheUtils";

type TabType = "place_bet" | "close_bet" | "update_bet";

export type MarketResult = "yes" | "no" | null;

export type TeamType = "RMA" | "FCB" | null;

export type TModalType =
  | "slippage"
  | "place_bet"
  | "close_bet"
  | "update_bet"
  | "settle_market"
  | "claim_winnings"
  | "redeem_tokens"
  | null;

const useMarketTrade = ({
  initialOption,
  resolvedOption,
  formattedTokenABalance,
  formattedTokenBBalance,
  marketProbability,
  marketAddress,
  market,
}: {
  initialOption: string | undefined;
  resolvedOption: string | undefined;
  initialBelief: number;
  formattedTokenABalance: string;
  formattedTokenBBalance: string;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
  marketAddress: string;
  market: IMarketData;
}) => {
  const { dbUser, userBalance } = useAuthContext();
  const queryClient = useQueryClient();
  // @Johnny-TODO: Set hasBet true if user has already placed a bet on this market. and you'll see this component in the trading panel: https://www.figma.com/design/T6bMcPd3bnMOyIBm7D89Ua/Bluff-Beta?node-id=54823-35391&t=Zn9xE1TJBQXv1YPL-0
  const [hasBet, setHasBet] = useState(false);
  
  // @Johnny-TODO: Set activeTab for place_bet, close_bet, update_bet for which tab is active. Mostly when hasBet is true, you will set the update_bet here. Otherwise, it will be place_bet initially.
  const [activeTab, setActiveTab] = useState<TabType>("place_bet");
  const [amount, setAmount] = useState("0.0");
  const [selectedOption, setSelectedOption] = useState(initialOption || "yes");
  const [marketResult, setMarketResult] = useState<MarketResult>(
    resolvedOption ? "yes" : "no"
  );
  const [slippageValue, setSlippageValue] = useState<number>(
    Number(localStorage.getItem("slippage")) || 5
  );

  const [teamType] = useState<TeamType>(null);

  const [hasProfit] = useState(false);
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [belief, setBelief] = useState(50);
  const [amountOut, setAmountOut] = useState<number>(0);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const [open, setOPen] = useState<TModalType>(null);

  const [requestResponse, setRequestResponse] = useState<{ yes?: string, no?: string } | null>(null);
  const [cashoutAmountOut, setCashoutAmountOut] = useState<number | null>(null);

  // Initialize balance refetcher for this market
  const { refreshBalances } = useMarketTokens(marketAddress as `0x${string}`);

  const refreshAllData = async () => {
    // Invalidate all market caches including liquidity positions
    await invalidateMarketCaches(queryClient, market.id, dbUser?.id);
  };
  const handleCloseModal = (message?: TModalType) => {
    setOPen(message || null);
    setTxHash(null);
  };

  const handleOPenModal = (message: TModalType) => {
    setOPen(message);
  };

  const updateSelectedOption = (option: string) => {
    if (option !== selectedOption) {
      setSelectedOption(option);
      if (option === "yes") {
        setBelief(100);
      } else {
        setBelief(0);
      }
    }
  };

  // Add recommended max bet calculation
  const getRecommendedMaxBet = useMemo(() => {
    if (!marketProbability) return "0.00";

    // Get the relevant token balance based on selected option
    const relevantBalance =
      selectedOption === "yes"
        ? parseFloat(formattedTokenABalance)
        : parseFloat(formattedTokenBBalance);

    // Get the relevant probability
    const probability =
      selectedOption === "yes" ? marketProbability.yes : marketProbability.no;

    // Kelly Criterion formula: f* = (p(b+1) - 1)/b
    // where: f* is the fraction of bankroll to bet
    // p is the probability of winning
    // b is the odds received on the bet
    const odds = 1 / probability;
    const kellyFraction = (probability * odds - 1) / (odds - 1);

    // Apply a conservative multiplier (usually 0.25 to 0.5 of Kelly)
    const conservativeMultiplier = 0.25;

    // Calculate the recommended bet amount
    const maxBet = relevantBalance * kellyFraction * conservativeMultiplier;

    // Add a ceiling to prevent excessive bets
    const maxAllowedBet = Math.min(maxBet, relevantBalance * 0.1); // Max 10% of balance

    return maxAllowedBet.toFixed(2);
  }, [
    selectedOption,
    marketProbability,
    formattedTokenABalance,
    formattedTokenBBalance,
  ]);

  useEffect(() => {
    if (initialOption) {
      setSelectedOption(initialOption === "no" ? "no" : "yes");
    }

    if (resolvedOption === "Yes") {
      setMarketResult("yes");
    } else if (resolvedOption === "No") {
      setMarketResult("no");
    }
  }, [initialOption, resolvedOption]);

  useEffect(() => {
    const calculateEstimatedWinnings = () => {
      const betAmount = parseFloat(amount) || 0;
      // const currentBelief = belief / 100;

      // Get market probability for selected option
      const marketProb =
        selectedOption === "yes"
          ? marketProbability?.yes
          : marketProbability?.no;

      if (!marketProb || marketProb === 0) {
        setAmountOut(0);
        return;
      }

      // Convert probability to decimal odds (1/probability)
      const decimalOdds = belief > 0 ? 1 / (belief / 100) : 0;

      if (belief === 0) {
        setAmountOut(betAmount * 100);
      } else if (belief === 100) {
        setAmountOut(betAmount);
      } else {
        const potentialPayout = betAmount * decimalOdds;
        setAmountOut(potentialPayout);
      }
    };

    calculateEstimatedWinnings();
  }, [amount, belief, selectedOption, marketProbability, slippageValue]);

  useEffect(() => {
    const numAmount = parseFloat(amount);
    setInsufficientFunds(numAmount > (userBalance || 0));
  }, [amount, userBalance]);

  useEffect(() => {
    setBelief(initialOption === "no" ? 0 : 100);
  }, [initialOption]);

  useEffect(() => {
    const tokenABalance = parseFloat(formattedTokenABalance) || 0;
    const tokenBBalance = parseFloat(formattedTokenBBalance) || 0;
    
    const hasTokens = tokenABalance > 0 || tokenBBalance > 0;
    
    // Original logic (context now controls this):
    setHasBet(hasTokens);
    setActiveTab(hasTokens ? "update_bet" : "place_bet");
  }, [formattedTokenABalance, formattedTokenBBalance]);

  const getOptionLabel = (option: string) => {
    return option === "yes" ? (
      <div className=" flex items-center gap-2 justify-center">
        <span className="text-sm font-semibold">Yes</span>
        <span
          className={cn(
            "py-1 px-2 rounded-[80px] text-xs font-semibold",
            selectedOption === "yes" ? "bg-[#33E06E] " : "bg-[#FFFFFF29]"
          )}
        >
          {Math.round(marketProbability?.no || 0)}%
        </span>
      </div>
    ) : (
      <div className=" flex items-center gap-2 justify-center">
        <span className="text-sm font-semibold">No</span>
        <span
          className={cn(
            "py-1 px-2 rounded-[80px] text-xs font-semibold",
            selectedOption === "no" ? "bg-[#D32B3F] " : "bg-[#FFFFFF29]"
          )}
        >
          {Math.round(marketProbability?.yes || 0)}%
        </span>
      </div>
    );
  };

  const handlePlaceBetConfirm = async (option: string, betAmount: string) => {
    try {
      if (!dbUser?.id) return;
      const normalizedAmount = parseFloat(betAmount);

      // Validate the amount is within acceptable range
      if (
        isNaN(normalizedAmount) ||
        normalizedAmount <= 0 ||
        normalizedAmount > 1
      ) {
        throw new Error("Bet amount must be between 0 and 100");
      }

      const betRequest = {
        type: option.toLowerCase(),
        amountIn: normalizedAmount,
        slippage: slippageValue / 100,
        targetOdds: belief,
        persist: true, // TODO: This should be passed as a parameter
        idempotencyKey: uuidv4(),
      };
      console.log("Placing bet with request:", betRequest);

      const betResponse = await axios.post(
        `/api/bets/swap/${marketAddress}`,
        betRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (betResponse?.data?.txHash) {
        setTxHash(betResponse.data.txHash);
      }

      if (betResponse) {
        await createNotification(
          dbUser.id,
          "bet_success",
          betAmount,
          `You bought ${betAmount} at ${market.question} with ${belief}% belief`,
          market.id
        );

        // Create activities for both market and user
        await createActivities(
          dbUser.id,
          market.id,
          option.toLowerCase() === "yes" ? "PLACE_BET_YES" : "PLACE_BET_NO",
          parseFloat(betAmount),
          betResponse?.data?.txHash || null
        );

        toast.success("Bet placed successfully!");
        
        // Refresh token balances and all data after successful bet placement
        await refreshBalances();
        await refreshAllData();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error placing bet:", error);
      toast.error(message || "Failed to place bet. Please try again.");
      throw error;
    } finally {
      setOPen(null);
    }
  };

  const handleCloseBetConfirm = async (option: string, amount: string) => {
    if (!dbUser?.id) return;
    try {
      const cashoutRequest = {
        amountIn: parseFloat(amount),
        idempotencyKey: uuidv4(),
      };

      const cashoutResponse = await axios.post(`/api/bets/cashout/${market.contractAddress}`, cashoutRequest);
      console.log("cashoutResponse", cashoutResponse);
      if (cashoutResponse) {
        const amountOutUSD = cashoutResponse.data?.amountOut 
          ? (Number(cashoutResponse.data.amountOut) / 1e6).toFixed(2)
          : amount;

        try {
          const amountOutNumber = Number(
            formatUnits(BigInt(cashoutResponse.data.amountOut), 6)
          );
          setCashoutAmountOut(amountOutNumber);
        } catch {}

        // Create activities for both market and user
        await createActivities(
          dbUser?.id,
          market.id,
          "CASH_OUT",
          parseFloat(amount),
          cashoutResponse?.data?.txHash || null
        );


        queryClient.invalidateQueries({ queryKey: ["usdcBalance"] });
        queryClient.invalidateQueries({ queryKey: ["market-usdc-investment", dbUser.id, market.id] });
        toast.success(`Cash out successful! You received $${amountOutUSD}`);
        setTxHash(cashoutResponse.data.txHash);
        return cashoutResponse;
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error cashing out:", error);
      toast.error(message || "Failed to cash out. Please try again.");
      throw error;
    } finally {
      // setOPen(null);
    }
  };

  const handleUpdateBetConfirm = async (option: string, amount: string, persist: boolean) => {
    if (!dbUser?.id) return;
    try {
      const updateRequest = {
        beliefPercentage: belief,
        amountIn: parseFloat(amount),
        idempotencyKey: uuidv4(),
        persist: persist,
      };

      const updateResponse = await axios.post(
        `/api/bets/update-belief/${market.id}`,
        updateRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (updateResponse) {
        setTxHash(updateResponse.data?.txHash);
        setRequestResponse(updateResponse.data?.tokenAmounts);

        toast.success("Bet updated successfully!");
        
        await refreshBalances();
        await refreshAllData();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error updating bet:", error);
      toast.error(message || "Failed to update bet. Please try again.");
      throw error;
    } finally {
      // setOPen(null);
    }
  };

  useEffect(() => {
    if (activeTab !== "update_bet") {
      if (belief < (marketProbability?.yes || 50)) {
        setSelectedOption("no");
      } else {
        setSelectedOption("yes");
      }
    }
  }, [belief, marketProbability, activeTab]);

  return {
    dbUser,
    userBalance,
    activeTab,
    setActiveTab,
    amount,
    setAmount,
    selectedOption,
    setSelectedOption,
    marketResult,
    setMarketResult,
    slippageValue,
    setSlippageValue,
    teamType,
    hasBet,
    setHasBet,
    hasProfit,
    insufficientFunds,
    setInsufficientFunds,
    belief,
    setBelief,
    amountOut,
    setAmountOut,
    txHash,
    setTxHash,
    open,
    setOPen,
    initialOption,
    resolvedOption,
    handleCloseModal,
    updateSelectedOption,
    getRecommendedMaxBet,
    handleOPenModal,
    getOptionLabel,
    handlePlaceBetConfirm,
    handleCloseBetConfirm,
    handleUpdateBetConfirm,
    requestResponse,
    setRequestResponse,
    cashoutAmountOut,
  };
};

export default useMarketTrade;
