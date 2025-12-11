import { CustomTooltip } from "@/components/shared/custom-tooltip";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface Network {
  src: string;
  alt: string;
}

interface SupportedNetworksProps {
  networks: Network[];
  label?: string;
}

const SupportedNetworks: React.FC<SupportedNetworksProps> = ({
  networks,
  label = "Supported networks",
}) => {
  return (
    <div className="flex items-center gap-1">
      <CustomTooltip
        className="max-w-[320px] w-fit text-xs"
        align="start"
        name="We support tokens on Arbitrum, Base and Mainnet (ETH). More coming
          soon."
      >
        <div className="flex items-center">
          {networks.map((net, idx) => (
            <Image
              key={idx}
              src={net.src}
              alt={net.alt}
              className={cn(
                "w-5 h-5 rounded-full pointer object-cover  border-[2px] border-[#16171E]",
                idx >= 1 && "ml-[-8px]"
              )}
              width={20}
              height={20}
            />
          ))}
        </div>
      </CustomTooltip>

      <span className="text-[#FFFFFF52] text-sm font-normal">{label}</span>
    </div>
  );
};

export default SupportedNetworks;
