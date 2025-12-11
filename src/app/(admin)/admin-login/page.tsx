"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "react-hot-toast"

import { AdminLoginForm } from "@/components/admin/AdminLoginForm"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Login successful!")
        router.push("/admin")
      } else {
        toast.error(data.error || "Invalid admin credentials")
      }
    } catch (error) {
      console.error("Admin login failed:", error)
      toast.error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-black">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-white">
            <Image 
              src="/adminlogo.png" 
              alt="Bluff Logo" 
              width={32} 
              height={32}
              className="rounded-sm"
            />
            <span className="text-white font-semibold">Bluff Admin</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <AdminLoginForm onLogin={handleLogin} isLoading={isLoading} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/bg-image.jpeg"
          alt="Admin Background"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  )
}
