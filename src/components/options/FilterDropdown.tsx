"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type FilterDropdownOption = {
  label: string
  value: string
}

interface FilterDropdownProps {
  label: string
  value: string
  options: FilterDropdownOption[]
  onChange: (value: string) => void
  className?: string
}

export function FilterDropdown({ label, value, options, onChange, className }: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 text-lg text-gray-200 bg-[#2E3144] rounded-full hover:bg-[#3A3D4D] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium text-sm">{label}: </span>
          <span className="text-white font-medium text-sm">{value}</span>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-10 w-full mt-2 bg-[#2E3144] rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className="w-full px-6 py-2 text-sm text-left text-gray-200 hover:bg-[#3A3D4D] transition-colors cursor-pointer"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
