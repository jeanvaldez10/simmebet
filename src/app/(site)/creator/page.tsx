"use client";

import React, { useCallback, useEffect, useState } from "react";
import ProfileHeader from "../profile/common/profile-header";
import { useAuthContext } from "@/context/AuthProvider";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { CreatorTab } from "@/types/profile";
import { cn } from "@/lib/utils";
import { TabSelect } from "../profile/common/tab-select";
import Belief from "./common/belief";
import Options from "./common/options";
import { BeliefFormProvider } from "./common/modal/belief/store/create-context";
import { OptionsFormProvider } from "./common/modal/options/store/options-context";

const TABS: CreatorTab[] = ["Belief", "Options"];

const CreatorPage = () => {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<CreatorTab>(
    (searchParams?.get("tab") as CreatorTab) || "Belief"
  );

  const { dbUser } = useAuthContext();
  const router = useRouter();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleTabChange = (tab: CreatorTab) => {
    setActiveTab(tab);
    router.replace(`/creator?${createQueryString("tab", tab)}`, {
      scroll: false,
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Belief":
        return (
          <BeliefFormProvider>
            <Belief />
          </BeliefFormProvider>
        );

      case "Options":
        return (
          <OptionsFormProvider>
            <Options />
          </OptionsFormProvider>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="max-w-7xl mx-auto  px-3 py-4 mt-8 lg:mt-2 relative">
      <ProfileHeader
        id={dbUser?.id}
        isPublic={false}
        isCreator={true}
        profileData={{
          username: dbUser?.username || "Anonymous",
          avatar: dbUser?.avatar,
          walletId: mounted ? address || "Not connected" : "Not connected",
          joinDate: dbUser?.createdAt,
        }}
      />

      <div
        className={cn(
          "mt-8 hidden md:flex items-center gap-4 md:gap-8 border border-[#FFFFFF29] backdrop-blur-sm bg-black rounded-[16px] px-5 py-2 overflow-x-auto whitespace-nowrap ",
          "!rounded-b-[0px]"
        )}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`text-base md:text-lg font-semibold  transition-all cursor-pointer ${
              activeTab === tab
                ? " underline underline-offset-[15px]  text-[#F2F2FD]"
                : "text-[#F2F2FD] opacity-30 hover:opacity-60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="h-[calc(100vh-130px)] md:h-auto mt-4 md:mt-0 overflow-y-auto md:overflow-visible rounded-[16px]">
        <div
          className={cn(
            "md:hidden block bg-black backdrop-blur-md z-20 mt-5 sticky top-0 border border-[#FFFFFF29] p-4 rounded-[16px]",
            "rounded-b-[0px] border-b-0"
          )}
        >
          <TabSelect
            isPublic={false}
            isCreator={true}
            value={activeTab}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue={(e) => handleTabChange(e as any)}
          />
        </div>

        <div className="md:min-h-[400px] min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>
    </section>
  );
};

export default CreatorPage;
