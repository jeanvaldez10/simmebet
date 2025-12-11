import { TooltipSlide } from "../MultiPageTooltip";
import Image from "next/image";

/**
 * Belief Tooltip Slide Content
 * 
 * This file contains all slide content for the Belief multi-page tooltip.
 * Centralizes images, text, and layout for easy maintenance.
 */

export const beliefTooltipSlides: TooltipSlide[] = [
  // Slide 1: What is Belief?
  {
    title: "What is Belief?",
    content: (
      <div className="space-y-3">
        {/* Slide 1 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/belief/slide1.png"
            alt="What is Belief explanation"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 1 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Belief is a dynamic way to trade conviction rather than the basic binary{" "}
          <span className="text-[#D32B3F] font-semibold">NO</span> or{" "}
          <span className="text-[#36FD68] font-semibold">YES</span>.
        </p>
      </div>
    ),
  },

  // Slide 2: Set Your Belief
  {
    title: "Set Your Belief",
    content: (
      <div className="space-y-3">
        {/* Slide 2 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/belief/slide2.png"
            alt="Set your belief"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 2 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Move the Belief slider to any point between 0–100%. With{" "}
          <span className="text-[#D32B3F] font-semibold">0%</span> meaning{" "}
          <span className="text-[#D32B3F] font-semibold">NO</span> and{" "}
          <span className="text-[#36FD68] font-semibold">100%</span> meaning{" "}
          <span className="text-[#36FD68] font-semibold">YES</span>.
        </p>
      </div>
    ),
  },

  // Slide 3: Place Your Belief Bet
  {
    title: "Place Your Belief Bet",
    content: (
      <div className="space-y-3">
        {/* Slide 3 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/belief/slide3.png"
            alt="Place your belief bet"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 3 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Bluff automatically splits your position. Part you hold as tokens and part becomes{" "}
          <span className="text-[#05B9FC] font-semibold">single-sided liquidity</span>.
        </p>
      </div>
    ),
  },

  // Slide 4: How It Works
  {
    title: "How It Works",
    content: (
      <div className="space-y-3">
        {/* Slide 4 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/belief/slide4.png"
            alt="How it works"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 4 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          Your LP sits like a limit order at your Belief. Earning fees, waiting to be swapped for the opposite token.
        </p>
      </div>
    ),
  },

  // Slide 5: Dynamic Control
  {
    title: "Dynamic Control",
    content: (
      <div className="space-y-3">
        {/* Slide 5 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/belief/slide5.png"
            alt="Dynamic control"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 5 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          You can change your Belief at anytime. Switch sides or rebalance your tokens as the market evolves.
        </p>
      </div>
    ),
  },

  // Slide 6: Outcome
  {
    title: "Outcome",
    content: (
      <div className="space-y-3">
        {/* Slide 6 Image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/belief/slide6.png"
            alt="Outcome explanation"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Slide 6 Text Content */}
        <p className="text-white/70 text-sm leading-relaxed">
          The market can settle in your favor but if your Belief position fills it also reduces your max loss.
        </p>
      </div>
    ),
  },
];

/**
 * Slide Metadata
 * Use this for analytics, tracking, or additional configuration
 */
export const beliefTooltipMetadata = {
  totalSlides: beliefTooltipSlides.length,
  category: "belief",
  version: "1.0.0",
};

