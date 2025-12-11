import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressBar = ({ current, total, className = "" }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div
      className={`w-full bg-gray-600 rounded-full h-2 ${className} flex items-center px-1`}
    >
      <div
        className="bg-green-400 h-[3px] rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
