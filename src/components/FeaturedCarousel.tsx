import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeaturedCard } from "@/components/FeaturedCard";

type FeaturedItem = {
  title: string;
  description: string;
  color: "blue" | "purple" | "orange" | "pink";
};

const featuredItems: FeaturedItem[] = [
  {
    title: "Global Trade Wars",
    description: "Hedge risk & forecast the fallout, amid rising US tariffs.",
    color: "blue",
  },
  {
    title: "Trump",
    description: "Hedge risk & forecast the fallout, amid rising US tariffs.",
    color: "purple",
  },
  {
    title: "Sports",
    description: "Hedge risk & forecast the fallout, amid rising US tariffs.",
    color: "orange",
  },
  {
    title: "Pop Culture",
    description: "Hedge risk & forecast the fallout, amid rising US tariffs.",
    color: "pink",
  },
];

export function FeaturedCarousel() {
  return (
    <div className="relative px-4 py-2">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {featuredItems.map((item, index) => (
          <FeaturedCard
            key={`${item.title}-${index}`}
            title={item.title}
            description={item.description}
            color={item.color}
          />
        ))}
      </div>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
