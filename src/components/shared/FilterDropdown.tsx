"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import FilterIcon from "./filter-icon";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortOption = 
  | "default"
  | "soonest" 
  | "latest" 
  | "liquidity-most" 
  | "liquidity-least" 
  | "volume-most" 
  | "volume-least";

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sortOption: SortOption) => void;
}

export const SortDropdown = ({ sortBy, onSortChange }: SortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 24,
        right: window.innerWidth - rect.right - 18
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sortOptions = [
    { value: "default", label: "Default", icon: null },
    { value: "soonest", label: "End Date", sublabel: "Soonest", icon: "up" },
    { value: "latest", label: "End Date", sublabel: "Latest", icon: "down" },
    { value: "liquidity-most", label: "Liquidity", sublabel: "Most", icon: "down" },
    { value: "liquidity-least", label: "Liquidity", sublabel: "Least", icon: "up" },
    { value: "volume-most", label: "Volume", sublabel: "Most", icon: "down" },
    { value: "volume-least", label: "Volume", sublabel: "Least", icon: "up" },
  ];

  const dropdownContent = isOpen && mounted ? (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed w-[280px] border border-[#FFFFFF29] rounded-2xl z-[100]"
        style={{ 
          top: `${position.top}px`,
          right: `${position.right}px`,
          boxShadow: '0 0.5px 0 0 #00000014',
          backgroundColor: 'rgba(22, 23, 30, 0.5)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
             <div className="p-3 flex flex-col gap-2">
               {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value as SortOption);
                    setIsOpen(false);
                  }}
                   className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between rounded-xl ${
                     sortBy === option.value
                       ? "bg-white text-black"
                       : "bg-[#2E3144] hover:bg-[#3C4055]"
                   }`}
                >
                   <span>
                     <span className={sortBy === option.value ? "text-[#070708]/60" : "text-[#FFFFFFA3]"}>{option.label}</span>
                     {option.sublabel && (
                       <span className={sortBy === option.value ? "text-[#070708]" : "text-white"}>: {option.sublabel}</span>
                     )}
                   </span>
                   {option.icon && (
                     <span className={`ml-2 ${sortBy === option.value ? "text-[#070708]" : "text-white"}`}>
                       {option.icon === "up" ? (
                         <ArrowUp className="w-4 h-4" />
                       ) : (
                         <ArrowDown className="w-4 h-4" />
                       )}
                     </span>
                   )}
                </button>
              ))}
            </div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-9 h-9 rounded-full border border-white transition-colors flex-shrink-0 aspect-square ${
          sortBy !== "default"
            ? "bg-white/10 hover:bg-white/20" 
            : "hover:bg-white/5"
        }`}
        aria-label="Sort markets"
      >
        <FilterIcon />
      </button>

      {mounted && createPortal(dropdownContent, document.body)}
    </>
  );
};

