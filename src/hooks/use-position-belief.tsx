import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import { useMarkets } from "@/hooks/useMarkets";
import { useAllMarketBalances } from "@/hooks/useAllMarketBalances";
import { calculateMarketPositionEV } from "@/utils";
import { useUserBeliefs } from "@/hooks/useUserBeliefs";
import { useMarketProfits } from "@/hooks/useMarketProfits";
import { useUserLiquidityPositions, UserLiquidityPosition } from "@/hooks/useUserLiquidityPositions";

export interface PositionApiResponse {
  id: string;
  amount: number;
  bought: boolean;
  profit: number;
  timestamp: string;
  market?: {
    name?: string;
    question?: string;
    image?: string;
    yesPercentage?: number;
    noPercentage?: number;
    status?: string;
    contractAddress?: string;
  };
}

export interface IPositionBelief {
  id: number;
  marketId: string;
  token: string;
  tokenImage: string;
  yesBet: number;
  noBet: number;
  beliefType: string;
  type: "bet" | "liquidity"; // Type of position - "liquidity" if has LP, otherwise "bet"

  profit: string;
  profitAmount: string;

  expectedValue: {
    yes: number;
    no: number;
  };
  currentMarketOdds: number;
  pending: string;
  status: "Ongoing" | "Won" | "Loss";
  statusTime: string;
  marketAddress?: string;
  marketDate?: string | Date | null;
  
  // Resolution fields
  isResolved: boolean;
  hasWinningPosition: boolean; // Can they claim winnings?
  
  // LP specific fields (only populated for liquidity positions)
  lpNftId?: string | null;
  lpFeesCollected?: number;
  lpLowerOdds?: number | null;
  lpUpperOdds?: number | null;
}


export default function usePositionBelief(
  userId: string,
  enabled: boolean,
): UseQueryResult<IPositionBelief[], Error> {
  const { dbUser } = useAuthContext();
  const { data: markets } = useMarkets();
  const { data: balances } = useAllMarketBalances();
  const { data: marketProfits } = useMarketProfits() as { data: Record<string, number> | undefined };
  const { data: userBeliefs } = useUserBeliefs();
  const { data: liquidityPositions } = useUserLiquidityPositions();

  return useQuery({
    queryKey: [
      "positionBelief",
      userId,
      dbUser?.walletAddress,
      markets?.length || 0,
      Object.keys(balances || {}).length || 0,
      Object.keys(marketProfits || {}).length || 0,
      userBeliefs?.length || 0,
      liquidityPositions?.length || 0,
    ],
    queryFn: async () => {
      if (!enabled) {
        return [];
      }
      if (!dbUser?.walletAddress) {
        return [];
      }
      if (!markets) {
        return [];
      }

      const beliefsByMarket = (userBeliefs || []).reduce((acc, belief) => {
        acc[belief.marketId] = belief;
        return acc;
      }, {} as Record<string, { marketId: string; belief: number; lastUpdated: Date; action: string; }>);

      // Create a map of LP positions by marketId for easy lookup
      const lpPositionsByMarket = (liquidityPositions || []).reduce((acc, lp) => {
        if (!acc[lp.marketId]) {
          acc[lp.marketId] = [];
        }
        acc[lp.marketId].push(lp);
        return acc;
      }, {} as Record<string, UserLiquidityPosition[]>);

      const items: IPositionBelief[] = [];
      const processedMarkets = new Set<string>();

      // Dust threshold - ignore amounts smaller than this (0.001 tokens = $0.001)
      const DUST_THRESHOLD = 0.001;

      // First, process all markets that have either token balances or LP positions
      markets.forEach((market) => {
        const marketBalances = balances?.[market.contractAddress];
        const walletYes = marketBalances?.yes || 0;
        const walletNo = marketBalances?.no || 0;
        const lpPositions = lpPositionsByMarket[market.id] || [];
        
        // Aggregate LP position token holdings across all LP positions for this market
        // token0Balance = NO tokens, token1Balance = YES tokens
        const lpYes = lpPositions.reduce((sum, lp) => {
          return sum + (lp.token1Balance ? Number(lp.token1Balance) : 0);
        }, 0);
        const lpNo = lpPositions.reduce((sum, lp) => {
          return sum + (lp.token0Balance ? Number(lp.token0Balance) : 0);
        }, 0);
        
        // Check for meaningful token amounts (above dust threshold)
        const hasWalletTokens = walletYes > DUST_THRESHOLD || walletNo > DUST_THRESHOLD;
        const hasLpPosition = lpPositions.length > 0;

        // Only include markets where the user has a meaningful wallet balance OR an LP position
        if (!hasWalletTokens && !hasLpPosition) {
          return;
        }

        processedMarkets.add(market.id);

        const latestPrice = typeof market.yesPrice === "number" ? market.yesPrice : 0;
        const marketBelief = beliefsByMarket[market.id];
        const yesPctRaw = marketBelief 
          ? marketBelief.belief 
          : typeof market.yesPercentage === "number"
            ? market.yesPercentage
            : (latestPrice || 0) * 100;

        // Determine if market is resolved
        const isResolved = market.isResolved || market.status === "RESOLVED";
        
        const marketProfit = marketProfits?.[market.id] || 0;

        // Helper function to calculate status for a position
        const calculateStatus = (yesAmount: number, noAmount: number): { status: IPositionBelief["status"], hasWinningPosition: boolean } => {
          let status: IPositionBelief["status"] = "Ongoing";
          let hasWinningPosition = false;
          
          if (isResolved) {
            // Check if this is a tie
            if (market.resolvedOption === "Tie" || market.isTie) {
              status = "Loss"; // In a tie, everyone loses
            } else {
              // Check if resolved option matches YES side (handles both "Yes" and custom names)
              const isYesWon = 
                market.resolvedOption === "Yes" || 
                market.resolvedOption === "YES" ||
                market.resolvedOption === market.yesSideName;
              
              // Check if resolved option matches NO side (handles both "No" and custom names)
              const isNoWon = 
                market.resolvedOption === "No" || 
                market.resolvedOption === "NO" ||
                market.resolvedOption === market.noSideName;
              
              // Determine if user won
              if ((isYesWon && yesAmount > 0) || (isNoWon && noAmount > 0)) {
                status = "Won";
                hasWinningPosition = true;
              } else if (yesAmount > 0 || noAmount > 0) {
                status = "Loss";
              } else {
                status = "Ongoing"; // No tokens held
              }
            }
          }
          
          return { status, hasWinningPosition };
        };

        // If user has BOTH wallet tokens AND LP position, create TWO separate rows
        if (hasWalletTokens && hasLpPosition) {
          // Create wallet position row
          const walletEV = calculateMarketPositionEV(
            walletYes,
            walletNo,
            yesPctRaw / 100,
            market.noPrice,
          );
          
          const walletStatus = calculateStatus(walletYes, walletNo);
          
          // For wallet position, profit is based on wallet tokens only
          const walletValue = (walletYes * market.yesPrice) + (walletNo * market.noPrice);
          const walletProfit = walletValue + (marketProfit * (walletValue / ((walletYes + lpYes) * market.yesPrice + (walletNo + lpNo) * market.noPrice || 1)));
          
          const walletPositionItem: IPositionBelief = {
            id: items.length + 1,
            marketId: market.id,
            token: market.name,
            tokenImage: market.image || "/images/cup.png",
            yesBet: Number(walletYes.toFixed(2)),
            noBet: Number(walletNo.toFixed(2)),
            expectedValue: { yes: walletEV.yesEV, no: walletEV.noEV },
            currentMarketOdds: yesPctRaw,
            beliefType: "Active",
            type: "bet",
            profit: walletProfit.toFixed(2),
            profitAmount: Math.abs(walletProfit).toFixed(2),
            pending: market.status === "ACTIVE" ? "yes" : "no",
            status: walletStatus.status,
            statusTime: new Date().toLocaleString(),
            marketAddress: market.contractAddress,
            marketDate: market.date,
            isResolved,
            hasWinningPosition: walletStatus.hasWinningPosition,
            lpNftId: null,
          };
          
          items.push(walletPositionItem);
          
          // Create LP position row
          let liquidityValue = 0;
          let liquidityFees = 0;
          lpPositions.forEach(lp => {
            const token0Balance = lp.token0Balance ? Number(lp.token0Balance) : 0;
            const token1Balance = lp.token1Balance ? Number(lp.token1Balance) : 0;
            
            const noTokenValue = token0Balance * (market.noPrice || 0);
            const yesTokenValue = token1Balance * (market.yesPrice || 0);
            liquidityValue += noTokenValue + yesTokenValue;
            
            liquidityFees += Number(lp.token0FeesCollected) + Number(lp.token1FeesCollected);
          });
          
          const lpEV = calculateMarketPositionEV(
            lpYes,
            lpNo,
            yesPctRaw / 100,
            market.noPrice,
          );
          
          const lpStatus = calculateStatus(lpYes, lpNo);
          const lpProfit = liquidityValue + liquidityFees + (marketProfit * (liquidityValue / ((walletYes + lpYes) * market.yesPrice + (walletNo + lpNo) * market.noPrice || 1)));
          
          const lpPositionItem: IPositionBelief = {
            id: items.length + 1,
            marketId: market.id,
            token: market.name,
            tokenImage: market.image || "/images/cup.png",
            yesBet: Number(lpYes.toFixed(2)),
            noBet: Number(lpNo.toFixed(2)),
            expectedValue: { yes: lpEV.yesEV, no: lpEV.noEV },
            currentMarketOdds: yesPctRaw,
            beliefType: "Active",
            type: "liquidity",
            profit: lpProfit.toFixed(2),
            profitAmount: Math.abs(lpProfit).toFixed(2),
            pending: market.status === "ACTIVE" ? "yes" : "no",
            status: lpStatus.status,
            statusTime: new Date().toLocaleString(),
            marketAddress: market.contractAddress,
            marketDate: market.date,
            isResolved,
            hasWinningPosition: lpStatus.hasWinningPosition,
            lpNftId: lpPositions.length > 0 ? lpPositions[0].nftId : null,
            lpFeesCollected: liquidityFees > 0 ? liquidityFees : undefined,
            lpLowerOdds: lpPositions.length > 0 ? lpPositions[0].lowerOdds : null,
            lpUpperOdds: lpPositions.length > 0 ? lpPositions[0].upperOdds : null,
          };
          
          items.push(lpPositionItem);
          
        } else if (hasWalletTokens) {
          // Only wallet position - create single row
          const walletEV = calculateMarketPositionEV(
            walletYes,
            walletNo,
            yesPctRaw / 100,
            market.noPrice,
          );
          
          const walletStatus = calculateStatus(walletYes, walletNo);
          const walletValue = (walletYes * market.yesPrice) + (walletNo * market.noPrice);
          const walletProfit = walletValue + marketProfit;
          
          const positionItem: IPositionBelief = {
            id: items.length + 1,
            marketId: market.id,
            token: market.name,
            tokenImage: market.image || "/images/cup.png",
            yesBet: Number(walletYes.toFixed(2)),
            noBet: Number(walletNo.toFixed(2)),
            expectedValue: { yes: walletEV.yesEV, no: walletEV.noEV },
            currentMarketOdds: yesPctRaw,
            beliefType: "Active",
            type: "bet",
            profit: walletProfit.toFixed(2),
            profitAmount: Math.abs(walletProfit).toFixed(2),
            pending: market.status === "ACTIVE" ? "yes" : "no",
            status: walletStatus.status,
            statusTime: new Date().toLocaleString(),
            marketAddress: market.contractAddress,
            marketDate: market.date,
            isResolved,
            hasWinningPosition: walletStatus.hasWinningPosition,
            lpNftId: null,
          };
          
          items.push(positionItem);
          
        } else if (hasLpPosition) {
          // Only LP position - create single row
          let liquidityValue = 0;
          let liquidityFees = 0;
          lpPositions.forEach(lp => {
            const token0Balance = lp.token0Balance ? Number(lp.token0Balance) : 0;
            const token1Balance = lp.token1Balance ? Number(lp.token1Balance) : 0;
            
            const noTokenValue = token0Balance * (market.noPrice || 0);
            const yesTokenValue = token1Balance * (market.yesPrice || 0);
            liquidityValue += noTokenValue + yesTokenValue;
            
            liquidityFees += Number(lp.token0FeesCollected) + Number(lp.token1FeesCollected);
          });
          
          const lpEV = calculateMarketPositionEV(
            lpYes,
            lpNo,
            yesPctRaw / 100,
            market.noPrice,
          );
          
          const lpStatus = calculateStatus(lpYes, lpNo);
          const lpProfit = liquidityValue + liquidityFees + marketProfit;
          
          const positionItem: IPositionBelief = {
            id: items.length + 1,
            marketId: market.id,
            token: market.name,
            tokenImage: market.image || "/images/cup.png",
            yesBet: Number(lpYes.toFixed(2)),
            noBet: Number(lpNo.toFixed(2)),
            expectedValue: { yes: lpEV.yesEV, no: lpEV.noEV },
            currentMarketOdds: yesPctRaw,
            beliefType: "Active",
            type: "liquidity",
            profit: lpProfit.toFixed(2),
            profitAmount: Math.abs(lpProfit).toFixed(2),
            pending: market.status === "ACTIVE" ? "yes" : "no",
            status: lpStatus.status,
            statusTime: new Date().toLocaleString(),
            marketAddress: market.contractAddress,
            marketDate: market.date,
            isResolved,
            hasWinningPosition: lpStatus.hasWinningPosition,
            lpNftId: lpPositions.length > 0 ? lpPositions[0].nftId : null,
            lpFeesCollected: liquidityFees > 0 ? liquidityFees : undefined,
            lpLowerOdds: lpPositions.length > 0 ? lpPositions[0].lowerOdds : null,
            lpUpperOdds: lpPositions.length > 0 ? lpPositions[0].upperOdds : null,
          };
          
          items.push(positionItem);
        }
      });

      // Add any LP positions for markets that weren't already included
      // (LP-only positions that don't have token balances)
      Object.keys(lpPositionsByMarket).forEach((marketId) => {
        if (!processedMarkets.has(marketId)) {
          const market = markets.find(m => m.id === marketId);
          if (!market) return;

          const lpPositions = lpPositionsByMarket[marketId] || [];
          if (lpPositions.length === 0) return;

          processedMarkets.add(marketId);

          const marketProfit = marketProfits?.[market.id] || 0;
          const isLpResolved = market.isResolved || market.status === "RESOLVED";
          const status: IPositionBelief["status"] =
            market.status === "ACTIVE"
              ? "Ongoing"
              : market.status === "RESOLVED"
              ? "Loss" // LP only means no token position to win with
              : "Ongoing";

          // Calculate liquidity position value (using same logic as market page)
          // Aggregate across all LP positions for this market
          let liquidityValue = 0;
          let liquidityFees = 0;
          let totalLpYes = 0;
          let totalLpNo = 0;

          console.log('lpPositions', lpPositions);
          
          lpPositions.forEach(lp => {
            const token0Balance = lp.token0Balance ? Number(lp.token0Balance) : 0;
            const token1Balance = lp.token1Balance ? Number(lp.token1Balance) : 0;
            
            // Calculate USD value using market prices (same as PositionSummaryCard)
            const noTokenValue = token0Balance * (market.noPrice || 0);
            const yesTokenValue = token1Balance * (market.yesPrice || 0);
            liquidityValue += noTokenValue + yesTokenValue;
            
            // Calculate fees collected
            liquidityFees += Number(lp.token0FeesCollected) + Number(lp.token1FeesCollected);
            
            // Aggregate token balances
            totalLpYes += token0Balance;
            totalLpNo += token1Balance;
          });
          
          // Calculate total P&L including liquidity value
          // For LP-only positions, marketProfit is negative investment, so we add it to current value
          const totalProfit = liquidityValue + liquidityFees + marketProfit; // marketProfit is already negative investment

          const positionItem: IPositionBelief = {
            id: items.length + 1,
            marketId: marketId,
            token: market.name,
            tokenImage: market.image || "/images/cup.png",
            yesBet: totalLpYes, // Show LP token holdings
            noBet: totalLpNo,   // Show LP token holdings
            expectedValue: { yes: totalLpYes * (market.yesPrice || 0), no: totalLpNo * (market.noPrice || 0) },
            currentMarketOdds: typeof market.yesPercentage === "number" 
              ? market.yesPercentage 
              : (market.yesPrice || 0) * 100,
            beliefType: "Active",
            type: "liquidity",
            profit: totalProfit.toFixed(2),
            profitAmount: Math.abs(totalProfit).toFixed(2),
            pending: market.status === "ACTIVE" ? "yes" : "no",
            status,
            statusTime: new Date().toLocaleString(),
            marketAddress: market.contractAddress,
            marketDate: market.date,
            // Resolution fields - LP-only positions can't claim tokens
            isResolved: isLpResolved,
            hasWinningPosition: false, // No tokens to claim for LP-only positions
            lpNftId: lpPositions.length > 0 ? lpPositions[0].nftId : null,
            lpFeesCollected: liquidityFees > 0 ? liquidityFees : undefined,
            lpLowerOdds: lpPositions.length > 0 ? lpPositions[0].lowerOdds : null,
            lpUpperOdds: lpPositions.length > 0 ? lpPositions[0].upperOdds : null,
          };

          items.push(positionItem);
        }
      });

      // Filter out resolved markets with nothing to claim
      const filteredItems = items.filter(item => {
        // Keep all ongoing markets
        if (!item.isResolved) return true;
        
        // For resolved markets, only keep if there's something to claim
        return item.hasWinningPosition;
      });

      return filteredItems;
    },
    staleTime: 30000,
    enabled: !!userId && enabled,
  });
}
