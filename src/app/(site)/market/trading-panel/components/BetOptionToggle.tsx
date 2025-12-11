import React from "react";

interface BetOptionToggleProps {
  selectedOption: string;
  onSelectOption: (option: "yes" | "no") => void;
  marketProbability?: {
    yes: number;
    no: number;
  } | null;
  yesSideName?: string;
  noSideName?: string;
}

const BetOptionToggle: React.FC<BetOptionToggleProps> = ({
  selectedOption,
  onSelectOption,
  marketProbability,
  yesSideName,
  noSideName,
}) => {
  const getOptionLabel = (option: "yes" | "no") => {
    const isYes = option === "yes";
    const label = isYes ? (yesSideName || "Yes") : (noSideName || "No");
    const percentage = isYes 
      ? Math.round(marketProbability?.yes || 0)
      : Math.round(marketProbability?.no || 0);

    return (
      <div className="flex items-center gap-2 justify-center">
        <span className="text-sm font-semibold">{label}</span>
        <span
          className={`py-1 px-2 rounded-[80px] text-xs font-semibold ${
            selectedOption === option ? 
              (isYes ? "bg-[#33E06E]" : "bg-[#D32B3F]") 
              : "bg-[#FFFFFF29]"
          }`}
        >
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="flex w-full bg-[#2E3144] rounded-[100px] p-1">
      <button
        onClick={() => onSelectOption("no")}
        className={`flex-1 text-lg font-medium py-3 rounded-[100px] text-center transition-all pointer ${
          selectedOption === "no"
            ? "bg-[#FF4D4D] text-[#070708]"
            : "text-white hover:bg-[#3A3D4D]"
        }`}
      >
        {getOptionLabel("no")}
      </button>
      <button
        onClick={() => onSelectOption("yes")}
        className={`flex-1 text-lg font-medium py-3 rounded-[100px] text-center transition-all pointer ${
          selectedOption === "yes"
            ? "bg-[#46FD84] text-[#070708]"
            : "text-white hover:bg-[#3A3D4D]"
        }`}
      >
        {getOptionLabel("yes")}
      </button>
    </div>
  );
};

export default BetOptionToggle;

