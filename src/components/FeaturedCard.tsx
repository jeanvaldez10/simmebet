import type React from "react"
import Image from "next/image"

interface FeaturedCardProps {
  title: string
  description: string
  color: "blue" | "purple" | "orange" | "pink"
  image?: React.ReactNode
  bottomRightImage?: string
  globeImage?: boolean
}

export function FeaturedCard({ title, description, color, image, bottomRightImage, globeImage }: FeaturedCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-[url('/images/GlobalTradeBg.png')] bg-cover bg-center",
      border: "border-blue-300",
      text: "text-blue-100",
      button: "bg-blue-700",
    },
    purple: {
      bg: "bg-[url('/images/TrumpBg.png')] bg-cover bg-center",
      border: "border-purple-300",
      text: "text-purple-100",
      button: "bg-purple-700",
    },
    orange: {
      bg: "bg-[url('/images/sportBg.png')] bg-cover bg-center",
      border: "border-orange-300",
      text: "text-orange-100",
      button: "bg-orange-700",
    },
    
    pink: {
      bg: "bg-[url('/images/PopCultureBg.png')] bg-cover bg-center",
      border: "border-pink-300",
      text: "text-pink-100",
      button: "bg-pink-700",
    },
  }

  return (
    <div
      className={`min-w-[250px] rounded-xl ${colorMap[color].bg} p-4 flex flex-col justify-between h-[200px] relative overflow-hidden`}
    >
      {globeImage && (
        <div className="absolute right-0 bottom-0 w-3/5 h-full opacity-80 z-0">
          <Image
            src="/images/global.png"
            alt="Globe"
            width={200}
            height={200}
            className="object-contain absolute bottom-0 right-0"
          />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 border border-blue-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/3 right-1/3 w-32 h-32 border border-blue-300 rounded-full opacity-30"></div>
        </div>
      )}

      {image && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${colorMap[color].border}`}>{image}</div>
        </div>
      )}

      {bottomRightImage && !globeImage && (
        <div className="absolute bottom-0 right-0 z-0 h-full w-1/2 flex items-center justify-center">
          <Image
            src={bottomRightImage || "/placeholder.svg"}
            alt="Featured image"
            width={180}
            height={180}
            className="object-contain opacity-80"
          />
        </div>
      )}

      <div className="relative z-10">
        <h3 className="font-geist font-semibold text-[20px] leading-[140%] tracking-[-0.02em]">{title}</h3>
        <p className={`text-sm ${colorMap[color].text} mt-1`}>{description}</p>
      </div>

      <div className="flex justify-between items-center relative z-10">
        <button className="bg-white text-black rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer">View Markets</button>
      </div>
    </div>
  )
}

