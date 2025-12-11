"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface Market {
  id: string
  name: string
  totalLiquidity: number
}

const chartConfig = {
  liquidity: {
    label: "Liquidity",
  },
} satisfies ChartConfig

export function LiquidityChart() {
  const [data, setData] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/analytics/market-rankings', {
          credentials: 'include',
        })
        if (response.ok) {
          const result = await response.json()
          setData(result.byLiquidity.slice(0, 5))
        }
      } catch (error) {
        console.error('Failed to fetch liquidity data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const truncateName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength) + '...'
  }

  const chartData = data.map((market, index) => ({
    market: truncateName(market.name, 20),
    liquidity: market.totalLiquidity,
    fill: `var(--chart-${(index % 5) + 1})`,
  }))

  if (loading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Market Liquidity Distribution</CardTitle>
        <CardDescription>Top markets by liquidity depth</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="market"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
            />
            <XAxis dataKey="liquidity" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value) => formatCurrency(Number(value))}
              />}
            />
            <Bar dataKey="liquidity" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Top {data.length} markets by liquidity <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Real-time liquidity distribution across active markets
        </div>
      </CardFooter>
    </Card>
  )
}
