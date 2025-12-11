import React from "react";

const LiveIndicator = () => {
  return (
    <div className="flex pl-1.5 items-center gap-2 px-3 py-1 rounded-full bg-[#FD374829] text-[#FD3748] font-semibold text-xs">
      <div className="relative w-3.5 h-3.5">
        <span className="absolute inset-0 rounded-full bg-[#FD3748] opacity-75 animate-ping"></span>
        <span className="relative block w-full h-full rounded-full bg-[#FD3748]"></span>
      </div>
      Live
    </div>
  );
};

export default LiveIndicator;
