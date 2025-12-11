'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { IMarketData } from '@/interfaces/market';

export type TabType = "place_bet" | "close_bet" | "update_bet" | "bookie";
export type MarketResult = "yes" | "no" | null;
export type TModalType = "slippage" | "place_bet" | "close_bet" | "update_bet" | "add_liquidity" | "settle_market" | "claim_winnings" | "redeem_tokens" | null;

interface TradingPanelState {
  activeTab: TabType;
  amount: string;
  selectedOption: string;
  belief: number;
  slippageValue: number;
  hasBet: boolean;
  hasProfit: boolean;
  insufficientFunds: boolean;
  amountOut: number;
  open: TModalType;
  txHash: `0x${string}` | null;
  isLoading: boolean;
  marketResult: MarketResult;
  persist: boolean;
  rangeOption: "single" | "3" | "5";
}

type TradingPanelAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_SELECTED_OPTION'; payload: string }
  | { type: 'SET_BELIEF'; payload: number }
  | { type: 'SET_SLIPPAGE'; payload: number }
  | { type: 'SET_HAS_BET'; payload: boolean }
  | { type: 'SET_HAS_PROFIT'; payload: boolean }
  | { type: 'SET_INSUFFICIENT_FUNDS'; payload: boolean }
  | { type: 'SET_AMOUNT_OUT'; payload: number }
  | { type: 'SET_MODAL'; payload: TModalType }
  | { type: 'SET_TX_HASH'; payload: `0x${string}` | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MARKET_RESULT'; payload: MarketResult }
  | { type: 'SET_PERSIST'; payload: boolean }
  | { type: 'SET_RANGE_OPTION'; payload: "single" | "3" | "5" }
  | { type: 'RESET_FORM' };

interface TradingPanelContextType {
  state: TradingPanelState;
  dispatch: React.Dispatch<TradingPanelAction>;
  updateSelectedOption: (option: string) => void;
  getRecommendedMaxBet: string;
  getOptionLabel: (option: string) => React.JSX.Element;
  handleOpenModal: (modal: TModalType) => void;
  handleCloseModal: () => void;
  togglePersist: () => void;
  userBalance?: number;
}

const TradingPanelContext = createContext<TradingPanelContextType | undefined>(undefined);

function tradingPanelReducer(state: TradingPanelState, action: TradingPanelAction): TradingPanelState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_SELECTED_OPTION':
      return { ...state, selectedOption: action.payload };
    case 'SET_BELIEF':
      return { ...state, belief: action.payload };
    case 'SET_SLIPPAGE':
      return { ...state, slippageValue: action.payload };
    case 'SET_HAS_BET':
      return { ...state, hasBet: action.payload };
    case 'SET_HAS_PROFIT':
      return { ...state, hasProfit: action.payload };
    case 'SET_INSUFFICIENT_FUNDS':
      return { ...state, insufficientFunds: action.payload };
    case 'SET_AMOUNT_OUT':
      return { ...state, amountOut: action.payload };
    case 'SET_MODAL':
      return { ...state, open: action.payload };
    case 'SET_TX_HASH':
      return { ...state, txHash: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_MARKET_RESULT':
      return { ...state, marketResult: action.payload };
    case 'SET_PERSIST':
      return { ...state, persist: action.payload };
    case 'SET_RANGE_OPTION':
      return { ...state, rangeOption: action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        amount: "0.0",
        belief: 50,
        open: null,
        txHash: null,
        isLoading: false,
        persist: true,
      };
    default:
      return state;
  }
}

interface TradingPanelProviderProps {
  children: ReactNode;
  market: IMarketData;
  marketAddress: string;
  initialOption?: string;
  formattedTokenABalance: string;
  formattedTokenBBalance: string;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
  initialBelief: number;
  initialPersist?: boolean;
  userBalance?: number;
}

export const TradingPanelProvider: React.FC<TradingPanelProviderProps> = ({
  children,
  market,
  initialOption,
  formattedTokenABalance,
  formattedTokenBBalance,
  marketProbability,
  initialBelief,
  initialPersist = true,
  userBalance,
}) => {
  const initialState: TradingPanelState = {
    activeTab: "place_bet",
    amount: "0.0",
    selectedOption: initialOption || "yes",
    belief: initialBelief || 50,
    slippageValue: Number(localStorage.getItem("slippage")) || 5,
    hasBet: false,
    hasProfit: false,
    insufficientFunds: false,
    amountOut: 0,
    open: null,
    txHash: null,
    isLoading: false,
    marketResult: market.resolvedOption ? "yes" : "no",
    persist: initialPersist,
    rangeOption: "3",
  };

  const [state, dispatch] = useReducer(tradingPanelReducer, initialState);

  const updateSelectedOption = (option: string) => {
    if (option !== state.selectedOption) {
      dispatch({ type: 'SET_SELECTED_OPTION', payload: option });
      if (option === "yes") {
        dispatch({ type: 'SET_BELIEF', payload: 100 });
      } else {
        dispatch({ type: 'SET_BELIEF', payload: 0 });
      }
    }
  };

  const getRecommendedMaxBet = useMemo(() => {
    if (!marketProbability) return "0.00";

    const relevantBalance =
      state.selectedOption === "yes"
        ? parseFloat(formattedTokenABalance)
        : parseFloat(formattedTokenBBalance);

    const probability =
      state.selectedOption === "yes" ? marketProbability.yes : marketProbability.no;

    const odds = 1 / probability;
    const kellyFraction = (probability * odds - 1) / (odds - 1);
    const conservativeMultiplier = 0.25;
    const maxBet = relevantBalance * kellyFraction * conservativeMultiplier;
    const maxAllowedBet = Math.min(maxBet, relevantBalance * 0.1);

    return maxAllowedBet.toFixed(2);
  }, [
    state.selectedOption,
    marketProbability,
    formattedTokenABalance,
    formattedTokenBBalance,
  ]);

  const getOptionLabel = (option: string) => {
    return option === "yes" ? (
      <div className=" flex items-center gap-2 justify-center">
        <span className="text-sm font-semibold">Yes</span>
        <span
          className={`py-1 px-2 rounded-[80px] text-xs font-semibold ${
            state.selectedOption === "yes" ? "bg-[#33E06E] " : "bg-[#FFFFFF29]"
          }`}
        >
          {Math.round(marketProbability?.yes || 0)}%
        </span>
      </div>
    ) : (
      <div className=" flex items-center gap-2 justify-center">
        <span className="text-sm font-semibold">No</span>
        <span
          className={`py-1 px-2 rounded-[80px] text-xs font-semibold ${
            state.selectedOption === "no" ? "bg-[#D32B3F] " : "bg-[#FFFFFF29]"
          }`}
        >
          {Math.round(marketProbability?.no || 0)}%
        </span>
      </div>
    );
  };

  const handleOpenModal = (modal: TModalType) => {
    dispatch({ type: 'SET_MODAL', payload: modal });
  };

  const handleCloseModal = () => {
    dispatch({ type: 'SET_MODAL', payload: null });
    dispatch({ type: 'SET_TX_HASH', payload: null });
  };

  useEffect(() => {
    if (initialOption) {
      dispatch({ type: 'SET_SELECTED_OPTION', payload: initialOption === "no" ? "no" : "yes" });
    }

    if (market.resolvedOption === "Yes") {
      dispatch({ type: 'SET_MARKET_RESULT', payload: "yes" });
    } else if (market.resolvedOption === "No") {
      dispatch({ type: 'SET_MARKET_RESULT', payload: "no" });
    }
  }, [initialOption, market.resolvedOption]);

  useEffect(() => {
    const calculateEstimatedWinnings = () => {
      const betAmount = parseFloat(state.amount) || 0;

      const marketProb =
        state.selectedOption === "yes"
          ? marketProbability?.yes
          : marketProbability?.no;

      if (!marketProb || marketProb === 0) {
        dispatch({ type: 'SET_AMOUNT_OUT', payload: 0 });
        return;
      }

      const decimalOdds = state.belief > 0 ? 1 / (state.belief / 100) : 0;

      if (state.belief === 0) {
        dispatch({ type: 'SET_AMOUNT_OUT', payload: betAmount * 100 });
      } else if (state.belief === 100) {
        dispatch({ type: 'SET_AMOUNT_OUT', payload: betAmount });
      } else {
        const potentialPayout = betAmount * decimalOdds;
        dispatch({ type: 'SET_AMOUNT_OUT', payload: potentialPayout });
      }
    };

    calculateEstimatedWinnings();
  }, [state.amount, state.belief, state.selectedOption, marketProbability, state.slippageValue]);

  useEffect(() => {
    const numAmount = parseFloat(state.amount);
    dispatch({ type: 'SET_INSUFFICIENT_FUNDS', payload: numAmount > (userBalance || 0) });
  }, [state.amount, userBalance]);

  useEffect(() => {
    dispatch({ type: 'SET_BELIEF', payload: initialOption === "no" ? 0 : 100 });
  }, [initialOption]);

  useEffect(() => {
    const tokenABalance = parseFloat(formattedTokenABalance) || 0;
    const tokenBBalance = parseFloat(formattedTokenBBalance) || 0;
    const hasTokens = tokenABalance > 0 || tokenBBalance > 0;
    
    // DEBUG FLAG: Set to true to force "Place Bet" tab, false for normal behavior
    const FORCE_PLACE_BET = false;
    
    if (FORCE_PLACE_BET) {
      // Force show Place Bet tab (for debugging/testing)
      dispatch({ type: 'SET_HAS_BET', payload: false });
      dispatch({ type: 'SET_ACTIVE_TAB', payload: "place_bet" });
    } else {
      // Normal behavior based on token balances
      dispatch({ type: 'SET_HAS_BET', payload: hasTokens });
      
      if (hasTokens) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: "update_bet" });
        
        // Default to the side where the user has a position
        // tokenA = NO, tokenB = YES
        if (tokenBBalance > tokenABalance) {
          // User has more YES tokens
          dispatch({ type: 'SET_SELECTED_OPTION', payload: "yes" });
          dispatch({ type: 'SET_BELIEF', payload: 100 });
        } else if (tokenABalance > tokenBBalance) {
          // User has more NO tokens
          dispatch({ type: 'SET_SELECTED_OPTION', payload: "no" });
          dispatch({ type: 'SET_BELIEF', payload: 0 });
        }
        // If equal (rare case), keep the current selectedOption
      } else {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: "place_bet" });
      }
    }
  }, [formattedTokenABalance, formattedTokenBBalance]);

  useEffect(() => {
    if (marketProbability) {
      // Switch option when belief crosses the market probability threshold
      if (state.selectedOption === "yes" && state.belief < marketProbability.yes) {
        // Switching from "yes" to "no" - keep current belief value
        dispatch({ type: 'SET_SELECTED_OPTION', payload: "no" });
      } else if (state.selectedOption === "no" && state.belief > marketProbability.yes) {
        // Switching from "no" to "yes" - keep current belief value
        dispatch({ type: 'SET_SELECTED_OPTION', payload: "yes" });
      }
    }
  }, [state.belief, state.selectedOption, marketProbability]);

  const togglePersist = () => {
    dispatch({ type: 'SET_PERSIST', payload: !state.persist });
  };

  const contextValue: TradingPanelContextType = {
    state,
    dispatch,
    updateSelectedOption,
    getRecommendedMaxBet,
    getOptionLabel,
    handleOpenModal,
    handleCloseModal,
    togglePersist,
    userBalance,
  };

  return (
    <TradingPanelContext.Provider value={contextValue}>
      {children}
    </TradingPanelContext.Provider>
  );
};

export const useTradingPanel = (): TradingPanelContextType => {
  const context = useContext(TradingPanelContext);
  if (!context) {
    throw new Error("useTradingPanel must be used within a TradingPanelProvider");
  }
  return context;
};
