# Multi-Page Tooltip Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                  MultiPageTooltip.tsx                       │
│                  (Base Component)                           │
│                                                             │
│  Props:                                                     │
│  • slides: TooltipSlide[]                                   │
│  • children: ReactNode                                      │
│  • className?: string                                       │
│  • maxWidth?: string                                        │
│                                                             │
│  Features:                                                  │
│  • State management (currentSlide)                          │
│  • Navigation logic (next, back, goTo)                      │
│  • Auto-reset on close                                      │
│  • Radix UI Dialog integration                              │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                            │ extends/uses
                            │
┌─────────────────────────────────────────────────────────────┐
│              BeliefMultiPageTooltip.tsx                     │
│              (Specific Implementation)                      │
│                                                             │
│  Pre-configured with:                                       │
│  • Slide 1: "What is Belief?"                              │
│  • Slide 2: "Set Your Belief"                              │
│  • Visual examples and explanations                         │
│  • Info icon as trigger                                     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                            │ imported by
                            │
┌─────────────────────────────────────────────────────────────┐
│                   BeliefSlider.tsx                          │
│                   (Integration Point)                       │
│                                                             │
│  Conditionally renders:                                     │
│  • BeliefMultiPageTooltip (for Belief)                     │
│  • CustomTooltip (for Bookie/Odds)                         │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                            │ used in
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  place-bet   │  │  update-bet  │  │    bookie    │
│  .tsx        │  │  .tsx        │  │    .tsx      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

```
User Action
    │
    ├─▶ Clicks Info Icon
    │       │
    │       ▼
    │   BeliefMultiPageTooltip
    │       │
    │       ├─▶ Passes slides array
    │       ├─▶ Passes Info icon as children
    │       │
    │       ▼
    │   MultiPageTooltip
    │       │
    │       ├─▶ Opens Radix Dialog
    │       ├─▶ Displays slide[0]
    │       │
    │       ▼
    │   User Navigates
    │       │
    │       ├─▶ Click dot → goToSlide(index)
    │       ├─▶ Click Next → handleNext()
    │       ├─▶ Click Back → handleBack()
    │       │
    │       ▼
    │   Updates currentSlide state
    │       │
    │       ▼
    │   Re-renders with new slide content
    │       │
    │       ▼
    │   User closes (ESC, outside click, or "Got it!")
    │       │
    │       ▼
    │   Dialog closes, resets to slide 0
```

## State Management

```typescript
// Inside MultiPageTooltip component

const [currentSlide, setCurrentSlide] = useState(0);
const [isOpen, setIsOpen] = useState(false);

// Navigation handlers
const handleNext = () => {
  if (currentSlide < slides.length - 1) {
    setCurrentSlide(currentSlide + 1);
  }
};

const handleBack = () => {
  if (currentSlide > 0) {
    setCurrentSlide(currentSlide - 1);
  }
};

const goToSlide = (index: number) => {
  setCurrentSlide(index);
};

const handleClose = (open: boolean) => {
  setIsOpen(open);
  if (!open) {
    // Reset to first slide after close animation
    setTimeout(() => setCurrentSlide(0), 200);
  }
};
```

## Component Composition

```
Dialog (Radix UI)
└── DialogTrigger
    └── {children} (Info icon, button, etc.)

└── DialogContent
    └── Container div
        ├── Title (h2)
        │   └── {slides[currentSlide].title}
        │
        ├── Content area
        │   └── {slides[currentSlide].content}
        │
        ├── Navigation Dots
        │   └── {slides.map((_, index) => <button>)}
        │
        └── Navigation Buttons
            ├── Back button (conditional)
            └── Next button / "Got it!" button
```

## Styling System

```
┌─────────────────────────────────────┐
│  Tailwind CSS Classes               │
├─────────────────────────────────────┤
│  Background:                        │
│  • bg-gradient-to-br                │
│  • from-[#1C1C28]                   │
│  • via-[#2A2A3A]                    │
│  • to-[#1C1C28]                     │
│                                     │
│  Effects:                           │
│  • backdrop-blur-xl                 │
│  • shadow-2xl shadow-black/50       │
│  • border border-white/10           │
│                                     │
│  Animations:                        │
│  • transition-all duration-200      │
│  • hover states                     │
│                                     │
│  Responsive:                        │
│  • sm:text-3xl (mobile: text-2xl)   │
│  • sm:p-10 (mobile: p-8)            │
└─────────────────────────────────────┘
```

## Extensibility Points

### 1. Create Custom Implementations
```typescript
// YourCustomTooltip.tsx
import { MultiPageTooltip } from "./MultiPageTooltip";

export const YourCustomTooltip = () => {
  const slides = [
    // Your custom slides
  ];
  
  return (
    <MultiPageTooltip slides={slides}>
      <YourTrigger />
    </MultiPageTooltip>
  );
};
```

### 2. Add New Features to Base Component
- Progress bar
- Auto-advance timer
- Slide transitions
- Analytics tracking
- Video support

### 3. Customize Appearance
```typescript
<MultiPageTooltip 
  slides={slides}
  className="your-custom-classes"
  maxWidth="max-w-4xl"
>
  <Trigger />
</MultiPageTooltip>
```

## Dependencies

```
External:
├── @radix-ui/react-dialog (Modal/Dialog primitives)
├── lucide-react (Icons)
└── tailwindcss (Styling)

Internal:
├── @/lib/utils (cn helper for className merging)
└── @/components/ui/dialog (Wrapped Radix Dialog)
```

## File Dependencies Graph

```
MultiPageTooltip.tsx
├── imports
│   ├── React (useState)
│   ├── @/components/ui/dialog
│   ├── @/lib/utils (cn)
│   └── lucide-react (ChevronLeft, ChevronRight)
└── exports
    ├── MultiPageTooltip (component)
    └── TooltipSlide (type)

BeliefMultiPageTooltip.tsx
├── imports
│   ├── lucide-react (Info)
│   └── ./MultiPageTooltip (MultiPageTooltip, TooltipSlide)
└── exports
    └── BeliefMultiPageTooltip (component)

BeliefSlider.tsx
├── imports (added)
│   └── ../shared/BeliefMultiPageTooltip
└── uses
    └── <BeliefMultiPageTooltip /> (conditionally)
```

## Integration Points

### Current
✅ BeliefSlider → Info icon for Belief explanation

### Potential Future Use Cases
- Liquidity explanation tooltips
- Persist toggle explanation
- Market rules walkthrough
- Onboarding tutorials
- Feature announcements
- Help sections

## Performance Considerations

- ✅ State reset delayed by 200ms to allow close animation
- ✅ Dialog content lazy-loaded (only shown when open)
- ✅ Single state variable for current slide (efficient)
- ✅ No unnecessary re-renders
- ✅ Keyboard handlers properly cleaned up
- ✅ Animation handled by Radix UI (optimized)

## Accessibility Features

- ✅ ARIA labels on navigation buttons
- ✅ Keyboard navigation (Escape to close)
- ✅ Focus management by Radix Dialog
- ✅ Screen reader support
- ✅ Clickable progress dots
- ✅ Clear visual indicators
- ✅ Descriptive button labels

---

This architecture provides a solid foundation for creating multi-page tooltips throughout the application while maintaining consistency, reusability, and clean code practices.

