/**
 * Side Bet Win Modal Component
 * 
 * Displays side bet wins immediately after the initial deal
 * Shows the type of win, payout multiplier, and total winnings
 */

"use client";

import { useEffect, useState } from "react";
import { Sidebet, SidebetType, SidebetResultType } from "@/types/games/blackjack/game";
import { playSound } from "@/utils/games/blackjack/client/sounds";

interface SideBetWinModalProps {
  sidebetResults: Sidebet[];
  onClose: () => void;
}

export function SideBetWinModal({
  sidebetResults,
  onClose,
}: SideBetWinModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedResults, setDisplayedResults] = useState<Sidebet[]>([]);

  useEffect(() => {
    // Filter only winning side bets
    const winningResults = sidebetResults.filter(
      (result) => result.result === SidebetResultType.WIN && result.profit && result.profit > 0
    );

    if (winningResults.length > 0) {
      setDisplayedResults(winningResults);
      setIsVisible(true);
      
      // Play win sound
      playSound("game-win-3", 0.6);
      
      // NO AUTO-CLOSE - User must click to dismiss
    } else {
      onClose();
    }
  }, [sidebetResults, onClose]);

  if (!isVisible || displayedResults.length === 0) {
    return null;
  }

  const getSideBetName = (type: SidebetType): string => {
    switch (type) {
      case SidebetType.PAIR:
        return "Perfect Pairs";
      case SidebetType.TWENTY_ONE_PLUS_THREE:
        return "21+3";
      default:
        return "Side Bet";
    }
  };

  const getWinTypeName = (sidebet: Sidebet): string => {
    if (!sidebet.profit || !sidebet.amount || sidebet.profit === 0) {
      return "No Win";
    }
    
    const multiplier = sidebet.profit / sidebet.amount;
    
    if (sidebet.type === SidebetType.PAIR) {
      // Perfect Pairs multipliers
      if (multiplier === 25) return "Perfect Pair (25:1)";
      if (multiplier === 12) return "Colored Pair (12:1)";
      if (multiplier === 6) return "Mixed Pair (6:1)";
    } else if (sidebet.type === SidebetType.TWENTY_ONE_PLUS_THREE) {
      // 21+3 multipliers
      if (multiplier === 40) return "Straight Flush (40:1)";
      if (multiplier === 30) return "Three of a Kind (30:1)";
      if (multiplier === 10) return "Straight (10:1)";
      if (multiplier === 5) return "Flush (5:1)";
    }
    
    // Fallback to showing multiplier
    return `${multiplier.toFixed(0)}:1 Win`;
  };

  const totalWinnings = displayedResults.reduce(
    (sum, result) => sum + (result.profit || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-green-900 to-emerald-900 border-4 border-yellow-400 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
            SIDEBET WIN!
          </h2>
          <div className="text-white/90 text-lg">
            Total Winnings: <span className="text-green-300 font-bold text-2xl">${totalWinnings.toLocaleString()}</span>
          </div>
        </div>

        {/* Side Bet Results */}
        <div className="space-y-4">
          {displayedResults.map((result, index) => (
            <div
              key={index}
              className="bg-black/40 rounded-lg p-4 border-2 border-yellow-400/50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-yellow-300 font-bold text-xl">
                    {getSideBetName(result.type)}
                  </div>
                  <div className="text-white/80 text-sm">
                    Bet: ${result.amount}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-300 font-bold text-2xl">
                    +${result.profit?.toLocaleString()}
                  </div>
                  <div className="text-yellow-300 text-sm">
                    {getWinTypeName(result)} Win
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/70 text-sm">
          Click anywhere to close
        </div>
      </div>
    </div>
  );
}

