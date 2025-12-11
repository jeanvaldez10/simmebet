# Blackjack Dev Tools Feature Flag

## Overview

The Blackjack dev tools are controlled by an environment variable that can be set per deployment environment. This allows you to enable/disable dev tools independently from NODE_ENV, providing more flexibility for staging, testing, and production environments.

## Enabling Blackjack Dev Tools

To enable the dev tools, set the environment variable in your `.env` file or deployment settings:

```bash
NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS=true
```

### For Different Environments

**Local Development (.env.local):**

```bash
NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS=true
```

**Staging (.env.staging or Vercel staging environment):**

```bash
NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS=true
```

**Production (.env.production or Vercel production environment):**

```bash
NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS=false  # or omit to keep disabled
```

## What Gets Enabled

When `NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS` is set to `true`:

1. **Dev Tools Toggle Button**

   - Purple circular button appears in the top-left corner of the game
   - Click to toggle dev tools visibility

2. **Game State Selector**

   - Dropdown menu to instantly jump to specific game states
   - Pre-configured scenarios for testing (blackjack, split, bust, etc.)
   - Located in top-left below the toggle button

3. **Sound Tester**
   - Panel to test all game sounds
   - Test card dealing, wins, losses, and other audio
   - Located below the game state selector

## What Gets Disabled

When `NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS` is not set or set to `false` (default):

1. **All Dev Tools Hidden**
   - Toggle button is hidden
   - Game state selector is hidden
   - Sound tester is hidden
   - No dev tool UI elements appear in the game

## Technical Implementation

### Environment Variable

- `NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS` - Must be set to `"true"` to enable (string comparison)
- Defaults to `false` if not set or set to any other value

### Constants Location

- `/src/constants/index.ts` - Feature flag that reads from environment variable

### Affected Components

- `/src/components/games/blackjack/BlackjackGame.tsx` - Main game component
- `/src/components/games/blackjack/dev/DevToolsToggle.tsx` - Toggle button
- `/src/components/games/blackjack/dev/GameStateSelector.tsx` - State selector dropdown
- `/src/components/games/blackjack/dev/SoundTester.tsx` - Sound testing panel

## Use Cases

### Staging Environment

Enable dev tools on staging to:

- Test game states without playing through entire rounds
- QA specific scenarios quickly
- Debug audio issues
- Verify game logic with pre-configured states

### Production Environment

Keep dev tools disabled in production to:

- Prevent users from accessing debug features
- Maintain clean UI without dev buttons
- Prevent accidental state manipulation

### Local Development

Enable dev tools locally to:

- Rapidly iterate on game features
- Test edge cases
- Debug specific game scenarios
- Verify sound playback

## Default State

**Default: `NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS` not set (disabled)**

Dev tools are disabled by default for security and clean UI in production.

## Important Notes

1. **Environment Variable Prefix**: Must use `NEXT_PUBLIC_` prefix to be available in the browser
2. **String Comparison**: Value must be exactly `"true"` (as a string) to enable
3. **Rebuild Required**: After changing environment variables, you must rebuild your Next.js app
4. **Vercel Deployments**: Set environment variables in Vercel dashboard per environment
5. **Independent of NODE_ENV**: Dev tools can be enabled in production builds if desired for testing

## Vercel Configuration

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add variable: `NEXT_PUBLIC_ENABLE_BLACKJACK_DEV_TOOLS`
3. Set value: `true`
4. Select environments:
   - ✅ Development (for local development)
   - ✅ Preview (for staging/PR previews)
   - ❌ Production (keep disabled for live site)
5. Redeploy your application

## Migration from NODE_ENV

Previously, dev tools checked `process.env.NODE_ENV === "development"`. This has been replaced with the feature flag for better control:

**Before:**

```typescript
if (process.env.NODE_ENV === "development") {
  // Show dev tools
}
```

**After:**

```typescript
import { ENABLE_BLACKJACK_DEV_TOOLS } from "@/constants";

if (ENABLE_BLACKJACK_DEV_TOOLS) {
  // Show dev tools
}
```

This allows you to:

- Enable dev tools in production builds for testing
- Disable dev tools in development if desired
- Control per deployment environment (staging vs production)
