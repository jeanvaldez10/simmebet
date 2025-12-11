import React from "react";

interface ArrowDownProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

const ArrowDown: React.FC<ArrowDownProps> = ({ 
  width = 21, 
  height = 20, 
  className = "",
  color = "#070708"
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 21 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M10.6667 5H8.44166C5.68333 5 4.55 6.95833 5.93333 9.35L7.05 11.275L8.16666 13.2C9.55 15.5917 11.8083 15.5917 13.1917 13.2L14.3083 11.275L15.425 9.35C16.8083 6.95833 15.675 5 12.9167 5H10.6667Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowDown;
