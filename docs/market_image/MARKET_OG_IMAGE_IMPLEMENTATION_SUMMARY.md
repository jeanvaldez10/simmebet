# Market OG Image Implementation Summary

## What Was Created

A complete system for generating dynamic Open Graph images for market pages, similar to the existing Flex Card system.

## Files Created

### 1. API Route

**File:** `src/app/(site)/api/og/market/route.tsx`

The main API endpoint that generates dynamic OG images for markets.

**Features:**

- Takes `marketId` as a query parameter (accepts UUID or contract address)
- Automatically detects whether ID is UUID or contract address (0x...)
- Fetches market data from the database using the appropriate field
- Uses the market's image as the background
- Overlays market information (title, odds, date, category)
- Generates a 1920x1080 PNG image (Full HD)
- Includes SVG circular progress indicator showing odds
- Caches images for 1 hour

**Usage:**

```
GET /api/og/market?marketId=<uuid-or-contract-address>

Examples:
/api/og/market?marketId=123e4567-e89b-12d3-a456-426614174000
/api/og/market?marketId=0x1234567890abcdef1234567890abcdef12345678
```

### 2. Test Page (Development Only)

**File:** `src/app/dev-tools/market-og/page.tsx`

An interactive test page for previewing generated market OG images. Only accessible in development mode.

**Features:**

- Input field for market ID
- Live preview of generated image
- Usage examples
- API documentation
- Helpful instructions

**Access:** Navigate to `/dev-tools/market-og` in your browser (development mode only)

### 3. Utility Functions

**File:** `src/utils/marketOgImage.ts`

Helper functions for working with market OG images throughout the app.

**Functions:**

- `getMarketOgImageUrl(marketId, baseUrl?)` - Generate OG image URL
- `generateMarketMetadata(market)` - Generate Next.js metadata object
- `getMarketShareData(market)` - Get data for Web Share API
- `getMarketTwitterShareUrl(market)` - Generate Twitter share URL
- `isValidMarketId(marketId)` - Validate UUID format

### 4. Documentation

**File:** `docs/MARKET_OG_IMAGE_SYSTEM.md`

Comprehensive documentation covering:

- System architecture
- API endpoint details
- Image layout specifications
- Design specifications (colors, typography, dimensions)
- Usage examples
- Error handling
- Comparison with Flex Cards
- Future enhancement ideas

## Integration

### Updated Market Page

**File:** `src/app/(site)/market/[id]/page.tsx`

Updated the existing market detail page to use the new dynamic OG images:

- Imported `getMarketOgImageUrl` utility
- Updated `generateMetadata()` to use dynamic OG image URL
- Now all market pages automatically use the new image generation

**Before:**

```typescript
const marketImage = market.image || "/og-image.png";
```

**After:**

```typescript
const marketOgImage = getMarketOgImageUrl(market.id);
```

## Design Elements

Based on your uploaded design, the generated image includes:

### Layout Components

1. **Category Badge** (Top Left)

   - White rounded pill with black text
   - Shows market category (e.g., "POLITICS", "SPORTS")
   - Uppercase styling

2. **Market Title** (Center)

   - Large, bold, uppercase text (72px)
   - Market question truncated to 80 characters
   - White with text shadow for readability

3. **Market Description** (Below Title)

   - Smaller text (32px)
   - Market name or default description
   - Semi-transparent white

4. **Bottom Row** (Left to Right)
   - **Date Button**: Market date (MM/DD/YYYY format)
   - **"Place Your Bet" Button**: Call-to-action
   - **Circular Progress Indicator**: Shows odds percentage
     - Green (#00E5B0) for odds ≥50%
     - Red (#FF5571) for odds <50%

### Visual Features

- **Background**: Market's image (from `imageSquare` or `image` field)
- **Overlay**: Dark semi-transparent layer (rgba(0, 0, 0, 0.6)) for text readability
- **Typography**: Geist font (weights 600, 700, 900)
- **Buttons**: White rounded pills with black text
- **Odds Circle**: SVG-based circular progress indicator

## How to Use

### 1. Test the Image Generation

Visit `/dev-tools/market-og` (development only) and enter a market ID to preview the generated image.

### 2. In Your Code

```typescript
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

// Get the OG image URL
const imageUrl = getMarketOgImageUrl(marketId);

// Use in metadata
export const metadata = {
  openGraph: {
    images: [imageUrl],
  },
  twitter: {
    card: "summary_large_image",
    images: [imageUrl],
  },
};
```

### 3. Direct Link

```html
<meta
  property="og:image"
  content="https://yourdomain.com/api/og/market?marketId=123e4567..."
/>
```

### 4. Share Button Example

```typescript
const handleShare = async () => {
  const imageUrl = getMarketOgImageUrl(market.id);
  if (navigator.share) {
    await navigator.share({
      title: market.question,
      url: window.location.href,
    });
  }
};
```

## Technical Details

### Image Specifications

- **Dimensions**: 1920x1080 pixels (Full HD)
- **Format**: PNG
- **Cache Duration**: 1 hour (3600 seconds)
- **Content-Type**: `image/png`

### Performance

- Fonts loaded in parallel from Google Fonts
- Only required characters loaded for optimization
- Images cached with proper headers
- Background images fetched and processed on-demand

### Database Dependencies

Requires these market fields:

- `id` (UUID) - Primary identifier
- `contractAddress` (string, unique) - Alternative identifier (0x...)
- `question` (string)
- `name` (string)
- `date` (DateTime, nullable)
- `yesPrice` (float) - for odds percentage
- `image` or `imageSquare` (string, nullable)
- `categoryAssignments` (relation)

**Note:** The route accepts either identifier format and automatically queries the correct field.

## Next Steps

1. **Test with Real Markets**

   - Navigate to `/dev-tools/market-og` (development only)
   - Enter a market ID from your database
   - Verify the generated image looks correct

2. **Customize Design** (Optional)

   - Modify colors in `src/app/(site)/api/og/market/route.tsx`
   - Adjust layout, fonts, or dimensions
   - Update circular progress colors/thresholds

3. **Social Media Testing**

   - Share a market page URL on Twitter/X
   - Verify the OG image displays correctly
   - Test on other platforms (Facebook, LinkedIn, etc.)

4. **Performance Monitoring**
   - Monitor API response times
   - Consider CDN caching for production
   - Pre-optimize market images if needed

## Comparison with Existing Flex Cards

| Aspect          | Flex Cards             | Market OG Images      |
| --------------- | ---------------------- | --------------------- |
| **Purpose**     | Share betting activity | Promote markets       |
| **Data Source** | FlexSnapshot table     | Market table          |
| **Background**  | Static template        | Market-specific image |
| **Content**     | Bet results/positions  | Market info & odds    |
| **User Focus**  | Individual trader      | Market discovery      |
| **Use Case**    | Social proof           | Marketing & sharing   |

## Benefits

1. **Dynamic Content**: Each market gets a unique, branded image
2. **Better Engagement**: Visual images drive more clicks on social media
3. **Consistent Branding**: All images follow the same design system
4. **Easy to Use**: Simple API with utility functions
5. **Performant**: Cached and optimized for production
6. **Flexible**: Easy to customize and extend

## Troubleshooting

### Image Not Displaying

- Verify market ID is valid UUID
- Check market exists in database
- Ensure market has an image (or default will show)
- Check browser console for errors

### Styling Issues

- Clear cache (images cached for 1 hour)
- Check font loading in browser network tab
- Verify market image URL is accessible

### Performance Issues

- Implement CDN caching
- Pre-optimize market images
- Consider image CDN for backgrounds

## Future Enhancements

Potential additions:

- Multiple layout themes per category
- Animated GIFs showing live odds
- QR codes linking to markets
- Leaderboard overlay
- Custom branding options
- A/B testing different designs
