"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import Toast from "./Toast";
import { Check } from "lucide-react";

export type ToastOptions = {
  message: string;
  icon?: React.ReactNode;
  duration?: number;
};

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [icon, setIcon] = useState<React.ReactNode>(
    <Check className="w-5 h-5 text-[#A6A7BC]" />
  );
  const [duration, setDuration] = useState(2000);

  const showToast = useCallback(({ message, icon, duration }: ToastOptions) => {
    setMessage(message);
    setIcon(icon || <Check className="w-5 h-5 text-[#A6A7BC]" />);
    setDuration(duration || 2000);
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => setVisible(false), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast
        message={message}
        icon={icon}
        visible={visible}
        onClose={handleClose}
        duration={duration}
      />
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
