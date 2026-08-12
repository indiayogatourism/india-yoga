'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface BookingCardProps {
  packageId: string
  priceShared: number
  pricePrivate: number
}

export default function BookingCard({ packageId, priceShared, pricePrivate }: BookingCardProps) {
  const router = useRouter()
  const [guests, setGuests] = useState(1)
  const [roomType, setRoomType] = useState<'shared' | 'private'>('shared')

  const basePrice = roomType === 'shared' ? priceShared : pricePrivate
  const total = basePrice * guests

  const handleBookNow = () => {
    router.push(`/booking/checkout?packageId=${packageId}&guests=${guests}&roomType=${roomType}`)
  }

  return (
    <>
      <div id="booking-card-section" className="sticky top-28 bg-surface-container-low/75 backdrop-blur-md soft-shadow rounded-2xl p-6 border-t-2 border-tertiary-fixed-dim z-20 shadow-md">
        <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
          <div>
            <span className="text-xs text-on-surface-variant block mb-1">Starting From</span>
            <div className="font-label-price text-3xl text-primary leading-none font-bold">
              {formatPrice(basePrice)}
              <span className="text-xs font-body-md text-on-surface-variant font-normal"> /person</span>
            </div>
          </div>
          <div className="bg-secondary-container/35 text-secondary text-xs px-2.5 py-1 rounded-full font-bold">
            Early Bird Offer
          </div>
        </div>

        <div className="space-y-5">
          {/* Guest Counter */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wider">Guests</label>
            <div className="flex items-center justify-between border border-outline-variant/50 rounded-xl p-2 bg-surface-container-lowest">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-dim text-primary transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="font-bold text-base w-8 text-center text-primary">{guests}</span>
              <button
                onClick={() => setGuests(guests + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-dim text-primary transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Accommodation Selection */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wider">Accommodation</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as 'shared' | 'private')}
              className="w-full p-3.5 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-primary text-xs sm:text-sm font-semibold focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary cursor-pointer"
            >
              <option value="shared">Shared Twin Room (Standard)</option>
              <option value="private">Private Standard Room (+{formatPrice(pricePrivate - priceShared)})</option>
            </select>
          </div>

          {/* Total calculation */}
          <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
            <span className="font-bold text-primary text-sm">Total Amount</span>
            <span className="font-label-price text-2xl font-bold text-primary">{formatPrice(total)}</span>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleBookNow}
              className="w-full bg-[#1C2E26] text-[#E2C799] font-body-lg font-bold py-4 rounded-full text-center hover:bg-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              type="button"
            >
              <span>Book Sanctuary</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            
            <a
              href="https://wa.me/919999876349"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-secondary text-secondary py-3 rounded-full font-body-md font-bold text-xs sm:text-sm text-center flex justify-center items-center gap-2 hover:bg-secondary/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              WhatsApp Consultation
            </a>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-6 flex flex-col gap-2.5 border-t border-outline-variant/20 pt-4">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-base text-secondary">lock</span>
            <span>Secure SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-base text-secondary">event_available</span>
            <span>Free cancellation up to 30 days before</span>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1C2E26]/95 backdrop-blur-md text-white px-5 py-3 border-t border-[#E2C799]/30 shadow-[0_-4px_25px_rgba(0,0,0,0.2)] flex items-center justify-between animate-in slide-in-from-bottom duration-300">
        <div>
          <span className="text-[10px] text-[#E2C799] uppercase tracking-wider block font-bold">Total Price</span>
          <div className="text-lg font-bold text-white flex items-baseline gap-1">
            {formatPrice(total)}
            <span className="text-[10px] text-white/60 font-normal">({guests} {guests === 1 ? 'guest' : 'guests'})</span>
          </div>
        </div>
        <button
          onClick={handleBookNow}
          className="bg-[#E2C799] text-[#1C2E26] font-bold text-xs px-5 py-2.5 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <span>Book Now</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </>
  )
}
