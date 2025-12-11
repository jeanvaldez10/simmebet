"use client";

import { NotificationType } from "@/types/profile";
import Image from "next/image";
import React from "react";
import { useAuthContext } from "@/context/AuthProvider";
import useProfileNotification from "@/hooks/use-notification";
import NotFound from "@/components/shared/not-found";

const NotificationsTab = () => {
  const { dbUser } = useAuthContext();
  const {
    data: bettingData,
    isLoading,
    isError,
  } = useProfileNotification(dbUser?.id || "");

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "win":
        return (
          <div
            className={`min-w-8 min-h-8 w-8 h-8 rounded-full flex items-center justify-center`}
          >
            <Image
              src="/images/buy-crypto.svg"
              alt={`${type} icon`}
              height={20}
              width={20}
            />
          </div>
        );
      case "buy":
        return (
          <div
            className={`min-w-8 min-h-8 w-8 h-8 rounded-full flex items-center justify-center`}
          >
            <Image
              src="/images/ticket.svg"
              alt={`${type} icon`}
              height={20}
              width={20}
            />
          </div>
        );
      case "deposit":
        return (
          <div
            className={`min-w-8 min-h-8 w-8 h-8 rounded-full flex items-center justify-center`}
          >
            <Image
              src="/images/round-arrow-down.svg"
              alt={`${type} icon`}
              height={20}
              width={20}
            />
          </div>
        );
      case "withdraw":
        return (
          <div
            className={`min-w-8 min-h-8 w-8 h-8 rounded-full flex items-center justify-center`}
          >
            <Image
              src="/images/round-arrow-up.svg"
              alt={`${type} icon`}
              height={20}
              width={20}
            />
          </div>
        );
      case "sell":
        return (
          <div
            className={`w-8 h-8 min-w-8 min-h-8 rounded-full flex items-center justify-center`}
          >
            <Image
              src="/images/ticket.svg"
              alt={`${type} icon`}
              height={20}
              width={20}
            />
          </div>
        );
    }
  };

  return (
    <React.Fragment>
      {bettingData && bettingData.length === 0 ? (
        <NotFound
          imageURL="/notification-not-found.png"
          heading="You have no notifications yet"
          desc="You will see all your notifications here once you start betting on markets."
          buttonText="View Markets"
        />
      ) : (
        <div className="flex flex-col mt-2 gap-2">
          {isLoading || isError || !dbUser?.id || bettingData === undefined ? (
            Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[74px] md:h-[66px]"
              >
                <div className="flex items-center gap-3 w-full col-span-1  h-[60px]" />
              </div>
            ))
          ) : (
            <>
              {bettingData?.map((notification, index: number) => {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#16171E52] backdrop-blur-sm border border-[#FFFFFF29] rounded-[16px]"
                  >
                    <div className="flex max-w-[70%] items-center gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="text-[15px] leading-5 text-[#F2F2FD]">
                        {notification.message}
                        {notification.marketName && (
                          <span className="text-[#878787]"> at {notification.marketName}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm min-w-[80px] text-[#878787]">
                      {notification.when}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </React.Fragment>
  );
};

export default NotificationsTab;
