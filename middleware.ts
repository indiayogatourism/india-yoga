import { NextRequest, NextFetchEvent, NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { BARE_HOST, PREFERRED_HOST } from '@/lib/siteUrl'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/booking(.*)',
  '/api/admin(.*)',
  '/api/user(.*)',
  '/api/upload(.*)',
  '/api/bookings/(.*)',
  '/api/packages/create(.*)',
  '/api/packages/update(.*)',
  '/api/packages/delete(.*)',
  '/api/pages/bulk(.*)',
  '/api/blogs/bulk(.*)',
  '/api/online-classes/(.*)',
  '/api/gallery/(.*)',
])

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL('/sign-in', req.url).toString(),
    })
  }
  // All other routes (including /) pass through freely
})

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const host = (req.headers.get('host') || req.nextUrl.hostname || '').toLowerCase().split(':')[0]
  const pathname = req.nextUrl.pathname

  // 1. Bare/naked domain -> www (301 Moved Permanently)
  if (host === BARE_HOST) {
    const url = req.nextUrl.clone()
    url.hostname = PREFERRED_HOST
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  // 2. Trailing slash normalization -> non-trailing slash (301 Moved Permanently)
  // Skip root '/' and API routes
  if (pathname.length > 1 && pathname.endsWith('/') && !pathname.startsWith('/api/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace(/\/+$/, '')
    return NextResponse.redirect(url, 301)
  }

  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

  // Skip Clerk entirely for non-protected routes so public pages
  // are never touched by Clerk (prevents timeout redirects to clerk.com)
  if (!key || !isProtectedRoute(req)) {
    return NextResponse.next()
  }

  return clerkHandler(req, event)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset files (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|xml|txt)).*)',
  ],
}
