"use client"


import { CgCloseO } from "react-icons/cg"
// import { FilterSidebar } from "./FilterSidebar"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-black border-r border-white/10">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-lg font-medium">Filters</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
           <CgCloseO className="h-5 w-5 color-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {/* <FilterSidebar /> */}
        </div>
      </div>
    </div>
  )
}
