"use client";

import type { ModalProps } from "@/types";
import { CgCloseO } from "react-icons/cg";
import { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  width = "max-w-md",
  className,
  contentClassName,
  zIndex = 61,
  showCloseButton = true,
}: ModalProps & { contentClassName?: string }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const updateModalHeight = () => {
      if (modalRef.current && window.innerWidth < 768) {
        // Use visualViewport for accurate mobile viewport height (accounts for browser chrome)
        const visualViewportHeight = window.visualViewport?.height || window.innerHeight;
        modalRef.current.style.maxHeight = `${visualViewportHeight * 0.85}px`;
      }
    };

    updateModalHeight();

    // Listen for viewport changes (Safari address bar showing/hiding)
    window.visualViewport?.addEventListener('resize', updateModalHeight);
    window.visualViewport?.addEventListener('scroll', updateModalHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateModalHeight);
      window.visualViewport?.removeEventListener('scroll', updateModalHeight);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className={`fixed left-1/2 w-full md:w-[95%] ${width}
        bottom-0 translate-y-0 bg-[#16171E] 
        md:bottom-auto md:top-[calc(50%+60px)] md:-translate-y-1/2 -translate-x-1/2 
        rounded-t-3xl md:rounded-3xl
        overflow-hidden
        md:max-h-[90vh]
        ${className}`}
        style={{
          maxHeight: '85vh',
          zIndex: zIndex + 1,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className={contentClassName || "glass-card p-3 sm:p-6 relative shadow-lg h-full overflow-y-auto"}>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onClose()}
            >
              <CgCloseO className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </button>
          )}
          <div className="h-full">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
