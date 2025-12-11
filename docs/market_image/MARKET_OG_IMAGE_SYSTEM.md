# Market OG Image Generation System

## Overview

The Market OG Image Generation system creates dynamic Open Graph images for market pages. Similar to the Flex Card system, it generates high-quality, shareable images that display market information with the market's background image.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Market Image Generation Flow                    │
└─────────────────────────────────────────────────────────────┘

1. Request to /api/og/market?marketId={id}
   ↓
2. Fetch market data from database (including categories)
   ↓
3. Load Google Fonts (Geist 600, 700, 900)
   ↓
4. Render ImageResponse with:
   - Market image as background
   - Dark overlay for readability
   - Category badge
   - Market title and description
   - Date and "Place Your Bet" buttons
   - Circular progress indicator showing odds
   ↓
5. Return 1200x630 PNG image
   - Cached for 1 hour
   - Suitable for Open Graph and Twitter cards
```

## API Endpoint

### GET /api/og/market

**Query Parameters:**

- `marketId` (required): The market identifier - accepts BOTH:
  - UUID format: `123e4567-e89b-12d3-a456-426614174000`
  - Contract Address: `0x1234567890abcdef...` (42 characters)

**Response:**

- Content-Type: `image/png`
- Dimensions: 1920x1080 pixels
- Cache-Control: `public, max-age=3600, s-maxage=3600`

**Examples:**

```
GET /api/og/market?marketId=123e4567-e89b-12d3-a456-426614174000
GET /api/og/market?marketId=0x1234567890abcdef1234567890abcdef12345678
```

## Image Layout

### Components

1. **Background Layer**

   - Market image (`market.imageSquare` or `market.image`)
   - Dark overlay (rgba(0, 0, 0, 0.6)) for text readability

2. **Category Badge** (Top Left)

   - White rounded pill with black text
   - Displays market category name
   - Uppercase text

3. **Market Title** (Middle Left)

   - Large bold text (72px)
   - Market question truncated to 80 characters
   - White color with text shadow
   - Uppercase styling

4. **Market Description** (Below Title)

   - Medium text (32px)
   - Market name or default description
   - Semi-transparent white

5. **Bottom Row** (Left to Right)
   - **Date Button**: Market date in MM/DD/YYYY format
   - **Place Your Bet Button**: Call-to-action
   - **Odds Circle**: Circular progress indicator
     - Shows YES odds percentage
     - Green (#00E5B0) for ≥50%, Red (#FF5571) for <50%
     - Animated SVG circle

## Design Specifications

### Colors

- **Background Overlay**: rgba(0, 0, 0, 0.6)
- **Buttons**: rgba(255, 255, 255, 0.95)
- **Primary Text**: #FFFFFF
- **Secondary Text**: rgba(255, 255, 255, 0.85)
- **Success (Odds ≥50%)**: #00E5B0
- **Danger (Odds <50%)**: #FF5571

### Typography

- **Font Family**: Geist
- **Weights**: 600 (Semibold), 700 (Bold), 900 (Black)
- **Category Badge**: 22px, 700 weight
- **Title**: 80px, 900 weight, uppercase
- **Description**: 27px, 600 weight
- **Buttons**: 27px, 700 weight
- **Odds**: 26px, 900 weight

### Dimensions

- **Image**: 1920x1080 px (Full HD)
- **Content Area**: Full width with left-aligned layout, 80px padding (200px right padding)
- **Title/Description Max Width**: 1050px
- **Category Badge to Title Gap**: 90px
- **Category Badge**: Auto width, ~46px height
- **Buttons**: Auto width, 25px vertical × 60px horizontal padding
- **Odds Circle**: 100x100 px

## Usage Examples

### In Next.js Page Metadata

```typescript
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const marketId = params.id;

  return {
    openGraph: {
      title: "Market Title",
      description: "Market description",
      images: [
        {
          url: `/api/og/market?marketId=${marketId}`,
          width: 1920,
          height: 1080,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Market Title",
      description: "Market description",
      images: [`/api/og/market?marketId=${marketId}`],
    },
  };
}
```

### Direct Image Link

```html
<meta
  property="og:image"
  content="https://yourdomain.com/api/og/market?marketId=123e4567-e89b-12d3-a456-426614174000"
/>
<meta
  name="twitter:image"
  content="https://yourdomain.com/api/og/market?marketId=123e4567-e89b-12d3-a456-426614174000"
/>
```

### Testing

Visit the dev tools at `/dev-tools/market-og` (development only) to:

1. Enter a market ID
2. Preview the generated image
3. See usage examples
4. Test different markets

## Database Requirements

The system requires the following market fields:

- `id` (UUID) - Primary identifier
- `contractAddress` (string, unique) - Alternative identifier (0x...)
- `question` (string)
- `name` (string)
- `date` (DateTime, nullable)
- `yesPrice` (float) - Fallback odds percentage
- `currentOdds` (relation to MarketCurrentOdds) - Real-time odds data
  - `yesOdds` (Decimal) - Current YES odds percentage (preferred)
- `socialImage` (string, nullable) - Preferred background image for OG images (1920x1080)
- `imageSquare` (string, nullable) - Fallback square image
- `image` (string, nullable) - Fallback regular image
- `categoryAssignments` (relation to MarketCategory)

**Notes:**

- The API accepts either `id` or `contractAddress` as the `marketId` parameter and automatically detects which format is being used.
- The system prioritizes `currentOdds.yesOdds` for the most accurate real-time odds, falling back to `yesPrice` if currentOdds is not available.
- Background image priority order: `socialImage` → `imageSquare` → `image`. The `socialImage` field is specifically designed for OG images at 1920x1080 resolution.

## Performance Considerations

### Caching

- Images are cached for 1 hour (3600 seconds)
- CDN/edge caching recommended for production

### Font Loading

- Fonts are loaded dynamically from Google Fonts
- Only required characters are loaded for optimization
- Multiple weights loaded in parallel

### Image Processing

- Market images are fetched and processed on-the-fly
- Consider pre-optimizing market images for faster generation

## Error Handling

### Missing marketId

```
Status: 400 Bad Request
Body: "Missing marketId parameter"
```

### Market Not Found

```
Status: 404 Not Found
Body: "Market not found"
```

### Generation Error

```
Status: 500 Internal Server Error
Body: "Failed to generate the image: [error message]"
```

## Comparison with Flex Cards

| Feature      | Flex Cards             | Market Images         |
| ------------ | ---------------------- | --------------------- |
| Purpose      | User betting activity  | Market promotion      |
| Background   | Static template        | Market-specific image |
| Data Source  | FlexSnapshot table     | Market table          |
| Primary Info | Bet results/positions  | Market odds           |
| Size         | 1500x750 or 1200x630   | 1200x630              |
| Use Case     | Sharing bets on social | Market discovery      |

## Future Enhancements

Potential improvements:

1. **Dynamic Themes**: Different color schemes per category
2. **Multiple Layouts**: Alternative designs for different market types
3. **Animated GIFs**: Show odds changing over time
4. **QR Codes**: Include QR code linking to market
5. **Leaderboard**: Show top traders on market image
6. **Live Data**: Real-time odds updates
7. **Branding**: Customizable logos and watermarks

## Related Documentation

- [Flex Card System](./flex/FLEX_CARD_SYSTEM.md)
- [Market Categories](../prisma/schema.prisma)
- [Next.js ImageResponse API](https://nextjs.org/docs/app/api-reference/functions/image-response)
