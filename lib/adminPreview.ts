import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const SUPER_ADMIN_EMAIL = 'indiayogatourism@gmail.com'

/**
 * True when the current visitor is a signed-in admin.
 * Used to let admins open unpublished (draft) blogs / packages / pages
 * instead of getting a 404. Requires the request to pass through Clerk
 * middleware — public pages do so when the URL has ?preview (see middleware.ts).
 */
export async function isAdminViewer(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false
    const [clerkUser, dbUser] = await Promise.all([
      currentUser(),
      prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }),
    ])
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
    return dbUser?.role === 'admin' || email === SUPER_ADMIN_EMAIL
  } catch {
    // auth() throws when Clerk middleware didn't run for this request
    return false
  }
}
