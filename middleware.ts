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
  '/api/pages(.*)',
  '/api/blogs(.*)',
  '/api/online-classes(.*)',
  '/api/gallery/(.*)',
  '/api/payments/paypal/capture(.*)',
  '/api/download/(.*)',
])

// Clerk uses this same-origin route for its client authentication handshake.
// It must pass through clerkMiddleware even when the current page is public.
const isClerkFrontendApiRoute = createRouteMatcher(['/__clerk(.*)'])
const isApiRoute = createRouteMatcher(['/api(.*)'])

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Send logged-out users to sign-in WITH a return address, so after signing in
    // they land back on the page they opened (e.g. /admin/blogs), not the homepage.
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search)
    await auth.protect({
      unauthenticatedUrl: signInUrl.toString(),
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

  // Clerk middleware provides auth() context for Route Handlers even when
  // they perform their own authorization. Public API/page routes stay public
  // because auth.protect() only runs for paths in isProtectedRoute.
  // Admin draft previews (/some-page?preview=1) need Clerk's auth() context so the
  // page can verify the admin session; without it every draft returns 404.
  const isDraftPreview = req.nextUrl.searchParams.has('preview')

  if (!key || (!isProtectedRoute(req) && !isClerkFrontendApiRoute(req) && !isApiRoute(req) && !isDraftPreview)) {
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
