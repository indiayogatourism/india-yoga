import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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

  const navItems = [
    { label: 'Overview', href: '/admin', icon: 'dashboard' },
    { label: 'Programs & Retreats', href: '/admin/packages', icon: 'spa' },
    { label: 'Blog Posts', href: '/admin/blogs', icon: 'article' },
    { label: 'CMS Pages', href: '/admin/pages', icon: 'description' },
    { label: 'Bookings & Orders', href: '/admin/bookings', icon: 'calendar_month' },
    { label: 'View Public Site', href: '/programmes', icon: 'open_in_new' },
  ]

  return (
    <div className="bg-[#FAF7F2] text-[#2C3E35] font-body-md antialiased flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1C2E26] text-white flex flex-col h-full flex-shrink-0 z-20 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="font-display-lg text-xl font-bold text-[#E2C799] tracking-tight">
            India Yoga Admin
          </Link>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px] text-[#E2C799]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#E2C799] text-[#1C2E26] flex items-center justify-center font-bold text-sm">
              {dbUser.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{dbUser.name}</p>
              <p className="text-[10px] text-white/60 truncate">{dbUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-[#1C2E26]">Admin Control Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Admin Access Active
            </span>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  )
}
