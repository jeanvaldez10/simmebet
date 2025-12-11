"use client"

import { SectionCards } from "@/components/admin/SectionCards"
import { DailyVolumeChart } from "@/components/admin/charts/DailyVolumeChart"
// import { LiquidityChart } from "@/components/admin/charts/LiquidityChart"
// import { RevenueChart } from "@/components/admin/charts/RevenueChart"
// import { UserBehaviorChart } from "@/components/admin/charts/UserBehaviorChart"
import { UserSignupsChart } from "@/components/admin/charts/UserSignupsChart"
import { UserMetricsCard } from "@/components/admin/charts/UserMetricsCard"
import { MarketRankingsTable } from "@/components/admin/MarketRankingsTable"
import { CheckCircle2 } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Success Banner */}
      <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Live Data Dashboard
            </h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-300">
              All metrics are now displaying real-time data from your platform. 
              Data refreshes automatically to keep you up to date.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform analytics and performance overview
          </p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <SectionCards />
      
      {/* Daily Volume Chart - Full Width */}
      <DailyVolumeChart />
      
      {/* Market Rankings Table - Full Width */}
      <MarketRankingsTable />
      
      {/* Charts Grid - 2 Column */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserSignupsChart />
        <UserMetricsCard />
      </div>
      
      {/* Bottom Charts Grid - 3 Column - COMMENTED OUT FOR NOW */}
      {/* <div className="grid gap-6 md:grid-cols-3">
        <LiquidityChart />
        <RevenueChart />
        <UserBehaviorChart />
      </div> */}
    </div>
  )
}
