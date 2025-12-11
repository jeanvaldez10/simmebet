import * as React from "react";

interface MessageIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const MessageIcon: React.FC<MessageIconProps> = ({ 
  width = 32, 
  height = 32,
  className 
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={width}
    height={height}
    fill='none'
    viewBox='0 0 32 32'
    className={className}
  >
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
      d='m7.37 22.44-.52 4.213c-.132 1.106 1.054 1.88 2 1.306l5.588-3.32q.92 0 1.8-.12c-.987-1.16-1.574-2.626-1.574-4.213 0-3.787 3.28-6.853 7.334-6.853 1.546 0 2.973.44 4.16 1.213.04-.333.053-.667.053-1.013 0-6.067-5.267-10.987-11.773-10.987-6.507 0-11.774 4.92-11.774 10.987 0 3.6 1.854 6.786 4.707 8.786'
    ></path>
    <path
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.5'
      d='M14.67 20.306c0 1.587.586 3.054 1.573 4.214 1.32 1.6 3.413 2.626 5.76 2.626l3.48 2.067c.586.36 1.333-.133 1.253-.813l-.333-2.627c1.786-1.24 2.933-3.227 2.933-5.467 0-2.346-1.253-4.413-3.173-5.64a7.6 7.6 0 0 0-4.16-1.213c-4.054 0-7.334 3.067-7.334 6.853'
    ></path>
  </svg>
);

export default MessageIcon;
