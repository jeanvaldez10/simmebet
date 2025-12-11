import React, { useRef, useEffect, useState } from "react";

const AdaptiveDollarInput = ({
  setAmount,
  outSideNumber = 0,
  isShowUSDSign = true,
  value,
}: {
  setAmount: (value: number) => void;
  outSideNumber?: number;
  isShowUSDSign?: boolean;
  value?: number | string;
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState(100);

  const [tempInput, setTempInput] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow only digits and a single optional dot
    if (/^\d*\.?\d*$/.test(value)) {
      setTempInput(value);

      if (value !== "" && value !== ".") {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          console.log("Parsed amount:", parsed);
          setAmount(parsed);
        }
      }
    }
  };

  useEffect(() => {
    if (spanRef.current) {
      setInputWidth(spanRef.current.offsetWidth + 12);
    }
  }, [tempInput]);

  useEffect(() => {
    if (outSideNumber !== 0) {
      setTempInput(outSideNumber.toString());
      setAmount(outSideNumber);
    }
  }, [outSideNumber, setAmount]);

  useEffect(() => {
    if (value) {
      setTempInput(String(value));
    }
  }, [value]);

  return (
    <div className="flex justify-center items-center">
      <div className="flex items-center text-[48px] font-semibold text-[#F2F2FD]">
        {isShowUSDSign && <span>$</span>}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={tempInput || ""}
            onChange={handleAmountChange}
            className="bg-transparent text-[48px] font-semibold text-[#F2F2FD] outline-none text-center md:!max-w-[378px] sm:!max-w-[366px] !max-w-[300px]"
            style={{ width: `${inputWidth}px` }}
            placeholder="0.00"
          />
          <span
            ref={spanRef}
            className="invisible absolute whitespace-pre font-semibold text-[48px]"
          >
            {tempInput || "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveDollarInput;
