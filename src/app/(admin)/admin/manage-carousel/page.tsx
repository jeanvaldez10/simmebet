"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CarouselBannerItem } from "@/data/carouselData"
import { CarouselTable } from "@/components/admin/CarouselTable"
import { useAdminAuth } from "@/app/(admin)/context/AdminAuthContext"


export default function CarouselManagement() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAdminAuth()
  const [items, setItems] = useState<CarouselBannerItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCarouselItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/carousel', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load carousel items')
      }

      const data = await response.json()
      
      // Convert database items to CarouselBannerItem format
      const formattedItems: CarouselBannerItem[] = data.items.map((item: {
        id: string;
        title: string;
        subtitle: string;
        date: string;
        betChance?: number;
        description: string;
        imageSrc: string;
        alignment: string;
        isVideo: boolean;
        primaryButtonText?: string;
        primaryButtonLink?: string;
        secondaryButtonText?: string;
        secondaryButtonLink?: string;
        status: string;
      }) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        betChance: item.betChance,
        description: item.description,
        imageSrc: item.imageSrc,
        alignment: item.alignment?.toLowerCase() as "left" | "center",
        isVideo: item.isVideo,
        primaryButtonText: item.primaryButtonText,
        primaryButtonLink: item.primaryButtonLink,
        secondaryButtonText: item.secondaryButtonText,
        secondaryButtonLink: item.secondaryButtonLink,
        status: item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED"
      }))

      setItems(formattedItems)
    } catch (error) {
      console.error('Error loading carousel items:', error)
      toast.error(error instanceof Error ? error.message : "Failed to load carousel items")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCarouselItems()
  }, [loadCarouselItems, isAuthenticated, user, authLoading])

  const handleCreateItem = () => {
    router.push("/admin/manage-carousel/create")
  }

  const handleEdit = (item: CarouselBannerItem) => {
    router.push(`/admin/manage-carousel/create?id=${item.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      if (!isAuthenticated) {
        toast.error("Admin authentication required")
        return
      }

      const response = await fetch(`/api/admin/carousel/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete carousel item')
      }

      // Remove the item from local state
      setItems(items.filter(item => item.id !== id))
      toast.success("Carousel item deleted successfully")
    } catch (error) {
      console.error('Error deleting carousel item:', error)
      toast.error(error instanceof Error ? error.message : "Failed to delete carousel item")
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (!isAuthenticated) {
        toast.error("Admin authentication required")
        return
      }

      const response = await fetch(`/api/admin/carousel/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: isActive ? 'PUBLISHED' : 'DRAFT'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update carousel item')
      }

      // Reload items to reflect the change
      await loadCarouselItems()
      toast.success(`Carousel item ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error updating carousel item:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update carousel item")
    }
  }

  const handleReorder = async (newItems: CarouselBannerItem[]) => {
    try {
      if (!isAuthenticated) {
        toast.error("Admin authentication required")
        return
      }

      // Update order indexes for all items
      const updatePromises = newItems.map((item, index) =>
        fetch(`/api/admin/carousel/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            orderIndex: index
          })
        })
      )

      await Promise.all(updatePromises)
      
      // Update local state
      setItems(newItems)
      toast.success("Carousel order updated successfully")
    } catch (error) {
      console.error('Error reordering carousel items:', error)
      toast.error("Failed to update carousel order")
      // Reload items to restore original order
      await loadCarouselItems()
    }
  }

  // Calculate stats based on real data
  const totalItems = items.length
  const videoItems = items.filter(item => item.isVideo).length
  const imageItems = items.filter(item => !item.isVideo).length
  const itemsWithBetChance = items.filter(item => item.betChance && item.betChance > 0).length

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the admin panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carousel Management</h1>
          <p className="text-muted-foreground">
            Manage featured carousel items displayed on the homepage
          </p>
        </div>
        <Button onClick={handleCreateItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videoItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Image Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imageItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Bet Chance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsWithBetChance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <CarouselTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onReorder={handleReorder}
      />
    </div>
  )
}
