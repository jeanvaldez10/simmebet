import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu-old";
import { ReactNode } from "react";
import { FilterDropdown } from "./options-filter";
import useFilter from "../hooks/use-filter";

const FilterDropdownMain = ({
  children,
  handleFilterSelect,
  selectedFilters,
  type,
}: {
  children: ReactNode;
  handleFilterSelect: (filterType: string, value: string) => void;
  selectedFilters: {
    strike: string;
    side: string;
    expiry: string;
    volume: string;
    token: string;
    price: string;
    sortBy: string;
  };
  type: "buy" | "exercise" | "transaction";
}) => {
  const { filters } = useFilter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-fit bg-[#16171E52] rounded-[16px] border border-[#FFFFFF29] backdrop-blur-sm"
        align="end"
      >
        {type === "buy" && (
          <div className="flex flex-col gap-2">
            <FilterDropdown
              label="Token"
              options={filters.tokensAll}
              value={selectedFilters.token}
              onSelect={(value) => handleFilterSelect("token", value)}
            />

            {selectedFilters.token !== "All" && (
              <>
                <FilterDropdown
                  label="Strike"
                  options={filters.strikes}
                  value={selectedFilters.strike}
                  onSelect={(value) => handleFilterSelect("strike", value)}
                />
                <FilterDropdown
                  label="Price"
                  options={filters.prices}
                  value={selectedFilters.price}
                  onSelect={(value) => handleFilterSelect("price", value)}
                />
              </>
            )}

            <FilterDropdown
              label="Side"
              options={filters.sides}
              value={selectedFilters.side}
              onSelect={(value) => handleFilterSelect("side", value)}
            />
            <FilterDropdown
              label="Expiry"
              options={filters.expiries}
              value={selectedFilters.expiry}
              onSelect={(value) => handleFilterSelect("expiry", value)}
            />
            <FilterDropdown
              label="Volume"
              options={filters.volumes}
              value={selectedFilters.volume}
              onSelect={(value) => handleFilterSelect("volume", value)}
            />
          </div>
        )}
        {type === "exercise" && (
          <div className="flex flex-col gap-2">
            <FilterDropdown
              label="Token"
              options={filters.tokensAll}
              value={selectedFilters.token}
              onSelect={(value) => handleFilterSelect("token", value)}
            />

            {selectedFilters.token !== "All" && (
              <>
                <FilterDropdown
                  label="Price"
                  options={filters.prices}
                  value={selectedFilters.price}
                  onSelect={(value) => handleFilterSelect("price", value)}
                />
                <FilterDropdown
                  label="Expiry"
                  options={filters.expiries}
                  value={selectedFilters.expiry}
                  onSelect={(value) => handleFilterSelect("expiry", value)}
                />
              </>
            )}
          </div>
        )}

        {type === "transaction" && (
          <div className="flex flex-col gap-2">
            <FilterDropdown
              label="Sort By"
              options={[{ label: "Name", value: "name" }]}
              value={selectedFilters.sortBy}
              onSelect={(value) => handleFilterSelect("name", value)}
            />
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdownMain;
