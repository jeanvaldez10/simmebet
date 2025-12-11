"use client";

import React, { useState, useEffect } from "react";
import { useLayoutHeights } from "@/hooks/use-layout-heights";
import { LayoutDashboard, StarIcon } from "lucide-react";
import { CategoryService, CategoryData } from "@/services/categoryService";

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  // count?: number;
}

// Get icon component dynamically from lucide-react
const getIconComponent = (iconName?: string | null): React.ComponentType<{ className?: string }> => {
  if (!iconName) return LayoutDashboard;
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const iconModule = require('lucide-react');
    return iconModule[iconName] || LayoutDashboard;
  } catch {
    return LayoutDashboard;
  }
};

// Fixed categories that are always present
const getFixedCategories = (): Category[] => [
  { id: "all", name: "All", icon: LayoutDashboard },
  { id: "favorites", name: "Favorites", icon: StarIcon },
];

interface MarketCategoriesProps {
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export const MarketCategories: React.FC<MarketCategoriesProps> = ({
  selectedCategory = "all",
  onCategoryChange,
}) => {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [categories, setCategories] = useState<Category[]>(getFixedCategories());
  const [isLoading, setIsLoading] = useState(true);
  const { headerHeight, tickerHeight } = useLayoutHeights();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const dbCategories = await CategoryService.getCategories();

        // Convert database categories to component format
        const dynamicCategories: Category[] = dbCategories.map((cat: CategoryData) => ({
          id: cat.id,
          name: cat.name,
          icon: getIconComponent(cat.icon),
          // count: cat._count.markets,
        }));

        // Combine fixed categories with dynamic ones
        const allCategories = [
          ...getFixedCategories(),
          ...dynamicCategories,
        ];

        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Keep only fixed categories if fetch fails
        setCategories(getFixedCategories());
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div 
      className="market-categories-container fixed left-0 right-0 z-[60] bg-black/20 backdrop-blur-sm border-b border-white/10 w-full overflow-x-auto scrollbar-hide"
      style={{ top: `${headerHeight + tickerHeight}px` }}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-3 min-w-max" style={{ height: '57px' }}>
        {isLoading ? (
          // Loading skeleton with realistic category widths to prevent layout shift
          <div className="flex items-center gap-2">
            {[64, 96, 80, 88, 72, 120, 96, 80, 88, 72, 96, 80, 88, 104].map((width, i) => (
              <div
                key={i}
                className="h-8 bg-white/10 rounded-lg animate-pulse"
                style={{ width: `${width}px` }}
              />
            ))}
          </div>
        ) : (
          categories.map((category) => {
            const isActive = activeCategory === category.id;
            const IconComponent = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-[#2E3144] text-white shadow-lg"
                      : "text-[#FFFFFFA3] hover:text-white"
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span className="relative z-10">{category.name}</span>
                {/* {category.count !== undefined && category.count > 0 && (
                  <span className="ml-1 text-xs opacity-70">({category.count})</span>
                )} */}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
