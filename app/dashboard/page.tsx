import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { SignOutButton } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default async function GuestDashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const clerkUser = await currentUser()
  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Get user from DB
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bookings: {
        include: { package: true },
        orderBy: { arrivalDate: 'asc' }
      }
    }
  })

  if (!dbUser) {
    // If not in DB yet, redirect to sync
    redirect('/booking/checkout')
  }

  const bookings = dbUser.bookings
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' && new Date(b.arrivalDate) > new Date())
  const totalInvestment = bookings.reduce((sum, b) => b.status === 'CONFIRMED' ? sum + b.totalAmount : sum, 0)

  const nextBooking = activeBookings[0]

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-on-primary flex flex-col justify-between hidden md:flex fixed h-full z-40">
        <div className="p-8">
          <Link href="/" className="font-display-lg text-[28px] mb-12 block tracking-tight hover:opacity-85">
            Indian Yoga Tourism
          </Link>
          <nav className="space-y-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 text-secondary-container font-bold bg-primary-container p-3 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/packages"
              className="flex items-center space-x-3 text-on-primary-fixed-variant hover:text-secondary-container p-3 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">explore</span>
              <span>Explore Retreats</span>
            </Link>
            <Link
              href="/dashboard#my-bookings"
              className="flex items-center space-x-3 text-on-primary-fixed-variant hover:text-secondary-container p-3 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              <span>My Bookings</span>
            </Link>
          </nav>
        </div>
        <div className="p-8">
          <SignOutButton>
            <button className="flex items-center space-x-3 text-on-primary-fixed-variant hover:text-error-container transition-colors w-full text-left cursor-pointer">
              <span className="material-symbols-outlined">logout</span>
              <span>Log Out</span>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 lg:p-[48px] max-w-[1280px] mx-auto w-full">
        {/* Header */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-primary mb-2">Namaste, {dbUser.name} 🙏</h1>
            <p className="font-body-md text-on-surface-variant">Your journey to inner peace begins soon.</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 rounded-full border-2 border-surface-container-high bg-primary/10 flex items-center justify-center font-bold text-primary">
              {dbUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Overview & Active Booking) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-surface-container-low rounded-xl p-6 ambient-shadow border border-outline-variant/30 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined fill-icon text-3xl">event_available</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant mb-1">Upcoming Retreats</p>
                  <p className="font-label-price text-primary">
                    {activeBookings.length} {activeBookings.length === 1 ? 'Active' : 'Active'}
                  </p>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6 ambient-shadow border border-outline-variant/30 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed/20 flex items-center justify-center text-tertiary-container">
                  <span className="material-symbols-outlined fill-icon text-3xl">account_balance_wallet</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant mb-1">Total Investment</p>
                  <p className="font-label-price text-primary">{formatPrice(totalInvestment)}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Booking Card */}
            <section id="my-bookings">
              <h2 className="font-headline-md text-primary mb-6">Upcoming Journey</h2>
              {nextBooking ? (
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow border-t border-tertiary-fixed-dim/50">
                  <div className="relative h-64 bg-surface-variant">
                    <img
                      className="w-full h-full object-cover"
                      alt={nextBooking.package.title}
                      src={nextBooking.package.featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUqiKQrZy7x7fNtAvF0jlhAzdwsXlRtAZDDXBpqdbeicvkZ-hFHdZT20noJZ6RIJ8Sny9Lja8xFRhSe6noHHI-D6KzKEPTTLfMdIHDEzfujjsmI7heR8KmcXR9jp5eWe_kz4hM8_LSM9s7nOvGFbYR77zZ-TuDlpCExuv1XTJ029oH8A-M7_mBI9HbrG4ZpNJGZwoGYdBg9Tk5nUMRu24IavL782HglRQJbqW6cLCoMNceak7Q0iOkAOkblUTW-OWAobQbQVx1teHL'}
                    />
                    <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md text-on-primary px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                      <span>CONFIRMED</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-headline-md text-primary mb-2">
                          {nextBooking.package.title}
                        </h3>
                        <div className="flex flex-wrap items-center text-on-surface-variant gap-4">
                          <div className="flex items-center space-x-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            <span>
                              {formatDate(nextBooking.arrivalDate)} - {formatDate(nextBooking.departureDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span>{nextBooking.package.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-outline mb-1">Booking Ref</p>
                        <p className="font-mono text-primary font-bold">#{nextBooking.bookingRef}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-outline-variant/30">
                      <a
                        href={`/api/download/voucher/${nextBooking.bookingRef}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-primary-container text-on-primary font-body-md font-bold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        <span>Download Voucher</span>
                      </a>
                      
                      <a
                        href={`/api/download/receipt/${nextBooking.bookingRef}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent border-2 border-outline-variant text-primary hover:bg-surface-container-high font-body-md font-bold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <span className="material-symbols-outlined text-base">receipt_long</span>
                        <span>Payment Receipt</span>
                      </a>

                      <a
                        href="https://wa.me/919999876349"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent border-2 border-tertiary-fixed-dim text-primary hover:bg-tertiary-fixed/10 font-label-price text-sm px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <span className="material-symbols-outlined text-base">chat</span>
                        <span>Contact Host</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">explore</span>
                  <h3 className="font-headline-md text-xl text-primary mb-2">No Active Retreats</h3>
                  <p className="font-body-md text-on-surface-variant mb-6">Explore our curated retreats to start your spiritual journey.</p>
                  <Link href="/packages">
                    <button className="bg-primary text-on-primary font-bold px-6 py-3 rounded-lg hover:opacity-90">Explore Packages</button>
                  </Link>
                </div>
              )}
            </section>

            {/* Past Bookings */}
            {bookings.length > (nextBooking ? 1 : 0) && (
              <section className="mt-12">
                <h2 className="font-headline-md text-primary mb-6">Past Journeys</h2>
                <div className="space-y-4">
                  {bookings
                    .filter((b) => b.id !== nextBooking?.id)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-primary text-lg">{b.package.title}</h4>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {formatDate(b.arrivalDate)} • {b.package.location}
                          </p>
                        </div>
                        <span className="text-xs bg-outline-variant/30 text-on-surface-variant px-3 py-1 rounded-full font-bold">
                          COMPLETED
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Checklist & Context) */}
          <div className="space-y-8">
            {/* Pre-Retreat Checklist */}
            <section className="bg-surface-container-low rounded-xl p-8 ambient-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-primary">Preparation</h2>
                <span className="text-secondary-container bg-primary-container px-3 py-1 rounded-full text-sm font-bold">
                  {nextBooking ? '2/4' : '0/4'}
                </span>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-surface-container-lowest border border-secondary-container/50 opacity-70">
                  <span className="material-symbols-outlined fill-icon text-secondary">check_circle</span>
                  <div>
                    <p className="text-primary font-bold line-through">Booking Confirmed</p>
                    <p className="text-xs text-outline">Payment processed successfully.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-surface-container-lowest border border-secondary-container/50 opacity-70">
                  <span className="material-symbols-outlined fill-icon text-secondary">check_circle</span>
                  <div>
                    <p className="text-primary font-bold line-through">Profile Completed</p>
                    <p className="text-xs text-outline">Dietary requirements noted.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-surface-bright shadow-sm border border-outline-variant cursor-pointer hover:border-tertiary-fixed-dim transition-colors">
                  <span className="material-symbols-outlined text-outline">radio_button_unchecked</span>
                  <div>
                    <p className="text-primary font-bold">Upload Travel Documents</p>
                    <p className="text-xs text-on-surface-variant">Visa &amp; Flight details needed.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 rounded-lg bg-surface-bright shadow-sm border border-outline-variant cursor-pointer hover:border-tertiary-fixed-dim transition-colors">
                  <span className="material-symbols-outlined text-outline">radio_button_unchecked</span>
                  <div>
                    <p className="text-primary font-bold">Review Packing List</p>
                    <p className="text-xs text-on-surface-variant">Essential items for the ashram.</p>
                  </div>
                </li>
              </ul>
            </section>

            {/* Weather / Location Snippet */}
            <section className="relative rounded-xl overflow-hidden h-48 ambient-shadow bg-surface-variant">
              <div
                className="absolute inset-0 bg-cover bg-center w-full h-full"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDG9HXMGLByE3uf-23LMR6kQiIUUQBWNuKf09cRVQ0dV0iRUumBCJpPgF4_CQkTF5E3iTlVDgOC3Rb9NHTlLN2_pXNdvL-A62rRKvCNsluPtrnmDLCg_cKY8cypRiaeJnEyFFTyWVBfgnB6uzGqRQFYMwVRDrE7Tm0tPus8b8_rpDM5f-k_gbjlVt-fBX6RxgStnPD7ewTtvVleLsAsB95xXJj6wPrduPd1uD981UdpPdnBndTQtzP7lvqkxBTgBR4phwBRY62nGxxw')"
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-on-primary w-full flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-80 mb-1">Current Weather in Rishikesh</p>
                  <p className="font-headline-md text-2xl">24°C / Sunny</p>
                </div>
                <span className="material-symbols-outlined text-4xl">light_mode</span>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
