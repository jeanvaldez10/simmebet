"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { UserNotification } from "@/generated/prisma";
import { formatRelativeTime } from "@/utils/date";

interface NotificationsPanelProps {
  isOpen: boolean;
  notifications: UserNotification[];
  onClose: () => void;
  buttonPosition?: {
    top: number;
    right: number;
  };
}

const NotificationsPanel = ({
  isOpen,
  notifications,
  onClose,
  buttonPosition,
}: NotificationsPanelProps) => {
  const router = useRouter();
  if (!isOpen) return null;
  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Calculate responsive positioning
  const getPanelPosition = () => {
    if (!buttonPosition) {
      return {
        top: "80px",
        right: "16px",
        left: "auto",
      };
    }

    const { top, right } = buttonPosition;
    const panelWidth = 320;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const minRightMargin = 16;
    const minLeftMargin = 16;
    
    // Calculate the right position, ensuring it doesn't go off-screen
    const calculatedRight = Math.min(right + 10, screenWidth - panelWidth - minRightMargin);
    
    // If the panel would be too far left, position it from the left instead
    if (calculatedRight < minRightMargin) {
      return {
        top: `${top + 65}px`,
        right: "auto",
        left: `${minLeftMargin}px`,
      };
    }
    
    return {
      top: `${top + 65}px`,
      right: `${Math.max(calculatedRight, minRightMargin)}px`,
      left: "auto",
    };
  };

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div
        className="absolute w-[320px] max-w-[calc(100vw-32px)] sm:w-[320px] bg-[#16171E] rounded-[16px] overflow-hidden z-50 p-[2px] shadow-2xl border border-white/10"
        onClick={handlePanelClick}
        style={getPanelPosition()}
      >
        <div className="absolute -top-2 right-4 w-4 h-4 bg-[#16171E] transform rotate-45 border-l border-t border-white/10" />

        <div className="px-4 py-2">
          <h2 className="text-[16px] font-medium text-white">Notifications</h2>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col gap-[2px] max-h-[220px] overflow-y-auto px-2">
            {notifications &&
              notifications.slice(-10).map((notification, index) => (
                <div
                  key={index}
                  className="px-4 py-[6px] bg-[#2E3144] rounded-full transition-colors cursor-pointer flex items-center gap-3 hover:bg-[#3E4154]"
                >
                  <div>
                    <Image
                      src={
                        notification.type === "win" ||
                        notification.type === "sell"
                          ? "/images/dollar-circle.svg"
                          : notification.type === "deposit"
                          ? "/images/copy-success.svg"
                          : "/images/arrow-up-icon.svg"
                      }
                      alt="icon"
                      width={12}
                      height={12}
                      className="h-[20px] w-[20px]"
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-[1fr_60px] items-center">
                    <div className="text-white text-[11px] truncate">
                      {notification.message}
                    </div>
                    <div className="text-gray-400 text-[10px] text-right">
                      {formatRelativeTime(notification.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="px-2 pb-2">
            <button
              className="w-full mt-2 py-[6px] text-center text-white text-[11px] border border-white rounded-full cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => {
                router.push("/profile?tab=Notifications")
                onClose();
              }}
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
