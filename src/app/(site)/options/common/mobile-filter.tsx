/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import useFilter from "../hooks/use-filter";

const MobileFilterModal = ({
  isOpen,
  onClose,
  selectedFilters,
  onFilterChange,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedFilters: {
    showAll?: boolean;
    token?: string;
    strike?: string;
    cost?: string;
    expiry?: string;
    volume?: string;
    sortBy: string;
    choice?: string;
  };
  onFilterChange: (type: string, value: string) => void;
  type: "buy" | "exercise" | "transaction";
}) => {
  const { filters } = useFilter();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((name) => name !== sectionName)
        : [sectionName]
    );
  };

  const allFilters =
    type === "exercise"
      ? {
          tokens: filters.tokens,
          expiries: filters.expiries,
        }
      : type === "transaction"
      ? {
          name: [{ label: "Name", value: "name" }],
        }
      : (filters as any);

  useEffect(() => {
    const c = type === "transaction" ? "name" : "tokens";
    setOpenSections([c]);
  }, [isOpen, type]);

  if (!isOpen) return null;

  const filterSections = [
    {
      key: "tokens",
      title: "Token",
      data: allFilters?.tokens,
      filterType: "token",
      selectedValue: selectedFilters.token,
    },
    {
      key: "choices",
      title: "Choices",
      data: allFilters?.choices,
      filterType: "choices",
      selectedValue: selectedFilters.choice,
    },
    {
      key: "strikes",
      title: "Strike",
      data: allFilters?.strikes,
      filterType: "strike",
      selectedValue: selectedFilters.strike,
    },
    {
      key: "costs",
      title: "Cost",
      data: allFilters?.costs,
      filterType: "cost",
      selectedValue: selectedFilters.cost,
    },
    {
      key: "name",
      title: "Sort By",
      data: allFilters?.name,
      filterType: "Name",
      selectedValue: selectedFilters.sortBy,
    },
    {
      key: "expiries",
      title: "Expiry",
      data: allFilters?.expiries,
      filterType: "expiry",
      selectedValue: selectedFilters.expiry,
    },
    {
      key: "volumes",
      title: "Volume",
      data: allFilters?.volumes,
      filterType: "volume",
      selectedValue: selectedFilters.volume,
    },
  ];

  return (
    <div className="fixed inset-0 bg-[rgba(3,3,3,0.12)] backdrop-blur-[4px] z-50 lg:hidden">
      <div className="fixed bottom-0 left-0 right-0 bg-[#16171E] rounded-t-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[#F2F2FD] text-2xl font-semibold">Filters</h3>
          <button
            onClick={onClose}
            className="text-[#FFFFFF] opacity-70 border border-[#FFFFFF] flex items-center justify-center w-[35px] h-[35px] rounded-full"
          >
            <X />
          </button>
        </div>

        <div className="flex flex-col gap-0">
          {filterSections.map((section) => {
            if (!section.data) return null;

            const isOpen = openSections.includes(section.key);

            return (
              <div key={section.key}>
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex justify-between items-center py-4 text-white font-medium hover:text-gray-300 transition-colors"
                >
                  <span>{section.title}</span>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {isOpen && (
                  <div className="pb-4 space-y-2 max-h-60 overflow-y-auto">
                    {Array.isArray(section.data)
                      ? section.data.map((item: any) => {
                          const isString = typeof item === "string";
                          const value = isString ? item : item.value;
                          const label = isString ? item : item.label;

                          return (
                            <button
                              key={value}
                              onClick={() =>
                                onFilterChange(section.filterType, value)
                              }
                              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                                section.selectedValue === value
                                  ? "bg-[#2E3144] text-white"
                                  : "text-gray-400 hover:text-white hover:bg-[#2E3144]"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })
                      : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileFilterModal;
