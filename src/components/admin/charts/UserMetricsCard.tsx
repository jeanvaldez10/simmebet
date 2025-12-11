"use client"

import { useEffect, useState } from "react"
import { Users, UserPlus, TrendingUp, Activity } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface UserMetrics {
  totalUsers: number
  usersWithPositions: number
  liquidityProviders: number
  retentionRate: number
  activeUsers7d: number
  averageBetSize: number
  userBehavior: {
    bettorPercentage: number
    lpPercentage: number
  }
}

export function UserMetricsCard() {
  const [data, setData] = useState<UserMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching user metrics from frontend...')
        const response = await fetch('/api/admin/analytics/user-metrics', {
          credentials: 'include',
        })
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('User metrics received:', result)
          setData(result)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch user metrics. Status:', response.status, 'Error:', errorText)
        }
      } catch (error) {
        console.error('Failed to fetch user metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Metrics</CardTitle>
        <CardDescription>Platform user statistics and engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Total Users
            </div>
            <div className="text-2xl font-bold">{data?.totalUsers.toLocaleString() || 0}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Active (7d)
            </div>
            <div className="text-2xl font-bold">{data?.activeUsers7d.toLocaleString() || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              Users with Bets
            </div>
            <div className="text-2xl font-bold">{data?.usersWithPositions.toLocaleString() || 0}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              LP Providers
            </div>
            <div className="text-2xl font-bold">{data?.liquidityProviders.toLocaleString() || 0}</div>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Retention Rate (2+ bets)</span>
            <span className="text-sm font-semibold">{data?.retentionRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average Bet Size</span>
            <span className="text-sm font-semibold">{data ? formatCurrency(data.averageBetSize) : '$0'}</span>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="text-sm font-medium">User Behavior (7d)</div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bettors</span>
            <span className="text-sm font-semibold">{data?.userBehavior.bettorPercentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">LP Providers</span>
            <span className="text-sm font-semibold">{data?.userBehavior.lpPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

