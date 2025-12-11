"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import TokenCard from "./common/option-card";
import { cn } from "@/lib/utils";
import { Filter, Search } from "lucide-react";
import ExerciseCard from "./common/exercise-card";
import MobileFilterModal from "./common/mobile-filter";
import FilterDropdownMain from "./common/filter-dropdown";
import ListedCard from "./common/listed-card";
import { useDeviceType } from "@/hooks/use-media-query";
import NotFound from "@/components/shared/not-found";
import { useAuthContext } from "@/context/AuthProvider";
import useOptionsBuy from "./hooks/use-buy";
import useOptionsHolding from "./hooks/use-holding";
import useOptionsListed from "./hooks/use-listed";
import BuyOptionModal from "./common/buy-modal";
import ExerciseOptions from "../profile/common/modal/exercise-options";
import ConformSellOptions from "../profile/common/modal/confirm-sell-options";
import SellOptions from "../profile/common/modal/sell-options";
import UpdateListing from "./modal/update-listing";
import ConfirmUpdate from "./modal/confirm-update";
import ConformCloseOptions from "./modal/confirm-close";
import { SearchInput } from "./common/search-input";
import useBetUpdate from "./hooks/use-bet-update";
import useOptionsExercise from "./hooks/use-option-exercise";
import useOptionSell from "./hooks/use-option-sell";
import useOptionClose from "./hooks/use-option-close";

const Options = () => {
  const [open, setOpen] = useState<
    | "sell"
    | "confirm_sell"
    | "exercise"
    | "confirm_exercise"
    | "update"
    | "confirm_update"
    | "confirm_close"
    | null
  >(null);

  const { dbUser } = useAuthContext();
  const { data: buyData, isPending: isBuyPending } = useOptionsBuy();

  const deviceType = useDeviceType();
  const searchParams = useSearchParams();

  // Get the tab from URL params, but force "buy" if user is not authenticated and URL has "my-options"
  const urlTab = searchParams.get("tab") as "buy" | "my-options";
  const [tab, setTab] = useState<"buy" | "my-options">(
    !dbUser && urlTab === "my-options" ? "buy" : urlTab || "buy"
  );
  const [subTab, setSubTab] = useState<"holding" | "listed">("holding");
  const { updateBet, setUpdateBet, updateBetInitialData } = useBetUpdate();
  const { setOptionClose, optionClose } = useOptionClose();

  const { data: holdingData, isPending: isHoldingPending } = useOptionsHolding(
    dbUser?.id || "",
    tab === "my-options"
  );

  const { exerciseData, exerciseInitialData, setExerciseData } =
    useOptionsExercise();
  const { sellInitialData, setOPtionSell, optionSell } = useOptionSell();

  const { data: listedData, isPending: isListedPending } = useOptionsListed(
    dbUser?.id || "",
    tab === "my-options"
  );

  const updateUrlParams = (newTab: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const handleTabChange = useCallback((newTab: "buy" | "my-options") => {
    setTab(newTab);
    updateUrlParams(newTab);
  }, []);

  // Effect to handle authentication state changes and redirect to buy tab if not authenticated on my-options
  useEffect(() => {
    if (!dbUser && urlTab === "my-options") {
      // User is not authenticated but URL has my-options, redirect to buy
      handleTabChange("buy");
    }
  }, [dbUser, urlTab, handleTabChange]);

  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    strike: "All",
    side: "All",
    expiry: "All",
    volume: "5",
    token: "All",
    price: "All",
    sortBy: "name",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleFilterSelect = (filterType: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleMobileFilterChange = (type: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const filteredBuyData = buyData?.filter((option) =>
    option.tokenName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto  px-[9px] mt-22 md:mt-29">
      <div className="h-[calc(100vh-112px)] rounded-[16px] md:h-[calc(100vh-140px)] overflow-y-scroll">
        <section
          className={cn(
            "border border-[#FFFFFF29] sticky top-0  h-[54px] flex items-center justify-between gap-6  bg-[rgba(3,3,3,0.32)] px-4 py-2 z-30  backdrop-blur-sm",
            tab !== "my-options" && tab !== "buy"
              ? "rounded-[16px]"
              : deviceType === "mobile"
              ? "!rounded-b-[0px]  rounded-[16px]"
              : "rounded-[16px]"
          )}
        >
          <div className="flex  items-center gap-4">
            <button
              onClick={() => handleTabChange("buy")}
              className={`font-semibold text-xl transition-colors  cursor-pointer ${
                tab === "buy"
                  ? "text-white !underline-offset-[18px] underline"
                  : "text-[#FFFFFF52]"
              }`}
            >
              Buy
            </button>
            {dbUser && (
              <button
                onClick={() => handleTabChange("my-options")}
                className={`font-semibold text-xl  transition-colors cursor-pointer ${
                  tab === "my-options"
                    ? "text-white !underline-offset-[18px]  underline"
                    : "text-[#FFFFFF52]"
                }`}
              >
                My Options
              </button>
            )}
          </div>

          {tab === "buy" && (
            <div className=" flex items-center gap-3">
              <SearchInput
                search={search}
                setSearch={setSearch}
                placeHolder="Search options"
                className="md:flex hidden"
              />

              <FilterDropdownMain
                selectedFilters={selectedFilters}
                handleFilterSelect={handleFilterSelect}
                type={"buy"}
              >
                <div className=" hidden md:flex items-center justify-center border border-[#ffff] w-[36px] h-[36px] rounded-full pointer">
                  <Filter size={20} />
                </div>
              </FilterDropdownMain>
            </div>
          )}
        </section>

        {tab === "my-options" && (
          <div className="block md:hidden bg-[rgba(3,3,3,0.32)] backdrop-blur-sm sticky top-[54px] z-30 border border-[#FFFFFF29] px-4 py-3 rounded-[16px] rounded-t-[0px] border-t-0">
            <div className="flex rounded-[100px] p-[2px] w-full border border-[#FFFFFF29]">
              <button
                onClick={() => {
                  setSubTab("holding");
                }}
                className={`flex-1 text-sm font-normal !h-[42px]  py-2  rounded-[100px] text-center transition-all cursor-pointer ${
                  subTab === "holding"
                    ? "bg-[#2E3144] text-[#FFFFFF]"
                    : "text-white bg-transparent"
                }`}
              >
                Holding
              </button>
              <button
                onClick={() => {
                  setSubTab("listed");
                }}
                className={` !h-[42px] flex-1 text-sm font-normal py-2  rounded-[100px] text-center transition-all cursor-pointer ${
                  subTab === "listed"
                    ? "bg-[#2E3144] text-[#FFFFFF]"
                    : "text-white bg-transparent"
                }`}
              >
                Listed
              </button>
            </div>
          </div>
        )}

        {tab === "buy" && (
          <div className="flex z-30 items-center bg-[rgba(3,3,3,0.32)] backdrop-blur-sm sticky top-[54px] justify-between gap-2 md:hidden  border border-[#FFFFFF29] p-4 rounded-[16px] rounded-t-[0px] border-t-0">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
              <input
                type="search"
                placeholder="Search option"
                className="pl-10 pr-4 py-2 text-sm bg-[#2E3144] text-[#FFFFFFA3]  rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600 h-[40px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div
              className=" shrink-0  flex  md:hidden items-center justify-center border border-[#ffff] w-[36px] h-[36px] rounded-full pointer"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter size={20} />
            </div>
          </div>
        )}

        <section className={cn("", "pt-3 md:pt-2")}>
          {!isBuyPending && filteredBuyData?.length === 0 ? (
            <NotFound
              heading={
                search ? "Options not found" : "You don't have any Options"
              }
              desc={
                search
                  ? "Try to search other option name."
                  : "Buy options in order to see them here."
              }
              imageURL="/holding.png"
              className="mt-1"
              buttonText="Buy Options"
              buttonClassName="bg-white text-black"
              buttonHref="/options"
              isButtonShow={!search}
            />
          ) : (
            <>
              {tab === "buy" && (
                <div className="grid gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]">
                  {isBuyPending && !filteredBuyData ? (
                    Array.from({ length: 8 }, (_, index) => (
                      <div
                        key={index}
                        className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl animate-pulse min-h-[296px]"
                      >
                        {/* Header section */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-[60px] h-[60px] rounded-full bg-gray-600 flex-shrink-0"></div>
                            <div>
                              <div className="h-8 w-16 bg-gray-600 rounded mb-1"></div>
                              <div className="h-4 w-24 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-gray-600 rounded"></div>
                              <div className="w-5 h-5 bg-gray-600 rounded"></div>
                            </div>
                            <div className="h-4 w-16 bg-gray-600 rounded"></div>
                          </div>
                        </div>

                        {/* Options available section */}
                        <div className="mb-6">
                          <div className="h-6 w-32 bg-gray-600 rounded mb-2"></div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <div className="h-5 w-16 bg-gray-600 rounded"></div>
                            <div className="h-5 w-20 bg-gray-600 rounded"></div>
                          </div>
                          <div className="h-2 w-full bg-gray-600 rounded"></div>
                          <div className="mb-6"></div>
                        </div>

                        {/* Grid section */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div>
                            <div className="h-3 w-8 bg-gray-600 rounded mb-2"></div>
                            <div className="h-4 w-12 bg-gray-600 rounded"></div>
                          </div>
                          <div>
                            <div className="h-3 w-10 bg-gray-600 rounded mb-2"></div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                              <div className="h-4 w-12 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                          <div>
                            <div className="h-3 w-12 bg-gray-600 rounded mb-2"></div>
                            <div className="h-4 w-16 bg-gray-600 rounded"></div>
                          </div>
                        </div>

                        {/* Button */}
                        <div className="h-[36px] w-full bg-gray-600 rounded-full"></div>
                      </div>
                    ))
                  ) : (
                    <>
                      {filteredBuyData?.map((option, index) => (
                        <TokenCard
                          key={index}
                          id={String(option.id)}
                          tokenSymbol={option.tokenSymbol}
                          tokenName={option.tokenName}
                          currentPrice={option.currentPrice}
                          optionsAvailable={option.optionsAvailable}
                          totalOptions={option.totalOptions}
                          strikePrice={option.strikePrice}
                          expiry={option.expiry}
                          position={option.position}
                          tokenImage={option.tokenImage}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
          {tab === "my-options" && (
            <>
              <div className=" hidden md:grid grid-cols-2 gap-2 ">
                <div className=" rounded-[16px] border bg-[#16171E52] backdrop-blur-sm border-[#FFFFFF29] p-4">
                  <h2 className="font-semibold  mb-3 text-xl text-[#F2F2FD]">
                    Holding
                  </h2>

                  {!isHoldingPending && holdingData?.length === 0 ? (
                    <NotFound
                      heading="You don't have any Options"
                      desc="Buy options in order to see them here."
                      imageURL="/holding.png"
                      className="mt-1"
                      buttonText="Buy Options"
                      buttonClassName="bg-white text-black"
                      buttonHref="/options"
                    />
                  ) : (
                    <div className="grid gap-2 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                      {isHoldingPending ? (
                        Array.from({ length: 8 }, (_, index) => (
                          <div
                            key={index}
                            className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl animate-pulse"
                          >
                            {/* Header section */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-[60px] h-[60px] rounded-full bg-gray-600 flex-shrink-0"></div>
                                <div>
                                  <div className="h-8 w-16 bg-gray-600 rounded mb-1"></div>
                                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                                  <div className="w-7 h-7 bg-gray-600 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Price change and chart section */}
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-16 bg-gray-600 rounded-full"></div>
                              </div>
                              <div className="h-12 w-full bg-gray-600 rounded"></div>
                            </div>

                            {/* Grid section */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-10 bg-gray-600 rounded mb-1"></div>
                                <div className="flex items-center justify-between">
                                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                  <div className="h-4 w-12 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-12 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {holdingData?.map((option, index) => (
                            <ExerciseCard
                              key={index}
                              id={String(option.id)}
                              tokenSymbol={option.tokenSymbol}
                              tokenName={option.tokenName}
                              currentPrice={option.currentPrice}
                              priceChange={option.priceChange}
                              strikePrice={option.strikePrice}
                              expiry={option.expiry}
                              position={option.position}
                              tokenImage={option.tokenImage}
                              size={option.size}
                              chartData={option.chartData}
                              onExercise={(e) => {
                                setOpen("exercise");
                                setExerciseData(e);
                              }}
                              onSell={(e) => {
                                setOpen("sell");
                                setOPtionSell(e);
                              }}
                              isProfileComponent={false}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className=" md:block hidden rounded-[16px] border bg-[#16171E52] backdrop-blur-sm border-[#FFFFFF29] p-4">
                  <h2 className=" font-semibold text-xl text-[#F2F2FD] mb-3">
                    Listed
                  </h2>

                  {!isListedPending && listedData?.length === 0 ? (
                    <NotFound
                      heading="You don't have listed Options"
                      desc="List options in order to see them here."
                      imageURL="/holding.png"
                      className="mt-1"
                      buttonText="List Options"
                      buttonClassName="bg-white text-black"
                      buttonHref="/options"
                    />
                  ) : (
                    <div className="grid gap-2 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                      {isListedPending ? (
                        Array.from({ length: 8 }, (_, index) => (
                          <div
                            key={index}
                            className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl animate-pulse"
                          >
                            {/* Header section */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-[60px] h-[60px] rounded-full bg-gray-600 flex-shrink-0"></div>
                                <div>
                                  <div className="h-8 w-16 bg-gray-600 rounded mb-1"></div>
                                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                                  <div className="w-7 h-7 bg-gray-600 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Listed price section */}
                            <div className="my-6">
                              <div className="h-20 w-full">
                                <div className="h-3 w-20 bg-gray-600 rounded mb-3"></div>
                                <div className="h-12 w-24 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Grid section */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-10 bg-gray-600 rounded mb-1"></div>
                                <div className="flex items-center justify-between">
                                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                  <div className="h-4 w-12 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-12 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2 mt-6">
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {listedData?.map((option, index) => (
                            <ListedCard
                              key={index}
                              {...option}
                              onUpdate={(e) => {
                                setOpen("update");
                                setUpdateBet({ ...e, amount: 0 });
                              }}
                              onClose={(e) => {
                                setOpen("confirm_close");
                                setOptionClose(e);
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {subTab === "listed" && (
                <>
                  {!isListedPending && listedData?.length === 0 ? (
                    <NotFound
                      heading="You don't have listed Options"
                      desc="List options in order to see them here."
                      imageURL="/holding.png"
                      className="mt-1"
                      buttonText="List Options"
                      buttonClassName="bg-white text-black"
                      buttonHref="/options"
                    />
                  ) : (
                    <div className="md:hidden grid gap-2 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                      {isListedPending ? (
                        Array.from({ length: 8 }, (_, index) => (
                          <div
                            key={index}
                            className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl animate-pulse"
                          >
                            {/* Header section */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-[60px] h-[60px] rounded-full bg-gray-600 flex-shrink-0"></div>
                                <div>
                                  <div className="h-8 w-16 bg-gray-600 rounded mb-1"></div>
                                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                                  <div className="w-7 h-7 bg-gray-600 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Listed price section */}
                            <div className="my-6">
                              <div className="h-20 w-full">
                                <div className="h-3 w-20 bg-gray-600 rounded mb-3"></div>
                                <div className="h-12 w-24 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Grid section */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-10 bg-gray-600 rounded mb-1"></div>
                                <div className="flex items-center justify-between">
                                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                  <div className="h-4 w-12 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-12 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2 mt-6">
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {listedData?.map((option, index) => (
                            <ListedCard
                              key={index}
                              {...option}
                              onUpdate={(e) => {
                                setOpen("update");
                                setUpdateBet({ ...e, amount: 0 });
                              }}
                              onClose={(e) => {
                                setOpen("confirm_close");
                                setOptionClose(e);
                              }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {subTab === "holding" && (
                <>
                  {!isHoldingPending && holdingData?.length === 0 ? (
                    <NotFound
                      heading="You don't have any Options"
                      desc="Buy options in order to see them here."
                      imageURL="/holding.png"
                      className="mt-1"
                      buttonText="Buy Options"
                      buttonClassName="bg-white text-black"
                      buttonHref="/options"
                    />
                  ) : (
                    <div className=" md:hidden grid gap-2 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))]">
                      {isHoldingPending ? (
                        Array.from({ length: 8 }, (_, index) => (
                          <div
                            key={index}
                            className="bg-[#16171E] rounded-[16px] p-4 text-white shadow-2xl animate-pulse"
                          >
                            {/* Header section */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-[60px] h-[60px] rounded-full bg-gray-600 flex-shrink-0"></div>
                                <div>
                                  <div className="h-8 w-16 bg-gray-600 rounded mb-1"></div>
                                  <div className="h-4 w-24 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gray-600 rounded"></div>
                                  <div className="w-7 h-7 bg-gray-600 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Price change and chart section */}
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="h-6 w-16 bg-gray-600 rounded-full"></div>
                              </div>
                              <div className="h-12 w-full bg-gray-600 rounded"></div>
                            </div>

                            {/* Grid section */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-10 bg-gray-600 rounded mb-1"></div>
                                <div className="flex items-center justify-between">
                                  <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                  <div className="h-4 w-12 bg-gray-600 rounded"></div>
                                </div>
                              </div>
                              <div>
                                <div className="h-3 w-8 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-12 bg-gray-600 rounded"></div>
                              </div>
                              <div>
                                <div className="h-3 w-12 bg-gray-600 rounded mb-1"></div>
                                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center gap-2">
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                              <div className="h-9 flex-1 bg-gray-600 rounded"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {holdingData?.map((option, index) => (
                            <ExerciseCard
                              key={index}
                              id={String(option.id)}
                              tokenSymbol={option.tokenSymbol}
                              tokenName={option.tokenName}
                              currentPrice={option.currentPrice}
                              priceChange={option.priceChange}
                              strikePrice={option.strikePrice}
                              expiry={option.expiry}
                              position={option.position}
                              tokenImage={option.tokenImage}
                              size={option.size}
                              chartData={option.chartData}
                              onExercise={(e) => {
                                setOpen("exercise");
                                setExerciseData(e);
                              }}
                              onSell={(e) => {
                                setOpen("sell");
                                setOPtionSell(e);
                              }}
                              isProfileComponent={false}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>

      <MobileFilterModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        selectedFilters={selectedFilters}
        onFilterChange={handleMobileFilterChange}
        type={"buy"}
      />

      {open === "sell" && (
        <SellOptions
          amount={optionSell.amount}
          setAmount={(e) => setOPtionSell((prev) => ({ ...prev, amount: e }))}
          setPrice={(e) => setOPtionSell((prev) => ({ ...prev, price: e }))}
          price={optionSell.price}
          onClose={() => {
            setOpen(null);
            setOPtionSell(sellInitialData);
          }}
          onSellConfirm={() => setOpen("confirm_sell")}
          balance={25}
        />
      )}
      {open === "confirm_sell" && (
        <ConformSellOptions
          onClose={() => {
            setOpen(null);
            setOPtionSell(sellInitialData);
          }}
          amount={optionSell.amount}
          price={optionSell.price}
          name={optionSell.name}
          image={optionSell.image}
          symbol={optionSell.symbol}
          type={optionSell.type}
        />
      )}
      {open === "exercise" && (
        <ExerciseOptions
          onClose={() => {
            setOpen(null);
            setExerciseData(exerciseInitialData);
          }}
          balance={exerciseData.optionBalance}
          onExerciseConfirm={() => setOpen("confirm_exercise")}
          amount={exerciseData.amount}
          setAmount={(e) => setExerciseData((prev) => ({ ...prev, amount: e }))}
        />
      )}

      <BuyOptionModal
        title={open === "confirm_exercise" ? "Confirm exercise order" : ""}
        isOpen={open === "confirm_exercise"}
        onClose={() => {
          setOpen(null);
          setExerciseData(exerciseInitialData);
        }}
        tokenSymbol={exerciseData.symbol}
        tokenName={exerciseData.name}
        selectedOption={"exercise"}
        tokenImage={exerciseData.image}
        strikePrice={exerciseData.strikePrice}
        optionCost={exerciseData.optionCost}
        amount={exerciseData.amount}
        expiry={exerciseData.expiry}
        fees={exerciseData.fee}
        priceChange={exerciseData.priceImpact}
        priceChangePercentage={exerciseData.priceImpactPercentage}
        onConfirm={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return true;
        }}
      />

      {open === "update" && (
        <UpdateListing
          currentPrice={25.5}
          onClose={() => {
            setOpen(null);
            setUpdateBet(updateBetInitialData);
          }}
          onUpdateConfirm={() => setOpen("confirm_update")}
          amount={updateBet.amount}
          setAmount={(e) => setUpdateBet((prev) => ({ ...prev, amount: e }))}
        />
      )}

      {open === "confirm_update" && (
        <ConfirmUpdate
          onClose={() => {
            setOpen(null);
            setUpdateBet(updateBetInitialData);
          }}
          type={updateBet.type}
          name={updateBet.symbol}
          newPrice={updateBet.amount}
          oldPrice={25.5}
          totalAmount={updateBet.amount + 0.5}
          imageSrc={updateBet.image}
          tokenName={updateBet.name}
        />
      )}

      {open === "confirm_close" && (
        <ConformCloseOptions onClose={() => setOpen(null)} {...optionClose} />
      )}
    </main>
  );
};

export default Options;
