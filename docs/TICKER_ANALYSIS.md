# Ticker Analysis and Improvement Plan

## Current Implementation

### Architecture Overview

The ticker system consists of four main components:

1. **Ticker Component** (`src/components/Ticker.tsx`)
2. **Data Hook** (`src/hooks/useTickerData.ts`)
3. **API Route** (`src/app/(site)/api/ticker/route.ts`)
4. **CSS Animations** (`src/styles/globals.css`)

---

## How It Currently Works

### 1. Data Flow

```
Database (materialized view)
    ↓
API Route (/api/ticker) - Fetches top 20 active markets with hourly price changes
    ↓
useTickerData Hook - Polls API every 30 seconds via React Query
    ↓
Ticker Component - Displays and animates the data
```

### 2. Animation Mechanism

**Component Logic:**

```typescript
// Duplicates data to create seamless loop
const duplicatedData = [...tickerItems, ...tickerItems];
```

**CSS Animation:**

```css
.ticker-track {
  animation: ticker 60s linear infinite;
}

@keyframes ticker {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
```

### 3. How the Loop Works

1. Data is **duplicated** (e.g., if you have 10 items, it creates 20)
2. The entire track scrolls from `0%` to `-50%` over a calculated duration
3. At `-50%`, the animation **resets to 0%**
4. Because data is duplicated, the visual reset isn't noticeable (first item at end matches first item at start)

**Note:** Previously, the animation was going to `-100%` which meant it was resetting halfway through and not showing all markets. This has been fixed to `-50%`.

---

## Analysis of Key Questions

### ❓ Is It Infinite?

**Answer: Yes, but with caveats.**

- ✅ **Visually infinite**: The duplication creates a seamless loop
- ✅ **Properly implemented**: Animation resets at -50% (halfway through duplicated data), showing all markets
- ⚠️ **Jump risk**: If content changes mid-animation, there could be visual discontinuity

**How It Works:**

```
[Item1, Item2, Item3] + [Item1, Item2, Item3]
                     ↓
Animation moves left: translateX(0% → -50%)
                     ↓
When it reaches -50%, it jumps back to 0%
                     ↓
Because both halves are identical, the jump is invisible
```

**Fixed Issue:** Previously was going to `-100%` which meant only half the markets were shown before reset. Now correctly goes to `-50%` to show all markets.

This works perfectly **IF** the two halves stay synchronized. If data updates during animation, synchronization can break.

---

### ❓ Will It Continue From Where It Left Off After Page Refresh?

**Answer: No.**

**Current Behavior:**

- On page refresh, the animation **resets to 0%**
- No position is saved to localStorage or sessionStorage
- The animation starts fresh every time

**Why This Happens:**

- CSS animations reset when the DOM is re-rendered
- No JavaScript state preservation
- React component mounts fresh on page load

**User Impact:**

- Consistent starting point (could be seen as a feature)
- No jarring mid-animation starts
- Predictable behavior

---

### ❓ How Does It Handle More or Less Markets (Variable Content)?

**Answer: Poorly - Fixed duration regardless of content amount.**

**Current Implementation:**

```css
.ticker-track {
  animation: ticker 60s linear infinite; /* Always 60 seconds */
}

@media (max-width: 768px) {
  .ticker-track {
    animation: ticker 10s linear infinite; /* Always 10 seconds on mobile */
  }
}
```

**Problems:**

| Scenario                               | Issue                                       |
| -------------------------------------- | ------------------------------------------- |
| **Few items (e.g., 5 markets)**        | Items scroll too fast, hard to read         |
| **Many items (e.g., 20 markets)**      | Items scroll at reasonable speed            |
| **Very many items (e.g., 50 markets)** | Would scroll even faster (but capped at 20) |

**The Math:**

- If ticker width is 5000px with 10 items = 500px per item travels in 60s = **8.3px/second**
- If ticker width is 10000px with 20 items = 500px per item travels in 60s = **8.3px/second**
- Same speed per item! ✅

**Actually, the current implementation is better than expected:**

- Because we scroll `-100%` of track width, and items are part of the track
- Speed per item stays constant regardless of number of items
- **However**, this assumes all items are similar width

---

### ❓ How Does It Adjust to Different Length Market Titles?

**Answer: It doesn't - No dynamic adjustment.**

**Current Behavior:**

```typescript
// All items are in whitespace-nowrap containers
<span className="text-white font-medium text-sm">{item.marketName}</span>
```

**Problems:**

1. **Variable Item Widths**

   - "BTC" is ~40px wide
   - "Will the Federal Reserve raise interest rates by Q4 2025?" is ~600px wide
   - Both scroll at the same speed (% of total track width)

2. **Readability Issues**

   - Short titles might scroll by too quickly to read
   - Long titles maintain good readability
   - Inconsistent user experience

3. **Visual Balance**
   - Some items take up 2% of track, others 15%
   - Uneven distribution makes the ticker feel unbalanced

**Example Calculation:**

```
Total track width: 10,000px (20 items)
Animation duration: 60 seconds

Short title item (200px):
  - Time visible in viewport (1920px): ~11.5 seconds
  - Scrolling speed: 166.7px/second

Long title item (800px):
  - Time visible in viewport (1920px): ~46 seconds
  - Scrolling speed: 166.7px/second (same!)
```

The speed is constant, but the **time to read** varies drastically with content length.

---

## Issues Summary

| Issue                                   | Status              | Severity       | Impact                                 |
| --------------------------------------- | ------------------- | -------------- | -------------------------------------- |
| Animation only showing half the markets | ✅ **FIXED**        | Was 🔴 High    | Was resetting at -100% instead of -50% |
| Fixed animation duration                | ✅ **FIXED**        | Was 🟡 Medium  | Now adapts to actual content width     |
| No position persistence                 | 🟡 Medium           | Minor UX issue | See Future Enhancements below          |
| Variable item widths                    | 🟢 Low              | Acceptable     | Natural variation in market names      |
| Data sync on update                     | 🟢 Low              | Minimal risk   | 30s refetch interval is reasonable     |
| Mobile speed too fast                   | ✅ **NOT AN ISSUE** | N/A            | Current speed is readable              |
| Animation reset jump                    | ✅ **WORKING**      | N/A            | Well hidden by duplication             |

---

## Improvement Recommendations

### 🎯 Priority 1: Dynamic Animation Duration

**Goal:** Adjust animation speed based on content amount and length.

**Implementation:**

```typescript
// In Ticker component
const calculateAnimationDuration = (items: TickerItem[]) => {
  // Base calculation: aim for ~150-200px per second scroll speed
  const estimatedWidth = items.reduce((total, item) => {
    // Rough estimation: 8px per character + padding/margins
    return total + (item.marketName.length * 8) + 200; // 200px for other elements
  }, 0);

  const SCROLL_SPEED_PX_PER_SEC = 150; // Adjust for desired speed
  const duration = estimatedWidth / SCROLL_SPEED_PX_PER_SEC;

  // Clamp between reasonable bounds
  return Math.max(20, Math.min(duration, 120)); // 20s min, 120s max
};

// Apply inline style
<div
  className="ticker-track"
  style={{
    animationDuration: `${calculateAnimationDuration(tickerItems)}s`
  }}
>
```

**Benefits:**

- ✅ Consistent scroll speed regardless of item count
- ✅ Adapts to content changes automatically
- ✅ Better readability

---

### 🎯 Priority 2: Content Width Measurement

**Goal:** Calculate actual rendered width instead of estimating.

**Implementation:**

```typescript
const [animationDuration, setAnimationDuration] = useState(60);
const trackRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (trackRef.current) {
    const trackWidth = trackRef.current.scrollWidth / 2; // Divide by 2 (duplicated)
    const SCROLL_SPEED_PX_PER_SEC = 150;
    const duration = trackWidth / SCROLL_SPEED_PX_PER_SEC;
    setAnimationDuration(Math.max(20, Math.min(duration, 120)));
  }
}, [tickerItems]); // Recalculate when data changes

// Apply to track
<div
  ref={trackRef}
  className="ticker-track"
  style={{ animationDuration: `${animationDuration}s` }}
>
```

**Benefits:**

- ✅ Accurate measurements
- ✅ Accounts for actual rendered width
- ✅ No estimation errors

---

### 🎯 Priority 3: Smooth Data Updates

**Goal:** Prevent visual glitches when data changes mid-animation.

**Implementation:**

```typescript
const [displayData, setDisplayData] = useState(tickerItems);
const [isTransitioning, setIsTransitioning] = useState(false);

useEffect(() => {
  if (JSON.stringify(tickerItems) !== JSON.stringify(displayData)) {
    // Wait for animation to complete a cycle before updating
    setIsTransitioning(true);

    // Update data at animation reset point
    const timeoutDuration = animationDuration * 1000;
    const timeout = setTimeout(() => {
      setDisplayData(tickerItems);
      setIsTransitioning(false);
    }, timeoutDuration);

    return () => clearTimeout(timeout);
  }
}, [tickerItems, displayData, animationDuration]);
```

**Benefits:**

- ✅ No mid-animation content changes
- ✅ Smoother user experience
- ✅ Maintains visual continuity

---

### 🎯 Priority 4: Normalize Item Widths (Advanced)

**Goal:** Make all items take approximately the same space for visual consistency.

**Implementation Option A - Padding:**

```typescript
const normalizeItemWidth = (item: TickerItem, targetWidth: number) => {
  // Measure actual content
  const contentWidth = measureTextWidth(item.marketName);
  const paddingNeeded = Math.max(0, targetWidth - contentWidth);

  return {
    paddingLeft: paddingNeeded / 2,
    paddingRight: paddingNeeded / 2,
  };
};
```

**Implementation Option B - Truncation:**

```typescript
const normalizeMarketName = (name: string, maxLength: number) => {
  if (name.length > maxLength) {
    return name.substring(0, maxLength - 3) + "...";
  }
  return name;
};

// In render:
<span>{normalizeMarketName(item.marketName, 50)}</span>;
```

**Trade-offs:**

- ⚠️ Padding approach: Creates visual consistency but wastes space
- ⚠️ Truncation approach: Loses information but maintains density

**Recommendation:** Use **truncation with hover tooltip** for long names.

---

### 🎯 Future Enhancement: Position Persistence

**Goal:** Resume animation from last position after refresh, creating true "leave off where it was" behavior.

**Why This Would Be Valuable:**

- Better UX continuity across page refreshes
- More TV news ticker-like experience
- Reduces repetition if user frequently refreshes

**Challenge with CSS Animations:**
CSS animations reset on component mount, so we need to either:

1. Use JavaScript-based animation (requestAnimationFrame)
2. Hack CSS animation start position

**Option A - JavaScript Animation (Recommended):**

```typescript
const STORAGE_KEY = "ticker-position";
const [offset, setOffset] = useState(() => {
  // Load saved position on mount
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseFloat(saved) : 0;
  }
  return 0;
});
const animationFrameRef = useRef<number>();

useEffect(() => {
  const SPEED_PX_PER_SEC = 150;
  const SPEED_PX_PER_FRAME = SPEED_PX_PER_SEC / 60; // 60fps
  let lastTimestamp = performance.now();

  const animate = (timestamp: number) => {
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    setOffset(prev => {
      const trackWidth = trackRef.current?.scrollWidth || 0;
      const newOffset = prev + (SPEED_PX_PER_FRAME * delta / (1000/60));

      // Reset at halfway point (duplicated data)
      const resetPoint = trackWidth / 2;
      if (newOffset >= resetPoint) {
        return 0;
      }

      // Save to localStorage periodically
      if (Math.floor(newOffset) % 100 === 0) {
        localStorage.setItem(STORAGE_KEY, newOffset.toString());
      }

      return newOffset;
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  animationFrameRef.current = requestAnimationFrame(animate);

  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, []);

// Apply transform
<div
  ref={trackRef}
  style={{ transform: `translateX(-${offset}px)` }}
>
```

**Option B - CSS Animation with Delay Hack:**

```typescript
const STORAGE_KEY = "ticker-position-percent";

const getInitialDelay = () => {
  if (typeof window === "undefined") return 0;

  const savedPercent = localStorage.getItem(STORAGE_KEY);
  if (!savedPercent) return 0;

  const percent = parseFloat(savedPercent);
  const duration = 60; // seconds

  // Calculate negative delay to start animation at saved position
  return -(percent * duration);
};

const [animationDelay, setAnimationDelay] = useState(getInitialDelay());

// Save position periodically
useEffect(() => {
  const interval = setInterval(() => {
    if (trackRef.current) {
      const styles = window.getComputedStyle(trackRef.current);
      const matrix = new DOMMatrix(styles.transform);
      const translateX = matrix.m41;
      const trackWidth = trackRef.current.scrollWidth / 2;
      const percent = Math.abs(translateX) / trackWidth;

      localStorage.setItem(STORAGE_KEY, percent.toString());
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

// Apply to animation
<div
  ref={trackRef}
  className="ticker-track"
  style={{
    animationDuration: `${animationDuration}s`,
    animationDelay: `${animationDelay}s`
  }}
>
```

**Trade-offs:**

| Approach                  | Pros                            | Cons                                   |
| ------------------------- | ------------------------------- | -------------------------------------- |
| **JavaScript (Option A)** | Full control, smooth, can pause | More code, slightly higher CPU         |
| **CSS Delay (Option B)**  | Simpler, GPU accelerated        | Hacky, animation delay only works once |

**Considerations:**

- ⚠️ Adds complexity to codebase
- ⚠️ Might create jarring UX if data changed between sessions
- ⚠️ Need to handle edge cases (data changes, different screen sizes)
- ⚠️ Requires testing across browsers
- ✅ Better continuity for users who refresh frequently
- ✅ More professional "broadcast" feel

**Recommendation:** **Consider for future** - Implement JavaScript-based animation (Option A) if position persistence becomes important. For now, fresh start on reload provides cleaner, more predictable UX.

---

### 🎯 Priority 5: JavaScript-Based Animation (Advanced Alternative)

**Goal:** Replace CSS animation with JavaScript for full control.

**Benefits:**

- ✅ Pause/resume capability
- ✅ Smooth speed changes
- ✅ Better data sync
- ✅ Performance monitoring

**Implementation:**

```typescript
const [offset, setOffset] = useState(0);
const animationFrameRef = useRef<number>();

useEffect(() => {
  const SPEED_PX_PER_SEC = 150;
  const SPEED_PX_PER_FRAME = SPEED_PX_PER_SEC / 60; // 60fps

  const animate = () => {
    setOffset(prev => {
      const trackWidth = trackRef.current?.scrollWidth || 0;
      const newOffset = prev + SPEED_PX_PER_FRAME;

      // Reset at halfway point (duplicated data)
      if (newOffset >= trackWidth / 2) {
        return 0;
      }

      return newOffset;
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, []);

// Apply transform
<div
  ref={trackRef}
  style={{ transform: `translateX(-${offset}px)` }}
>
```

**Trade-offs:**

- ⚠️ More complex code
- ⚠️ Slightly higher CPU usage
- ✅ Much more control
- ✅ Can add pause on hover

---

### 🎯 Priority 6: Responsive Speed Adjustments

**Goal:** Better mobile experience with adaptive speeds.

**Current Problem:**

```css
@media (max-width: 768px) {
  .ticker-track {
    animation: ticker 10s linear infinite; /* Way too fast! */
  }
}
```

**Recommendation:**

```typescript
const getScrollSpeed = () => {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth < 1024;

  if (isMobile) return 100; // px/sec - slower for mobile
  if (isTablet) return 125; // px/sec - medium for tablet
  return 150; // px/sec - normal for desktop
};
```

**Benefits:**

- ✅ Maintains readability across devices
- ✅ Accounts for different viewport sizes
- ✅ Better mobile UX

---

## Implementation Status

### ✅ Completed Improvements

1. ✅ **Fixed critical bug** - Animation now goes to -50% instead of -100%, showing all markets
2. ✅ **Dynamic duration calculation** - Animation duration adapts to actual content width
3. ✅ **Content width measurement** - Uses actual rendered width via ref measurement
4. ✅ **Responsive speed adjustments** - Different speeds for mobile (300px/s) vs desktop (200px/s)
5. ✅ **Removed hardcoded mobile override** - Duration now calculated dynamically instead of fixed timing

### 🔮 Future Enhancements (Optional)

#### High Value

1. ⭐ **Position persistence** - Resume from last position after page refresh (see detailed implementation above)
2. ⭐ **Pause on hover** - Allow users to stop and read specific items
3. ⭐ **Smooth data transitions** - Prevent glitches when data updates mid-animation

#### Nice to Have

4. ⭐ **Truncation with tooltips** - Handle very long market names gracefully
5. ⭐ **JavaScript-based animation** - Full control over animation lifecycle
6. ⭐ **Performance monitoring** - Track FPS and optimize if needed
7. ⭐ **User speed controls** - Let users adjust ticker speed

---

## Example Improved Implementation

```typescript
"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderHeight } from "@/hooks/use-header-height";
import { useTickerData } from "@/hooks/useTickerData";

const Ticker: React.FC = () => {
  const headerHeight = useHeaderHeight();
  const { data: tickerResponse, isLoading } = useTickerData();
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState(60);

  const tickerItems = tickerResponse?.tickerItems || [];
  const duplicatedData = [...tickerItems, ...tickerItems];

  // Calculate dynamic animation duration
  useEffect(() => {
    if (trackRef.current && tickerItems.length > 0) {
      // Wait for render
      setTimeout(() => {
        const trackWidth = trackRef.current?.scrollWidth || 0;
        const halfWidth = trackWidth / 2; // Account for duplication

        // Responsive scroll speed
        const isMobile = window.innerWidth < 768;
        const SCROLL_SPEED = isMobile ? 100 : 150; // px/second

        const duration = halfWidth / SCROLL_SPEED;
        const clampedDuration = Math.max(20, Math.min(duration, 120));

        setAnimationDuration(clampedDuration);
      }, 100);
    }
  }, [tickerItems]);

  const handleTickerItemClick = (contractAddress?: string) => {
    if (contractAddress) {
      router.push(`/market/${contractAddress}`);
    }
  };

  // Truncate long market names
  const truncateMarketName = (name: string, maxLength = 60) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + '...';
    }
    return name;
  };

  if (isLoading && !tickerResponse) {
    return (/* Loading state */);
  }

  if (!isLoading && tickerItems.length === 0) {
    return (/* Empty state */);
  }

  return (
    <div
      className="fixed left-0 right-0 z-[65] ticker-container bg-black/30 backdrop-blur-lg border-y border-white/10 py-1 overflow-hidden select-none"
      style={{ top: `${headerHeight}px` }}
    >
      <div
        ref={trackRef}
        className="ticker-track"
        style={{
          animationDuration: `${animationDuration}s`,
          // Optional: pause on hover
          animationPlayState: 'running'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running';
        }}
      >
        {duplicatedData.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="ticker-item flex items-center whitespace-nowrap cursor-pointer hover:bg-white/5 transition-colors duration-200 rounded-lg px-2 py-1"
            onClick={() => handleTickerItemClick(item.contractAddress)}
            title={item.marketName} // Full name on hover
          >
            <span className="text-white font-medium text-sm">
              {truncateMarketName(item.marketName)}
            </span>
            {/* Rest of item rendering */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
```

---

## Performance Considerations

### Current Performance

| Metric               | Value                      | Status             |
| -------------------- | -------------------------- | ------------------ |
| **Render frequency** | On data change (every 30s) | ✅ Good            |
| **Animation method** | CSS transform              | ✅ GPU accelerated |
| **Re-renders**       | Minimal                    | ✅ Good            |
| **Memory usage**     | Low (duplicated array)     | ✅ Good            |

### Recommendations

1. **Keep CSS animations** - They're GPU-accelerated and performant
2. **Avoid frequent re-renders** - Only update when data actually changes
3. **Use React.memo** - Memoize ticker items if they become complex
4. **Monitor FPS** - Add performance monitoring in dev mode

---

## Conclusion

### ✅ Fixed - Critical Issue Resolved

The ticker was **resetting too early** (at -100% instead of -50%) which meant only half the markets were shown before the animation jumped back. This has been fixed.

### ✅ Improved - Dynamic Duration

Animation duration now **adapts to actual content width** instead of using fixed timings. This ensures consistent scroll speed regardless of how many markets are shown or how long their names are.

### Current State

The ticker implementation is now **fully functional, performant, and adaptive**:

1. ✅ Shows all markets in each cycle (fixed -50% issue)
2. ✅ Dynamic duration based on content width
3. ✅ Responsive speeds (300px/s mobile, 200px/s desktop) - fast and readable
4. ✅ Infinite seamless loop
5. ✅ Efficient data fetching (30s polling with React Query)
6. ✅ GPU-accelerated CSS animations
7. ✅ Clean loading and empty states

### Future Enhancements

The main enhancement to consider is **position persistence** - allowing the ticker to resume from where it left off after page refresh. See detailed implementation options in the "Future Enhancement: Position Persistence" section above.

Other nice-to-haves include pause-on-hover, truncation for long names, and smooth data update transitions - but these are optional quality-of-life improvements rather than functional requirements.
