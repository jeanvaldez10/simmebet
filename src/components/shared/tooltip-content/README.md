# Tooltip Content Files

This folder contains all content for multi-page tooltips, keeping the code clean and maintainable.

## Structure

```
tooltip-content/
├── index.ts                      # Central export file
├── BeliefTooltipContent.tsx      # Belief tooltip slides
├── BookieTooltipContent.tsx      # Bookie tooltip slides
└── README.md                     # This file
```

## How to Use

### Import Content
```tsx
import { beliefTooltipSlides } from "./tooltip-content/BeliefTooltipContent";
// or
import { beliefTooltipSlides, bookieTooltipSlides } from "./tooltip-content";
```

### Create New Tooltip Content
1. Create a new file: `YourTooltipContent.tsx`
2. Export an array of `TooltipSlide[]`
3. Add to `index.ts` for easy importing

### Slide Structure
Each slide contains:
- `title`: String for the slide heading
- `content`: React component with image and text

## Image Paths

Images are stored in `/public/images/tooltips/`:
- Belief: `/images/tooltips/belief/slide1.png`, `slide2.png`, etc.
- Bookie: `/images/tooltips/bookie/slide1.png`, `slide2.png`, etc.
- Backgrounds: `/images/tooltips/backgrounds/your-bg.png`

## Example Content File

```tsx
import { TooltipSlide } from "../MultiPageTooltip";
import Image from "next/image";

export const yourTooltipSlides: TooltipSlide[] = [
  {
    title: "Slide Title",
    content: (
      <div className="space-y-3">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src="/images/tooltips/your-category/slide1.png"
            alt="Description"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          Your text content here
        </p>
      </div>
    ),
  },
];
```

## Updating Content

To update tooltip content:
1. Edit the respective content file
2. Update images in `/public/images/tooltips/[category]/`
3. The component will automatically use the new content

