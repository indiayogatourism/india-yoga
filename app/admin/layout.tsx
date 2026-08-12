import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const clerkUser = await currentUser()
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  const isAdminEmail = userEmail === 'indiayogatourism@gmail.com'

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: userEmail || clerkUser?.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 'Admin User',
        role: isAdminEmail ? 'admin' : 'guest',
      },
    })
  } else if (isAdminEmail && dbUser.role !== 'admin') {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: 'admin' },
    })
  }

  if (dbUser.role !== 'admin' && !isAdminEmail) {
    redirect('/dashboard')
  }

  return (
    <AdminLayoutClient dbUser={{ name: dbUser.name, email: dbUser.email }}>
      {children}
    </AdminLayoutClient>
  )
}
