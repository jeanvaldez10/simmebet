import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-old";

// Optimized options data
export const options = Array(8)
  .fill(null)
  .map((_, i) => ({
    id: i,
    price: "12.30",
    available: "5000",
    traded: "5000",
    premium: "$0.006",
    expiry: "7 days",
    return: "Long",
  }));

export const FilterDropdown = ({
  label,
  options,
  onSelect,
  value,
}: {
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  value: string;
}) => {
  return (
    <>
      <Select value={value} onValueChange={onSelect}>
        <SelectTrigger className="px-4 py-2 rounded-full text-sm font-medium bg-[#2E3144] border-none hover:bg-[#353850] transition-colors flex items-center w-[175px]">
          <div className="flex items-center gap-1 w-full overflow-hidden">
            <span className="text-[#FFFFFFA3] shrink-0">{label}:</span>
            <span className="text-white text-left truncate overflow-hidden whitespace-nowrap block w-full">
              {label === "Volume" ? `${value}k` : <SelectValue />}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#2E3144] border-none rounded-lg shadow-lg">
          {label !== "Volume" ? (
            <>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-gray-300 hover:bg-[#353850] hover:text-white focus:bg-[#353850] focus:text-white cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </>
          ) : (
            <div className="bg-dark px-4 py-3 rounded-lg w-[240px]">
              <div className="flex justify-between text-sm text-white mb-2">
                <span className="font-bold">Select</span>
                <span className="font-bold">{`${parseInt(value)}k`}</span>
              </div>
              <div className="relative w-full mb-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={parseInt(value)}
                  onChange={(e) => onSelect(e.target.value)}
                  className="w-full h-2 bg-[#4A4D5F] rounded-lg appearance-none cursor-pointer accent-green-400 pointer"
                  style={{
                    background: `linear-gradient(to right, #00ff95 ${value}%, #20232F ${value}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span>0</span>
                <span>100k</span>
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
    </>
  );
};

export const MobileFilterModal = ({
  isOpen,
  onClose,
  filters,
  selectedFilters,
  onFilterChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    tokens: string[];
    strikes: { label: string; value: string }[];
    costs: { label: string; value: string }[];
    expiries: { label: string; value: string }[];
    volumes: { label: string; value: string }[];
  };
  selectedFilters: {
    showAll?: boolean;
    token?: string;
    strike?: string;
    cost?: string;
    expiry?: string;
    volume?: string;
  };
  onFilterChange: (type: string, value: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-lg font-semibold">Filters</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-3">Token</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filters.tokens.map((token) => (
                <button
                  key={token}
                  onClick={() => onFilterChange("token", token)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedFilters.token === token
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Strike</h4>
            <div className="space-y-2">
              {filters.strikes.map((strike) => (
                <button
                  key={strike.value}
                  onClick={() => onFilterChange("strike", strike.value)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedFilters.strike === strike.value
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {strike.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Cost</h4>
            <div className="space-y-2">
              {filters.costs.map((cost) => (
                <button
                  key={cost.value}
                  onClick={() => onFilterChange("cost", cost.value)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedFilters.cost === cost.value
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {cost.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Expiry</h4>
            <div className="space-y-2">
              {filters.expiries.map((expiry) => (
                <button
                  key={expiry.value}
                  onClick={() => onFilterChange("expiry", expiry.value)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedFilters.expiry === expiry.value
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {expiry.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-3">Volume</h4>
            <div className="space-y-2">
              {filters.volumes.map((volume) => (
                <button
                  key={volume.value}
                  onClick={() => onFilterChange("volume", volume.value)}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selectedFilters.volume === volume.value
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {volume.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
