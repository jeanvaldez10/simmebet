import {
  Briefcase,
  Globe,
  Trophy,
  CircleArrowDown,
  LayoutDashboard,
  Database,
  SquareUser,
  Hash,
  AtSign,
  Asterisk,
  Star,
  Circle,
} from "lucide-react";
import { FilterTab } from "@/components/common/FilterTab";
import { LucideIcon } from "lucide-react";
import { useLayoutHeights } from "@/hooks/use-layout-heights";

type TabItem = {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  dot?: boolean;
  dotColor?: string;
};

const tabItems: TabItem[] = [
  { label: "Live", icon: Circle, dot: true },
  { label: "All", icon: LayoutDashboard },
  { label: "New", icon: CircleArrowDown },
  { label: "Politics", icon: Briefcase },
  { label: "Sports", icon: Trophy, active: true },
  { label: "Crypto", icon: Database },
  { label: "Trump", icon: SquareUser },
  { label: "Global Elections", icon: Globe },
  { label: "Elon Tweets", icon: Hash },
  { label: "Mentions", icon: AtSign },
  { label: "Creators", icon: Asterisk },
  { label: "Pop culture", icon: Star },
  { label: "Business", icon: Briefcase },
];


export function FilterTabs({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const { totalHeight } = useLayoutHeights();
  
  return (
    <div 
      className="fixed left-0 right-0 flex justify-center items-center gap-1 p-4 overflow-x-auto no-scrollbar mt-2 bg-black/30 backdrop-blur-lg border-b border-t border-white/20"
      style={{ top: `${totalHeight}px` }}
    >
      {tabItems.map((tab, index) => (
        <FilterTab
          key={`${tab.label}-${index}`}
          label={tab.label}
          icon={tab.icon}
          active={tab.label === activeTab}
          dot={tab.dot}
          dotColor={tab.dotColor}
          onClick={() => onTabChange(tab.label)}
        />
      ))}
    </div>
  );
}
