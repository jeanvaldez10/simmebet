import { IMarketData } from "@/interfaces/market";
import Slippage from "@/app/(site)/market/trading-panel/modal/slippage";
import PlaceBetContent from "./common/place-bet";
import CloseBetContent from "./common/close-bet";
import MarketEnd from "./common/market-end";
import React, { useState } from "react";
import UpdateBetContent from "./common/update-bet";
import BookieContent from "./common/bookie";
import MarketBetClaim from "./modal/claim";
import { TradingPanelProvider, useTradingPanel } from "./context/TradingPanelContext";
import { UnifiedModal } from "./components/UnifiedModal";
import { AddLiquidityModal } from "./modal/add-liquidity";
import { useAuthContext } from "@/context/AuthProvider";
import PositionSummaryCard from "./components/PositionSummaryCard";
import LiquiditySummaryCard from "./components/LiquiditySummaryCard";

interface TradingPanelProps {
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
  persist: boolean;
  togglePersist: () => void;
  onTokenBalanceRefetch?: () => void;
}

export function TradingPanel({
  market,
  marketAddress,
  initialOption,
  formattedTokenABalance,
  formattedTokenBBalance,
  marketProbability,
  initialBelief,
  persist,
  togglePersist,
}: TradingPanelProps) {
  const { userBalance } = useAuthContext();
  
  return (
    <TradingPanelProvider
      market={market}
      marketAddress={marketAddress}
      initialOption={initialOption}
      formattedTokenABalance={formattedTokenABalance}
      formattedTokenBBalance={formattedTokenBBalance}
      marketProbability={marketProbability}
      initialBelief={initialBelief}
      initialPersist={persist}
      userBalance={userBalance}
    >
      <TradingPanelContent 
        market={market}
        marketAddress={marketAddress}
        marketProbability={marketProbability}
        persist={persist}
        togglePersist={togglePersist}
      />
    </TradingPanelProvider>
  );
}

function TradingPanelContent({ 
  market, 
  marketAddress,
  marketProbability,
}: {
  market: IMarketData;
  marketAddress: string;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
  persist: boolean;
  togglePersist: () => void;
}) {
  const { state, dispatch } = useTradingPanel();
  const { dbUser } = useAuthContext();

  const [claim, setClaim] = useState<"pending" | "error" | "success" | null>(
    null
  );
  
  // Track advanced state from localStorage
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tradingPanelAdvancedOpen');
      setShowAdvanced(stored === 'true');
    }
  }, []);
  
  React.useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('tradingPanelAdvancedOpen');
        setShowAdvanced(stored === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-window updates
    window.addEventListener('tradingPanelAdvancedChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tradingPanelAdvancedChange', handleStorageChange);
    };
  }, []);

  const renderContent = () => {
    if (market.isResolved) {
      return (
        <MarketEnd
          marketResult={state.marketResult}
          market={market}
        />
      );
    }

    switch (state.activeTab) {
      case "place_bet":
        return (
          <PlaceBetContent
            marketProbability={marketProbability}
            market={market}
          />
        );
      case "update_bet":
        return (
          <UpdateBetContent
            marketProbability={marketProbability}
            market={market}
          />
        );
      case "bookie":
        return (
          <BookieContent
            marketProbability={marketProbability}
          />
        );
      case "close_bet":
        return (
          <CloseBetContent
            marketContractAddress={market.contractAddress as `0x${string}`}
            market={market}
          />
        );
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <div className="flex w-full lg:w-[400px] flex-col gap-4 bg-[#16171E] p-5 rounded-2xl">
        {market.isResolved ? null : (
          <div className="flex items-start gap-5">
            {!state.hasBet ? (
              <button
                className={`text-2xl font-semibold transition-colors ${
                  state.activeTab === "place_bet"
                    ? "text-white"
                    : "text-[#FFFFFF66] hover:text-white"
                }`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: "place_bet" })}
              >
                Place Bet
              </button>
            ) : (
              <button
                className={`text-2xl font-semibold transition-colors ${
                  state.activeTab === "update_bet"
                    ? "text-white"
                    : "text-[#FFFFFF66] hover:text-white"
                }`}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: "update_bet" })}
              >
                Update Bet
              </button>
            )}
            <button
              className={`text-2xl font-semibold transition-colors ${
                state.activeTab === "bookie"
                  ? "text-white"
                  : "text-[#FFFFFF66] hover:text-white"
              }`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: "bookie" })}
            >
              Bookie
            </button>
          </div>
        )}

        {renderContent()}
      </div>

      {/* Position Summary Card - shown when user has bet and not on bookie tab */}
      {state.hasBet && !market.isResolved && state.activeTab !== 'bookie' && (
        <div className="mt-4 lg:mt-0">
          <PositionSummaryCard
            marketAddress={marketAddress}
            market={market}
            showAdvanced={showAdvanced}
          />
        </div>
      )}

      {/* Liquidity Summary Card - shown on bookie tab */}
      {!market.isResolved && state.activeTab === 'bookie' && (
        <div className="mt-4 lg:mt-0">
          <LiquiditySummaryCard market={market} />
        </div>
      )}

      {state.open && ['place_bet', 'update_bet', 'close_bet'].includes(state.open) && (
        <UnifiedModal
          type={state.open as 'place_bet' | 'update_bet' | 'close_bet'}
          onClose={() => dispatch({ type: 'SET_MODAL', payload: null })}
          market={market}
          marketAddress={marketAddress}
          imageSrc="/images/cup.png"
          teamName={
            state.belief >= (marketProbability?.yes || 50)
              ? market.yesSideName || ""
              : market.noSideName || ""
          }
          marketProbability={marketProbability}

          onCashOutSuccess={() => {
            // Don't set hasBet to false here - let the useEffect in TradingPanelContext
            // handle this based on actual token balances after the cash out
            dispatch({ type: 'SET_ACTIVE_TAB', payload: 'place_bet' });
          }}
        />
      )}

      {state.open === "slippage" && (
        <Slippage
          onClose={() => dispatch({ type: 'SET_MODAL', payload: null })}
          updateSLippage={(e) => dispatch({ type: 'SET_SLIPPAGE', payload: e })}
          slippageValue={state.slippageValue}
        />
        )}

      {state.open === "add_liquidity" && (
        <AddLiquidityModal
          onClose={() => dispatch({ type: 'SET_MODAL', payload: null })}
          marketId={market.id}
          marketAddress={marketAddress}
          userId={dbUser?.id}
          odds={100 - state.belief}
          selectRange={state.rangeOption}
          liquidityAmount={parseFloat(state.amount) || 0}
          market={market}
          onSuccess={() => dispatch({ type: 'SET_AMOUNT', payload: '' })}
        />
      )}

      {claim && (
        <MarketBetClaim state={claim} handleClose={() => setClaim(null)} />
      )}
    </React.Fragment>
  );
}
