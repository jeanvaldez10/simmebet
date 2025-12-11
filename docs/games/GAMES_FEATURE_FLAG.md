# Games Feature Flag

## Overview

The games feature is controlled by an environment variable that can be set differently for staging and production environments. This includes the games navigation link and all game routes (including Blackjack).

## Enabling the Games Feature

To enable the games feature, set the environment variable in your `.env` file or deployment settings:

```bash
NEXT_PUBLIC_ENABLE_GAMES=true
```

### For Different Environments

**Staging (.env.staging or Vercel staging environment):**
```bash
NEXT_PUBLIC_ENABLE_GAMES=true
```

**Production (.env.production or Vercel production environment):**
```bash
NEXT_PUBLIC_ENABLE_GAMES=false  # or omit to keep disabled
```

### Local Development

Create or update your `.env.local` file:
```bash
NEXT_PUBLIC_ENABLE_GAMES=true
```

## What Gets Enabled

When `ENABLE_GAMES` is set to `true`:

1. **Navigation Links**
   - "Games" link appears in the main navigation header (desktop)
   - "Games" link appears in the mobile menu

2. **Routes**
   - `/games` - Games index page with all available games
   - `/blackjack` - Blackjack game page

3. **Features**
   - Games page shows a card for each available game
   - Blackjack game is fully playable
   - Header and ticker are visible on all games pages

## What Gets Disabled

When `NEXT_PUBLIC_ENABLE_GAMES` is not set or set to `false` (default):

1. **Navigation Links**
   - "Games" link is hidden from navigation
   - "Games" link is hidden from mobile menu

2. **Route Protection**
   - `/games` redirects to home page
   - `/blackjack` redirects to home page
   - Direct URL access is blocked

## Technical Implementation

### Environment Variable
- `NEXT_PUBLIC_ENABLE_GAMES` - Must be set to `"true"` to enable (string comparison)
- Defaults to `false` if not set or set to any other value

### Constants Location
- `/src/constants/index.ts` - Feature flag that reads from environment variable

### Protected Routes
- `/src/app/(games)/games/page.tsx` - Games index page
- `/src/app/(games)/blackjack/page.tsx` - Blackjack game page

### Navigation Components
- `/src/components/Header.tsx` - Main navigation with conditional games link

### Layout Components
- `/src/app/(games)/layout.tsx` - Games layout wrapper
- `/src/app/(games)/GamesClientLayout.tsx` - Client-side games layout
- `/src/components/GamesPageLayout.tsx` - Page layout with header and ticker

## Games Layout

All games pages include:
- Header (with navigation)
- Ticker (market data)
- Background image
- Full authentication and wallet integration

The layout is consistent with the main site for a seamless user experience.

## Adding New Games

To add a new game:

1. Create a new game component in `/src/components/games/[game-name]/`
2. Add a route in `/src/app/(games)/[game-name]/page.tsx`
3. Add a card to the games index page at `/src/app/(games)/games/page.tsx`
4. The game will automatically be protected by the `ENABLE_GAMES` feature flag

## Default State

**Default: `NEXT_PUBLIC_ENABLE_GAMES` not set (disabled)**

Games are disabled by default to allow for controlled rollout and testing.

## Important Notes

1. **Environment Variable Prefix**: Must use `NEXT_PUBLIC_` prefix to be available in the browser
2. **String Comparison**: Value must be exactly `"true"` (as a string) to enable
3. **Rebuild Required**: After changing environment variables, you must rebuild your Next.js app
4. **Vercel Deployments**: Set environment variables in Vercel dashboard per environment

## Vercel Configuration

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add variable: `NEXT_PUBLIC_ENABLE_GAMES`
3. Set value: `true`
4. Select environments: Choose "Preview" for staging, leave unchecked for "Production"
5. Redeploy your application

