"use client";

import { Info } from "lucide-react";
import { MultiPageTooltip } from "./MultiPageTooltip";
import { beliefTooltipSlides } from "./tooltip-content/BeliefTooltipContent";
import { useEffect } from "react";

interface BeliefMultiPageTooltipProps {
  className?: string;
}

export const BeliefMultiPageTooltip = ({
  className,
}: BeliefMultiPageTooltipProps) => {
  // Preload all belief tooltip images on component mount
  useEffect(() => {
    // Preload content images for all 6 slides
    const contentImages = [
      '/images/tooltips/belief/slide1.png',
      '/images/tooltips/belief/slide2.png',
      '/images/tooltips/belief/slide3.png',
      '/images/tooltips/belief/slide4.png',
      '/images/tooltips/belief/slide5.png',
      '/images/tooltips/belief/slide6.png',
    ];

    // Preload background images for all 6 slides
    const backgroundImages = [
      '/images/tooltips/backgrounds/slide1.png',
      '/images/tooltips/backgrounds/slide2.png',
      '/images/tooltips/backgrounds/slide3.png',
      '/images/tooltips/backgrounds/slide4.png',
      '/images/tooltips/backgrounds/slide5.png',
      '/images/tooltips/backgrounds/slide6.png',
    ];

    // Preload all images
    [...contentImages, ...backgroundImages].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <MultiPageTooltip slides={beliefTooltipSlides} className={className}>
      <Info className="w-5 h-5 text-[#FFFFFF52] pointer hover:text-white transition-colors" />
    </MultiPageTooltip>
  );
};

