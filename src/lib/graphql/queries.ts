import { gql } from 'urql';

export const GET_POOL_DATA = gql`
  query GetPoolData($poolId: ID!) {
    pool(id: $poolId) {
      id
      feeTier
      token0 {
        id
        name
        symbol
      }
      token1 {
        id
        name
        symbol
      }
      token0Price
      token1Price
      volumeToken0
      volumeToken1
      volumeUSD
      txCount
      swaps {
        amount0
        amount1
      }
    }
  }
`; 