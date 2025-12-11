"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Map of admin routes to their display names
const routeMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/manage-carousel": "Carousel Management",
  "/admin/manage-carousel/create": "Create Carousel Item",
  "/admin/manage-markets": "Market Management",
  "/admin/manage-markets/create": "Create Market",
  "/admin/settings": "Settings",
}

// Generate breadcrumb items based on current path
function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = []

  // Always start with Admin
  breadcrumbs.push({
    label: "Admin",
    href: "/admin",
    isActive: pathname === "/admin"
  })

  // Build path progressively
  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    
    // Skip the first "admin" segment as we already added it
    if (i === 0 && segments[i] === "admin") continue
    
    const isLast = i === segments.length - 1
    const label = routeMap[currentPath] || segments[i].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isActive: isLast
    })
  }

  return breadcrumbs
}

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <BreadcrumbItem>
              {breadcrumb.isActive ? (
                <BreadcrumbPage className="font-medium">
                  {breadcrumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.href} className="text-muted-foreground">
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
