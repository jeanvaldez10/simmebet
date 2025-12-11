import * as React from "react";

interface LinkIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const LinkIcon: React.FC<LinkIconProps> = ({ size = 13, className = "", ...props }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    fill='none'
    viewBox='0 0 13 12'
    className={className}
    {...props}
  >
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m7.167 5.5 4.1-4.1'
    ></path>
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
      d='M11.667 3.4V1h-2.4M6.167 1h-1c-2.5 0-3.5 1-3.5 3.5v3c0 2.5 1 3.5 3.5 3.5h3c2.5 0 3.5-1 3.5-3.5v-1'
    ></path>
  </svg>
);

export default LinkIcon;
