import axios from "axios";
import JSBI from 'jsbi'
import { FeeAmount } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'

import {createBarChartTicks} from "./activeLiquidity"
import { GraphTick, BarChartTick } from "./interfaces"

interface Pool {
  liquidity: JSBI
  tickCurrent: number
}
const TICK_SPACING = 500;

async function loadTicks(poolAddress: string, skip: number = 0): Promise<{ ticks: GraphTick[], pool: Pool }> {
  const API_KEY = "20b6ce25b058e7b6067d5f1943b4ace3";
  const response = await axios.post(
    `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/655x11nEGRudi5Nh4attV1uMt2YnyFRMaSKRM5QndXLK`,
    {
      "query": `{ ticks(
          where: {poolAddress: "${poolAddress.toLowerCase()}", liquidityNet_not: "0"}
          first: 1000,
          skip: ${skip},
          orderBy: tickIdx,
          orderDirection: asc
        ) {
          tickIdx
          liquidityGross
          liquidityNet
        },
        pool(id: "${poolAddress}") {
          tick
          liquidity
        }
      }`
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return {
    ticks: response.data.data.ticks,
    pool: {
      liquidity: JSBI.BigInt(response.data.data.pool.liquidity),
      tickCurrent: Number(response.data.data.pool.tick),
    }
  }
}

export async function loadGraphBins(poolAddress: string): Promise<BarChartTick[]> {
  const { ticks, pool } = await loadTicks(poolAddress)

  const tokenA = new Token(
    1,
    "0x0000000000000000000000000000000000000000",
    18,
    "A",
    "A"
  )

  const tokenB = new Token(
    1,
    "0x0000000000000000000000000000000000000001",
    18,
    "B",
    "B"
  )

  const barChartTicks = await createBarChartTicks(
    pool.tickCurrent,
    pool.liquidity,
    TICK_SPACING,
    tokenA,
    tokenB,
    50,
    FeeAmount.LOW,
    ticks
  )
  return barChartTicks
}
