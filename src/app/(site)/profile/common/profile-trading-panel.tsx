import UpdateBetContent from "@/app/(site)/market/trading-panel/common/update-bet";
import ProfileCloseBetContent from "./profile-close-bet";
import { TradingPanelProvider, useTradingPanel } from "@/app/(site)/market/trading-panel/context/TradingPanelContext";
import Slippage from "@/app/(site)/market/trading-panel/modal/slippage";
import { IMarketData } from "@/interfaces/market";
import React, { useEffect } from "react";
import { UnifiedModal } from "@/app/(site)/market/trading-panel/components/UnifiedModal";
import { useAuthContext } from "@/context/AuthProvider";

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
  onClose: () => void;
  mode?: "update" | "cashout"; // Add mode prop
}

const ProfileUpdatePosition = ({
  market,
  marketAddress,
  initialOption,
  formattedTokenABalance,
  formattedTokenBBalance,
  marketProbability,
  initialBelief,
  onClose,
  mode = "update",
}: TradingPanelProps) => {
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
      userBalance={userBalance}
    >
      <ProfileUpdatePositionContent 
        market={market}
        marketAddress={marketAddress}
        marketProbability={marketProbability}
        onClose={onClose}
        mode={mode}
      />
    </TradingPanelProvider>
  );
};

const ProfileUpdatePositionContent = ({
  market,
  marketAddress,
  marketProbability,
  onClose,
  mode = "update",
}: {
  market: IMarketData;
  marketAddress: string;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
  onClose: () => void;
  mode?: "update" | "cashout";
}) => {
  const { state, dispatch } = useTradingPanel();

  useEffect(() => {
    if (mode === "cashout") {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: "close_bet" });
    } else {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: "update_bet" });
    }
  }, [dispatch, mode]);

  return (
    <div className="flex flex-col gap-4">
      {mode === "update" ? (
        <UpdateBetContent
          marketProbability={marketProbability}
          market={market}
        />
      ) : (
        <ProfileCloseBetContent
          marketContractAddress={marketAddress as `0x${string}`}
          market={market}
        />
      )}

      {state.open === "slippage" && (
        <Slippage
          onClose={() => dispatch({ type: 'SET_MODAL', payload: null })}
          updateSLippage={(e) => dispatch({ type: 'SET_SLIPPAGE', payload: e })}
          slippageValue={state.slippageValue}
        />
      )}

      {state.open === "update_bet" && (
        <UnifiedModal
          type="update_bet"
          onClose={() => {
            dispatch({ type: 'SET_MODAL', payload: null });
            onClose();
          }}
          market={market}
          marketAddress={marketAddress}
          imageSrc={market.imageSquare || market.image || "/images/cup.png"}
          teamName={market.name}
        />
      )}

      {state.open === "close_bet" && (
        <UnifiedModal
          type="close_bet"
          onClose={() => {
            dispatch({ type: 'SET_MODAL', payload: null });
            // Close the parent profile modal after user dismisses the success modal
            onClose();
          }}
          market={market}
          marketAddress={marketAddress}
          imageSrc={market.imageSquare || market.image || "/images/cup.png"}
          teamName={market.name}
          // Don't provide onCashOutSuccess - let the success modal show properly
        />
      )}
    </div>
  );
};

export default ProfileUpdatePosition;
