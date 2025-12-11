"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface Market {
  id: string
  name: string
  question: string
  volume: number
  totalLiquidity: number
  status: string
  activityCount?: number
}

interface RankingsData {
  byVolume: Market[]
  byLiquidity: Market[]
  byActivity: Array<Market & { activityCount: number }>
}

export function MarketRankingsTable() {
  const [data, setData] = useState<RankingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/analytics/market-rankings', {
          credentials: 'include',
        })
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch market rankings:', error)
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
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Rankings</CardTitle>
        <CardDescription>
          Top performing markets by volume, liquidity, and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="volume">By Volume</TabsTrigger>
            <TabsTrigger value="liquidity">By Liquidity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="volume" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Liquidity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.byVolume.slice(0, 10).map((market, index) => (
                    <TableRow key={market.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="font-medium">{truncateText(market.name, 40)}</div>
                        <div className="text-xs text-muted-foreground">
                          {truncateText(market.question, 50)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(market.volume)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(market.totalLiquidity)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={market.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {market.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="liquidity" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead className="text-right">Liquidity</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.byLiquidity.slice(0, 10).map((market, index) => (
                    <TableRow key={market.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="font-medium">{truncateText(market.name, 40)}</div>
                        <div className="text-xs text-muted-foreground">
                          {truncateText(market.question, 50)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(market.totalLiquidity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(market.volume)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={market.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {market.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

