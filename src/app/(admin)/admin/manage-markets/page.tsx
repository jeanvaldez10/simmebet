"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, TrendingUp, DollarSign, Activity, Eye } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AdminMarketService, AdminMarket } from "@/services/adminMarketService"
import { MarketTable } from "@/components/admin/MarketTable"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount)
}

export default function MarketManagement() {
  const router = useRouter()
  const [markets, setMarkets] = useState<AdminMarket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMarkets = useCallback(async () => {
    setIsLoading(true)
    try {
      const marketsData = await AdminMarketService.getMarkets()
      setMarkets(marketsData)
    } catch (error) {
      console.error('Error loading markets:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load markets")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMarkets()
  }, [loadMarkets])

  const handleCreateMarket = () => {
    router.push("/admin/manage-markets/create")
  }

  const handleEdit = (market: AdminMarket) => {
    router.push(`/admin/manage-markets/create?id=${market.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await AdminMarketService.deleteMarket(id)
      setMarkets(markets.filter(market => market.id !== id))
      toast.success("Market deleted successfully")
    } catch (error) {
      console.error('Error deleting market:', error)
      toast.error(error instanceof Error ? error.message : "Failed to delete market")
    }
  }

  const updateStatus = async (id: string, status: AdminMarket["status"]) => {
    try {
      await AdminMarketService.updateMarket(id, { status })
      setMarkets(markets.map(market =>
        market.id === id 
          ? { ...market, status, updatedAt: new Date().toISOString() }
          : market
      ))
      toast.success(`Market ${status.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating market status:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update market status")
    }
  }

  const handleReorder = async (newMarkets: AdminMarket[]) => {
    try {
      // Update order indexes for all markets
      const updatePromises = newMarkets.map((market, index) =>
        AdminMarketService.updateMarket(market.id, {
          orderIndex: index
        })
      )

      await Promise.all(updatePromises)
      
      // Update local state
      setMarkets(newMarkets)
      toast.success("Market order updated successfully")
    } catch (error) {
      console.error('Error reordering markets:', error)
      toast.error("Failed to update market order")
      // Reload markets to restore original order
      await loadMarkets()
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalVolume = markets.reduce((sum, market) => sum + market.volume, 0)
  const totalLiquidity = markets.reduce((sum, market) => sum + market.totalLiquidity, 0)
  const activeMarkets = markets.filter(market => market.status === "ACTIVE").length
  const resolvedMarkets = markets.filter(market => market.status === "RESOLVED").length

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Management</h1>
          <p className="text-muted-foreground">
            Create and manage prediction markets on the platform
          </p>
        </div>
        <Button onClick={handleCreateMarket} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Market
        </Button>
        </div>
        
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{markets.length}</div>
            <p className="text-xs text-muted-foreground">
              All markets created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMarkets}</div>
            <p className="text-xs text-muted-foreground">
              {resolvedMarkets} resolved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trading Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              Total volume traded
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLiquidity)}</div>
            <p className="text-xs text-muted-foreground">
              Available liquidity
            </p>
          </CardContent>
        </Card>
                    </div>
                    
      {/* Data Table */}
      <MarketTable
        markets={markets}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateStatus={updateStatus}
        onReorder={handleReorder}
      />
    </div>
  )
}
