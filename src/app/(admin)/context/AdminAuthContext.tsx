"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

interface AdminAuthProviderProps {
  children: React.ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth/session', {
        credentials: 'include',
        cache: 'no-store'
      })

      if (response.ok) {
        const sessionData = await response.json()
        if (sessionData.authenticated && sessionData.user) {
          setUser(sessionData.user)
          return true
        }
      }
      
      setUser(null)
      return false
    } catch {
      setUser(null)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch {
      // Logout error - continue with cleanup
    } finally {
      setUser(null)
      router.push('/admin-login')
    }
  }, [router])

  // Secure fetch wrapper that includes credentials and handles auth errors
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    // Handle authentication errors globally
    if (response.status === 401) {
      setUser(null)
      router.push('/admin-login')
      throw new Error('Authentication required')
    }

    return response
  }, [router])

  // Initial auth check
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      const isAuth = await checkAuth()
      
      if (!isAuth && !pathname.includes('/admin-login')) {
        router.push('/admin-login')
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [checkAuth, pathname, router])

  // No periodic auth validation needed - adminFetch handles 401s automatically

  // Check auth on route changes (only when navigating away from login)
  useEffect(() => {
    if (user && pathname.includes('/admin-login')) {
      // If user is authenticated but on login page, redirect to admin
      router.push('/admin')
    }
  }, [pathname, user, router])

  const value: AdminAuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    checkAuth,
    adminFetch,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
