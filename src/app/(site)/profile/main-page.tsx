"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { ProfileTab } from "@/types/profile";
import { useAuthContext } from "@/context/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Position from "./common/position";
import { TabSelect } from "./common/tab-select";
import NotificationsTab from "./common/notification";
// import FriendsTab from "./common/friends";
import Activity from "./common/activity";
import { cn } from "@/lib/utils";
import WatchList from "./common/watchlist";
import ProfileStats from "./common/profile-stats";
import ProfileHeader from "./common/profile-header";
import { useToast } from "@/components/common/ToastContext";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

const PRIVATE_TABS: ProfileTab[] = [
  "Positions",
  "Activity",
  "Watchlist",
  // "Friends",
  "Notifications",
];

const PUBLIC_TABS: ProfileTab[] = ["Positions", "Activity"];

const Profile = ({
  type = "private",
  id,
}: {
  type?: "public" | "private";
  id?: string;
}) => {
  const TABS = type === "private" ? PRIVATE_TABS : PUBLIC_TABS;

  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { dbUser, userBalance } = useAuthContext();
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    (searchParams?.get("tab") as ProfileTab) || "Positions"
  );
  const [selectedOption, setSelectedOption] = useState<"belief" | "options">("belief");
  const { showToast } = useToast();
  const { totalHeight } = useLayoutHeights();

  // Require authentication - redirect to home if not logged in
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth({
    requireAuth: true,
  });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab && typeof tab === "string" && TABS.includes(tab as ProfileTab)) {
      setActiveTab(tab as ProfileTab);
    } else {
      setActiveTab("Positions");
    }
  }, [searchParams, TABS]);

  // Handle Twitter linking results
  useEffect(() => {
    const linking = searchParams?.get("linking");
    const error = searchParams?.get("error");
    const success = searchParams?.get("success");

    if (linking === "twitter") {
      // The linking was already handled in the JWT callback
      // Just show success message and clean up URL
      showToast({ message: "Twitter account linked successfully!" });
      router.replace("/profile", { scroll: false });
      // Refresh the page to update the UI
      window.location.reload();
    }

    if (error === "twitter_linking_failed") {
      const message =
        searchParams?.get("message") || "Failed to link Twitter account";
      showToast({ message });
      // Clean up URL
      router.replace("/profile", { scroll: false });
    }

    if (success === "twitter_linked") {
      showToast({ message: "Twitter account linked successfully!" });
      // Clean up URL and refresh the page to update the UI
      router.replace("/profile", { scroll: false });
      window.location.reload();
    }
  }, [searchParams, showToast, router]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    const path = type === "private" ? "/profile" : `/user/${id}`;
    router.replace(`${path}?${createQueryString("tab", tab)}`, {
      scroll: false,
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Positions":
        return <Position isPublic={type === "public"} selectedOption={selectedOption} />;
      case "Activity":
        return <Activity />;
      case "Watchlist":
        return type === "public" ? null : <WatchList />;
      case "Notifications":
        return type === "public" ? null : <NotificationsTab />;
      // case "Friends":
      //   return type === "public" ? null : <FriendsTab />;
      default:
        return null;
    }
  };

  // Show loading state only when authenticated and loading user data
  if (authLoading && isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-3 py-4 mt-8 lg:mt-2">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 mt-4 sm:mt-6 lg:mt-8 xl:mt-2 relative">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 lg:gap-8">
        <div className="flex-shrink-0 w-full lg:w-auto">
          <ProfileHeader
            id={id}
            isPublic={type === "public"}
            profileData={{
              username: dbUser?.username || "Anonymous",
              avatar: dbUser?.avatar || dbUser?.image,
              walletId: mounted ? address || "Not connected" : "Not connected",
              joinDate: dbUser?.createdAt,
            }}
          />
        </div>

        <div className="flex-shrink-0 w-full lg:w-auto">
          <ProfileStats
            isPublic={type === "public"}
            balance={userBalance || 0}
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-6 sm:mt-8 hidden md:flex items-center gap-3 sm:gap-4 lg:gap-8 border border-[#FFFFFF29] backdrop-blur-sm bg-black rounded-[16px] px-3 sm:px-5 py-2 overflow-x-auto whitespace-nowrap sticky z-40",
          activeTab === "Notifications" ? "" : "!rounded-b-[0px]"
        )}
        style={{ top: `${totalHeight}px` }}
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

      {/* Unified Mobile Selector - Pure CSS sticky positioning */}
      <div 
        className="mobile-selector-container md:hidden bg-black backdrop-blur-md z-40 sticky border border-[#FFFFFF29] rounded-[16px] mt-3 sm:mt-4"
        style={{ top: `${totalHeight}px` }}
      >
        {/* Tab Selector */}
        <div className="p-3 sm:p-4">
          <TabSelect
            isPublic={type === "public"}
            value={activeTab}
            setValue={(e) => handleTabChange(e as ProfileTab)}
          />
        </div>
        
        {/* Belief/Options Selector - only show for Positions tab */}
        {activeTab === "Positions" && (
          <div className="p-4">
            <div className="flex rounded-[100px] p-[2px] w-full border border-[#FFFFFF29]">
              <button
                onClick={() => setSelectedOption("belief")}
                className={`flex-1 text-sm font-normal !h-[50px] py-2 rounded-[100px] text-center transition-all cursor-pointer ${
                  selectedOption === "belief"
                    ? "bg-[#2E3144] text-[#FFFFFF]"
                    : "text-white bg-transparent"
                }`}
              >
                Belief
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="md:min-h-[400px] min-h-[250px] sm:min-h-[300px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
