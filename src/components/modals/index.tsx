import React, { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { CgCloseO } from "react-icons/cg";
import { cn } from "@/lib/utils";

type CommonModalProps = {
  onClose: () => void;
  className?: string;
  overLayClassName?: string;
  children: ReactNode;
  isCloseButtonShow?: boolean;
};

const CommonModal: React.FC<CommonModalProps> = ({
  onClose,
  className,
  overLayClassName,
  children,
  isCloseButtonShow = true,
}) => {
  // Disable body scroll when modal is open
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    
    // Fix body position to prevent scroll
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    return () => {
      // Restore body and scroll position
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[999] flex md:items-center md:justify-center items-end justify-center text-white">
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm",
          overLayClassName
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "relative md:max-w-md w-[95%] z-50 bg-[#16171E] p-4 rounded-[16px] overflow-hidden",
          "md:mb-0 mb-0 md:rounded-[16px] rounded-t-[16px] rounded-b-none md:rounded-b-[16px]",
          className
        )}
      >
        {isCloseButtonShow && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 pointer"
            aria-label="Close"
          >
            <CgCloseO className="h-6 w-6" />
          </button>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
};

export default CommonModal;
