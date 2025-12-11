"use client";

import React from "react";
import { useTradingPanel } from "../context/TradingPanelContext";
import { cn } from "@/lib/utils";
import BeliefSlider from "@/components/market/BeliefSlider";

interface BookieContentProps {
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
}

export type RangeOption = "single" | "3" | "5";

export default function BookieContent({ marketProbability }: BookieContentProps) {
  const { state, dispatch, userBalance } = useTradingPanel();

  // Calculate exposure range based on belief and range option
  const calculateExposureRange = () => {
    const baseOdds = state.belief;
    let lowerBound = baseOdds;
    let upperBound = baseOdds;

    if (state.rangeOption === "3") {
      lowerBound = Math.max(0, baseOdds - 3);
      upperBound = Math.min(100, baseOdds + 3);
    } else if (state.rangeOption === "5") {
      lowerBound = Math.max(0, baseOdds - 5);
      upperBound = Math.min(100, baseOdds + 5);
    }

    return { lowerBound, upperBound };
  };

  // // Calculate estimated APY (simplified calculation)
  // const calculateEstimatedAPY = () => {
  //   const amount = parseFloat(state.amount) || 0;
  //   if (amount === 0) return 0;

  //   const { lowerBound, upperBound } = calculateExposureRange();
  //   const spread = upperBound - lowerBound;
  //   const marketOdds = marketProbability?.yes || 50;
    
  //   // Simple APY calculation based on spread and distance from market
  //   const distanceFromMarket = Math.abs(state.belief - marketOdds);
  //   const baseAPY = 8; // Base APY
  //   const spreadBonus = spread * 0.5; // Wider spread = higher APY
  //   const riskBonus = distanceFromMarket * 0.3; // Further from market = higher APY
    
  //   return baseAPY + spreadBonus + riskBonus;
  // };

  const { lowerBound, upperBound } = calculateExposureRange();

  return (
    <div className="flex flex-col gap-1">
      {/* Add Liquidity Amount Section - Matching Buy Amount styling */}
      <div className="flex flex-col gap-2 border p-4 rounded-lg border-solid border-[rgba(255,255,255,0.16)]">
        <span className="text-base font-semibold text-[#FFFFFFA3]">
          Add Liquidity Amount
        </span>
        <div>
          <div className="text-[40px] font-semibold text-[#F2F2FD] flex items-center relative">
            <span>$</span>
            <input
              type="text"
              value={state.amount === "0.0" || state.amount === "0" ? "" : state.amount}
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
          </div>
          {userBalance && parseFloat(state.amount) > userBalance && (
            <div className="text-red-500 text-sm mt-2 text-center">
              Insufficient funds. Your balance is ${userBalance.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Odds Slider - Using BeliefSlider component with isUpdate prop to change styling */}
      <BeliefSlider
        belief={state.belief}
        selectedOption="yes"
        updateBelief={(value) => dispatch({ type: 'SET_BELIEF', payload: value })}
        marketProbability={marketProbability}
        isUpdate="bookie"
      />

      {/* Select Range - Matching Quick Bet Button styling */}
      <div className="mt-2">
        <h4 className="text-base font-semibold text-[#FFFFFFA3] mb-2">Select Range</h4>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_RANGE_OPTION', payload: "single" })}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
              state.rangeOption === "single"
                ? "bg-white text-[#16171E] border-white"
                : "bg-transparent text-[#FFFFFFA3] border-[#FFFFFF52] hover:bg-[#FFFFFF40]"
            )}
          >
            Single Tick
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_RANGE_OPTION', payload: "3" })}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
              state.rangeOption === "3"
                ? "bg-white text-[#16171E] border-white"
                : "bg-transparent text-[#FFFFFFA3] border-[#FFFFFF52] hover:bg-[#FFFFFF40]"
            )}
          >
            ±3%
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_RANGE_OPTION', payload: "5" })}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
              state.rangeOption === "5"
                ? "bg-white text-[#16171E] border-white"
                : "bg-transparent text-[#FFFFFFA3] border-[#FFFFFF52] hover:bg-[#FFFFFF40]"
            )}
          >
            ±5%
          </button>
        </div>
      </div>

      {/* Updated Liquidity Summary - Matching PositionSummaryCard styling */}
      <div className="border border-[#FFFFFF29] rounded-lg p-4 mt-4">
        <h3 className="text-base font-semibold text-[#FFFFFFA3] mb-3">Updated Liquidity Summary</h3>
        
        {/* Estimated Yield */}
        {/* <div className="flex items-center justify-between mb-3">
          <span className="text-[#FFFFFFA3] text-sm">Estimated Yield</span>
          <span className="text-[#F2F2FD] font-semibold">~{estimatedAPY.toFixed(1)}% APY</span>
        </div> */}

        {/* Exposure Range */}
        <div className="flex items-center justify-between">
          <span className="text-[#FFFFFFA3] text-sm">Exposure Range</span>
          <span className="text-[#F2F2FD] font-semibold">
            {state.rangeOption === "single" ? `${Math.round(state.belief)}%` : `${Math.round(lowerBound)}% - ${Math.round(upperBound)}%`}
          </span>
        </div>
      </div>

      {/* Update Liquidity Button - Matching button styling */}
      <button
        onClick={() => dispatch({ type: 'SET_MODAL', payload: 'add_liquidity' })}
        disabled={parseFloat(state.amount) <= 0 || (userBalance ? parseFloat(state.amount) > userBalance : false)}
        className={cn(
          "w-full text-sm font-semibold cursor-pointer px-8 py-[13px] rounded-[80px] border-[none] transition-colors mt-4",
          parseFloat(state.amount) > 0 && (!userBalance || parseFloat(state.amount) <= userBalance)
            ? "bg-[#05B9FC] text-[#070708] hover:bg-[#0EA5E9]"
            : "bg-[#FFFFFF29] text-[#FFFFFF66] cursor-not-allowed"
        )}
      >
        Add Liquidity
      </button>
    </div>
  );
}
