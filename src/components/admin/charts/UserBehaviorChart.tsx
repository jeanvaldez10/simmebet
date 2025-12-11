"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

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

interface UserBehaviorData {
  totalUsers: number
  usersWithPositions: number
  liquidityProviders: number
  onlyBettors: number
  onlyLPs: number
  both: number
}

const chartConfig = {
  users: {
    label: "Users",
  },
  traders: {
    label: "Traders Only",
    color: "var(--chart-1)",
  },
  bookies: {
    label: "LPs Only",
    color: "var(--chart-2)",
  },
  both: {
    label: "Both",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function UserBehaviorChart() {
  const [data, setData] = React.useState<UserBehaviorData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/analytics/user-behavior', {
          credentials: 'include',
        })
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch user behavior:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  const chartData = React.useMemo(() => {
    if (!data) return []
    return [
      { behavior: "traders", users: data.onlyBettors, fill: "var(--color-traders)" },
      { behavior: "bookies", users: data.onlyLPs, fill: "var(--color-bookies)" },
      { behavior: "both", users: data.both, fill: "var(--color-both)" },
    ]
  }, [data])

  const totalUsers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.users, 0)
  }, [chartData])

  const activePercentage = data && data.totalUsers > 0
    ? ((totalUsers / data.totalUsers) * 100).toFixed(1)
    : "0"

  if (loading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <Skeleton className="mx-auto aspect-square max-h-[250px]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>User Behavior Distribution</CardTitle>
        <CardDescription>Trading vs Liquidity Provision Patterns</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="users"
              nameKey="behavior"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activePercentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Active Users
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {activePercentage}% of users are active <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {totalUsers.toLocaleString()} active users out of {data?.totalUsers.toLocaleString() || 0} total
        </div>
      </CardFooter>
    </Card>
  )
}
