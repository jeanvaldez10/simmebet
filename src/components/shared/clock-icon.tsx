import React from "react";
import clsx from "clsx";

const ClockIcon: React.FC<React.SVGProps<SVGSVGElement> & { className?: string }> = ({ 
  className = "",
  ...props 
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='16'
    height='17'
    fill='none'
    viewBox='0 0 16 17'
    className={clsx("group pointer", className)}
    {...props}
  >
    <path
      className="stroke-[1.5] stroke-[var(--icon-stroke)] group-hover:stroke-white"
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M14.667 8.716A6.67 6.67 0 0 1 8 15.383a6.67 6.67 0 0 1-6.667-6.667A6.67 6.67 0 0 1 8 2.049a6.67 6.67 0 0 1 6.667 6.667'
    />
    <path
      className="stroke-[1.5] stroke-[var(--icon-stroke)] group-hover:stroke-white"
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M10.473 10.836 8.407 9.603c-.36-.214-.654-.727-.654-1.147V5.723'
    />
  </svg>
);

export default ClockIcon;
