import Image from "next/image";
import { useState, useEffect } from "react";
import { useConnect, type Connector } from "wagmi";
import { BALANCE, DEPOSIT_DISABLED } from "@/constants";
import { getConnectorIcon, getConnectorName } from "@/utils";

interface WalletConnectorProps {
  selectedTab: "deposit" | "withdraw";
  setSelectedTab: (tab: "deposit" | "withdraw") => void;
  onWalletConnected?: () => void;
}

export default function WalletConnector({ 
  selectedTab, 
  setSelectedTab,
  onWalletConnected
}: WalletConnectorProps) {
  const { connect, connectors, isPending } = useConnect();
  const [pendingConnectorId, setPendingConnectorId] = useState<string | null>(null);
  console.log("connectors", connectors);
  useEffect(() => {
    if (!isPending && pendingConnectorId) {
      setPendingConnectorId(null);
      if (onWalletConnected) {
        onWalletConnected();
      }
    }
  }, [isPending, pendingConnectorId, onWalletConnected]);

  useEffect(() => {
    return () => {
      setPendingConnectorId(null);
    };
  }, []);

  useEffect(() => {
    setPendingConnectorId(null);
  }, [selectedTab]);


  return (
    <div className="p-6 max-sm:p-4">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex gap-6">
          {!DEPOSIT_DISABLED && (
            <button
              className={`text-2xl font-medium ${
                selectedTab === "deposit" ? "text-white" : "text-gray-500"
              }`}
              onClick={() => setSelectedTab("deposit")}
            >
              Deposit
            </button>
          )}
          <button
            className={`text-2xl font-medium ${
              selectedTab === "withdraw" ? "text-white" : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("withdraw")}
          >
            Withdraw
          </button>
        </div>
        <div className="text-base text-gray-400">
          Balance:{" "}
          <span className="text-white">${BALANCE.toFixed(1)}</span>
        </div>
      </div>

      <h2 className="text-[32px] font-medium text-white mb-4">
        Connect Wallet to {DEPOSIT_DISABLED ? "Withdraw" : "Deposit"}
      </h2>

      <div className="space-y-0">
        {connectors.map((connector: Connector) => (
          <button
            key={connector.id}
            onClick={() => {
              connect({ connector });
              setPendingConnectorId(connector.id);
            }}
            className="w-full cursor-pointer flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.1)]"
          >
            <div className="flex items-center gap-3">
              <Image
                src={getConnectorIcon(connector.id)}
                alt={connector.name}
                className="w-8 h-8"
                width={20}
                height={20}
              />
              <span className="text-white text-lg">
                {getConnectorName(connector.id)}
              </span>
            </div>
            {Boolean(connector.ready) && (
              <span className="px-3 py-1 rounded-full bg-[#2F4F3A] text-[#A3E5B2] text-sm">
                {isPending && pendingConnectorId === connector.id
                  ? "Connecting..."
                  : "Detected"}
              </span>
            )}
          </button>
        ))}
      </div>

      <button className="w-full mt-4 text-gray-400 flex items-center justify-start gap-2 text-base">
        Show more
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
} 
