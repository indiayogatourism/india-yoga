import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import AdminCharts from '@/components/AdminCharts'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Check clerk user email
  const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase()

  // Verify Admin Role in DB or auto-grant if indiayogatourism@gmail.com
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  const isAdminEmail = userEmail === 'indiayogatourism@gmail.com'

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: userEmail || clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Admin User',
        role: isAdminEmail ? 'admin' : 'guest'
      }
    })
  } else if (isAdminEmail && dbUser.role !== 'admin') {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: 'admin' }
    })
  }

  if (dbUser.role !== 'admin' && !isAdminEmail) {
    redirect('/dashboard')
  }

  // Fetch metrics
  const totalRevenueResult = await prisma.payment.aggregate({
    where: { status: 'PAID' },
    _sum: { amount: true }
  })
  const totalRevenue = totalRevenueResult._sum.amount || 0

  const activeBookings = await prisma.booking.count({
    where: { status: 'CONFIRMED' }
  })

  const totalGuestsResult = await prisma.booking.aggregate({
    where: { status: 'CONFIRMED' },
    _sum: { guests: true }
  })
  const totalGuests = totalGuestsResult._sum.guests || 0

  // Recent Bookings
  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      package: true
    }
  })

  // Aggregate monthly bookings data
  const bookingsData = await prisma.booking.findMany({
    where: { status: 'CONFIRMED' },
    select: { createdAt: true }
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = months.map((month, index) => {
    const count = bookingsData.filter((b) => new Date(b.createdAt).getMonth() === index).length
    return { month, count }
  })

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased overflow-hidden flex h-screen w-full">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-on-background text-surface flex flex-col h-full flex-shrink-0 z-20 shadow-xl">
        <div className="p-6 border-b border-surface-variant/20 flex items-center justify-between">
          <Link href="/" className="font-display-lg text-[24px] font-bold text-tertiary-fixed tracking-tight">
            IYT Admin
          </Link>
        </div>
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-medium transition-colors"
              >
                <span className="material-symbols-outlined">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/packages/new"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-surface-variant hover:bg-surface-variant/10 hover:text-surface transition-colors"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Create Package
              </Link>
            </li>
            <li>
              <Link
                href="/packages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-surface-variant hover:bg-surface-variant/10 hover:text-surface transition-colors"
              >
                <span className="material-symbols-outlined">explore</span>
                View Live Site
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-surface-variant/20">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-secondary-container font-bold border border-secondary/30">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-surface">{dbUser.name}</p>
              <p className="text-xs text-surface-variant/70">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-grow bg-[#F8F3E3] flex flex-col h-full overflow-hidden relative">
        <header className="h-20 bg-surface/85 backdrop-blur-md flex items-center justify-between px-8 border-b border-outline-variant/30 flex-shrink-0">
          <div>
            <h2 className="font-headline-md text-primary text-2xl">Overview</h2>
            <p className="text-on-surface-variant text-sm">Welcome back. Here is today's summary.</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8">
          
          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface rounded-xl p-6 soft-shadow border border-outline-variant/30 flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-on-surface-variant text-sm font-medium mb-1">Total Revenue</p>
                <h3 className="font-label-price text-primary text-3xl">{formatPrice(totalRevenue)}</h3>
                <p className="text-secondary text-sm flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  Live transactions
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 soft-shadow border border-outline-variant/30 flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-on-surface-variant text-sm font-medium mb-1">Active Bookings</p>
                <h3 className="font-label-price text-primary text-3xl">{activeBookings}</h3>
                <p className="text-secondary text-sm flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  Confirmed retreats
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 soft-shadow border border-outline-variant/30 flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
              <div>
                <p className="text-on-surface-variant text-sm font-medium mb-1">Total Guests</p>
                <h3 className="font-label-price text-primary text-3xl">{totalGuests}</h3>
                <p className="text-on-surface-variant text-sm flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-[16px]">diversity_3</span>
                  Registered pilgrims
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined">diversity_3</span>
              </div>
            </div>
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-surface rounded-xl p-6 soft-shadow border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-primary text-xl">Bookings by Month</h3>
              </div>
              <AdminCharts data={monthlyData} />
            </div>

            <div className="lg:col-span-1 bg-surface rounded-xl p-6 soft-shadow border border-outline-variant/30 flex flex-col justify-between">
              <h3 className="font-headline-md text-primary text-xl mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Link href="/admin/packages/new">
                  <button className="w-full bg-primary text-on-primary font-bold py-3.5 px-6 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Create Retreat Package
                  </button>
                </Link>
                
                <Link href="/packages">
                  <button className="w-full border-2 border-outline text-outline font-bold py-3 px-6 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">preview</span>
                    View Live Sanctuary Catalog
                  </button>
                </Link>
              </div>
              <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/20 mt-4">
                <h4 className="font-bold text-primary text-sm mb-1">AWS & Payment Systems</h4>
                <p className="text-xs text-on-surface-variant">AWS S3, AWS SES, Razorpay and PayPal systems are operational.</p>
              </div>
            </div>
          </section>

          {/* Recent Bookings Table */}
          <section className="bg-surface rounded-xl soft-shadow border border-outline-variant/30 overflow-hidden mb-12">
            <div className="p-6 border-b border-outline-variant/20">
              <h3 className="font-headline-md text-primary text-xl">Recent Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-sm border-b border-outline-variant/20">
                    <th className="py-4 px-6 font-medium">Guest Name</th>
                    <th className="py-4 px-6 font-medium">Package</th>
                    <th className="py-4 px-6 font-medium">Dates</th>
                    <th className="py-4 px-6 font-medium">Amount</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                    <th className="py-4 px-6 font-medium text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">
                        No bookings processed yet.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors"
                      >
                        <td className="py-4 px-6">
                          <span className="font-medium text-primary">{b.fullName}</span>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant">{b.package.title}</td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {formatDate(b.arrivalDate)}
                        </td>
                        <td className="py-4 px-6 font-medium text-primary">
                          {formatPrice(b.totalAmount)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              b.status === 'CONFIRMED'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-variant text-on-surface-variant'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {b.status === 'CONFIRMED' && (
                            <>
                              <a
                                href={`/api/download/voucher/${b.bookingRef}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:underline text-xs font-bold"
                              >
                                Voucher
                              </a>
                              <span className="text-outline-variant">|</span>
                              <a
                                href={`/api/download/receipt/${b.bookingRef}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:underline text-xs font-bold"
                              >
                                Receipt
                              </a>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
