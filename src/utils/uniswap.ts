interface UniswapPositionData {
  tokenId: string;
  poolId: string;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
  depositedToken0: string;
  depositedToken1: string;
  withdrawnToken0: string;
  withdrawnToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  tokensOwed0: string;
  tokensOwed1: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimals: number;
  token1Decimals: number;
}

export async function fetchUniswapPosition(tokenId: string, chainId: number = 42161): Promise<UniswapPositionData | null> {
  try {
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'connect-protocol-version': '1',
      'content-type': 'application/json',
      'origin': 'https://app.uniswap.org',
      'referer': 'https://app.uniswap.org/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    };

    const jsonData = {
      chainId,
      protocolVersion: 'PROTOCOL_VERSION_V4',
      tokenId,
    };

    const response = await fetch('https://interface.gateway.uniswap.org/v2/pools.v1.PoolsService/GetPosition', {
      method: 'POST',
      headers,
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) {
      console.error(`Failed to fetch Uniswap position ${tokenId}:`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data || !data.position || !data.position.v4Position || !data.position.v4Position.poolPosition) {
      console.error(`No position data found for token ${tokenId}`);
      return null;
    }

    const poolPosition = data.position.v4Position.poolPosition;
    
    // Validate required fields exist
    if (!poolPosition.token0 || !poolPosition.token1) {
      console.error(`Invalid position data structure for token ${tokenId}: missing token information`);
      return null;
    }
    
    return {
      tokenId: poolPosition.tokenId || tokenId,
      poolId: poolPosition.poolId || '',
      liquidity: poolPosition.liquidity || '0',
      tickLower: parseInt(poolPosition.tickLower) || 0,
      tickUpper: parseInt(poolPosition.tickUpper) || 0,
      depositedToken0: poolPosition.amount0 || '0',
      depositedToken1: poolPosition.amount1 || '0',
      withdrawnToken0: '0', // Not available in this response
      withdrawnToken1: '0', // Not available in this response
      collectedFeesToken0: poolPosition.token0UncollectedFees || '0',
      collectedFeesToken1: poolPosition.token1UncollectedFees || '0',
      tokensOwed0: poolPosition.token0UncollectedFees || '0',
      tokensOwed1: poolPosition.token1UncollectedFees || '0',
      token0Symbol: poolPosition.token0.symbol || 'UNKNOWN',
      token1Symbol: poolPosition.token1.symbol || 'UNKNOWN',
      token0Decimals: poolPosition.token0.decimals || 18,
      token1Decimals: poolPosition.token1.decimals || 18,
    };
  } catch (error) {
    console.error(`Error fetching Uniswap position ${tokenId}:`, error);
    return null;
  }
}

export async function fetchMultipleUniswapPositions(tokenIds: string[], chainId: number = 42161): Promise<Map<string, UniswapPositionData>> {
  const results = new Map<string, UniswapPositionData>();
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < tokenIds.length; i += batchSize) {
    const batch = tokenIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (tokenId) => {
      const position = await fetchUniswapPosition(tokenId, chainId);
      if (position) {
        results.set(tokenId, position);
      }
      // Add small delay between requests to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await Promise.all(batchPromises);
    
    // Add delay between batches
    if (i + batchSize < tokenIds.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}
