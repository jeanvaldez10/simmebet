# Carousel Market Linking Logic

## Overview

The banner carousel can display content in three ways:

1. **Image Only** - When using social/OG images (no overlay)
2. **Manual Content** - Custom content with overlay
3. **Hybrid** - Manual content + live market odds

---

## TL;DR - Quick Decision Tree

```
Has marketId?
  ├─ useSocialImage = true  → Generated OG Image + NO Overlay (clean professional look)
  └─ useSocialImage = false → Uploaded Banner + YES Overlay (custom design with live odds)

No marketId?
  → Uploaded Banner + Overlay with manual content
```

---

## Boolean Flags

### `marketId` (string | optional)

Links the carousel banner to a specific market by its UUID or contract address.

### `useSocialImage` (boolean, default: false) ⭐ **PRIMARY CONTROL**

**This boolean takes absolute priority over all other logic:**

- **When `true`:**
  - ✅ Uses generated OG image from `/api/og/market`
  - ❌ NO overlay displayed
  - 📦 All content baked into image
- **When `false`:**
  - 🖼️ Uses uploaded banner image
  - ✅ ALWAYS shows overlay structure
  - 📊 Live market odds if `marketId` exists

---

## Content Display Logic

### Priority 1: No Overlay (useSocialImage = true) ⭐

**When:**

- ✅ `useSocialImage = true`

**Result:**

- **NO content overlay displayed at all**
- The image itself (social image or generated OG image) contains all the content baked in
- **ALL manual content fields are IGNORED**
- Image is displayed full-screen without any text, buttons, or overlays
- Content like title, description, buttons, and odds are part of the image itself

**Use Case:** Perfect for market-generated images where all design is pre-rendered in the OG image

---

### Priority 2: Manual Carousel Content (useSocialImage = false)

**When:**

- ❌ `useSocialImage = false` OR not set
- ✅ Any of these fields have data:
  - `title`
  - `subtitle`
  - `description`
  - `date`
  - `primaryButtonText`
  - `secondaryButtonText`

**Result:** Display the manually entered content overlaid on the image.

---

### Priority 3: Live Market Odds (Always When marketId Exists)

**When:** `marketId` is set AND `useSocialImage = false`

**Result:** Circular progress indicator shows **live market odds** overlaid on content:

1. **Priority 1:** `market.currentOdds.yesOdds` (real-time)
2. **Priority 2:** Calculated from `market.yesPrice`: `(yesPrice / 2) * 100`
3. **Fallback:** `betChance` field from carousel (deprecated)

> **Note:** `betChance` field will be removed once market integration is fully adopted.

---

## Image Source Logic

**`useSocialImage` boolean is the PRIMARY determinant:**

### `useSocialImage = true` (Market-Powered Mode)

**Image:**

- Uses dynamically generated OG image: `/api/og/market?marketId={id}`
- All content (title, buttons, odds) is baked into the image

**Overlay:**

- ❌ NO overlay displayed
- Content is part of the image itself

### `useSocialImage = false` (Manual Mode)

**Image:**

- Uses uploaded `imageSrc` / `mobileBannerSrc`
- Falls back to uploaded banner even if `marketId` exists

**Overlay:**

- ✅ ALWAYS shows overlay structure
- Displays whatever content fields are populated
- Shows circular progress with live market odds if `marketId` exists

### No `marketId` Set

**Image:**

- Uses uploaded `imageSrc` or `mobileBannerSrc`

**Overlay:**

- Shows overlay with whatever content is available

---

## Common Scenarios

### Scenario 1: Market-Powered Image (No Overlay) ⭐ RECOMMENDED

```typescript
{
  title: "",           // Ignored
  description: "",     // Ignored
  primaryButtonText: "", // Ignored
  marketId: "abc-123",
  useSocialImage: true
}
```

**Result:**

- Displays generated OG image or social image ONLY
- No overlay, no buttons, no text overlaid
- All content is baked into the image itself
- Clean, professional look

---

### Scenario 2: Fully Manual Banner

```typescript
{
  title: "Custom Title",
  primaryButtonText: "Click Here",
  imageSrc: "/uploaded-banner.jpg",
  marketId: null,
  useSocialImage: false
}
```

**Result:** Shows custom content overlaid on uploaded image.

---

### Scenario 3: Hybrid (Custom Content + Live Odds)

```typescript
{
  title: "My Custom Title",
  primaryButtonText: "Learn More",
  imageSrc: "/my-banner.jpg",
  marketId: "abc-123",
  useSocialImage: false
}
```

**Result:**

- Shows custom content and uploaded image
- Circular indicator displays **live market odds** (not betChance)
- Uses generated OG image as background

---

## Admin Preview vs Live Site

### ⚠️ Important Discrepancy

**Admin Preview:**

- Uses `formData` directly from input fields
- Shows what you type in real-time
- Reflects form state, not database state

**Live Homepage:**

- Uses **saved database data** from `/api/carousel/published`
- If fields are null/empty in database → different behavior
- Must save changes to see actual live behavior

**To Fix:** Ensure all form fields are properly saved to the database before publishing.

---

## Database Fields

```typescript
CarouselItem {
  marketId?: string | null
  useSocialImage: boolean (default: false)  // KEY FLAG: true = no overlay
  marketSocialImageUrl?: string | null      // Server-enriched field

  // Manual content fields (IGNORED when useSocialImage=true)
  title: string
  subtitle: string
  description: string
  date: string
  primaryButtonText?: string
  secondaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonLink?: string

  // Deprecated (will be removed)
  betChance?: number  // TODO: Remove after market integration
}
```

---

## Quick Reference

| Scenario                     | `marketId` | `useSocialImage` | Manual Content | Image Used         | Overlay Shown | Odds Source |
| ---------------------------- | ---------- | ---------------- | -------------- | ------------------ | ------------- | ----------- |
| **Market OG Image Only**     | ✅         | ✅               | ❌ (ignored)   | Generated OG Image | ❌ No         | Baked in    |
| Market OG + Manual (ignored) | ✅         | ✅               | ✅ (ignored)   | Generated OG Image | ❌ No         | Baked in    |
| Manual with Uploaded         | ❌         | ❌               | ✅             | Uploaded Banner    | ✅ Yes        | betChance   |
| Manual + Live Market Odds    | ✅         | ❌               | ✅             | Uploaded Banner    | ✅ Yes        | Live Market |

---

## Debug Logs

When troubleshooting carousel issues for market `ab31c819-3b85-4ccb-bef6-891b237a331f`, check console for:

**API Logs:**

- `🔍 [API] Debug carousel item ab31c819 (raw from DB)` - Database values
- `🔍 [API] Debug carousel item ab31c819 (after enrichment)` - After social image fetch
- `🔍 [API] Debug carousel item ab31c819 (after conversion/final)` - Final output

**Component Logs:**

- `🔍 Debug banner ab31c819` - What the carousel component receives
- Check `useSocialImage`, `marketSocialImageUrl`, and all content fields

---

## Best Practices

✅ **DO:** Use `useSocialImage: true` for market-linked banners to show pre-rendered OG images  
✅ **DO:** Leave all content fields empty when `useSocialImage: true`  
✅ **DO:** Use custom content fields when you need specific messaging  
✅ **DO:** Link `marketId` to get live odds even with custom content

❌ **DON'T:** Fill in content fields when `useSocialImage: true` (they're ignored anyway)  
❌ **DON'T:** Use `betChance` field - it's deprecated, use `marketId` instead  
❌ **DON'T:** Forget to publish changes - admin preview shows form state, not live state
