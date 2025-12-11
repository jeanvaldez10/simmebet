/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import type { Market } from "@/generated/prisma";
// import { MarketTweetTab } from "./tabs/MarketTweetTab";
import { MarketActivityTab } from "./tabs/MarketActivityTab";
import MarketTopHoldersTab from "./tabs/MarketTopHoldersTab";
import { TweetTabSelect } from "@/app/(site)/market/common/tweet-tab";

export type TabType = "Activity" | "Top Holders";

const TABS: TabType[] = ["Activity", "Top Holders"];

export const MarketTweets = ({ market }: Market | any) => {
  const [activeTab, setActiveTab] = useState<TabType>("Activity");

  return (
    <div className="flex flex-col gap-5 ">
      <div
        className="hidden md:flex items-center overflow-x-auto whitespace-nowrap gap-8 px-5 py-3
      border border-[#FFFFFF29] bg-[#16171E52] rounded-[16px] backdrop-blur-sm
      "
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? "text-[#F2F2FD] underline underline-offset-[19px]"
                : "text-[#F2F2FD] opacity-30 hover:opacity-60 border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full block md:hidden mb-[-8px] my-[-15px]">
        <TweetTabSelect
          value={activeTab}
          setValue={(e) => setActiveTab(e as TabType)}
        />
      </div>

      {/* {activeTab === "Tweets" && <MarketTweetTab tweets={market.tweets} />} */}
      {activeTab === "Activity" && <MarketActivityTab marketId={market.id} yesSideName={market.yesSideName} noSideName={market.noSideName} />}
      {activeTab === "Top Holders" && (
        <MarketTopHoldersTab marketId={market.id} />
      )}
    </div>
  );
};
