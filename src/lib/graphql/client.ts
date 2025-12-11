import { createClient } from 'urql';
import { cacheExchange, fetchExchange } from '@urql/core';

export const client = createClient({
  url: 'https://gateway.thegraph.com/api/subgraphs/id/G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r',
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}`,
    },
  },
  exchanges: [cacheExchange, fetchExchange],
}); 