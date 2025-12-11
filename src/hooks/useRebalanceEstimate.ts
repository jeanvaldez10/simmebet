import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import useMarketTokens from "@/hooks/useMarketTokens";
import { useReadContract } from "wagmi";
import SimpleRouterAbi from "@/abis/SimpleRouter.json";
import { SIMPLE_ROUTER_ADDRESS } from "@/constants";
import { parseUnits } from "viem";
import { Odds } from "@/utils/uniswap-math";

export type RebalanceEstimateParams = {
	marketContractAddress: `0x${string}`;
	amountUsd: string; // USDC/fiat input amount in dollars
	beliefPercentage: number; // 0-100
	selectedSide: "yes" | "no";
};

export function useRebalanceEstimate({
	marketContractAddress,
	amountUsd,
	beliefPercentage,
	selectedSide,
}: RebalanceEstimateParams) {
	const { walletAddress } = useAuth();
	const { tokenABalance, tokenBBalance } = useMarketTokens(marketContractAddress);

	const { sqrtPrice, mintAmount } = useMemo(() => {
		// Compute sqrtPrice from belief
		let computedSqrt: bigint | undefined;
		let odds: Odds | undefined;

		if (beliefPercentage === 0) {
			computedSqrt = BigInt("1456195216270955103206513029158776779468408838535");
		} else if (beliefPercentage === 100) {
			computedSqrt = BigInt(
				"4310618292"
			);
		} else {
			try {
				const odds = new Odds(1 - beliefPercentage / 100);
				computedSqrt = BigInt(odds.sqrtPrice().valueOf());
			} catch {
				computedSqrt = undefined;
			}
		}

		// Prepare mint amount from user input (assume 6 decimals stablecoin)
		let parsed = 0n;
		try {
			const sanitized = amountUsd && !isNaN(Number(amountUsd)) ? amountUsd : "0";
			parsed = parseUnits(sanitized, 6);
		} catch {
			parsed = 0n;
		}

		return { sqrtPrice: computedSqrt, mintAmount: parsed, odds };
	}, [amountUsd, beliefPercentage]);

	// Only make contract call if we have valid inputs and wallet
	const shouldMakeCall = useMemo(() => {
		return (
			!!walletAddress &&
			!!marketContractAddress &&
			sqrtPrice !== undefined &&
			beliefPercentage >= 0 &&
			beliefPercentage <= 100 &&
			(tokenABalance !== undefined || tokenBBalance !== undefined)
		);
	}, [walletAddress, marketContractAddress, sqrtPrice, beliefPercentage, tokenABalance, tokenBBalance]);

	const { data, error, isLoading } = useReadContract({
		address: SIMPLE_ROUTER_ADDRESS,
		abi: SimpleRouterAbi.abi,
		functionName: "rebalanceToPrice",
		args: [
			marketContractAddress,
			mintAmount,
			tokenABalance,
			tokenBBalance,
			sqrtPrice,
			"",
		],
		chainId: 42161,
		account: walletAddress,
		query: {
			enabled: shouldMakeCall,
			staleTime: 5 * 1000, // Consider data fresh for 5 seconds
			refetchInterval: 10 * 1000, // Refetch every 10 seconds
		},
	});

	let token0Out: bigint | undefined;
	let token1Out: bigint | undefined;
	if (Array.isArray(data) && data.length >= 2) {
		const maybe0 = data[0] as unknown;
		const maybe1 = data[1] as unknown;
		token0Out = typeof maybe0 === "bigint" ? (maybe0 as bigint) : undefined;
		token1Out = typeof maybe1 === "bigint" ? (maybe1 as bigint) : undefined;
	}

	return {
		token0Out,
		token1Out,
		isEstimating: isLoading && shouldMakeCall,
		error: shouldMakeCall ? error : undefined,
		// surface useful inputs in case caller wants to show them
		sqrtPrice,
		mintAmount,
		selectedSide,
	};
}

export default useRebalanceEstimate; 
