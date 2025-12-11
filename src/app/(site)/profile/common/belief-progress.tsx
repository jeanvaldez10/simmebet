import React from "react";

interface BeliefProgressProps {
  width?: string;
  yes?: number;
  no?: number;
}

const BeliefProgress: React.FC<BeliefProgressProps> = ({
  width,
  yes = 50,
  no = 50,
}) => {
  return (
    <div className="bg-[#2E3144] border border-[#FFFFFF29] py-[2px] rounded-[8px] px-1">
      <div
        className={`${
          width ? `${width}` : "w-[120px]"
        }  h-2  flex items-center gap-1`}
      >
        <div
          className="bg-[#FD3748] h-1 rounded-full transition-all duration-300"
          style={{ width: `${no}%` }}
        />
        <div
          className="bg-[#36FD68] h-1 rounded-full transition-all duration-300"
          style={{ width: `${yes}%` }}
        />
      </div>
    </div>
  );
};

export default BeliefProgress;
