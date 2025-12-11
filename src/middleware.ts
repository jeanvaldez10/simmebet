import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Check for rate limit errors in the URL
  const url = request.nextUrl.clone();
  const error = url.searchParams.get('error');
  
  // If it's a Configuration error and contains rate limit indicators, redirect to rate limit error page
  if (error === 'Configuration') {
    const urlString = url.toString();
    if (urlString.includes('429') || urlString.includes('Too Many Requests') || urlString.includes('rate limit')) {
      const errorUrl = new URL('/auth/error?error=RATE_LIMIT_EXCEEDED', request.url);
      return NextResponse.redirect(errorUrl);
    }
  }
  
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
