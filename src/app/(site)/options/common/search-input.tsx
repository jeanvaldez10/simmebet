import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { SortDropdown, SortOption } from "@/components/shared/FilterDropdown";

export const SearchInput = ({
  search,
  setSearch,
  placeHolder = "Search market",
  className,
  showSort = false,
  sortBy,
  onSortChange,
}: {
  search: string;
  setSearch: (e: string) => void;
  placeHolder?: string;
  className?: string;
  showSort?: boolean;
  sortBy?: SortOption;
  onSortChange?: (sortOption: SortOption) => void;
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeHolder}
          className="pl-10 pr-4 py-2 text-sm bg-[#2E3144] text-[#FFFFFFA3]  rounded-full w-full focus:outline-none focus:ring-1 focus:ring-gray-600 h-[36px]"
        />
      </div>
      {showSort && sortBy && onSortChange && (
        <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
      )}
    </div>
  );
};
