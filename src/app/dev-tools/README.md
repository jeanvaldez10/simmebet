# Development Tools

This directory contains internal development tools and utilities that are only accessible in development mode.

## Access

- **Environment**: Only accessible when `NODE_ENV === 'development'`
- **URL**: `/dev-tools`
- **Footer Link**: A "Dev Tools" link appears in the footer during development

## Available Tools

### Market OG Image Tester (`/dev-tools/market-og`)

Test and preview dynamically generated market Open Graph images.

**Features:**

- Preview OG images for any market (by UUID or contract address)
- See the generated 1920x1080 image in real-time
- Get usage examples for metadata
- Test the `/api/og/market` endpoint

**Use Case:**
Test market OG images before they're used in production, verify that new markets have proper images, and debug OG image generation issues.

## Adding New Tools

To add a new development tool:

1. Create a new directory under `/dev-tools/your-tool-name`
2. Add a `page.tsx` with dev mode protection:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function YourToolPage() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.push('/');
    }
  }, [router]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    // Your tool UI
  );
}
```

3. Add a card to `/dev-tools/page.tsx` linking to your new tool

## Security

- All pages in this directory check `process.env.NODE_ENV` and redirect to home if not in development
- No sensitive data should be exposed in these tools
- These tools are for development convenience only and won't be accessible in production builds
