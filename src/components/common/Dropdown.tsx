import { ChevronDown } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

export type DropdownOption = {
  id: string | number;
  name: string;
  symbol?: string;
};

interface DropdownProps {
  options: DropdownOption[];
  value: DropdownOption | null;
  onChange: (option: DropdownOption) => void;
  label?: string;
  className?: string;
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <div className="text-gray-400 mb-2">{label}</div>}
      <div
        className="flex items-center justify-between bg-[#2A2A3A] rounded-full p-2.5 cursor-pointer hover:bg-[#2f2f3f] transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <span
          className={`ml-2 ${
            value ? "text-white font-medium" : "text-gray-300"
          }`}
        >
          {value ? value.name : "Select"}
        </span>
        <ChevronDown
          className={`text-gray-400 h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div 
          className="fixed z-[1000]"
          style={{
            top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
            left: dropdownRef.current ? Math.max(dropdownRef.current.getBoundingClientRect().left, 8) : 8,
            width: dropdownRef.current ? Math.min(dropdownRef.current.getBoundingClientRect().width, window.innerWidth - 16) : 'auto',
            maxHeight: '200px'
          }}
        >
          <div 
            ref={listRef}
            className="bg-[#2A2A3A] rounded-2xl overflow-hidden shadow-lg border border-[rgba(255,255,255,0.1)]"
          >
            <div className="py-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`py-2 px-4 mx-2 rounded-xl text-white hover:bg-[rgba(255,255,255,0.1)] cursor-pointer transition-colors flex items-center justify-between ${
                    value?.id === option.id ? "bg-[rgba(255,255,255,0.15)]" : ""
                  }`}
                  onClick={(e) => handleSelect(option, e)}
                >
                  <span>{option.name}</span>
                  {option.symbol && (
                    <span className="text-gray-400">{option.symbol}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 