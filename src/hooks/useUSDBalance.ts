import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { useEffect, useState } from "react";
import { ARBITRUM_USDC_CONTRACT_ADDRESS } from "@/constants";
import { roundDownToCent } from "@/utils/format";

export const useUSDBalance = (address: `0x${string}` | undefined) => {
  const [usdBalance, setUsdBalance] = useState<string>("0.00");
  // const [isLoading, setIsLoading] = useState(true);
  // const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
  //   address,
  // });

  const {
    data: usdcTokenBalance,
    isLoading: isUSDCLoading,
    error,
    failureReason,
  } = useReadContract({
    address: ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  if (error || failureReason) {
    console.log("error", error, failureReason);
  }

  useEffect(() => {
    const fetchUSDPrice = async () => {
      if (!usdcTokenBalance || !address) {
        setUsdBalance("0.00");
        // setIsLoading(false);
        return;
      }

      try {
        const balanceInUSD =
          parseFloat((Number(usdcTokenBalance) / 1e6).toString());
        setUsdBalance(roundDownToCent(balanceInUSD));
      } catch (error) {
        console.error("Error fetching USD price:", error);
        setUsdBalance("0.00");
      } finally {
        // setIsLoading(false);
      }
    };

    fetchUSDPrice();
  }, [usdcTokenBalance, address]);

  return {
    usdBalance,
    isLoading: isUSDCLoading,
  };
};
