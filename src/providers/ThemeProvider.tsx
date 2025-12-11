"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Theme = "light" | "dark" | "system"
type PrimaryColor = "blue" | "purple" | "green" | "orange" | "red" | "pink"

interface AppearanceSettings {
  theme: Theme
  primaryColor: PrimaryColor
  enableAnimations: boolean
  enableSoundEffects: boolean
  compactMode: boolean
  highContrast: boolean
}

interface ThemeContextType {
  settings: AppearanceSettings
  updateSetting: <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => void
  resetToDefaults: () => void
}

const defaultSettings: AppearanceSettings = {
  theme: "system",
  primaryColor: "blue",
  enableAnimations: true,
  enableSoundEffects: false,
  compactMode: false,
  highContrast: false,
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const colorSchemes = {
  blue: {
    primary: "hsl(221, 83%, 53%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(210, 40%, 96%)",
    accent: "hsl(210, 40%, 92%)",
  },
  purple: {
    primary: "hsl(262, 83%, 58%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(270, 40%, 96%)",
    accent: "hsl(270, 40%, 92%)",
  },
  green: {
    primary: "hsl(142, 76%, 36%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(120, 40%, 96%)",
    accent: "hsl(120, 40%, 92%)",
  },
  orange: {
    primary: "hsl(25, 95%, 53%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(30, 40%, 96%)",
    accent: "hsl(30, 40%, 92%)",
  },
  red: {
    primary: "hsl(0, 84%, 60%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(0, 40%, 96%)",
    accent: "hsl(0, 40%, 92%)",
  },
  pink: {
    primary: "hsl(330, 81%, 60%)",
    primaryForeground: "hsl(0, 0%, 98%)",
    secondary: "hsl(330, 40%, 96%)",
    accent: "hsl(330, 40%, 92%)",
  },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("appearance-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved appearance settings:", error)
      }
    }
    setMounted(true)
  }, [])

  // Apply theme and color scheme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Handle theme
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    const effectiveTheme = settings.theme === "system" ? systemTheme : settings.theme
    
    root.classList.remove("light", "dark")
    root.classList.add(effectiveTheme)
    
    // Apply color scheme
    const colors = colorSchemes[settings.primaryColor]
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
    })
    
    // Apply other settings
    root.style.setProperty("--animation-duration", settings.enableAnimations ? "0.2s" : "0s")
    root.classList.toggle("compact-mode", settings.compactMode)
    root.classList.toggle("high-contrast", settings.highContrast)
    
    // Save to localStorage
    localStorage.setItem("appearance-settings", JSON.stringify(settings))
  }, [settings, mounted])

  const updateSetting = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    localStorage.removeItem("appearance-settings")
  }

  const contextValue: ThemeContextType = {
    settings,
    updateSetting,
    resetToDefaults,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export { colorSchemes }
export type { Theme, PrimaryColor, AppearanceSettings }
