import { type ReactNode } from "react";

interface Tab {
  id: string;
  label: ReactNode;
}

interface TabSelectorProps {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabSelector({
  tabs,
  selectedTab,
  onTabChange,
  className = "",
}: TabSelectorProps) {
  return (
    <div className={`flex space-x-2 md:space-x-8 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`text-lg font-medium pb-2 cursor-pointer ${
            selectedTab === tab.id
              ? "text-white border-white"
              : "text-[#6F6F7D] hover:text-gray-200"
          }`}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={selectedTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          tabIndex={selectedTab === tab.id ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
