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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display-lg text-2xl font-bold text-[#1C2E26]">Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Welcome back. Here is your operational summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/packages/new">
            <button className="bg-[#1C2E26] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
              <span className="material-symbols-outlined text-base">add_circle</span>
              New Retreat
            </button>
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-black/5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1C2E26]">{formatPrice(totalRevenue)}</h3>
            <p className="text-emerald-700 text-xs font-bold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Live transactions
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1C2E26] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-black/5 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Bookings</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1C2E26]">{activeBookings}</h3>
            <p className="text-emerald-700 text-xs font-bold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              Confirmed retreats
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#1C2E26] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-black/5 flex items-center justify-between hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Guests</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1C2E26]">{totalGuests}</h3>
            <p className="text-gray-500 text-xs font-medium flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-sm">group</span>
              Registered guests
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#1C2E26] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
        </div>
      </section>

      {/* Charts & Quick Actions Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1C2E26]">Bookings Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <AdminCharts data={monthlyData} />
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#1C2E26] mb-4">Quick Management</h3>
            <div className="space-y-3">
              <Link href="/admin/packages/new">
                <button className="w-full bg-[#1C2E26] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer">
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Create Retreat Package
                </button>
              </Link>
              
              <Link href="/packages" target="_blank">
                <button className="w-full bg-[#FAF7F2] text-[#1C2E26] border border-black/10 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-black/5 transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  View Live Public Site
                </button>
              </Link>
            </div>
          </div>
          <div className="bg-[#FAF7F2] rounded-xl p-4 border border-black/5">
            <h4 className="font-bold text-[#1C2E26] text-xs mb-1">System Health</h4>
            <p className="text-[11px] text-gray-600">Database, Storage, & Payment Gateways are fully operational.</p>
          </div>
        </div>
      </section>

      {/* Recent Bookings Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1C2E26]">Recent Bookings</h3>
          <span className="text-xs text-gray-500 font-medium">{recentBookings.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-[#FAF7F2] text-gray-500 text-xs uppercase tracking-wider border-b border-black/5">
                <th className="py-3.5 px-6 font-bold">Guest Name</th>
                <th className="py-3.5 px-6 font-bold">Package</th>
                <th className="py-3.5 px-6 font-bold">Dates</th>
                <th className="py-3.5 px-6 font-bold">Amount</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-black/5">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    No bookings processed yet.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#1C2E26]">{b.fullName}</td>
                    <td className="py-4 px-6 text-gray-600 truncate max-w-[200px]">{b.package.title}</td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{formatDate(b.arrivalDate)}</td>
                    <td className="py-4 px-6 font-bold text-[#1C2E26]">{formatPrice(b.totalAmount)}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                      {b.status === 'CONFIRMED' && (
                        <>
                          <a
                            href={`/api/download/voucher/${b.bookingRef}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-800 hover:underline font-bold text-xs"
                          >
                            Voucher
                          </a>
                          <span className="text-gray-300">|</span>
                          <a
                            href={`/api/download/receipt/${b.bookingRef}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-800 hover:underline font-bold text-xs"
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
  )
}
