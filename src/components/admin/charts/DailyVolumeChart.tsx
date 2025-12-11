"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { TrendingUp } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-old"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"

interface VolumeData {
  date: string
  volume: number
}

const chartConfig = {
  volume: {
    label: "Volume",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function DailyVolumeChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [data, setData] = React.useState<VolumeData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    async function fetchData() {
      try {
        let days = 90
        if (timeRange === "30d") {
          days = 30
        } else if (timeRange === "7d") {
          days = 7
        }

        const response = await fetch(`/api/admin/analytics/daily-volume?days=${days}`, {
          credentials: 'include',
        })
        
        if (response.ok) {
          const result = await response.json()
          setData(result.dailyVolume)
        }
      } catch (error) {
        console.error('Failed to fetch volume data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [timeRange])

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const totalVolume = data.reduce((acc, curr) => acc + curr.volume, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Daily Trade Volume</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Trading volume trends over time
          </span>
          <span className="@[540px]/card:hidden">Volume trends</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex [&_[data-state=on]]:bg-primary [&_[data-state=on]]:text-primary-foreground [&_[data-state=off]:hover]:bg-muted [&_[data-state=off]:hover]:text-muted-foreground"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-volume)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-volume)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => {
                    const num = Number(value)
                    if (num >= 1000000) {
                      return `$${(num / 1000000).toFixed(2)}M`
                    } else if (num >= 1000) {
                      return `$${(num / 1000).toFixed(1)}K`
                    }
                    return `$${num.toFixed(2)}`
                  }}
                />
              }
            />
            <Area
              dataKey="volume"
              type="natural"
              fill="url(#fillVolume)"
              fillOpacity={0.4}
              stroke="var(--color-volume)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        {data.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">
                Total Volume: ${totalVolume >= 1000000 
                  ? `${(totalVolume / 1000000).toFixed(2)}M` 
                  : totalVolume >= 1000 
                    ? `${(totalVolume / 1000).toFixed(1)}K`
                    : totalVolume.toFixed(2)}
              </span>
            </div>
            <span className="text-muted-foreground">
              {data.length} days
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

