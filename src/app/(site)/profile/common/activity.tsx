import React from "react";
import MobileActivity from "./mobile-activity";
import { useAuthContext } from "@/context/AuthProvider";
import { useProfileActivityInfinite } from "@/hooks/use-profile-activity";
import ActivityRow from "./table-row/activity-row";
import NotFound from "@/components/shared/not-found";
import Button from "@/components/Button";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

const Activity = () => {
  const { dbUser } = useAuthContext();
  const { totalHeight } = useLayoutHeights();
  const {
    activities,
    isLoading,
    isError,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useProfileActivityInfinite(dbUser?.id || "");

  const showEmptyState = !isLoading && !isError && activities.length === 0;

  return (
    <div>
      {showEmptyState ? (
        <NotFound
          imageURL="/activity-not-found.png"
          heading="You have no activities yet"
          desc="Browse markets and start betting on different topics"
          buttonText="Browse Markets"
          buttonHref="/markets"
        />
      ) : (
        <>
          <div className="w-full md:block hidden">
            <div
              className="bg-black backdrop-blur-sm rounded-b-[16px] border-t-transparent grid md:grid-cols-[2fr_100px_100px_1fr] lg:grid-cols-4 p-4 text-xs font-normal text-[#FFFFFFA3] capitalize tracking-wider border border-[#FFFFFF29] sticky z-30 mt-0"
              style={{ top: `${totalHeight + 46}px` }}
            >
              <div className="col-span-1 text-center">Activity</div>
              <div className="col-span-1 text-center">Amount</div>
              <div className="col-span-1 text-center">Date</div>
              <div className="col-span-1 opacity-0 self-end">
                View market
              </div>
            </div>

            {isLoading ? (
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="text-[#FFFFFFA3] rounded-[16px] bg-gray-700 animate-pulse w-full h-[60px] mt-2"
                >
                  <div className="flex items-center gap-3 w-full col-span-1 h-[60px]" />
                </div>
              ))
            ) : isError ? (
              <div className="text-center text-red-500 py-4">
                Error loading activities. Please try again.
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {activities.map((activity) => (
                  <ActivityRow key={activity.id} {...activity} />
                ))}
              </div>
            )}
            
            {hasMore && (
              <div className="flex justify-center mt-4 px-4">
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  variant="ghost"
                  size="sm"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>

          <div className="grid mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:hidden">
            {isLoading ? (
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="text-[#FFFFFFA3] rounded-[16px] bg-gray-700 animate-pulse w-full h-[100px]"
                >
                  <div className="flex items-center gap-3 w-full col-span-1 h-[60px]" />
                </div>
              ))
            ) : isError ? (
              <div className="text-center text-red-500 py-4">
                Error loading activities. Please try again.
              </div>
            ) : (
              <>
                {activities.map((activity) => (
                  <MobileActivity key={activity.id} {...activity} />
                ))}
                
                {hasMore && (
                  <div className="flex justify-center mt-4 col-span-full">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      variant="ghost"
                      size="sm"
                    >
                      {isLoadingMore ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Activity;
