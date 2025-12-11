# BluffBets Blackjack

A Web3-enabled Blackjack gaming platform built with Next.js 15, React 19, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The development server uses Turbopack for faster builds and hot reloading.

### Build

Build the application for production:

```bash
npm run build
```

### Production

Run the production build:

```bash
npm start
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Build Tool**: Turbopack

## Project Structure

```
bluffbets-blackjack/
├── app/
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── lib/
│   └── utils/
│       ├── assets.ts        # Asset path utilities
│       └── assets.example.tsx  # Usage examples
├── public/
│   └── assets/              # Static assets
│       ├── images/          # Images (cards, backgrounds, ui, logos)
│       ├── icons/           # Icons (social, actions, game)
│       ├── fonts/           # Custom fonts
│       ├── sounds/          # Audio (effects, music)
│       └── videos/          # Video assets
├── package.json             # Project dependencies
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

See `public/assets/README.md` for detailed asset organization guidelines.

## Next Steps

Based on the GAME_ARCHITECTURE_BLUEPRINT.md, the following features can be implemented:

- [ ] Prisma ORM setup for database management
- [ ] SIWE (Sign-In With Ethereum) authentication
- [ ] Game state machine and logic
- [ ] Blackjack game components
- [ ] Balance management system
- [ ] Wallet integration with Wagmi and Reown AppKit

## Documentation

See `GAME_ARCHITECTURE_BLUEPRINT.md` for comprehensive architecture documentation and implementation guidelines.
