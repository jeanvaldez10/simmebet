import CommonModal from "@/components/modals";
import { marketsApi } from "@/services/api/markets";
import { formatTokenAmount } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import marketBase from "@/abis/ConditionalTokenMarketBase.json";
import { arbitrum } from "viem/chains";
import { erc20Abi } from "viem";
import { useAuthContext } from "@/context/AuthProvider";
import ProfileUpdatePosition from "../profile-trading-panel";
import { useMarketProbability } from "@/hooks/useMarket";
import { cn } from "@/lib/utils";

const UpdatePosition = ({
  onClose,
  id,
  option = "yes",
}: {
  onClose: () => void;
  id: string;
  option?: string;
}) => {
  const { dbUser } = useAuthContext();
  const [initialBelief, setInitialBelief] = useState(50);
  const [activeTab, setActiveTab] = useState<"update" | "cashout">("update");

  const marketBaseAbi = marketBase.abi;

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ["market", id],
    queryFn: () => marketsApi.getMarketById(id as string),
    enabled: !!id,
  });

  const { data: marketProbability } = useMarketProbability(id, false);

  const market = marketData?.market;

  const { data: outcomeTokens } = useReadContracts({
    contracts: [
      {
        address: market?.contractAddress as `0x${string}`,
        abi: marketBaseAbi,
        functionName: "outcomeTokens",
        args: [BigInt(0)],
        chainId: arbitrum.id,
      },
      {
        address: market?.contractAddress as `0x${string}`,
        abi: marketBaseAbi,
        functionName: "outcomeTokens",
        args: [BigInt(1)],
        chainId: arbitrum.id,
      },
    ],
  });

  const { data: tokenBalances } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: outcomeTokens?.[0]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [dbUser?.walletAddress as `0x${string}`],
      },
      {
        address: outcomeTokens?.[1]?.result as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [dbUser?.walletAddress as `0x${string}`],
      },
    ],
  });

  useEffect(() => {
    if (marketProbability) {
      if (option == "yes" || option == null) {
        setInitialBelief(marketProbability.yes);
      } else {
        setInitialBelief(marketProbability.no);
      }
    }
  }, [option, marketProbability]);

  const formattedTokenABalance = formatTokenAmount(tokenBalances?.[0]);
  const formattedTokenBBalance = formatTokenAmount(tokenBalances?.[1]);

  return (
    <CommonModal onClose={onClose} className="max-h-[97vh] overflow-scroll">
      {marketLoading ? (
        <div className="text-[#FFFFFFA3]  rounded-[16px] bg-gray-700 animate-pulse w-full h-[596px]">
          <div className="flex items-center gap-3 w-full col-span-1  h-full" />
        </div>
      ) : (
        <>
          {/* Tab Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab("update")}
              className={cn(
                "text-2xl font-semibold transition-colors",
                activeTab === "update" ? "text-[#F2F2FD]" : "text-[#FFFFFF52]"
              )}
            >
              Update Belief
            </button>
            <button
              onClick={() => setActiveTab("cashout")}
              className={cn(
                "text-2xl font-semibold transition-colors",
                activeTab === "cashout" ? "text-[#F2F2FD]" : "text-[#FFFFFF52]"
              )}
            >
              Cash Out
            </button>
          </div>

          {/* Tab Content */}
          <ProfileUpdatePosition
            market={market!}
            initialOption={option}
            marketProbability={marketProbability}
            marketAddress={market!.contractAddress}
            formattedTokenABalance={formattedTokenABalance}
            formattedTokenBBalance={formattedTokenBBalance}
            initialBelief={initialBelief}
            onClose={onClose}
            mode={activeTab === "update" ? "update" : "cashout"}
          />
        </>
      )}
    </CommonModal>
  );
};

export default UpdatePosition;
