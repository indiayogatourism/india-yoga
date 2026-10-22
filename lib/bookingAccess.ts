import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/** Return a booking only to its owner or an authenticated administrator. */
export async function getAuthorizedBookingByRef(bookingRef: string) {
  const { userId } = await auth()
  if (!userId) return null

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({ where: { clerkId: userId } }),
  ])
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  const isAdmin = dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'

  if (!isAdmin && !dbUser) return null

  return prisma.booking.findFirst({
    where: {
      bookingRef,
      ...(isAdmin ? {} : { userId: dbUser!.id }),
    },
  })
}
