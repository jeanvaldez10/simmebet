import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthProvider";
import HoldersList from "../HoldersList";
import { marketService, type TopHolders } from "@/services/marketService";
import NotFound from "@/components/shared/not-found";

interface MarketTopHoldersTabProps {
  marketId: string;
}

export default function MarketTopHoldersTab({
  marketId,
}: MarketTopHoldersTabProps) {
  const [holders, setHolders] = useState<TopHolders>({ yes: [], no: [] });
  const [isLoading, setIsLoading] = useState(true);
  const { dbUser } = useAuthContext();
  const currentUserAddress = dbUser?.walletAddress ? (dbUser.walletAddress as `0x${string}`) : undefined;

  useEffect(() => {
    const fetchHolders = async () => {
      console.log('Fetching holders from API...');
      try {
        const data = await marketService.getTopHolders(marketId);
        console.log('API response:', data);
        setHolders(data);
      } catch (error) {
        console.error("Error fetching holders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHolders();
  }, [marketId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
        <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
      </div>
    );
  }

  if (holders.yes.length === 0 && holders.no.length === 0) {
    return (
      <NotFound
        className="md:mt-[-5px] mt-[-3px]"
        imageURL="/market_leaderboard.png"
        heading="There are no holders yet"
        desc="Be the first one to buy shares of this market"
        isButtonShow={false}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <HoldersList 
        title="Yes holders" 
        holders={holders.yes} 
        currentUserAddress={currentUserAddress}
      />
      <HoldersList 
        title="No holders" 
        holders={holders.no} 
        currentUserAddress={currentUserAddress}
      />
    </div>
  );
}
