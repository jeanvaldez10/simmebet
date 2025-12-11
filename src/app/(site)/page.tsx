"use client";

import BannerCarousel from "@/components/BannerCarousel";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import AccessProvider from "./common/access-provider";
import { CarouselService } from "@/services/carouselService";
import { CarouselBannerItem } from "@/data/carouselData";
import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
import { ENABLE_OPTIONS } from "@/constants";

const Markets = [
  {
    id: 1,
    title: "Select a Market to bet on",
    image: "/images/markets1.svg",
    description:
      "Browse live markets and pick the event you want to bet on. Each market shows real time odds so you can quickly see where others are betting.",
  },
  {
    id: 2,
    title: "Bet on your Belief",
    image: "/images/markets2.svg",
    description:
      "Use the slider to set your belief, the percentage odds you think are right. You can update your position at any time, until the market resolves",
  },
  {
    id: 3,
    title: "Claim your winnings",
    image: "/images/markets3.svg",
    description:
      "When the market resolves, the winning side shifts to $2 per token. You can claim your winnings from the market page or user profile.",
  },
  {
    id: 4,
    title: "Browse Markets",
    image: "/images/market4.png",
    isButton: true,
    buttonText: "View Markets ->",
    route: "/markets",
  },
];

const Options = [
  {
    id: 1,
    title: "Choose an option contract",
    image: "/images/options1.svg",
    description:
      "Reader will be distracted by the readable content of a page when looking at its layout.",
  },
  {
    id: 2,
    title: "Select the amount and buy",
    image: "/images/options2.svg",
    description:
      "Reader will be distracted by the readable content of a page when looking at its layout.",
  },
  {
    id: 3,
    title: "Exercise or list your options for sale",
    image: "/images/options3.svg",
    description:
      "Reader will be distracted by the readable content of a page when looking at its layout.",
  },
  {
    id: 4,
    title: "Browse Options",
    image: "/images/options4.svg",
    isButton: true,
    buttonText: "View Options ->",
    route: "/options",
  },
];

export default function Page() {
  const [carouselBanners, setCarouselBanners] = useState<CarouselBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isSendingEmail, setIsSendingEmail] = useState(false);
  // const { data: session } = useSession();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await CarouselService.getPublishedCarouselItems();
        setCarouselBanners(banners);
      } catch (error) {
        // Enhanced error logging for banner loading failures
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const timestamp = new Date().toISOString();
        
        console.error(`❌ [${timestamp}] Banner loading failed:`, {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp,
          context: 'home-page-client-side-fetch',
          environment: 'client',
        });
        
        // Fallback to empty array if database fails
        setCarouselBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // const handleSendTestEmail = async () => {
  //   if (!session) {
  //     toast.error("Please login to send a test email");
  //     return;
  //   }

  //   setIsSendingEmail(true);
  //   try {
  //     const response = await fetch("/api/test-email", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const data = await response.json();

  //     if (data.success) {
  //       toast.success(`Test email sent to ${session.user?.email}! Check your inbox.`);
  //     } else {
  //       toast.error(data.error || "Failed to send test email");
  //     }
  //   } catch (error) {
  //     console.error("Error sending test email:", error);
  //     toast.error("Failed to send test email");
  //   } finally {
  //     setIsSendingEmail(false);
  //   }
  // };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 pt-8">
          {/* Always render carousel container to prevent layout shift */}
          <div className="mb-8">
            {isLoading ? (
              // Loading placeholder to maintain consistent height
              <div 
                className="w-full rounded-2xl bg-gray-800/20 border border-gray-700/30 animate-pulse"
                style={{ 
                  aspectRatio: '1368/650',
                  minHeight: '300px'
                }}
              />
            ) : carouselBanners.length > 0 ? (
              <BannerCarousel 
                banners={carouselBanners}
                autoPlayInterval={6000}
                className=""
              />
            ) : (
              // Placeholder to maintain consistent height when no banners
              <div 
                className="w-full rounded-2xl bg-gray-800/20 border border-gray-700/30"
                style={{ 
                  aspectRatio: '1368/650',
                  minHeight: '300px'
                }}
              />
            )}
          </div>
          <HowItWorks title="Markets" cards={Markets} key={1} />
          {ENABLE_OPTIONS && <HowItWorks title="Options" cards={Options} isOption={true} key={2} />}
          <AccessProvider />
        </div>
      </div>
      <Footer />
      
      {/* Test Email Button - Fixed position in bottom right */}
      {/* {session && (
        <button
          onClick={handleSendTestEmail}
          disabled={isSendingEmail}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-50"
        >
          {isSendingEmail ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Send Test Email</span>
            </>
          )}
        </button>
      )} */}
    </div>
  );
}
