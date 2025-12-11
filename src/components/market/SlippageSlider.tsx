import React from "react";

interface SlippageSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const SlippageSlider: React.FC<SlippageSliderProps> = ({ value, onChange }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl text-[rgba(255,255,255,0.64)]">
          Slippage
        </span>
        <span className="text-lg font-medium text-white">
          {value}%
        </span>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-[#1F1F3A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #FF4D4D 0%, #FFA64D 25%, #46FD84 50%, #1F1F3A 100%)",
              width: `${value}%`,
            }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          style={{ touchAction: 'pan-x' }}
        />
        <div
          className="absolute top-2 -translate-y-1/4 w-4 h-4 bg-[#46FD84] rounded-full"
          style={{
            left: `${value}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
};

export default SlippageSlider; 
