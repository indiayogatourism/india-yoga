import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{
    ref?: string
  }>
}

export default async function BookingConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { ref } = params

  if (!ref) {
    redirect('/packages')
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingRef: ref },
    include: {
      package: true,
      payment: true
    }
  })

  if (!booking) {
    notFound()
  }

  return (
    <main className="pt-32 pb-24 max-w-[800px] mx-auto px-6 text-center">
      <div className="bg-surface-container-low/50 border border-outline-variant/30 rounded-xl p-8 md:p-12 soft-shadow">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-secondary-container/40 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[48px] icon-fill">self_improvement</span>
        </div>

        <h1 className="font-display-lg text-primary mb-3">Booking Confirmed!</h1>
        <p className="font-quote-italic text-on-surface-variant text-xl mb-8">
          Namaste, {booking.fullName}. Your journey to the Himalayas is secured.
        </p>

        {/* Details card */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 p-6 text-left mb-8 max-w-md mx-auto">
          <h3 className="font-bold text-primary mb-4 border-b border-outline-variant/10 pb-2">Booking details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Reference</span>
              <span className="font-bold text-primary">{booking.bookingRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Retreat</span>
              <span className="font-bold text-on-surface">{booking.package.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Location</span>
              <span className="font-bold text-on-surface">{booking.package.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Arrival Date</span>
              <span className="font-bold text-on-surface">{formatDate(booking.arrivalDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Departure Date</span>
              <span className="font-bold text-on-surface">{formatDate(booking.departureDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Guests</span>
              <span className="font-bold text-on-surface">{booking.guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Room Accommodation</span>
              <span className="font-bold text-on-surface capitalize">{booking.roomType} Room</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant/10 pt-2 font-bold">
              <span className="text-primary">Total Paid</span>
              <span className="text-tertiary-fixed-dim text-lg">{formatPrice(booking.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* PDF Download buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-md mx-auto">
          <a
            href={`/api/download/voucher/${booking.bookingRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-primary text-on-primary font-bold py-3.5 px-6 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
            Booking Voucher PDF
          </a>
          
          <a
            href={`/api/download/receipt/${booking.bookingRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border-2 border-outline text-outline font-bold py-3.5 px-6 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Payment Receipt PDF
          </a>
        </div>

        <p className="text-sm text-on-surface-variant mb-8">
          A confirmation email along with your Booking Voucher and Receipt has been sent to <span className="font-bold text-primary">{booking.email}</span>.
        </p>

        {/* Dashboard button */}
        <div className="space-y-4">
          <Link href="/dashboard">
            <button className="bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold py-3.5 px-8 rounded-full text-center hover:opacity-90 transition-opacity">
              Go to Guest Dashboard
            </button>
          </Link>
          <div>
            <a
              href="https://wa.me/919999876349"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary font-bold text-sm hover:underline flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Need support? Contact us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
