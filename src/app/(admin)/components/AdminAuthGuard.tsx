"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminAuthGuardProps {
  children: React.ReactNode
}

interface AdminSession {
  authenticated: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkAdminSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      })

      if (response.ok) {
        const sessionData = await response.json()
        setSession(sessionData)
        
        if (!sessionData.authenticated) {
          console.log('🚪 Admin session invalid, redirecting to login')
          router.push('/admin-login')
        }
      } else {
        console.log('🚪 Admin session check failed, redirecting to login')
        setSession({ authenticated: false })
        router.push('/admin-login')
      }
    } catch (error) {
      console.error('❌ Error checking admin session:', error)
      // Don't redirect on network errors, only on auth failures
      if (!session?.authenticated) {
        setSession({ authenticated: false })
        router.push('/admin-login')
      }
    } finally {
      setIsLoading(false)
    }
  }, [router, session?.authenticated])

  useEffect(() => {
    checkAdminSession()
    
    // Set up periodic session checks every 5 minutes
    intervalRef.current = setInterval(checkAdminSession, 5 * 60 * 1000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkAdminSession])

  // Check session on route changes
  useEffect(() => {
    if (session?.authenticated) {
      checkAdminSession()
    }
  }, [pathname, session?.authenticated, checkAdminSession])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking admin authentication...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (redirect is handled in useEffect)
  if (!session?.authenticated) {
    return null
  }

  return <>{children}</>
}
