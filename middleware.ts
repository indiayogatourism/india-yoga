import { NextRequest, NextFetchEvent, NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

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
    // Only invoke middleware on routes that actually need protection.
    // Public pages (/, /about, /packages, /blog, etc.) are NOT listed
    // so Next.js never runs this middleware for them at all.
    '/admin(.*)',
    '/dashboard(.*)',
    '/booking(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
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
  ],
}
