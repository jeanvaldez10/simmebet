import { useMemo } from "react";
import { Abi } from "viem";
import { useAuth } from "@/hooks/useAuth";
import { useReadContract } from "wagmi";
// import SimpleRouterAbi from "@/abis/SimpleRouter.json";
// import { SIMPLE_ROUTER_ADDRESS } from "@/constants";
import MarketQuoterAbi from "@/abis/MarketQuoter.json";
import { formatUnits, parseUnits } from "viem";
import { Odds, getSqrtPriceAtTick } from "@/utils/uniswap-math";

export type RebalanceEstimateParams = {
	marketContractAddress: `0x${string}`;
	amountUsd: string; // USDC/fiat input amount in dollars
	beliefPercentage: number; // 0-100
};

export function usePlaceEstimate({
	marketContractAddress,
	amountUsd,
	beliefPercentage,
}: RebalanceEstimateParams) {
	const { walletAddress } = useAuth();

	const { sqrtPrice, mintAmount } = useMemo(() => {
		// Compute sqrtPrice from belief
		let computedSqrt: bigint | undefined;
		if (beliefPercentage === 0) {
			computedSqrt = BigInt("1456195216270955103206513029158776779468408838535");
		} else if (beliefPercentage === 100) {
			computedSqrt = BigInt(
				"4310618292"
			);
		} else {
			try {
				const odds = new Odds(1 - beliefPercentage / 100);
				// Convert to tick first, then ensure it's on proper tick spacing
				const tick = odds.tick();
				// Use tick spacing of 60 (typical for this application)
				const roundedTick = tick.nearestTick(200, true);
				// Convert back to sqrt price
				computedSqrt = getSqrtPriceAtTick(roundedTick.valueOf());
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

		return { sqrtPrice: computedSqrt, mintAmount: parsed };
	}, [amountUsd, beliefPercentage]);

	// Only make contract call if we have valid inputs and wallet
	const shouldMakeCall = useMemo(() => {
		return (
			mintAmount > 0n &&
			sqrtPrice !== undefined &&
			!!marketContractAddress &&
			beliefPercentage >= 0 &&
			beliefPercentage <= 100
		);
	}, [mintAmount, sqrtPrice, walletAddress, marketContractAddress, beliefPercentage]);

	const { data: simulationData, error, isLoading } = useReadContract({
		address: MarketQuoterAbi.address as `0x${string}`,
		abi: MarketQuoterAbi.abi as Abi,
		functionName: "estimateMintAndSwapToPrice",
		args: [
			marketContractAddress,
			mintAmount,
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

	if (simulationData !== undefined) {
		const [currency0Balance, currency1Balance] = simulationData as [bigint, bigint];
		return {
			currency0Balance: formatUnits(currency0Balance, 18),
			currency1Balance: formatUnits(currency1Balance, 18),
			isEstimating: false,
			error: undefined,
		};
	}

	return {
		currency0Balance: undefined,
		currency1Balance: undefined,
		isEstimating: isLoading && shouldMakeCall,
		error: shouldMakeCall ? error : undefined,
	};
}

export default usePlaceEstimate;
