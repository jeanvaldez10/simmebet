import React from "react";
import clsx from "clsx";

const ShareIcon = ({
  width = "18",
  height = "18",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("group pointer", className)}
    >
      <path
        className="stroke-[1.5] stroke-[var(--icon-stroke)] group-hover:stroke-white"
        d="M11.127 5.93359C13.527 6.14026 14.507 7.37359 14.507 10.0736V10.1603C14.507 13.1403 13.3136 14.3336 10.3336 14.3336H5.99365C3.01365 14.3336 1.82031 13.1403 1.82031 10.1603V10.0736C1.82031 7.39359 2.78698 6.16026 5.14698 5.94026"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="stroke-[1.5] stroke-[var(--icon-stroke)] group-hover:stroke-white"
        d="M8.16699 9.99975V2.41309"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="stroke-[1.5] stroke-[var(--icon-stroke)] group-hover:stroke-white"
        d="M10.4003 3.90033L8.16693 1.66699L5.93359 3.90033"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShareIcon;
