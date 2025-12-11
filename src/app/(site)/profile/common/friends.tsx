"use client";

import React from "react";
import { useAuthContext } from "@/context/AuthProvider";
import useProfileFriends from "@/hooks/use-profile-friends";
import FriendsRow from "./table-row/friends-row";
import MobileFriends from "./mobile-friends";
import NotFound from "@/components/shared/not-found";

const FriendsTab = () => {
  const { dbUser } = useAuthContext();
  const {
    data: bettingData,
    isLoading,
    isError,
  } = useProfileFriends(dbUser?.id || "");

  return (
    <React.Fragment>
      {false ? (
        <NotFound
          imageURL="/friends-not-found.png"
          heading="You're not following any user"
          desc="Start following users and see what they are up to."
          isButtonShow={false}
        />
      ) : (
        <>
          <div className="w-full  md:block hidden">
            <div className="overflow-hidden border-none">
              <div className="overflow-x-auto">
                <div className="w-full">
                  <div
                    className=" bg-black border-t-transparent mb-2 backdrop-blur-sm rounded-b-[16px] grid grid-cols-[1fr_1fr_1fr_1fr]
      p-4 text-xs font-normal text-[#FFFFFFA3]  capitalize tracking-wider border border-[#FFFFFF29]"
                  >
                    <div className="col-span-1">User</div>
                    <div className="col-span-1 text-center">Profit/Loss</div>
                    <div className="col-span-1 text-center">Volume Traded</div>
                    <div className="col-span-1 text-right opacity-0">
                      Market Traded
                    </div>
                  </div>

                  {isLoading ||
                  isError ||
                  !dbUser?.id ||
                  bettingData === undefined ? (
                    Array.from({ length: 3 }, (_, index) => (
                      <div
                        key={index}
                        className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[64px] mt-2"
                      >
                        <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      {bettingData?.map((data, idx) => (
                        <FriendsRow key={idx} {...data} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:hidden mt-4 gap-2 grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] md:grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))]">
            {isLoading ||
            isError ||
            !dbUser?.id ||
            bettingData === undefined ? (
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[136px]"
                >
                  <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
                </div>
              ))
            ) : (
              <>
                {bettingData?.map((data, idx) => (
                  <MobileFriends key={idx} {...data} />
                ))}
              </>
            )}
          </div>
        </>
      )}
    </React.Fragment>
  );
};

export default FriendsTab;
