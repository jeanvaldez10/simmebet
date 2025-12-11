# Assets Directory

This directory contains all static assets for the BluffBets Blackjack application.

## Directory Structure

```
assets/
├── images/          # Image assets
│   ├── cards/       # Playing card images (suits, ranks)
│   ├── backgrounds/ # Table backgrounds, gradients, textures
│   ├── ui/          # UI elements, buttons, chips, decorations
│   └── logos/       # Brand logos, partner logos
├── icons/           # Icon assets
│   ├── social/      # Social media icons
│   ├── actions/     # Action icons (hit, stand, split, etc.)
│   └── game/        # Game-related icons (chips, cards, etc.)
├── fonts/           # Custom fonts
├── sounds/          # Audio assets
│   ├── effects/     # Sound effects (card shuffle, chip sounds)
│   └── music/       # Background music
└── videos/          # Video assets (animations, tutorials)
```

## Usage

Assets in the `public/assets/` directory can be referenced in your components using absolute paths:

```tsx
// Images
<img src="/assets/images/cards/ace-spades.png" alt="Ace of Spades" />

// Icons
<img src="/assets/icons/actions/hit.svg" alt="Hit" />

// Using Next.js Image component
import Image from 'next/image';

<Image
  src="/assets/images/logos/bluffbets.png"
  alt="BluffBets Logo"
  width={200}
  height={100}
/>
```

## Asset Guidelines

### Images

- **Format**: Use WebP for photos/complex images, PNG for transparency, SVG for vector graphics
- **Optimization**: Compress all images before adding
- **Naming**: Use kebab-case (e.g., `ace-of-spades.png`)
- **Cards**: Standard 52-card deck + jokers if needed
- **Resolution**: Provide 1x, 2x, and 3x versions for high-DPI displays when possible

### Icons

- **Format**: Prefer SVG for scalability
- **Size**: Design at 24x24px baseline
- **Color**: Use single color or design for easy color customization
- **Naming**: Descriptive kebab-case (e.g., `chip-stack.svg`)

### Fonts

- **Format**: Include WOFF2 for modern browsers, WOFF for fallback
- **License**: Ensure proper licensing for web use
- **Loading**: Use font-display: swap for better performance

### Sounds

- **Format**: Use MP3 or OGG for broad compatibility
- **Size**: Keep file sizes small (<100KB for effects)
- **Naming**: Descriptive names (e.g., `card-flip.mp3`, `chip-place.mp3`)

### Videos

- **Format**: Use MP4 (H.264) for best compatibility
- **Size**: Optimize and compress before adding
- **Consider**: Animated GIFs or Lottie animations as lighter alternatives

## Recommended Card Images

For a blackjack game, you'll need:

- 52 playing cards (13 ranks × 4 suits)
- Card back design
- Optional: Blank/placeholder card

Suggested naming convention:

```
cards/
├── hearts/
│   ├── ace.png
│   ├── 2.png
│   ├── 3.png
│   └── ...
├── diamonds/
├── clubs/
├── spades/
└── back.png
```

## Recommended Game Sounds

- `card-flip.mp3` - Card being flipped/dealt
- `card-shuffle.mp3` - Deck shuffling
- `chip-place.mp3` - Placing a bet
- `chip-collect.mp3` - Collecting winnings
- `button-click.mp3` - UI button clicks
- `win.mp3` - Winning a hand
- `lose.mp3` - Losing a hand
- `blackjack.mp3` - Getting blackjack
- `ambient-casino.mp3` - Background casino ambience

## Performance Tips

1. Use Next.js Image component for automatic optimization
2. Implement lazy loading for below-the-fold images
3. Use image sprites for small, frequently used icons
4. Preload critical assets (fonts, logo)
5. Use CSS for simple shapes instead of images when possible
