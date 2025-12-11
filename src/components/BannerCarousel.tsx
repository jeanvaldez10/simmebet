"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CircularProgress } from "./common/CircularProgress";
import { CarouselBannerItem } from "@/data/carouselData";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

interface BannerCarouselProps {
  banners: CarouselBannerItem[];
  autoPlayInterval?: number;
  className?: string;
}

const BannerCarousel = ({ 
  banners, 
  autoPlayInterval = 6000,
  className = ""
}: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // const [, setImageErrors] = useState<Set<string>>(new Set());
  const [marketData, setMarketData] = useState<Record<string, {
    id: string;
    question: string;
    name: string;
    date: string | null;
    yesPrice: number;
    currentOdds?: { yesOdds: string | number };
  }>>({});
  const isMobile = useIsMobile();
  
  // Scroll accumulation for less sensitive trackpad/wheel scrolling
  const scrollAccumulator = useRef(0);
  const scrollThreshold = 10; // Amount of scroll delta needed to trigger slide change
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastSlideTime = useRef(0);
  const slideCooldown = 50; // Milliseconds to wait before allowing another slide (handles trackpad momentum)

  // Helper function to check if a URL is a video
  const isVideoUrl = (url: string): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };


  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  }, [banners.length]);


  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if this is primarily a vertical scroll
      const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      
      // Allow vertical scrolling to pass through
      if (isVerticalScroll) {
        return;
      }
      
      // Only prevent default for horizontal scrolling
      e.preventDefault();
      
      const now = Date.now();
      const timeSinceLastSlide = now - lastSlideTime.current;
      
      // If we're in cooldown period (to handle trackpad momentum), reset accumulator and ignore
      if (timeSinceLastSlide < slideCooldown) {
        scrollAccumulator.current = 0;
        return;
      }
      
      // Accumulate scroll delta (use deltaX for horizontal, deltaY for trackpad horizontal gestures)
      const scrollDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollAccumulator.current += scrollDelta;
      
      // Check if accumulated scroll exceeds threshold
      if (Math.abs(scrollAccumulator.current) >= scrollThreshold) {
        if (scrollAccumulator.current > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        // Record the time of slide change and reset accumulator
        lastSlideTime.current = now;
        scrollAccumulator.current = 0;
      }
    };

    // Add event listener with passive: false to allow preventDefault
    carousel.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      carousel.removeEventListener('wheel', handleWheel);
    };
  }, [nextSlide, prevSlide, scrollThreshold, slideCooldown]);

  // Auto-play functionality - pauses when hovered
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [nextSlide, isAutoPlaying, autoPlayInterval, banners.length, currentIndex, isHovered]);

  // Fetch market data for banners with marketId
  useEffect(() => {
    const fetchMarketData = async () => {
      const marketsToFetch = banners.filter(b => b.marketId && !marketData[b.marketId]);
      
      for (const banner of marketsToFetch) {
        if (banner.marketId) {
          try {
            const response = await fetch(`/api/markets/${banner.marketId}`);
            if (response.ok) {
              const data = await response.json();
              setMarketData(prev => ({
                ...prev,
                [banner.marketId!]: data.market
              }));
            }
          } catch (error) {
            console.error(`Failed to fetch market data for ${banner.marketId}:`, error);
          }
        }
      }
    };

    fetchMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div 
      ref={carouselRef}
      className={`relative w-full overflow-hidden rounded-2xl ${isMobile ? 'mx-auto' : ''} ${className}`}
      style={{ 
        aspectRatio: (className.includes('mobile-preview') || isMobile) ? '9/16' : '1368/650',
        maxWidth: (className.includes('mobile-preview') || isMobile) ? '375px' : 'none',
        minHeight: (className.includes('mobile-preview') || isMobile) ? '400px' : '300px'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main carousel container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
          // Determine image source based on flags:
          // 1. If useSocialImage = true AND marketId exists → Use generated OG image (content baked in)
          // 2. Otherwise → Use uploaded banner image
          let desktopImageSrc = banner.imageSrc;
          let mobileImageSrc = banner.mobileBannerSrc || banner.imageSrc;
          
          if (banner.marketId && banner.useSocialImage) {
            // Use the dynamically generated OG image which includes all market content
            desktopImageSrc = getMarketOgImageUrl(banner.marketId);
            mobileImageSrc = getMarketOgImageUrl(banner.marketId);
          }
          
          // Determine content source logic:
          // 1. If useSocialImage=true → show ONLY the image (no overlay), content is baked into the image
          // 2. Otherwise, use carousel input data or market data for overlay
          // 3. If marketId exists (regardless of useSocialImage) → use market odds for percentage
          const market = banner.marketId ? marketData[banner.marketId] : null;
          
          const hasCarouselContent = banner.title || banner.subtitle || banner.description || banner.date || banner.primaryButtonText || banner.secondaryButtonText;
          const shouldUseMarketContent = !hasCarouselContent && banner.marketId && banner.useSocialImage && market;
          
          // If useSocialImage is true, don't show any content overlay - content is baked into the image
          const shouldShowContentOverlay = !banner.useSocialImage;
          
          // Determine content to display
          const displayTitle = shouldUseMarketContent ? market.question : banner.title;
          const displaySubtitle = shouldUseMarketContent ? '' : banner.subtitle;
          const displayDescription = shouldUseMarketContent ? market.name : banner.description;
          const displayDate = shouldUseMarketContent ? (market.date ? new Date(market.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '') : banner.date;
          const displayPrimaryButtonText = shouldUseMarketContent ? displayDate : banner.primaryButtonText;
          const displayPrimaryButtonLink = shouldUseMarketContent ? `/market/${market.id}` : banner.primaryButtonLink;
          const displaySecondaryButtonText = shouldUseMarketContent ? 'Place Your Bet' : banner.secondaryButtonText;
          const displaySecondaryButtonLink = shouldUseMarketContent ? `/market/${market.id}` : banner.secondaryButtonLink;
          
          // TODO: Remove betChance field from carousel form once market data integration is complete
          // Determine market belief percentage: use market odds if available, otherwise fall back to betChance
          let displayBetChance = banner.betChance;
          if (banner.marketId && market?.currentOdds) {
            displayBetChance = Math.round(Number(market.currentOdds.yesOdds));
          } else if (banner.marketId && market?.yesPrice) {
            displayBetChance = Math.round((market.yesPrice / 2) * 100);
          }
          
          return (
            <div key={banner.id} className="relative w-full h-full flex-shrink-0">
              <>
                {/* Desktop banner - check if it's a video or image */}
                {isVideoUrl(desktopImageSrc) ? (
                  <video
                    src={desktopImageSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={`w-full h-full object-cover ${(className.includes('mobile-preview') || isMobile) ? 'hidden' : 'hidden md:block'}`}
                    // onError={(e) => {
                    //   setImageErrors(prev => new Set(prev).add(banner.id));
                    // }}
                  />
                ) : (
                  <Image
                    src={desktopImageSrc}
                    alt={banner.title}
                    fill
                    className={`object-cover ${(className.includes('mobile-preview') || isMobile) ? 'hidden' : 'hidden md:block'}`}
                    priority={index === 0}
                    unoptimized={!!banner.marketId}
                    // onError={(e) => {
                    //   setImageErrors(prev => new Set(prev).add(banner.id));
                    // }}
                  />
                )}
                
                {/* Mobile banner - check if it's a video or image */}
                {isVideoUrl(mobileImageSrc) ? (
                  <video
                    src={mobileImageSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={`w-full h-full object-cover ${(className.includes('mobile-preview') || isMobile) ? 'block' : 'md:hidden'}`}
                    // onError={(e) => {
                    //   setImageErrors(prev => new Set(prev).add(banner.id));
                    // }}
                  />
                ) : (
                  <Image
                    src={mobileImageSrc}
                    alt={banner.title}
                    fill
                    className={`object-cover ${(className.includes('mobile-preview') || isMobile) ? 'block' : 'md:hidden'}`}
                    priority={index === 0}
                    unoptimized={!!banner.marketId}
                    // onError={(e) => {
                    //   setImageErrors(prev => new Set(prev).add(banner.id));
                    // }}
                  />
                )}
              </>
            
            {/* Content overlay - always show when NOT using social image, even if empty (useSocialImage boolean takes priority) */}
            {shouldShowContentOverlay && (
              <div className="absolute inset-0 p-4 md:p-4 md:px-8 md:py-8 lg:py-22 flex flex-col">
                {/* Mobile: Position content at 30% from top, Desktop: normal flex layout */}
                <div className={className.includes('mobile-preview') ? 'block' : 'md:hidden'} style={{ paddingTop: '30%' }}>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {displayDate && !displayPrimaryButtonText && (
                      <div className="bg-[#2E3144] backdrop-blur-sm px-4 py-[10px] rounded-full text-base">
                        <span className="text-white">{displayDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex-wrap items-center gap-3 ${className.includes('mobile-preview') ? 'hidden' : 'hidden md:flex'}`}>
                  {displayDate && !displayPrimaryButtonText && (
                    <div className="bg-[#2E3144] backdrop-blur-sm px-4 py-[10px] rounded-full text-base md:text-sm">
                      <span className="text-white">{displayDate}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col md:flex-row justify-between">
                  <div className="flex flex-col gap-6 md:gap-4 w-full md:w-[55%]">
                    {(displayTitle || displaySubtitle) && (
                      <div>
                        {displayTitle && (
                          <h1
                            className="text-6xl md:text-[78px] font-semibold leading-[110%] tracking-[-0.02em] text-left"
                            style={{
                              fontFamily: "'Geist', sans-serif",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {displayTitle}
                          </h1>
                        )}
                        {displaySubtitle && (
                          <h2 className="text-3xl md:text-[40px] font-semibold leading-[110%] tracking-[-0.02em] text-left text-white mt-1">
                            {displaySubtitle}
                          </h2>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-6 w-full md:w-2/5 mt-6 md:mt-0">
                    {displayDescription && (
                      <div className="text-left max-w-sm">
                        <p className="text-gray-300 text-base md:text-sm leading-tight">
                          {displayDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Left-aligned buttons positioned at bottom left with proper spacing */}
                {banner.alignment === 'left' && (displayPrimaryButtonText || displaySecondaryButtonText) && (
                  <>
                    {/* Mobile buttons - HIDDEN on mobile (only Yes/No buttons shown at bottom) */}
                    
                    {/* Tablet buttons (hidden on mobile, shown on md-xl) */}
                    <div className={`justify-start mt-4 ${className.includes('mobile-preview') ? 'hidden' : 'hidden md:flex xl:hidden'}`}>
                      <div className="flex flex-row gap-3 items-center">
                        {displayPrimaryButtonText && displayPrimaryButtonLink && (
                          <Link 
                            href={displayPrimaryButtonLink}
                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-md text-sm inline-flex items-center justify-center whitespace-nowrap"
                          >
                            {displayPrimaryButtonText}
                          </Link>
                        )}
                        {displaySecondaryButtonText && displaySecondaryButtonLink && (
                          <Link 
                            href={displaySecondaryButtonLink}
                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-md text-sm inline-flex items-center justify-center whitespace-nowrap"
                          >
                            {displaySecondaryButtonText}
                          </Link>
                        )}
                        {displayBetChance && displayBetChance > 0 && (
                          <div className="ml-2">
                            <CircularProgress
                              positivePercentage={displayBetChance}
                              negativePercentage={100 - displayBetChance}
                              size={44}
                              strokeWidth={5}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Absolute positioned buttons for xl screens to align with graphic content */}
                    <div className={`absolute bottom-25 left-16 ${className.includes('mobile-preview') ? 'hidden' : 'hidden xl:block'}`}>
                      <div className="flex flex-row gap-3 items-center">
                        {displayPrimaryButtonText && displayPrimaryButtonLink && (
                          <Link 
                            href={displayPrimaryButtonLink}
                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all text-center shadow-md text-sm inline-flex items-center justify-center whitespace-nowrap"
                          >
                            {displayPrimaryButtonText}
                          </Link>
                        )}
                        {displaySecondaryButtonText && displaySecondaryButtonLink && (
                          <Link 
                            href={displaySecondaryButtonLink}
                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all text-center shadow-md text-sm inline-flex items-center justify-center whitespace-nowrap"
                          >
                            {displaySecondaryButtonText}
                          </Link>
                        )}
                        {displayBetChance && displayBetChance > 0 && (
                          <div className="ml-2">
                            <CircularProgress
                              positivePercentage={displayBetChance}
                              negativePercentage={100 - displayBetChance}
                              size={44}
                              strokeWidth={5}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Center-aligned buttons section */}
                {banner.alignment === 'center' && (displayPrimaryButtonText || displaySecondaryButtonText || (displayBetChance && displayBetChance > 0)) && (
                  <>
                    {/* Mobile center buttons - HIDDEN on mobile (only Yes/No buttons shown at bottom) */}
                    
                    {/* Desktop center buttons */}
                    <div className={`justify-center mt-4 ${className.includes('mobile-preview') ? 'hidden' : 'hidden md:flex'}`}>
                      <div className="flex flex-row gap-3 items-center">
                        {displayPrimaryButtonText && displayPrimaryButtonLink && (
                          <Link 
                            href={displayPrimaryButtonLink}
                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-md text-sm inline-flex items-center justify-center whitespace-nowrap"
                          >
                            {displayPrimaryButtonText}
                          </Link>
                        )}
                        {displaySecondaryButtonText && displaySecondaryButtonLink && (
                          <Link 
                            href={displaySecondaryButtonLink}
                            className="bg-white text-black font-medium px-6 py-2.5 rounded-full hover:bg-opacity-90 transition-all shadow-md text-sm inline-flex items-center justify-center whitespace-nowrap"
                          >
                            {displaySecondaryButtonText}
                          </Link>
                        )}
                        {displayBetChance && displayBetChance > 0 && (
                          <div className="ml-2">
                            <CircularProgress
                              positivePercentage={displayBetChance}
                              negativePercentage={100 - displayBetChance}
                              size={44}
                              strokeWidth={5}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Mobile Yes/No Buttons - Show at bottom when marketId exists */}
                {banner.marketId && displayBetChance && displayBetChance > 0 && (
                  <div className={`absolute bottom-6 left-4 right-4 ${className.includes('mobile-preview') ? 'block' : 'md:hidden'}`}>
                    <div className="flex gap-3">
                      <Link 
                        href={displaySecondaryButtonLink || `/market/${banner.marketId}`}
                        className="flex-1 bg-[#FF4D4D] font-bold text-base rounded-full py-3.5 flex items-center justify-center gap-2.5 shadow-lg"
                        style={{ color: '#070708' }}
                      >
                        <span>Buy No</span>
                        <span className="bg-black/20 px-2.5 py-0.5 rounded-full text-sm">{100 - displayBetChance}%</span>
                      </Link>
                      <Link 
                        href={displaySecondaryButtonLink || `/market/${banner.marketId}`}
                        className="flex-1 bg-[#46FD84] font-bold text-base rounded-full py-3.5 flex items-center justify-center gap-2.5 shadow-lg"
                        style={{ color: '#070708' }}
                      >
                        <span>Buy Yes</span>
                        <span className="bg-black/10 px-2.5 py-0.5 rounded-full text-sm">{displayBetChance}%</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Yes/No Buttons for social images (when no overlay) - Show at bottom when marketId exists */}
            {!shouldShowContentOverlay && banner.marketId && displayBetChance && displayBetChance > 0 && (
              <div className={`absolute bottom-6 left-4 right-4 ${className.includes('mobile-preview') ? 'block' : 'md:hidden'}`}>
                <div className="flex gap-3">
                  <Link 
                    href={`/market/${banner.marketId}`}
                    className="flex-1 bg-[#FF4D4D] font-bold text-base rounded-full py-3.5 flex items-center justify-center gap-2.5 shadow-lg"
                    style={{ color: '#070708' }}
                  >
                    <span>Buy No</span>
                    <span className="bg-black/20 px-2.5 py-0.5 rounded-full text-sm">{100 - displayBetChance}%</span>
                  </Link>
                  <Link 
                    href={`/market/${banner.marketId}`}
                    className="flex-1 bg-[#46FD84] font-bold text-base rounded-full py-3.5 flex items-center justify-center gap-2.5 shadow-lg"
                    style={{ color: '#070708' }}
                  >
                    <span>Buy Yes</span>
                    <span className="bg-black/10 px-2.5 py-0.5 rounded-full text-sm">{displayBetChance}%</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Navigation arrows - hidden on mobile */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 backdrop-blur-sm rounded-full p-2 hover:bg-black/50 transition-all duration-200 group opacity-60 hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 backdrop-blur-sm rounded-full p-2 hover:bg-black/50 transition-all duration-200 group opacity-60 hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
          </button>
        </>
      )}


    </div>
  );
};

export default BannerCarousel;
