import * as React from "react";

interface OngoingIconProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

const OngoingIcon: React.FC<OngoingIconProps> = ({ 
  width = 16, 
  height = 16, 
  className = "",
  color = "#DA8F05"
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    viewBox="0 0 11 10"
    className={className}
  >
    <circle
      cx="5.977"
      cy="5"
      r="4.25"
      stroke={color}
      strokeWidth="1.5"
    ></circle>
  </svg>
);

export default OngoingIcon;
