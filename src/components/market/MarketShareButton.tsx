'use client';

import { useState } from 'react';
import { getMarketOgImageUrl, getMarketTwitterShareUrl } from '@/utils/marketOgImage';

interface MarketShareButtonProps {
  market: {
    id: string;
    question: string;
    name?: string;
  };
  className?: string;
}

/**
 * MarketShareButton Component
 * 
 * A button component for sharing markets with dynamic OG images.
 * Supports both Web Share API (mobile) and Twitter sharing.
 * 
 * @example
 * ```tsx
 * <MarketShareButton 
 *   market={{ id: '123...', question: 'Will BTC hit $100k?' }} 
 * />
 * ```
 */
export function MarketShareButton({ market, className = '' }: MarketShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const marketUrl = `${baseUrl}/market/${market.id}`;

    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: market.question,
          text: market.name || 'Check out this prediction market!',
          url: marketUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err);
      }
    }

    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(marketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = getMarketTwitterShareUrl(market);
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Main Share Button */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition"
        title="Share this market"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {copied ? 'Copied!' : 'Share'}
      </button>

      {/* Twitter/X Share Button */}
      <button
        onClick={handleTwitterShare}
        className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition"
        title="Share on X (Twitter)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
    </div>
  );
}

/**
 * MarketShareButtonWithPreview Component
 * 
 * Advanced version that shows a preview of the OG image when hovered.
 * Useful for demonstrating what will be shared on social media.
 */
export function MarketShareButtonWithPreview({ market, className = '' }: MarketShareButtonProps) {
  const [showPreview, setShowPreview] = useState(false);
  const ogImageUrl = getMarketOgImageUrl(market.id);

  return (
    <div className={`relative ${className}`}>
      <div
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
      >
        <MarketShareButton market={market} />
      </div>

      {/* Preview Tooltip */}
      {showPreview && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 rounded-lg shadow-xl z-50 animate-fadeIn">
          <p className="text-xs text-gray-300 mb-2 whitespace-nowrap">
            Preview: What people will see when shared
          </p>
          <img
            src={ogImageUrl}
            alt="Share preview"
            className="w-80 rounded border border-gray-700"
          />
        </div>
      )}
    </div>
  );
}

/**
 * CompactMarketShareButton Component
 * 
 * A more compact version suitable for use in cards or tight spaces.
 */
export function CompactMarketShareButton({ market, className = '' }: MarketShareButtonProps) {
  const handleShare = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const marketUrl = `${baseUrl}/market/${market.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: market.question,
          url: marketUrl,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to Twitter
      const twitterUrl = getMarketTwitterShareUrl(market);
      window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`p-2 hover:bg-gray-800 rounded-full transition ${className}`}
      title="Share"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    </button>
  );
}

export default MarketShareButton;

