'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usdPrice } from '@/lib/retreatContent'
import { trackConversion } from '@/lib/analytics'

interface BookingCardProps {
  packageId: string
  packageSlug: string
  packageTitle: string
  rooms: { type: 'dormitory' | 'shared' | 'private'; label: string; price: number }[]
  bookingDates: string[]
  canBook: boolean
  maxGuests: number
  flexibleDates: boolean
  enquiryUrl: string
  whatsappUrl: string
}

export default function BookingCard({ packageId, packageSlug, packageTitle, rooms, bookingDates, canBook, maxGuests, flexibleDates, enquiryUrl, whatsappUrl }: BookingCardProps) {
  const router = useRouter()
  const [guests, setGuests] = useState(1)
  const [roomType, setRoomType] = useState<string>(rooms[0]?.type || '')
  const [selectedBatch, setSelectedBatch] = useState(bookingDates[0] || '')
  const room = rooms.find((option) => option.type === roomType)
  const total = room ? room.price * guests : null

  const handleBookNow = () => {
    if (!canBook || !room || (!flexibleDates && !bookingDates.includes(selectedBatch))) return
    trackConversion('booking_cta_click', { package_slug: packageSlug, source: 'booking_card' })
    const query = new URLSearchParams({ packageId, guests: String(guests), roomType: room.type })
    if (selectedBatch) query.set('selectedBatch', selectedBatch)
    router.push(`/booking/checkout?${query}`)
  }

  return <>
    <aside id="booking-card-section" aria-label={`Booking options for ${packageTitle}`} className="scroll-mt-32 rounded-3xl border border-[#17372b]/15 bg-white p-6 shadow-sm lg:sticky lg:top-28">
      <h2 className="font-display-lg text-2xl text-[#17372b]">Plan your retreat</h2>
      <p className="mt-2 text-sm leading-6 text-[#536457]">{canBook ? 'Choose your room and guests, then review your travel details in checkout.' : 'Current dates or room prices need confirmation. Enquire about the next available retreat.'}</p>
      {canBook && <div className="mt-6 space-y-5">
        {bookingDates.length > 0 ? <div><label htmlFor="retreat-batch" className="mb-2 block text-sm font-semibold text-[#17372b]">Retreat dates</label><select id="retreat-batch" value={selectedBatch} onChange={(event) => setSelectedBatch(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#17372b]/25 bg-white p-3 text-sm text-[#17372b]">{bookingDates.map((batch) => <option key={batch} value={batch}>{batch}</option>)}</select></div> : <p className="rounded-xl bg-[#e9ecdf] p-3 text-sm leading-6 text-[#536457]">Flexible dates: select arrival dates in checkout and confirm arrangements with the team.</p>}
        <div><label htmlFor="retreat-room" className="mb-2 block text-sm font-semibold text-[#17372b]">Accommodation</label><select id="retreat-room" value={roomType} onChange={(event) => setRoomType(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#17372b]/25 bg-white p-3 text-sm text-[#17372b]">{rooms.map((option) => <option key={option.type} value={option.type}>{option.label} — {usdPrice(option.price)} USD / person</option>)}</select></div>
        <div><label htmlFor="retreat-guests" className="mb-2 block text-sm font-semibold text-[#17372b]">Guests</label><input id="retreat-guests" type="number" min={1} max={maxGuests} value={guests} onChange={(event) => setGuests(Math.max(1, Math.min(maxGuests, Math.floor(Number(event.target.value)) || 1)))} className="min-h-12 w-full rounded-xl border border-[#17372b]/25 p-3 text-[#17372b]" /></div>
        {total !== null && <div className="border-t border-[#17372b]/15 pt-5"><p className="text-sm text-[#536457]">Total for {guests} {guests === 1 ? 'guest' : 'guests'}</p><p className="mt-1 text-2xl font-bold text-[#17372b]">{usdPrice(total)} USD</p></div>}
        <button type="button" onClick={handleBookNow} className="min-h-12 w-full rounded-full bg-[#17372b] px-5 py-3 font-bold text-white hover:bg-[#294e3e]">Continue to booking</button>
      </div>}
      <Link href={enquiryUrl} className="mt-5 flex min-h-12 items-center justify-center rounded-full border border-[#17372b]/30 px-4 text-sm font-semibold text-[#17372b]">Enquire about this retreat</Link>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-track-event="whatsapp_enquiry_click" data-track-package={packageSlug} className="mt-3 flex min-h-12 items-center justify-center text-sm font-semibold text-[#17372b] underline underline-offset-4">Ask on WhatsApp</a>
      <p className="mt-5 text-xs leading-6 text-[#536457]">Confirm room availability and review the <Link href="/refund-policy" className="underline">cancellation policy</Link> before payment. Prices are in US dollars (USD).</p>
    </aside>
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-[#e5cf9a]/30 bg-[#17372b] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white lg:hidden">
      <div className="min-w-0"><p className="text-xs text-[#e5cf9a]">{total !== null ? `Total · ${guests} ${guests === 1 ? 'guest' : 'guests'}` : 'Plan your retreat'}</p><p className="font-bold">{total !== null ? `${usdPrice(total)} USD` : 'Ask about dates'}</p></div>
      <a href={canBook ? '#booking-card-section' : enquiryUrl} data-track-event={canBook ? 'booking_cta_click' : undefined} data-track-package={packageSlug} className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-[#e5cf9a] px-5 text-sm font-bold text-[#17372b]">{canBook ? 'Choose & book' : 'Enquire'}</a>
    </div>
  </>
}
