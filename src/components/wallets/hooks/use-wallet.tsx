import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import { useAccount } from "wagmi";
import { getConnectorIcon, getConnectorName } from "@/utils";

type TWallet = {
  name: string;
  icon: string;
  address: string;
};

const useWallet = ({ userId }: { userId: string }) => {
  const { dbUser } = useAuthContext();
  const { address: connectedAddress, connector } = useAccount();
  
  return useQuery({
    queryKey: ["my-wallets", userId, connectedAddress, connector?.id],
    queryFn: async () => {
      const wallets: TWallet[] = [];
      
      if (dbUser?.walletAddress) {
        wallets.push({
          name: "Bluff Wallet",
          icon: "/images/simul.png",
          address: dbUser.walletAddress,
        });
      }
      
      if (connectedAddress && connector && connectedAddress !== dbUser?.walletAddress) {
        wallets.push({
          name: getConnectorName(connector.id),
          icon: getConnectorIcon(connector.id),
          address: connectedAddress,
        });
      }
      
      return wallets;
    },
    enabled: !!userId && !!dbUser,
  });
};

export default useWallet;
