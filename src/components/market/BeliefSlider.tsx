"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { BeliefMultiPageTooltip } from "../shared/BeliefMultiPageTooltip";
import { BookieMultiPageTooltip } from "../shared/BookieMultiPageTooltip";

interface BeliefSliderProps {
  belief: number;
  selectedOption: string;
  updateBelief: (value: number) => void;
  isUpdate?: string;
  marketProbability:
    | {
        yes: number;
        no: number;
      }
    | null
    | undefined;
}

export default function BeliefSlider({
  belief,
  updateBelief,
  selectedOption,
  isUpdate = "",
  marketProbability,
}: BeliefSliderProps) {
  const [localValue, setLocalValue] = useState(belief.toString());
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isDragging) {
      setLocalValue(belief.toString());
    }
  }, [belief, isDragging]);

  const updateSliderValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100)
      );
      const decimalValue = Math.round(percentage * 10) / 10; // Round to 1 decimal place

      setLocalValue(decimalValue.toString());

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(() => {
        updateBelief(decimalValue);
      });
    },
    [updateBelief]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updateSliderValue(e.clientX);
    },
    [updateSliderValue]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      updateSliderValue(e.clientX);
    },
    [isDragging, updateSliderValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      updateSliderValue(touch.clientX);
    },
    [updateSliderValue]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      updateSliderValue(touch.clientX);
    },
    [isDragging, updateSliderValue]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 mt-2 pb-[10px]">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold flex items-center gap-2">
          <span className="text-[#FFFFFFA3]">{isUpdate === "bookie" ? "Odds" : "Belief"}</span>
          {isUpdate === "bookie" ? (
            <BookieMultiPageTooltip />
          ) : (
            <BeliefMultiPageTooltip />
          )}
        </div>

        <div className="flex items-center gap-2">
          {isUpdate && (
            <div className="text-[#FFFFFF52] flex items-center text-sm">
              <span>
                {Math.round((marketProbability?.yes || 0) * 100) / 100}
                %
              </span>
              <ArrowRight size={16} />
            </div>
          )}

          <input
            value={localValue}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d{0,1}$/.test(value)) {
                const num = parseFloat(value);
                // Prevent inputting values over 100
                if (num > 100) {
                  return;
                }
                setLocalValue(value);
                if (value === "" || (num >= 0 && num <= 100 && !value.endsWith("."))) {
                  const finalValue = num || 0;
                  updateBelief(finalValue);
                }
              }
            }}
            onBlur={() => {
              const num = parseFloat(localValue);
              if (isNaN(num) || num < 0) {
                setLocalValue("0");
                updateBelief(0);
              } else if (num >= 100) {
                setLocalValue("99.9");
                updateBelief(99.9);
              } else if (localValue.endsWith(".")) {
                // Handle trailing decimal - remove it and use the number
                setLocalValue(num.toString());
                updateBelief(num);
              } else {
                setLocalValue(num.toString());
                updateBelief(num);
              }
            }}
            type="text"
            className="text-[#FFFFFFA3] font-normal text-sm bg-[#2E3144] py-1 px-2 rounded-[50px] !w-[60px] focus:ring-0 active:ring-0 ring-0"
          />
        </div>
      </div>

      <div className="p-[2px] bg-[#2E3144] border border-[#FFFFFF29] rounded-[8px]">
        <div
          ref={sliderRef}
          className="relative w-full h-1 bg-[#2E3144] rounded-full cursor-pointer select-none"
          style={{ touchAction: 'pan-x' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            id="belief-progress"
            className="absolute left-0 top-0 h-full pointer-events-none bg-gradient-to-r rounded-full"
            style={{
              width: `${parseFloat(localValue) || 0}%`,
              backgroundImage: isUpdate
                ? "linear-gradient(to right, #FFFFFF52, #05B9FC)"
                : selectedOption === "yes"
                ? "linear-gradient(to right, #FFFFFF52, #33E06E)"
                : "linear-gradient(to right, #FFFFFF52, #D32B3F)",
            }}
          />

          <div
            className={cn(
              "absolute  w-5 h-5 md:w-4 md:h-4 rounded-full -mt-[8px] md:-mt-1.5  pointer shadow-lg",
              isDragging ? "scale-110" : "scale-100",
              isUpdate
                ? "bg-[#05B9FC]"
                : selectedOption === "yes"
                ? "bg-[#46FD84]"
                : "bg-[#D32B3F]"
            )}
            style={{ left: `calc(${parseFloat(localValue) || 0}% - 10px)` }}
          />

          {marketProbability?.yes !== undefined && (
            <>
              <div
                className="absolute top-[-3px] w-[2px] h-[10px] bg-[#ffff] pointer-events-none  whitespace-nowrap"
                style={{
                  left: `calc(${marketProbability.yes}%)`,
                  transform: "translateX(-1px)",
                }}
              />

              <div
                className="absolute top-4 px-3 py-2 bg-[#2E3144] border border-[#2E3144] text-[#FFFFFF] text-sm rounded-[16px] shadow-lg pointer-events-none whitespace-nowrap z-50"
                style={{
                  left: `${marketProbability.yes}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="text-center">
                  Market: {Math.round(marketProbability.yes * 100) / 100}%
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#2E3144]" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between text-sm text-[rgba(255,255,255,0.32)]">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
