import React from "react";

interface ChartFilterProps {
  selectedInterval: string;
  onIntervalChange: (interval: string) => void;
  className?: string;
}

const TIME_INTERVALS = ["15m", "1H", "4H", "1D"];

export const ChartFilter: React.FC<ChartFilterProps> = ({
  selectedInterval,
  onIntervalChange,
  className = "",
}) => {
  return (
    <div
      className={`flex justify-between items-center self-stretch ${className}`}
    >
      <div className="flex items-center gap-1">
        {TIME_INTERVALS.map((interval) => (
          <button
            key={interval}
            onClick={() => onIntervalChange(interval)}
            className={`h-7 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
              interval === selectedInterval
                ? "bg-[#2E3144] text-[#F2F2FD]"
                : "text-[rgba(255,255,255,0.32)] hover:bg-[rgba(255,255,255,0.08)]"
            }`}
          >
            {interval}
          </button>
        ))}
      </div>
    </div>
  );
};
