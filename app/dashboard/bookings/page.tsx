import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import {
  Calendar,
  MapPin,
  Users,
  Download,
  Receipt,
  MessageCircle,
  Upload,
  Compass,
  ArrowRight
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bookings: {
        include: { package: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!dbUser) redirect("/sign-in")

  const bookings = dbUser.bookings

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-md font-bold text-2xl text-primary">
            My Retreat Bookings
          </h1>
          <p className="text-sm text-on-surface-variant">
            View all past and upcoming spiritual retreats, downloads, and itinerary details.
          </p>
        </div>
        <Link
          href="/packages"
          className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Explore New Retreats</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-outline mx-auto" />
          <h2 className="font-headline-md font-bold text-xl text-primary">
            No Bookings Found
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            You haven't reserved any retreats yet. Browse our handpicked packages in Rishikesh, Goa, and Kerala.
          </p>
          <Link href="/packages">
            <button className="bg-primary text-on-primary font-bold text-xs px-6 py-3 rounded-xl hover:opacity-90 transition-opacity mt-2">
              Browse Packages
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden shrink-0 bg-surface-container-high relative">
                  <img
                    src={
                      b.package.featuredImage ||
                      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={b.package.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={b.status} />
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-outline font-bold">
                        Booking Ref: #{b.bookingRef}
                      </span>
                      <h3 className="font-headline-md font-bold text-xl text-primary mt-0.5">
                        {b.package.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-outline font-bold">Total Paid</p>
                      <p className="font-headline-md font-bold text-lg text-primary">
                        {formatPrice(b.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-on-surface-variant bg-surface-container/50 p-3 rounded-xl border border-outline-variant/20">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {formatDate(b.arrivalDate)} - {formatDate(b.departureDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{b.package.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>
                        {b.guests} {b.guests === 1 ? "Guest" : "Guests"} · {b.roomType} room
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <a
                      href={`/api/download/voucher/${b.bookingRef}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Voucher</span>
                    </a>

                    <a
                      href={`/api/download/receipt/${b.bookingRef}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-primary text-xs font-bold px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </a>

                    <Link
                      href="/dashboard/upload"
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-700" />
                      <span>Passport & Info</span>
                    </Link>

                    <Link
                      href="/dashboard/tracking"
                      className="bg-secondary-container/40 hover:bg-secondary-container/70 text-secondary text-xs font-bold px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-secondary" />
                      <span>Track Journey</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
