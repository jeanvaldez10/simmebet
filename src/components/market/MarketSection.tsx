import { useEffect, useState } from "react";
import { IMarketData } from "@/interfaces/market";
import { MarketsGrid } from "./MarketsGrid";
import { marketsApi } from "@/services/api/markets";

export function MarketsSection({ activeTab }: { activeTab: string }) {
  const [markets, setMarkets] = useState<IMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { markets } = await marketsApi.getAllMarkets();
        setMarkets(markets);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const filteredMarkets = markets.filter((market) =>
    activeTab === "All"
      ? market
      : activeTab === "Active"
        ? !market.isResolved
        : market.isResolved
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0 lg:px-0">
      <MarketsGrid 
        markets={filteredMarkets}
        isLoading={loading}
        error={error ? new Error(error) : null}
      />
    </div>
  );
}
