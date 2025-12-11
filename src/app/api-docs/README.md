# API Documentation & Testing

This directory contains the authenticated API documentation and testing interface.

## Access

The API docs are accessible at `/api-docs` but require **two levels of authentication**:

### Authentication Flow

**Step 1: Password Protection (First Layer)**

- Enter password to unlock the API docs page
- **Default Password**: `bluff-dev-2025`
- **Environment Variable**: `NEXT_PUBLIC_API_DOCS_PASSWORD`
- Password is stored in session storage

**Step 2: User Authentication (Second Layer)**

- After entering password, users must be signed in with their Bluff account
- If not signed in, users are directed to the main site to sign in
- After signing in on main site, users can return to access API docs
- Uses the `NEXT_PUBLIC_APP_URL` environment variable for redirects

### Environment Variables

```env
# Password for API docs access
NEXT_PUBLIC_API_DOCS_PASSWORD=your-custom-password

# Main site URL for authentication redirects
NEXT_PUBLIC_APP_URL=https://your-site.com
```

## Security Layers

1. **Password Protection**: First barrier to prevent unauthorized discovery (session storage)
2. **User Authentication**: Must have valid Bluff account (redirects to main site to sign in)
3. **Lock Button**: Available in top-right corner to manually lock and clear password
4. Session-based - users re-authenticate each browser session

## User Flow

1. Visit `/api-docs`
2. Enter password: `bluff-dev-2025`
3. If not signed in → Redirected to main site (`NEXT_PUBLIC_APP_URL`) to sign in
4. After signing in on main site → Return to `/api-docs`
5. Full access to API testing tools

## Adding New API Sections

To add a new API section:

1. Add a new `TabsTrigger` in the main `Tabs` component
2. Create a corresponding `TabsContent` section
3. Build your API tester component following the `BlackjackApiTester` pattern

## Features

- 🔐 Two-factor protection (User auth + Password)
- 🎨 Clean, modern UI using shadcn/ui components
- 📝 Interactive API testing
- 📊 Request preview and response display
- 🎴 **Blackjack** - Full game API tester
- 🪙 **Coin Flip** - Coming soon
- 💣 **Minesweeper** - Coming soon
