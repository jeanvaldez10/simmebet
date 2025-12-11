# Multi-Page Tooltip Component

A reusable, multi-slide hover tooltip component for creating tutorial flows and feature explanations.

## 📁 Files Created

### Core Components
1. **`src/components/shared/MultiPageTooltip.tsx`**
   - Main reusable component with props for customization
   - Supports multiple slides with navigation
   - Navigation dots and Back/Next buttons
   - Smooth animations and transitions

2. **`src/components/shared/BeliefMultiPageTooltip.tsx`**
   - Specific implementation for the Belief tooltip
   - Pre-configured with Belief-specific content and visuals
   - Matches the design from the provided mockups

3. **`src/components/shared/MultiPageTooltip.example.tsx`**
   - Multiple usage examples and patterns
   - Documentation for various use cases

### Updated Files
- **`src/components/market/BeliefSlider.tsx`**
  - Integrated the new `BeliefMultiPageTooltip`
  - Automatically applies to all places where `BeliefSlider` is used:
    - `src/app/(site)/market/trading-panel/common/place-bet.tsx`
    - `src/app/(site)/market/trading-panel/common/update-bet.tsx`
    - `src/app/(site)/market/trading-panel/common/bookie.tsx`

## 🚀 Quick Start

### Basic Usage

```tsx
import { MultiPageTooltip, TooltipSlide } from "@/components/shared/MultiPageTooltip";
import { Info } from "lucide-react";

const MyComponent = () => {
  const slides: TooltipSlide[] = [
    {
      title: "First Slide",
      content: <div>Your content here</div>
    },
    {
      title: "Second Slide",
      content: <div>More content</div>
    }
  ];

  return (
    <MultiPageTooltip slides={slides}>
      <Info className="w-5 h-5 text-white/50 hover:text-white pointer" />
    </MultiPageTooltip>
  );
};
```

### Using the Belief Tooltip

The Belief tooltip is already integrated into the `BeliefSlider` component:

```tsx
import BeliefSlider from "@/components/market/BeliefSlider";

// It's automatically available when using BeliefSlider
<BeliefSlider
  belief={belief}
  updateBelief={updateBelief}
  selectedOption={selectedOption}
  marketProbability={marketProbability}
/>
```

## 📋 Component Props

### MultiPageTooltip

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `slides` | `TooltipSlide[]` | Yes | - | Array of slide objects with title and content |
| `children` | `ReactNode` | Yes | - | Trigger element (opens on hover) |
| `className` | `string` | No | - | Additional CSS classes for the tooltip |
| `align` | `"center" \| "end" \| "start"` | No | `"center"` | Tooltip alignment relative to trigger |

### TooltipSlide

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | Yes | Title shown at the top of each slide |
| `content` | `ReactNode` | Yes | Content/body of the slide (can be any JSX) |

## 🎨 Features

- ✅ **Multi-slide support** - Create tutorials with multiple pages
- ✅ **Navigation dots** - Visual progress indicator
- ✅ **Back/Next buttons** - Smooth slide navigation
- ✅ **Auto-reset** - Returns to first slide when closed
- ✅ **Hover to open** - Opens on hover (desktop) or click (mobile)
- ✅ **Interactive content** - Stays open while hovering/interacting
- ✅ **Fully responsive** - Works on mobile and desktop
- ✅ **Customizable styling** - Use className and align props
- ✅ **Smooth animations** - Built-in fade transitions
- ✅ **Dark theme** - Matches your app's design system

## 💡 Advanced Examples

### Example 1: Custom Trigger

```tsx
<MultiPageTooltip slides={slides}>
  <button className="btn-primary">Learn More</button>
</MultiPageTooltip>
```

### Example 2: Rich Content

```tsx
const slides = [
  {
    title: "Visual Tutorial",
    content: (
      <div className="space-y-4">
        <img src="/tutorial.png" alt="Tutorial" className="rounded-lg" />
        <p className="text-white/70">Explanation text here</p>
      </div>
    )
  }
];
```

### Example 3: Step-by-Step Guide

```tsx
const slides = [
  {
    title: "Step 1: Setup",
    content: (
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-[#36FD68] flex items-center justify-center text-[#070708] font-bold">
            1
          </div>
          <p className="text-white/70">First instruction</p>
        </div>
        {/* More steps... */}
      </div>
    )
  }
];
```

## 🎯 Use Cases

- **Onboarding flows** - Guide new users through your app
- **Feature explanations** - Explain complex features
- **Tutorial sequences** - Multi-step learning experiences
- **Help tooltips** - Contextual help with multiple pages
- **Settings explanations** - Explain configuration options

## 🔧 Customization

### Custom Styling

```tsx
<MultiPageTooltip 
  slides={slides}
  className="border-2 border-[#36FD68]/30"
  align="start"
>
  <Info className="w-5 h-5" />
</MultiPageTooltip>
```

### Custom Colors

The component uses your app's existing color scheme:
- Background: `from-[#1C1C28] via-[#2A2A3A] to-[#1C1C28]`
- Primary green: `#36FD68`
- Secondary red: `#D32B3F`
- Text: `text-white` with opacity variations

You can override these in the slide content with custom classes.

## 📱 Mobile Support

The component automatically handles mobile screens:
- Responsive padding and sizing
- Touch-friendly navigation buttons
- Optimized for small screens
- Full-screen on mobile for better readability

## 🧪 Testing

The component has been integrated and is ready to use. Test it by:

1. Navigate to any market with a trading panel
2. Click the "Advanced" toggle
3. Look for the Info icon next to "Belief"
4. Hover over it to see the multi-page tooltip
5. Interact with the navigation dots and buttons while hovering

## 📝 Notes

- The tooltip resets to the first slide when closed
- Users can click on navigation dots to jump to specific slides
- The "Got it!" button appears on the last slide instead of "Next"
- Tooltip closes when mouse moves away from trigger and content
- The tooltip stays open while hovering over it to allow interaction
- On mobile, uses Popover (click to open) instead of hover
- The component uses Radix UI Tooltip/Popover under the hood for accessibility

## 🤝 Contributing

To create a new multi-page tooltip:

1. Define your slides array with `TooltipSlide[]` type
2. Wrap your trigger element with `<MultiPageTooltip>`
3. Pass the slides as props
4. Customize styling as needed

For complex, reusable tooltips (like `BeliefMultiPageTooltip`), create a separate component file that wraps `MultiPageTooltip` with pre-configured content.

---

**Built with**: React, TypeScript, Radix UI, Tailwind CSS

