# Multi-Page Tooltip Component

## ✅ Implementation Complete

A fully reusable multi-page hover tooltip component has been created and integrated into the belief slider.

## 📦 What Was Created

### 1. Core Component: `MultiPageTooltip.tsx`
**Location**: `src/components/shared/MultiPageTooltip.tsx`

Reusable component that accepts:
- `slides`: Array of slide objects with `title` and `content`
- `children`: Any trigger element (typically an Info icon)
- `className`: Optional styling customization
- `maxWidth`: Optional max width (default: `max-w-2xl`)

### 2. Belief-Specific Component: `BeliefMultiPageTooltip.tsx`
**Location**: `src/components/shared/BeliefMultiPageTooltip.tsx`

Pre-configured implementation for the Belief feature with:
- **Slide 1**: "What is Belief?" - Explains the concept with visual examples
- **Slide 2**: "Set Your Belief" - Shows how to use the slider

### 3. Examples & Documentation: `MultiPageTooltip.example.tsx`
**Location**: `src/components/shared/MultiPageTooltip.example.tsx`

Contains multiple usage examples:
- Simple text tooltips
- Advanced visual tutorials
- Custom triggers
- Custom styling

## 🎯 Current Integration

The `BeliefMultiPageTooltip` has been integrated into:
- ✅ `src/components/market/BeliefSlider.tsx`

Which automatically applies to:
- ✅ Place Bet panel (`src/app/(site)/market/trading-panel/common/place-bet.tsx`)
- ✅ Update Bet panel (`src/app/(site)/market/trading-panel/common/update-bet.tsx`)
- ✅ Bookie panel (`src/app/(site)/market/trading-panel/common/bookie.tsx`)

## 🚀 How to Use

### Quick Example

```tsx
import { MultiPageTooltip } from "@/components/shared/MultiPageTooltip";
import { Info } from "lucide-react";

const slides = [
  {
    title: "Welcome",
    content: <div>Your content here</div>
  },
  {
    title: "Next Step",
    content: <div>More content</div>
  }
];

// Use it:
<MultiPageTooltip slides={slides}>
  <Info className="w-5 h-5 text-white/50 hover:text-white pointer" />
</MultiPageTooltip>
```

## 🎨 Features

- ✨ Multi-slide navigation
- 🔘 Progress dots
- ⬅️ Back button (appears after first slide)
- ➡️ Next button (changes to "Got it!" on last slide)
- 🔄 Auto-reset to first slide on close
- 🖱️ Opens on hover (desktop) / click (mobile)
- 💡 Stays open while hovering/interacting
- 📱 Fully responsive
- 🎭 Smooth animations
- ♿ Accessible (built on Radix UI)

## 🧪 Testing

To test the implementation:

1. Navigate to any market page
2. Open the trading panel
3. Toggle "Advanced" to show the belief slider
4. Hover over the info icon next to "Belief"
5. Navigate through the slides using dots and buttons
6. Tooltip stays open while you hover over it

## 📚 Full Documentation

See `MULTIPAGE_TOOLTIP_GUIDE.md` in the project root for comprehensive documentation.

---

**Status**: ✅ Ready to Use  
**Linting**: ✅ No Errors  
**Integration**: ✅ Complete  

