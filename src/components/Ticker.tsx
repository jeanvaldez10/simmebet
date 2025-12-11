"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowUp from "./icons/ArrowUp";
import ArrowDown from "./icons/ArrowDown";
import DotDivider from "./icons/DotDivider";
import { useHeaderHeight } from "@/hooks/use-header-height";
import { useTickerData} from "@/hooks/useTickerData";

const Ticker: React.FC = () => {
  const headerHeight = useHeaderHeight();
  const { data: tickerResponse, isLoading } = useTickerData();
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(60);
  const [halfWidthPx, setHalfWidthPx] = useState(0);
  
  // Use real data from the API
  const tickerItems = tickerResponse?.tickerItems || [];
  
  // Duplicate the data to create seamless loop
  const duplicatedData = [...tickerItems, ...tickerItems];

  // Calculate dynamic animation duration based on actual content width
  useEffect(() => {
    if (trackRef.current && tickerItems.length > 0) {
      // Wait longer for render to complete and fonts to load
      const timer = setTimeout(() => {
        if (trackRef.current) {
          const trackWidth = trackRef.current.scrollWidth;
          const halfWidth = trackWidth / 2; // Account for duplication
          
          // Responsive scroll speed - balanced for readability
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          const SCROLL_SPEED = isMobile ? 70 : 60; // px/second (slower for better readability)
          
          const duration = halfWidth / SCROLL_SPEED;
          const clampedDuration = Math.max(10, Math.min(duration, 90));
          
          setAnimationDuration(clampedDuration);
          setHalfWidthPx(halfWidth);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [tickerItems, duplicatedData.length]);


  const handleTickerItemClick = (contractAddress?: string) => {
    if (contractAddress) {
      router.push(`/market/${contractAddress}`);
    }
  };

  // Show loading state or empty state if needed
  if (isLoading && !tickerResponse) {
    // Create shimmer item template
    const shimmerItem = (key: string) => (
      <div
        key={key}
        className="ticker-item flex items-center whitespace-nowrap rounded-lg px-2 py-1 ticker-shimmer"
      >
        <div className="h-4 w-32 bg-white/10 rounded mr-2"></div>
        <div className="mx-2 w-px h-3 bg-white/10"></div>
        <div className="h-4 w-20 bg-white/10 rounded mr-2"></div>
        <div className="mx-2 w-px h-3 bg-white/10"></div>
        <div className="h-4 w-16 bg-white/10 rounded mr-2"></div>
        <div className="mx-2 w-px h-3 bg-white/10"></div>
        <div className="h-4 w-12 bg-white/10 rounded"></div>
        <div className="mx-4">
          <div className="w-1 h-1 bg-white/10 rounded-full"></div>
        </div>
      </div>
    );

    // Create duplicated shimmer items with unique keys (same as real ticker)
    const duplicatedShimmers = [
      ...Array.from({ length: 6 }).map((_, index) => shimmerItem(`shimmer-1-${index}`)),
      ...Array.from({ length: 6 }).map((_, index) => shimmerItem(`shimmer-2-${index}`))
    ];

    // Estimate loading animation duration based on typical content
    // Assuming ~485px per shimmer item × 6 items = ~2910px for half width
    const estimatedHalfWidth = 2910;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const SCROLL_SPEED = isMobile ? 70 : 60;
    const loadingDuration = estimatedHalfWidth / SCROLL_SPEED;

    return (
      <div 
        className="fixed left-0 right-0 z-[65] ticker-container bg-black/30 backdrop-blur-lg border-y border-white/10 overflow-hidden py-1.5"
        style={{ top: `${headerHeight}px` }}
      >
        <div 
          className="ticker-track"
          style={{
            animationDuration: `${loadingDuration}s`,
            animationName: 'tickerScroll',
            '--half-width': `${estimatedHalfWidth}px`
          } as React.CSSProperties & { '--half-width': string }}
        >
          {/* Duplicated shimmer items for seamless loop */}
          {duplicatedShimmers}
        </div>
      </div>
    );
  }

  // Show empty state if no data is available
  if (!isLoading && tickerItems.length === 0) {
    return (
      <div 
        className="fixed left-0 right-0 z-[65] ticker-container bg-black/30 backdrop-blur-lg border-y border-white/10 py-1 overflow-hidden"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="ticker-track">
          <div className="ticker-item flex items-center whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors duration-200 rounded-lg px-2 py-1">
            <span className="text-white/60 text-sm">No market data available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div 
        className="fixed left-0 right-0 z-[65] ticker-container bg-black/30 backdrop-blur-lg border-y border-white/10 py-1 overflow-hidden select-none"
        style={{ top: `${headerHeight}px` }}
      >
      <div 
        ref={trackRef}
        className="ticker-track"
        style={{ 
          animationDuration: `${animationDuration}s`,
          animationName: halfWidthPx > 0 ? 'tickerScroll' : 'ticker',
          '--half-width': `${halfWidthPx}px`
        } as React.CSSProperties & { '--half-width': string }}
      >
        {duplicatedData.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="ticker-item flex items-center whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors duration-200 rounded-lg px-2 py-1"
            onClick={() => handleTickerItemClick(item.contractAddress)}
          >
            <span className="text-white font-medium text-sm">{item.marketName}</span>
            <div className="mx-2 w-px h-3 bg-[#FFFFFF29]" />
            <span className="text-white/60 text-sm">{item.category}</span>
            <div className="mx-2 w-px h-3 bg-[#FFFFFF29]" />
            <span className="text-white/80 text-sm">${item.currentPrice}</span>
            <div className="mx-2 w-px h-3 bg-[#FFFFFF29]" />
            <div className="flex items-center gap-1">
              <span 
                className={`font-semibold text-sm ${
                  item.isPositive ? "text-[#36FD68]" : "text-[#FD3748]"
                }`}
              >
                {item.priceChange} ({item.percentChange}%)
              </span>
              {item.isPositive ? (
                <ArrowUp 
                  width={16} 
                  height={16} 
                  color="#36FD68" 
                  className="flex-shrink-0"
                />
              ) : (
                <ArrowDown 
                  width={16} 
                  height={16} 
                  color="#FD3748" 
                  className="flex-shrink-0"
                />
              )}
            </div>
            <div className="mx-4">
              <DotDivider className="flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
