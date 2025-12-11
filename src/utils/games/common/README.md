# Shared Game Assets Manager

## Overview

This directory contains the **centralized asset manager** for all PixiJS games. It prevents duplicate asset loading when switching between games.

## Architecture

```
src/utils/games/
├── common/
│   └── pixiAssets.ts          ← SHARED ASSET MANAGER (single source of truth)
├── blackjack/client/
│   └── pixiAssets.ts          ← Re-exports from common
└── coinflip/client/
    └── pixiAssets.ts          ← Re-exports from common
```

## How It Works

### Before (❌ Problem):
```typescript
// blackjack/client/pixiAssets.ts
let assetsLoaded = false;  // Separate flag

// coinflip/client/pixiAssets.ts  
let assetsLoaded = false;  // Another separate flag

// Result: Both games try to load assets independently!
```

### After (✅ Solution):
```typescript
// common/pixiAssets.ts
let assetsLoaded = false;  // SINGLE GLOBAL FLAG

// blackjack/client/pixiAssets.ts
export * from "@/utils/games/common/pixiAssets";  // Re-export

// coinflip/client/pixiAssets.ts
export * from "@/utils/games/common/pixiAssets";  // Re-export

// Result: Assets loaded once, shared by all games!
```

## What's Loaded

The shared asset manager loads:

### Blackjack Assets:
- Backgrounds (desktop & mobile)
- UI elements (deck, buttons, overlays)
- 52 playing cards
- Card back texture
- All chip denominations

### Coinflip Assets:
- Coin textures

### Shared Assets:
- Chips (used by multiple games)
- Playing cards (used by card games)
- Common UI elements

## Usage

Games should continue importing from their own paths:

```typescript
// In blackjack components
import { getCardTexture } from "@/utils/games/blackjack/client/pixiAssets";

// In coinflip components
import { getIconTexture } from "@/utils/games/coinflip/client/pixiAssets";
```

Both will use the same underlying shared asset manager automatically!

## Benefits

✅ **No duplicate loading** - Assets load once globally  
✅ **Faster game switching** - Assets already in memory  
✅ **Better performance** - Reduced memory usage  
✅ **Single source of truth** - One place to manage all assets  
✅ **Backward compatible** - Existing imports still work  

## Adding New Game Assets

To add assets for a new game:

1. Add asset definitions in `common/pixiAssets.ts`:
```typescript
// In preloadGameAssets()
assetsToLoad.push({
  alias: "newGameAsset",
  src: "/games/newgame/assets/images/asset.png",
});
```

2. Create game-specific re-export file:
```typescript
// src/utils/games/newgame/client/pixiAssets.ts
export * from "@/utils/games/common/pixiAssets";
```

3. Import in game components:
```typescript
import { getUITexture } from "@/utils/games/newgame/client/pixiAssets";
```

Done! ✅

