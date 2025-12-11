import { LayoutGrid, StretchHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import WatchListDesktopBelief from "./watchlist-desktop-belief";
import WatchListDesktopOptions from "./watchlist-desktop-options";
import TokenCard from "@/app/(site)/options/common/option-card";
import WatchListMobileBelief from "./watchlist-mobile-belief";
import { useDeviceType } from "@/hooks/use-media-query";
import NotFound from "@/components/shared/not-found";
import { useWatchlist } from "@/hooks/useWatchlist";
import { MarketCard } from "@/components/market/MarketCard";
import { useMarkets } from "@/hooks/useMarkets";
import useOptionsBuy from "@/app/(site)/options/hooks/use-buy";
import { useMemo } from "react";
import { useIsMediumScreen } from "@/hooks/use-medium-screen";

const WatchList = () => {
  const deviceType = useDeviceType();
  const screenMedium = useIsMediumScreen();

  const [selectedOption, setSelectedOption] = useState<"belief" | "options">(
    "belief"
  );

  const { watchlist, isLoadingWatchlist } = useWatchlist();

  // Get all markets and options in parallel (no dependencies)
  const { data: allMarkets = [], isLoading: isLoadingAllMarkets } =
    useMarkets();
  const { data: allOptions = [], isPending: isLoadingAllOptions } =
    useOptionsBuy();

  // Extract market and option IDs from watchlist
  const marketIds = useMemo(
    () =>
      watchlist
        .filter((item) => item.itemType === "MARKET")
        .map((item) => item.itemId),
    [watchlist]
  );


  const optionIds = useMemo(
    () =>
      watchlist
        .filter((item) => item.itemType === "OPTION")
        .map((item) => item.itemId),
    [watchlist]
  );

  // Filter starred markets efficiently with useMemo
  const starredMarkets = useMemo(() => {
    
    if (!allMarkets.length || !marketIds.length) {
      console.log("Profile Watchlist - Early return, no markets or market IDs");
      return [];
    }

    const filteredMarkets = allMarkets.filter((market) => {
      const isIncluded = marketIds.includes(market.id);
      console.log(`Profile Watchlist - Market ${market.id} included: ${isIncluded}`);
      return isIncluded;
    });
    

    return filteredMarkets
      .map((market) => ({
        id: market.id,
        name: market.question,
        tokenImage: market.imageSquare || market.image || "/images/football.png",
        status: (market.isResolved ? "resolved" : "Ongoing") as
          | "resolved"
          | "Ongoing"
          | "rejected",
        bet: `Yes at $${market.yesPercentage?.toFixed(2) || "50.00"}`,
        yesBet: market.yesPercentage || 50,
        noBet: market.noPercentage || 50,
      }));
  }, [allMarkets, marketIds]);

  // Filter starred market data for MarketCard component
  const starredMarketData = useMemo(() => {
    
    if (!allMarkets.length || !marketIds.length) {
      console.log("Profile Watchlist - Early return for starredMarketData, no markets or market IDs");
      return [];
    }
    
    const filteredData = allMarkets.filter((market) => marketIds.includes(market.id));
    return filteredData.map((market) => ({
      ...market,
      status: (market.isResolved ? "RESOLVED" : "ACTIVE") as "ACTIVE" | "RESOLVED"
    }));
  }, [allMarkets, marketIds]);

  // Filter starred options efficiently with useMemo
  const starredOptions = useMemo(() => {
    if (!allOptions.length || !optionIds.length) return [];

    return allOptions
      .filter((option) => optionIds.includes(option.id.toString()))
      .map((option) => ({
        id: option.id.toString(),
        tokenSymbol: option.tokenSymbol,
        tokenName: option.tokenName,
        currentPrice: option.currentPrice,
        optionsAvailable: option.optionsAvailable,
        totalOptions: option.totalOptions,
        strikePrice: option.strikePrice,
        expiry: option.expiry,
        position: option.position,
        tokenImage: option.tokenImage,
      }));
  }, [allOptions, optionIds]);

  // Combined loading states
  const isLoadingMarkets = isLoadingAllMarkets;
  const isLoadingOptions = isLoadingAllOptions;

  const [layout, setLayout] = useState<"table" | "card">("table");

  useEffect(() => {
    if (deviceType === "mobile") {
      setLayout("card");
    } else {
      setLayout("table");
    }
  }, [deviceType]);

  useEffect(() => {
    if (deviceType !== "mobile") {
      if (screenMedium) {
        setLayout("card");
      } else {
        setLayout("table");
      }
    }
  }, [deviceType, screenMedium]);

  useEffect(() => {
    if (deviceType === "mobile") {
      setSelectedOption("belief");
    }
  }, [deviceType]);

  return (
    <div>
      <div
        className={cn(
          "p-4 hidden md:grid grid-cols-2 gap-4 justify-between border border-[#FFFFFF29] backdrop-blur-sm bg-black  rounded-[16px]",
          layout === "card"
            ? "rounded-t-[0px] border-t-0"
            : "rounded-t-[0px] rounded-b-[0px] border-t-0 border-b-0 !border-b-transparent"
        )}
      >
        <div className="flex  rounded-[100px] p-[2px] w-[250px] border border-[#FFFFFF29]">
          <button
            onClick={() => {
              setSelectedOption("belief");
            }}
            className={`flex-1 text-sm font-normal  py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "belief"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Markets ({marketIds.length})
          </button>
          {/* <button
            onClick={() => {
              setSelectedOption("options");
            }}
            className={`flex-1 text-sm font-normal py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "options"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Options ({optionIds.length})
          </button> */}
        </div>
        <div className=" w-full flex items-center justify-end  pTableCard">
          <div className="border border-[#FFFFFF29] p-1 rounded-[50px] flex items-center justify-center   w-fit">
            <div
              className={cn(
                "pointer flex items-center justify-center p-1.5 h-[28px] w-[28px] text-[#fff] rounded-full",
                layout === "table" ? "bg-[#2E3144]" : "opacity-60"
              )}
              onClick={() => {
                if (!screenMedium) {
                  setLayout("table");
                }
              }}
              role="button"
            >
              <StretchHorizontal />
            </div>
            <div
              className={cn(
                "flex items-center pointer justify-center p-1.5 h-[28px] w-[28px] text-[#fff] rounded-full",
                layout === "card" ? "bg-[#2E3144]" : "opacity-60"
              )}
              onClick={() => setLayout("card")}
              role="button"
            >
              <LayoutGrid />
            </div>
          </div>
        </div>
      </div>

      <div className="block md:hidden bg-black backdrop-blur-md z-20 sticky !top-[77px] pt-0 border border-[#FFFFFF29] p-4 rounded-[16px] rounded-t-[0px] border-t-0">
        <div className="flex rounded-[100px] p-[2px] w-full border border-[#FFFFFF29]">
          <button
            onClick={() => {
              setSelectedOption("belief");
            }}
            className={`flex-1 text-sm font-normal !h-[50px]  py-2  rounded-[100px] text-center transition-all cursor-pointer ${
              selectedOption === "belief"
                ? "bg-[#2E3144] text-[#FFFFFF]"
                : "text-white bg-transparent"
            }`}
          >
            Markets ({marketIds.length})
          </button>
        </div>
      </div>

      {!isLoadingWatchlist && watchlist.length === 0 ? (
        <NotFound
          imageURL="/watchlist-not-found.png"
          heading="You have no favorites added"
          desc="Browse markets and save them as favorites."
          buttonText="Browse Markets"
          buttonHref="/markets"
        />
      ) : (
        <>
          {layout === "table" && (
            <>
              {selectedOption === "belief" ? (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <WatchListDesktopBelief
                      isLoading={isLoadingWatchlist || isLoadingMarkets}
                      isError={false}
                      data={starredMarketData}
                    />
                  </div>
                  {/* Mobile table */}
                  <div className="block md:hidden">
                    {isLoadingWatchlist || isLoadingMarkets ? (
                      Array.from({ length: 3 }, (_, index) => (
                        <div
                          key={index}
                          className="text-[#FFFFFFA3] rounded-[16px] bg-gray-700 animate-pulse w-full h-[200px] mb-4"
                        >
                          <div className="flex items-center gap-3 w-full col-span-1 h-[60px]" />
                        </div>
                      ))
                    ) : starredMarkets.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400 mb-4">
                          No starred markets found
                        </p>
                        <p className="text-sm text-gray-500">
                          Star markets to add them to your watchlist
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {starredMarkets.map((market) => (
                          <WatchListMobileBelief key={market.id} />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <WatchListDesktopOptions
                  isLoading={isLoadingWatchlist || isLoadingOptions}
                  isError={false}
                  // @ts-expect-error - starredOptions is not typed
                  data={starredOptions}
                />
              )}
            </>
          )}

          {layout === "card" && (
            <>
              {selectedOption === "belief" ? (
                <div className="grid mt-4 gap-2 grid-cols-1 md:grid-cols-3">
                  {isLoadingWatchlist || isLoadingMarkets ? (
                    Array.from({ length: 3 }, (_, index) => (
                      <div
                        key={index}
                        className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[227px]"
                      >
                        <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
                      </div>
                    ))
                  ) : starredMarkets.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400 mb-4">
                        No starred markets found
                      </p>
                      <p className="text-sm text-gray-500">
                        Star markets to add them to your watchlist
                      </p>
                    </div>
                  ) : (
                    <>
                      {starredMarketData.map((market) => (
                        <MarketCard key={market.id} market={market} />
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="grid mt-4 gap-2 grid-cols-1 md:grid-cols-3">
                  {isLoadingWatchlist || isLoadingOptions ? (
                    Array.from({ length: 3 }, (_, index) => (
                      <div
                        key={index}
                        className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[296px]"
                      >
                        <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
                      </div>
                    ))
                  ) : starredOptions.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-400 mb-4">
                        No starred options found
                      </p>
                      <p className="text-sm text-gray-500">
                        Star options to add them to your watchlist
                      </p>
                    </div>
                  ) : (
                    <>
                      {starredOptions.map((option) => (
                        <TokenCard key={option.id} {...option} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WatchList;
