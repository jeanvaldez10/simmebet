import { TooltipSlide } from "../MultiPageTooltip";
import Image from "next/image";

/**
 * Bookie Tooltip Slide Content
 * 
 * This file contains all slide content for the Bookie multi-page tooltip.
 * Centralizes images, text, and layout for easy maintenance.
 */

export const bookieTooltipSlides: TooltipSlide[] = [
  // Slide 1: What is Bookie Mode?
  {
    title: "What is Bookie Mode?",
    content: (
      <div className="space-y-3">
        {/* Slide 1 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/bookie/slide1.png"
            alt="What is Bookie Mode"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 1 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Bookie Mode lets you be the house. You provide liquidity for other traders to bet against.
        </p>
      </div>
    ),
  },

  // Slide 2: Why Liquidity Matters?
  {
    title: "Why Liquidity Matters?",
    content: (
      <div className="space-y-3">
        {/* Slide 2 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/bookie/slide2.png"
            alt="Why liquidity matters"
            fill
            className="object-contain"
          />
        </div>

        {/* Slide 2 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Liquidity makes markets efficient. The more liquidity, the less slippage, the easier it is to buy and sell.
        </p>
      </div>
    ),
  },

  // Slide 3: Set Your Liquidity
  {
    title: "Set Your Liquidity",
    content: (
      <div className="space-y-3">
        {/* Slide 3 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/bookie/slide3.png"
            alt="Set your liquidity"
            fill
            className="object-contain"
          />
        </div>

        {/* Slide 3 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Choose how much you want to provide. The more you provide, the bigger share of fees you collect.
        </p>
      </div>
    ),
  },

  // Slide 4: Choose Your Range
  {
    title: "Choose Your Range",
    content: (
      <div className="space-y-3">
        {/* Slide 4 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/bookie/slide4.png"
            alt="Choose your range"
            fill
            className="object-contain"
          />
        </div>

        {/* Slide 4 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Pick the odds you believe are right, then select your range where your liquidity sits collecting fees.
        </p>
      </div>
    ),
  },

  // Slide 5: Earn from Volume & Volatility
  {
    title: "Earn from Volume & Volatility",
    content: (
      <div className="space-y-3">
        {/* Slide 5 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/bookie/slide5.png"
            alt="Earn from volume and volatility"
            fill
            className="object-contain"
          />
        </div>

        {/* Slide 5 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          As traders buy and sell in your range, you collect fees. More action in your range means more revenue.
        </p>
      </div>
    ),
  },

  // Slide 6: Manage & Withdraw Anytime
  {
    title: "Manage & Withdraw Anytime",
    content: (
      <div className="space-y-3">
        {/* Slide 6 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/bookie/slide6.png"
            alt="Manage and withdraw anytime"
            fill
            className="object-contain"
          />
        </div>

        {/* Slide 6 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Monitor fees, time elapsed, and ranges. Claim fees or set auto-close to withdraw liquidity.
        </p>
      </div>
    ),
  },
];

/**
 * Slide Metadata
 * Use this for analytics, tracking, or additional configuration
 */
export const bookieTooltipMetadata = {
  totalSlides: bookieTooltipSlides.length,
  category: "bookie",
  version: "1.0.0",
};

