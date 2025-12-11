"use client";

import { Info } from "lucide-react";
import { MultiPageTooltip } from "./MultiPageTooltip";
import { bookieTooltipSlides } from "./tooltip-content/BookieTooltipContent";

interface BookieMultiPageTooltipProps {
  className?: string;
}

export const BookieMultiPageTooltip = ({
  className,
}: BookieMultiPageTooltipProps) => {
  return (
    <MultiPageTooltip slides={bookieTooltipSlides} className={className}>
      <Info className="w-5 h-5 text-[#FFFFFF52] pointer hover:text-white transition-colors" />
    </MultiPageTooltip>
  );
};

