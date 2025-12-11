import React from "react";
import { ENABLE_BLACKJACK_DEV_TOOLS } from "@/constants";

interface DevToolsToggleProps {
  showDevTools: boolean;
  onToggle: () => void;
}

export function DevToolsToggle({ onToggle }: DevToolsToggleProps) {
  if (!ENABLE_BLACKJACK_DEV_TOOLS) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔧 DevTools button clicked!");
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed left-4 z-[9999] w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white/20 cursor-pointer"
      title="Toggle Dev Tools"
      style={{ 
        position: 'fixed', 
        top: '150px', 
        left: '16px',
        pointerEvents: 'auto',
        zIndex: 99999
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>
  );
}

