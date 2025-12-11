# Market OG Image Usage Examples

## Quick Start

### 1. Testing the Image Generation

Navigate to `/dev-tools/market-og` in your browser (development only) and enter a market identifier (UUID or contract address) to see the generated image.

### 2. Basic Usage in Code

The system accepts **both UUID and contract address** formats:

```typescript
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

// Using UUID
const imageUrl1 = getMarketOgImageUrl("123e4567-e89b-12d3-a456-426614174000");
// Result: "/api/og/market?marketId=123e4567-e89b-12d3-a456-426614174000"

// Using contract address
const imageUrl2 = getMarketOgImageUrl(
  "0x1234567890abcdef1234567890abcdef12345678"
);
// Result: "/api/og/market?marketId=0x1234567890abcdef1234567890abcdef12345678"
```

## Real-World Examples

### Example 1: Adding to Market Page Metadata

The market detail page already uses this! See `src/app/(site)/market/[id]/page.tsx`:

```typescript
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

export async function generateMetadata({ params }): Promise<Metadata> {
  const market = await getMarket(params.id);
  const marketOgImage = getMarketOgImageUrl(market.id);

  return {
    openGraph: {
      images: [{ url: marketOgImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [marketOgImage],
    },
  };
}
```

### Example 2: Share Button Component

Use the provided share button components:

```tsx
import { MarketShareButton } from "@/components/market/MarketShareButton";

function MarketHeader({ market }) {
  return (
    <div className="flex items-center justify-between">
      <h1>{market.question}</h1>
      <MarketShareButton market={market} />
    </div>
  );
}
```

**Available variants:**

- `MarketShareButton` - Full button with share and Twitter options
- `MarketShareButtonWithPreview` - Shows OG image preview on hover
- `CompactMarketShareButton` - Minimal icon-only version

### Example 3: Market Card with Share

```tsx
import { CompactMarketShareButton } from "@/components/market/MarketShareButton";

function MarketCard({ market }) {
  return (
    <div className="market-card">
      <img src={market.image} alt={market.question} />
      <h3>{market.question}</h3>
      <div className="flex justify-between items-center">
        <span>{market.yesPrice}% odds</span>
        <CompactMarketShareButton market={market} />
      </div>
    </div>
  );
}
```

### Example 4: Custom Share Handler

```typescript
import {
  getMarketOgImageUrl,
  getMarketTwitterShareUrl,
} from "@/utils/marketOgImage";

async function handleCustomShare(market) {
  const imageUrl = getMarketOgImageUrl(market.id);

  // Option 1: Web Share API (mobile-friendly)
  if (navigator.share) {
    await navigator.share({
      title: market.question,
      text: "Check out this prediction market!",
      url: window.location.href,
    });
  } else {
    // Option 2: Open Twitter share dialog
    const twitterUrl = getMarketTwitterShareUrl(market);
    window.open(twitterUrl, "_blank");
  }
}
```

### Example 5: Email Template

```typescript
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

function generateMarketEmail(market) {
  const ogImageUrl = getMarketOgImageUrl(market.id);
  const fullImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}${ogImageUrl}`;

  return `
    <html>
      <body>
        <h1>${market.question}</h1>
        <img src="${fullImageUrl}" alt="${market.question}" width="600" />
        <p>Current odds: ${market.yesPrice}%</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/market/${market.id}">
          Place Your Bet
        </a>
      </body>
    </html>
  `;
}
```

### Example 6: Dynamic OG Tags Component

```tsx
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

function MarketOGTags({ market }) {
  const ogImageUrl = getMarketOgImageUrl(market.id);

  return (
    <>
      <meta property="og:title" content={market.question} />
      <meta property="og:description" content={market.name} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImageUrl} />
    </>
  );
}
```

### Example 7: Market List with Preview

```tsx
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

function MarketList({ markets }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {markets.map((market) => {
        const ogImageUrl = getMarketOgImageUrl(market.id);

        return (
          <div key={market.id} className="market-preview">
            <img src={ogImageUrl} alt={market.question} />
            <h3>{market.question}</h3>
          </div>
        );
      })}
    </div>
  );
}
```

### Example 8: Pre-generating Images for Newsletter

```typescript
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

async function generateNewsletterImages(marketIds: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Pre-warm the cache by requesting all images
  const imagePromises = marketIds.map(async (id) => {
    const imageUrl = getMarketOgImageUrl(id);
    const fullUrl = `${baseUrl}${imageUrl}`;

    try {
      const response = await fetch(fullUrl);
      return { id, url: fullUrl, success: response.ok };
    } catch (error) {
      return { id, url: fullUrl, success: false };
    }
  });

  return await Promise.all(imagePromises);
}
```

### Example 9: QR Code with Market Image

```tsx
import QRCode from "qrcode.react";
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

function MarketQRCard({ market }) {
  const marketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.id}`;
  const ogImageUrl = getMarketOgImageUrl(market.id);

  return (
    <div className="print-card">
      <img src={ogImageUrl} alt={market.question} />
      <div className="qr-section">
        <QRCode value={marketUrl} size={200} />
        <p>Scan to place your bet</p>
      </div>
    </div>
  );
}
```

### Example 10: Admin Preview Tool

```tsx
"use client";

import { useState } from "react";
import { getMarketOgImageUrl } from "@/utils/marketOgImage";

function MarketImagePreviewTool() {
  const [marketId, setMarketId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const handlePreview = () => {
    if (marketId) {
      setPreviewUrl(getMarketOgImageUrl(marketId));
    }
  };

  const handleRefresh = () => {
    // Force refresh by adding timestamp
    if (marketId) {
      setPreviewUrl(getMarketOgImageUrl(marketId) + `&t=${Date.now()}`);
    }
  };

  return (
    <div className="admin-tool">
      <input
        value={marketId}
        onChange={(e) => setMarketId(e.target.value)}
        placeholder="Enter Market ID"
      />
      <button onClick={handlePreview}>Preview</button>
      <button onClick={handleRefresh}>Refresh Cache</button>

      {previewUrl && (
        <div className="preview">
          <img src={previewUrl} alt="Market OG Preview" />
          <code>{previewUrl}</code>
        </div>
      )}
    </div>
  );
}
```

## Platform-Specific Examples

### Twitter/X Integration

```typescript
function shareToTwitter(market) {
  const url = getMarketTwitterShareUrl(market);
  window.open(url, "_blank", "width=550,height=420");
}
```

### Facebook Integration

```typescript
function shareToFacebook(market) {
  const marketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.id}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    marketUrl
  )}`;
  window.open(facebookUrl, "_blank", "width=600,height=400");
}
```

### LinkedIn Integration

```typescript
function shareToLinkedIn(market) {
  const marketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.id}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    marketUrl
  )}`;
  window.open(linkedInUrl, "_blank", "width=600,height=600");
}
```

### WhatsApp Integration

```typescript
function shareToWhatsApp(market) {
  const marketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/market/${market.id}`;
  const text = `Check out this prediction market: ${market.question}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    text + " " + marketUrl
  )}`;
  window.open(whatsappUrl, "_blank");
}
```

## Testing Examples

### Test with Open Graph Debugger

```bash
# Facebook OG Debugger
https://developers.facebook.com/tools/debug/?q=https://yourdomain.com/market/[market-id]

# Twitter Card Validator
https://cards-dev.twitter.com/validator

# LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/
```

### cURL Test

```bash
# Test image generation
curl "http://localhost:3000/api/og/market?marketId=YOUR_MARKET_ID" -o test-market.png

# Check response headers
curl -I "http://localhost:3000/api/og/market?marketId=YOUR_MARKET_ID"
```

### Next.js Dev Console

```typescript
// In your browser console
const testMarketId = "your-market-id";
const imageUrl = `/api/og/market?marketId=${testMarketId}`;
window.open(imageUrl, "_blank");
```

## Common Patterns

### Loading State

```tsx
function MarketWithOGImage({ marketId }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const ogImageUrl = getMarketOgImageUrl(marketId);

  return (
    <div>
      {!imageLoaded && <Skeleton />}
      <img
        src={ogImageUrl}
        onLoad={() => setImageLoaded(true)}
        style={{ display: imageLoaded ? "block" : "none" }}
      />
    </div>
  );
}
```

### Error Handling

```tsx
function MarketOGImageWithFallback({ marketId, fallbackSrc }) {
  const [error, setError] = useState(false);
  const ogImageUrl = getMarketOgImageUrl(marketId);

  return (
    <img
      src={error ? fallbackSrc : ogImageUrl}
      onError={() => setError(true)}
      alt="Market preview"
    />
  );
}
```

### Cache Busting

```typescript
// Force regeneration by adding timestamp
function getMarketOgImageUrlFresh(marketId: string) {
  return `${getMarketOgImageUrl(marketId)}&t=${Date.now()}`;
}
```

## Tips & Best Practices

1. **Pre-generate for Marketing**: Generate images ahead of time for newsletters/campaigns
2. **Test on Multiple Platforms**: Each social platform renders differently
3. **Monitor Cache**: Images cache for 1 hour - plan updates accordingly
4. **Optimize Market Images**: Use high-quality background images for best results
5. **Handle Errors Gracefully**: Always provide fallback images
6. **Mobile First**: Test share functionality on mobile devices
7. **Analytics**: Track which markets are shared most frequently
8. **A/B Testing**: Try different designs to see what performs best

## Troubleshooting

### Image Not Updating

```typescript
// Clear cache by adding timestamp
const freshUrl = `${getMarketOgImageUrl(marketId)}&bust=${Date.now()}`;
```

### Image Not Loading

```typescript
// Check if market ID is valid (supports both UUID and contract address)
import { isValidMarketId } from "@/utils/marketOgImage";

if (!isValidMarketId(marketId)) {
  console.error("Invalid market ID format - must be UUID or contract address");
}

// Examples:
isValidMarketId("123e4567-e89b-12d3-a456-426614174000"); // true (UUID)
isValidMarketId("0x1234567890abcdef1234567890abcdef12345678"); // true (contract address)
isValidMarketId("invalid-format"); // false
```

### Performance Issues

```typescript
// Preload images
<link rel="preload" as="image" href={getMarketOgImageUrl(marketId)} />
```

## Additional Resources

- [Main Documentation](./MARKET_OG_IMAGE_SYSTEM.md)
- [Implementation Summary](./MARKET_OG_IMAGE_IMPLEMENTATION_SUMMARY.md)
- [Test Page](/test-market-og)
- [Flex Card System](./flex/FLEX_CARD_SYSTEM.md)
