"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthProvider";
import { NotificationType } from "@/types/profile";
import EmptyState from "@/components/common/EmptyState";
import { BellIcon } from "lucide-react";

const NotificationsTab = () => {
  const { dbUser } = useAuthContext() as { dbUser: any };
  const router = useRouter();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "win":
        return (
          <div className="w-8 h-8 rounded-full bg-[rgba(70,253,132,0.2)] flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1907 6.35333C13.7307 6.35333 13.3573 5.98 13.3573 5.52V3.98666C13.3573 2.61333 12.244 1.5 10.8707 1.5H9.33732C8.87732 1.5 8.50398 1.12666 8.50398 0.666666C8.50398 0.206666 8.87732 -0.166667 9.33732 -0.166667H10.8707C13.0507 -0.166667 14.8373 1.62 14.8373 3.8V5.33333C14.8373 5.79333 14.464 6.16667 14.004 6.16667L14.1907 6.35333ZM1.83732 6.35333C1.37732 6.35333 1.00398 5.98 1.00398 5.52V3.98666C1.00398 1.80666 2.79065 0.02 4.97065 0.02H6.50398C6.96398 0.02 7.33732 0.393333 7.33732 0.853333C7.33732 1.31333 6.96398 1.68667 6.50398 1.68667H4.97065C3.59732 1.68667 2.48398 2.8 2.48398 4.17333V5.70667C2.48398 6.16667 2.11065 6.54 1.65065 6.54L1.83732 6.35333Z"
                fill="#46FD84"
              />
              <path
                d="M10.8707 16.1667H4.97065C2.79065 16.1667 1.00398 14.38 1.00398 12.2V10.6667C1.00398 10.2067 1.37732 9.83333 1.83732 9.83333C2.29732 9.83333 2.67065 10.2067 2.67065 10.6667V12.2C2.67065 13.5733 3.78398 14.6867 5.15732 14.6867H10.8707C12.244 14.6867 13.3573 13.5733 13.3573 12.2V10.6667C13.3573 10.2067 13.7307 9.83333 14.1907 9.83333C14.6507 9.83333 15.024 10.2067 15.024 10.6667V12.2C15.024 14.38 13.2373 16.1667 11.0573 16.1667H10.8707Z"
                fill="#46FD84"
              />
              <path
                d="M7.99967 12.1667C7.53967 12.1667 7.16634 11.7933 7.16634 11.3333V4.66667C7.16634 4.20667 7.53967 3.83333 7.99967 3.83333C8.45967 3.83333 8.83301 4.20667 8.83301 4.66667V11.3333C8.83301 11.7933 8.45967 12.1667 7.99967 12.1667Z"
                fill="#46FD84"
              />
              <path
                d="M8.00033 12.5C7.26699 12.5 6.52033 12.2133 5.97366 11.6667C5.88699 11.58 5.80033 11.4933 5.74033 11.3933C5.58033 11.18 5.50033 10.9133 5.50033 10.6667C5.50033 10.42 5.58033 10.1533 5.74033 9.94C5.80033 9.84 5.88699 9.75333 5.97366 9.66667C7.06699 8.57333 8.93366 8.57333 10.0203 9.66667C10.107 9.75333 10.1937 9.84 10.2537 9.94C10.4137 10.1533 10.4937 10.42 10.4937 10.6667C10.4937 10.9133 10.4137 11.18 10.2537 11.3933C10.1937 11.4933 10.107 11.58 10.0203 11.6667C9.48033 12.2133 8.73366 12.5 8.00033 12.5ZM7.13366 10.6667C7.13366 10.8267 7.20033 10.9733 7.32033 11.0933C7.72033 11.4933 8.28033 11.4933 8.68033 11.0933C8.80033 10.9733 8.86699 10.8267 8.86699 10.6667C8.86699 10.5067 8.80033 10.36 8.68033 10.24C8.28033 9.84 7.72033 9.84 7.32033 10.24C7.20033 10.36 7.13366 10.5067 7.13366 10.6667Z"
                fill="#46FD84"
              />
            </svg>
          </div>
        );
      case "deposit":
        return (
          <div className="w-8 h-8 rounded-full bg-[rgba(131,71,255,0.2)] flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.93333 14.5H10.0667C13.1333 14.5 14.5 13.1333 14.5 10.0667V5.93333C14.5 2.86667 13.1333 1.5 10.0667 1.5H5.93333C2.86667 1.5 1.5 2.86667 1.5 5.93333V10.0667C1.5 13.1333 2.86667 14.5 5.93333 14.5Z"
                stroke="#8347FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.93333 6.46667L8 8.53333L10.0667 6.46667"
                stroke="#8347FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "bet_success":
        return (
          <div className="w-8 h-8 rounded-full bg-[rgba(70,253,132,0.2)] flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.93333 9.53333L8 7.46667L10.0667 9.53333"
                stroke="#46FD84"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.93333 14.5H10.0667C13.1333 14.5 14.5 13.1333 14.5 10.0667V5.93333C14.5 2.86667 13.1333 1.5 10.0667 1.5H5.93333C2.86667 1.5 1.5 2.86667 1.5 5.93333V10.0667C1.5 13.1333 2.86667 14.5 5.93333 14.5Z"
                stroke="#46FD84"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "sell":
        return (
          <div className="w-8 h-8 rounded-full bg-[rgba(255,77,77,0.2)] flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.93333 6.46667L8 8.53333L10.0667 6.46667"
                stroke="#FF4D4D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.93333 14.5H10.0667C13.1333 14.5 14.5 13.1333 14.5 10.0667V5.93333C14.5 2.86667 13.1333 1.5 10.0667 1.5H5.93333C2.86667 1.5 1.5 2.86667 1.5 5.93333V10.0667C1.5 13.1333 2.86667 14.5 5.93333 14.5Z"
                stroke="#FF4D4D"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
    }
  };

  const handleMarketClick = (marketId: string) => {
    if (marketId) {
      router.push(`/market/${marketId}`);
    } else {
      router.push('/markets');
    }
  };

  if (!dbUser?.notifications || dbUser.notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellIcon className="w-8 h-8 text-gray-400" />}
        title="No notifications"
        description="You'll receive notifications here when there's activity on your account."
        actionLabel="Explore Markets"
        actionLink="/markets"
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.16)]">
      {dbUser.notifications.map((notification: any, index: number) => {
        // Handle both old format (marketName) and new format (marketId)
        const marketName = notification.marketName || 
                          (notification.market ? notification.market.question : "Unknown market");
        
        return (
          <div
            key={index}
            className="flex items-center justify-between py-6 px-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
          >
            <div className="flex items-center gap-3">
              {getNotificationIcon(notification.type)}
              <div className="text-[15px] leading-5 text-[#F2F2FD]">
                {notification.type === "win" && `You won $${notification.amount}`}
                {notification.type === "deposit" &&
                  `Deposit of $${notification.amount} completed`}
                {notification.type === "buy" &&
                  `You bought $${notification.amount}`}
                {notification.type === "sell" &&
                  `You sold $${notification.amount}`}
                <span className="text-[#878787]"> at </span>
                <span 
                  className="text-[#F2F2FD] cursor-pointer hover:underline"
                  onClick={() => handleMarketClick(notification.marketId)}
                >
                  {marketName}
                </span>
              </div>
            </div>
            <span className="text-sm text-[#878787]">
              {notification.createdAt 
                ? new Date(notification.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : notification.timestamp || "2min ago"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationsTab;
