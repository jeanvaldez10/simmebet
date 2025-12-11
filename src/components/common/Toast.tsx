import React, { useEffect, useRef } from "react";

export type ToastProps = {
  message: string;
  icon?: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  duration?: number; // ms
};

const Toast: React.FC<ToastProps> = ({ message, icon, visible, onClose, duration = 2000 }) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onClose, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, duration, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      tabIndex={0}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-[99999] flex items-center p-2 rounded-2xl border-1 border-[#48495A] bg-[#2B2C3B] text-white text-sm font-medium shadow-lg max-w-full transition-opacity duration-300 opacity-100 animate-fadeIn"
      style={{ outline: "none" }}
      aria-label={message}
    >
      <span className="mr-4 flex items-center">
        {icon}
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
