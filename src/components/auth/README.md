# Authentication System

This directory contains utilities for handling authentication requirements in the application.

## Components

### `useRequireAuth` Hook

A custom hook that handles authentication requirements and automatically redirects users based on their authentication status. **By default, it does NOT redirect users** - you must explicitly configure it to do so.

```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';

function MyPage() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  
  // This page works for both authenticated and unauthenticated users
  return <div>Welcome, {isAuthenticated ? user?.name : 'Guest'}!</div>;
}
```

#### Options

- `requireAuth`: If true, redirects unauthenticated users (default: false)
- `redirectTo`: Where to redirect if authentication requirements aren't met (default: "/")
- `redirectIfAuthenticated`: If true, redirects authenticated users (useful for login pages)

```typescript
// For protected pages - explicitly require authentication
const { isLoading } = useRequireAuth({ 
  requireAuth: true 
});

// For login pages - redirect authenticated users to home
const { isLoading } = useRequireAuth({ 
  redirectIfAuthenticated: true 
});

// For pages that work for everyone (default behavior)
const { isLoading } = useRequireAuth(); // No redirects
```

### `withAuth` HOC

A higher-order component that wraps pages to require authentication. **By default, it does NOT require authentication** - you must explicitly configure it to do so.

```typescript
import { withAuth } from '@/components/auth/withAuth';

function MyPage() {
  return <div>This page works for everyone</div>;
}

// Export without any auth requirements (default)
export default withAuth(MyPage);

// Export with explicit auth requirements
export default withAuth(MyPage, { requireAuth: true });
```

#### Options

```typescript
// With explicit authentication requirement
export default withAuth(MyProtectedPage, {
  requireAuth: true,
  redirectTo: "/login"
});

// For login pages
export default withAuth(MyLoginPage, {
  redirectIfAuthenticated: true,
  redirectTo: "/"
});

// Default behavior - no auth requirements
export default withAuth(MyPage); // Works for everyone
```

## Usage Examples

### Public Page (works for everyone - default behavior)

```typescript
// src/app/markets/page.tsx
"use client";

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function MarketsPage() {
  const { isAuthenticated, user } = useRequireAuth(); // No options = public page
  
  return (
    <div>
      <h1>Markets</h1>
      {isAuthenticated ? (
        <p>Welcome back, {user?.name}!</p>
      ) : (
        <p>Welcome! Sign in to place bets.</p>
      )}
    </div>
  );
}
```

### Protected Page (explicitly requires authentication)

```typescript
// src/app/profile/page.tsx
"use client";

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ProfilePage() {
  const { isLoading } = useRequireAuth({ requireAuth: true }); // Explicitly require auth
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return <div>Profile content</div>;
}
```

### Login Page (redirects authenticated users)

```typescript
// src/app/login/page.tsx
"use client";

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function LoginPage() {
  const { isLoading } = useRequireAuth({ 
    redirectIfAuthenticated: true 
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return <div>Login form</div>;
}
```

### Using the HOC

```typescript
// src/app/dashboard/page.tsx
"use client";

import { withAuth } from '@/components/auth/withAuth';

function DashboardPage() {
  return <div>Dashboard content</div>;
}

// Explicitly require authentication
export default withAuth(DashboardPage, { requireAuth: true });

// Or make it public (default)
export default withAuth(DashboardPage); // No auth requirements
```

## How It Works

1. The `useRequireAuth` hook checks the user's authentication status using NextAuth
2. **By default, it does NOT redirect users** - pages work for both authenticated and unauthenticated users
3. Only when `requireAuth: true` is explicitly set will it redirect unauthenticated users
4. The hook returns the authentication state and loading status
5. The `withAuth` HOC uses the hook internally and handles the rendering logic

## Benefits

- **Opt-in security**: Pages are public by default, you explicitly choose which ones to protect
- **Automatic redirects**: When configured, no need to manually handle redirects
- **Loading states**: Built-in loading state management
- **Flexible**: Can be used for public pages, protected pages, and login pages
- **Type-safe**: Full TypeScript support
- **Reusable**: Can be applied to any component or page
