import Button from "@/components/Button";
import CommonModal from "@/components/modals";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

const Slippage = ({
  onClose,
  updateSLippage,
  slippageValue,
}: {
  onClose: () => void;
  updateSLippage: (value: number) => void;
  slippageValue: number;
}) => {
  const [displayValue, setDisplayValue] = useState("");
  const [percentPosition, setPercentPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  const slippageType =
    slippageValue > 9 && slippageValue < 50
      ? "High Slippage"
      : slippageValue > 49
      ? "Very High Slippage"
      : "Good Slippage";

  const calculatePercentPosition = (value: string) => {
    if (!hiddenSpanRef.current || !value) return 0;

    hiddenSpanRef.current.textContent = value;
    const width = hiddenSpanRef.current.offsetWidth;
    return width + 16;
  };

  const formatDisplayValue = (value: number) => {
    if (value === 0) return "";

    const savedValue = localStorage.getItem("slippage");
    if (savedValue && parseFloat(savedValue) === value) {
      return savedValue.includes(".") ? value.toFixed(2) : value.toString();
    }

    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  useEffect(() => {
    const formattedValue = formatDisplayValue(slippageValue);
    setDisplayValue(formattedValue);
    setPercentPosition(calculatePercentPosition(formattedValue));
  }, [slippageValue]);

  useEffect(() => {
    setPercentPosition(calculatePercentPosition(displayValue));
  }, [displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      setDisplayValue("");
      updateSLippage(0);
      return;
    }

    const numericValue = parseFloat(inputValue);

    if (isNaN(numericValue)) {
      return;
    }

    if (numericValue > 100) {
      setDisplayValue("100");
      updateSLippage(100);
      return;
    }

    setDisplayValue(inputValue);

    const clampedValue = Math.max(0, Math.min(100, numericValue));
    updateSLippage(Number(clampedValue.toFixed(2)));
  };

  const handleAutoClick = () => {
    const autoValue = 5;
    setDisplayValue(formatDisplayValue(autoValue));
    updateSLippage(autoValue);
    localStorage.setItem("slippage", autoValue.toString());
  };

  const handleSave = () => {
    const valueToSave =
      slippageValue % 1 === 0
        ? slippageValue.toString()
        : slippageValue.toFixed(2);

    localStorage.setItem("slippage", valueToSave);
    onClose();
  };

  return (
    <CommonModal onClose={onClose} className="w-[360px]">
      <h2 className="text-[#F2F2FD] text-2xl font-semibold">Adjust Slippage</h2>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[#FFFFFFA3] text-sm font-semibold">
            Slippage
          </span>
          <span
            className={cn(
              slippageValue > 9 && slippageValue < 50
                ? "text-[#DA8F05]"
                : slippageValue > 49
                ? "text-[#FD3748]"
                : "text-[#36FD68]",
              "text-sm font-normal"
            )}
          >
            {slippageType}
          </span>
        </div>

        <div className="bg-[#2E3144] rounded-[50px] mt-2 p-3 flex items-center justify-between relative">
          <span
            ref={hiddenSpanRef}
            className="absolute invisible text-sm font-normal"
            style={{
              fontFamily: "inherit",
              fontSize: "0.875rem",
              fontWeight: "normal",
            }}
          />

          <input
            ref={inputRef}
            type="number"
            className="w-[80%] focus:outline-none focus:ring-0 focus:border-transparent pl-2 text-[#FFFFFFA3] text-sm font-normal bg-transparent"
            min="0"
            max="100"
            step="0.01"
            value={displayValue}
            onChange={handleInputChange}
            placeholder="0"
          />

          <span
            className={cn(
              "absolute top-[14px] text-[#FFFFFFA3] text-sm font-normal",
              !displayValue && "hidden"
            )}
            style={{
              left: `${percentPosition + 6}px`,
            }}
          >
            %
          </span>

          <button
            className="cursor-pointer text-black bg-[#FFFFFF] py-1 px-3 rounded-[80px] text-xs font-semibold"
            onClick={handleAutoClick}
          >
            Auto
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 gap-2 w-full">
        <Button variant="ghost" className="w-full" onClick={onClose}>
          Cancel
        </Button>
        <Button className="w-full" variant="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </CommonModal>
  );
};

export default Slippage;
