/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { ReactNode, useEffect } from "react";
import Header from "./Header";
import Ticker from "./Ticker";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

type PageLayoutProps = {
  children: ReactNode;
  maxWidth?: string;
  className?: string;
  allowOverflowX?: boolean;
};

const PageLayout = ({
  children,
  maxWidth = "100%",
  className = "",
  allowOverflowX = false,
}: PageLayoutProps) => {
  const pathName = usePathname();
  const { totalHeight } = useLayoutHeights();

  const isMarketOptionsPage =
    pathName === "/markets" || pathName === "/options";
  
  const isMarketDetailPage = pathName?.startsWith("/market/");
  
  const isHomePage = pathName === "/";
  
  const isMarketsPage = pathName === "/markets";
  
  // Bypass layout for share pages - render children directly
  const isSharePage = pathName?.startsWith("/share/");
  
  // Preload the background image
  useEffect(() => {
    if (!isSharePage) {
      const img = new Image();
      img.src = "/bg-image.jpeg";
    }
  }, [isSharePage]);
  
  if (isSharePage) {
    return <>{children}</>;
  }

  return (
    <>
      <main 
        className={cn(
          "relative min-h-screen w-full text-white bg-cover bg-center bg-no-repeat bg-fixed",
          !isMarketsPage && !allowOverflowX && "overflow-x-hidden"
        )}
        style={{ 
          backgroundImage: "url(/bg-image.jpeg)",
          minHeight: "100dvh",
          overflow: isMarketsPage ? "visible" : undefined
        }}
      >
        <Header />
        <Ticker />
        <div
          className={cn(
            "mx-auto w-full",
            !isMarketOptionsPage && !isHomePage &&
              "sm:px-6 lg:px-8 sm:pb-12 md:pb-16",
            !isMarketOptionsPage && isHomePage &&
              "sm:px-6 lg:px-8",
            className
          )}
          style={{
            paddingTop: isHomePage 
              ? '120px' 
              : (!isMarketOptionsPage && !isMarketDetailPage ? `${totalHeight + 20}px` : undefined),
            // maxWidth: maxWidth === "100%" ? "1280px" : maxWidth,
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
};

export default PageLayout;
