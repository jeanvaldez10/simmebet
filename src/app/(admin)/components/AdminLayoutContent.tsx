"use client"

import { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useAdminAuth } from "../context/AdminAuthContext"

interface AdminLayoutContentProps {
  children: ReactNode
}

export function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const { isAuthenticated, isLoading } = useAdminAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render admin content
  // The context will handle the redirect
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <AdminBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="flex-1 page-load-animation">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
