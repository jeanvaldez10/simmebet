import React from "react";

interface DotDividerProps {
  width?: number;
  height?: number;
  className?: string;
  opacity?: number;
}

const DotDivider: React.FC<DotDividerProps> = ({ 
  width = 9, 
  height = 7, 
  className = "",
  opacity = 0.32
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 9 7" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M7.24805 6.55398V4.87398H9.00005V6.55398H7.24805ZM7.24805 2.12598V0.445984H9.00005V2.12598H7.24805Z" 
        fill="white" 
        fillOpacity={opacity}
      />
      <path 
        d="M3.82031 6.55398V4.87398H5.57231V6.55398H3.82031ZM3.82031 2.12598V0.445984H5.57231V2.12598H3.82031Z" 
        fill="white" 
        fillOpacity={opacity}
      />
      <path 
        d="M0.392578 6.55398V4.87398H2.14458V6.55398H0.392578ZM0.392578 2.12598V0.445984H2.14458V2.12598H0.392578Z" 
        fill="white" 
        fillOpacity={opacity}
      />
    </svg>
  );
};

export default DotDivider;
