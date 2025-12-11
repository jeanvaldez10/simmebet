# Assets Quick Reference Guide

## 📁 Directory Structure

```
public/assets/
├── 📸 images/
│   ├── 🃏 cards/          → Playing cards (52 cards + back)
│   ├── 🎨 backgrounds/    → Table felt, textures, patterns
│   ├── 🎯 ui/             → Chips, buttons, decorations
│   └── 🏷️  logos/         → Brand and partner logos
├── 🎨 icons/
│   ├── 📱 social/         → Twitter, Discord, Telegram
│   ├── ⚡ actions/        → Hit, Stand, Split, Double
│   └── 🎮 game/           → Wallet, Settings, Info
├── 🔤 fonts/             → Custom web fonts
├── 🔊 sounds/
│   ├── 🎵 effects/        → Card flip, chip sounds
│   └── 🎶 music/          → Background ambience
└── 🎬 videos/            → Animations, tutorials
```

## 🚀 Quick Usage

### In Your React Components

```tsx
import Image from 'next/image';
import { getCardImage, getIcon, getSoundEffect } from '@/lib/utils/assets';

// Display a card
<Image
  src={getCardImage('spades', 'ace')}
  alt="Ace of Spades"
  width={100}
  height={140}
/>

// Display an icon
<img src={getIcon('actions', 'hit')} alt="Hit" className="w-6 h-6" />

// Play a sound
<button onClick={() => new Audio(getSoundEffect('card-flip')).play()}>
  Deal Card
</button>
```

### Direct Path Access

```tsx
import { AssetPaths } from "@/lib/utils/assets";

// Get base paths
const cardPath = `${AssetPaths.images.cards}/hearts/ace.png`;
const iconPath = `${AssetPaths.icons.actions}/hit.svg`;
```

## 📋 Recommended Assets for Blackjack

### Playing Cards (52 files)

```
cards/
├── hearts/     (ace.png, 2.png ... king.png)
├── diamonds/   (ace.png, 2.png ... king.png)
├── clubs/      (ace.png, 2.png ... king.png)
├── spades/     (ace.png, 2.png ... king.png)
└── back.png    (Card back design)
```

### UI Elements

- `chip-1.png`, `chip-5.png`, `chip-10.png`, `chip-25.png`
- `chip-100.png`, `chip-500.png`, `chip-1000.png`
- `button-primary.png`, `button-secondary.png`

### Icons

- **Actions**: `hit.svg`, `stand.svg`, `double.svg`, `split.svg`, `surrender.svg`
- **Game**: `wallet.svg`, `settings.svg`, `history.svg`, `info.svg`, `help.svg`
- **Social**: `twitter.svg`, `discord.svg`, `telegram.svg`

### Sound Effects

- `card-flip.mp3` - Dealing cards
- `card-shuffle.mp3` - Shuffling deck
- `chip-place.mp3` - Placing bets
- `chip-collect.mp3` - Collecting winnings
- `button-click.mp3` - UI interactions
- `win.mp3` - Winning hand
- `lose.mp3` - Losing hand
- `blackjack.mp3` - Natural 21
- `push.mp3` - Tie with dealer

### Background Music

- `casino-ambient.mp3` - Casino atmosphere
- `lobby-music.mp3` - Menu music

## 💡 Best Practices

1. **Image Formats**

   - Use **WebP** for photos (smaller file size)
   - Use **PNG** for transparency (cards, chips)
   - Use **SVG** for icons (scalable)

2. **Naming Convention**

   - Use lowercase with hyphens: `ace-of-spades.png`
   - Be descriptive: `chip-100-blue.png`
   - Keep it short: `bg-felt.jpg`

3. **Performance**

   - Compress images before adding
   - Use Next.js `<Image>` component for optimization
   - Lazy load below-the-fold images
   - Preload critical assets (visible cards, logos)

4. **Accessibility**
   - Always provide meaningful `alt` text
   - Use ARIA labels for icon buttons
   - Provide visual alternatives to sound effects

## 🎨 Asset Resources

### Free Card Decks

- [Vectorized Playing Cards](https://code.google.com/archive/p/vectorized-playing-cards/)
- [SVG Cards](https://github.com/htdebeer/SVG-cards)
- [Playing Cards Assets](https://www.me.uk/cards/)

### Free Icons

- [Heroicons](https://heroicons.com/) - Beautiful SVG icons
- [Lucide](https://lucide.dev/) - Modern icon set
- [Phosphor Icons](https://phosphoricons.com/) - Flexible icons

### Free Sounds

- [Freesound](https://freesound.org/) - Community sound library
- [Zapsplat](https://www.zapsplat.com/) - Free SFX library
- [Mixkit](https://mixkit.co/free-sound-effects/) - High-quality sounds

### Fonts

- [Google Fonts](https://fonts.google.com/) - Free web fonts
- [Font Squirrel](https://www.fontsquirrel.com/) - Commercial-use fonts

## 🔧 Utility Functions Reference

| Function                   | Purpose             | Example                         |
| -------------------------- | ------------------- | ------------------------------- |
| `getCardImage(suit, rank)` | Get card image path | `getCardImage('hearts', 'ace')` |
| `getCardBackImage()`       | Get card back path  | `getCardBackImage()`            |
| `getIcon(category, name)`  | Get icon path       | `getIcon('actions', 'hit')`     |
| `getSoundEffect(name)`     | Get sound effect    | `getSoundEffect('card-flip')`   |
| `getMusic(name)`           | Get music track     | `getMusic('casino-ambient')`    |
| `getUIImage(name)`         | Get UI element      | `getUIImage('chip-100')`        |
| `getLogo(name)`            | Get logo            | `getLogo('bluffbets-logo')`     |
| `getBackground(name)`      | Get background      | `getBackground('table-felt')`   |

## 📦 Next Steps

1. **Add Card Images**: Start with a basic 52-card deck
2. **Add UI Elements**: Chips, buttons, decorative elements
3. **Add Sounds**: Card flip, chip placement sounds
4. **Add Icons**: Action buttons (hit, stand, etc.)
5. **Optimize**: Compress and optimize all assets

---

For detailed documentation, see `/public/assets/README.md`
For usage examples, see `/lib/utils/assets.example.tsx`
