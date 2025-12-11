import React from "react";

interface ArrowUpProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

const ArrowUp: React.FC<ArrowUpProps> = ({ 
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
        d="M10.6667 15H8.44166C5.68333 15 4.55 13.0416 5.93333 10.65L7.05 8.72498L8.16666 6.79998C9.55 4.40831 11.8083 4.40831 13.1917 6.79998L14.3083 8.72498L15.425 10.65C16.8083 13.0416 15.675 15 12.9167 15H10.6667Z" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeMiterlimit="10" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowUp;
