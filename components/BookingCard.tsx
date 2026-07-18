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
    <div className="sticky top-28 bg-surface-container-low/75 backdrop-blur-md soft-shadow rounded-xl p-6 border-t-2 border-tertiary-fixed-dim z-20">
      <div className="flex justify-between items-end mb-6 border-b border-outline-variant/20 pb-4">
        <div>
          <span className="text-sm text-on-surface-variant block mb-1">From</span>
          <div className="font-label-price text-3xl text-primary leading-none">
            {formatPrice(basePrice)}
            <span className="text-sm font-body-md text-on-surface-variant font-normal"> /person</span>
          </div>
        </div>
        <div className="bg-secondary-container/35 text-secondary text-xs px-2.5 py-1 rounded font-medium">
          Early Bird Offer
        </div>
      </div>

      <div className="space-y-5">
        {/* Guest Counter */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Guests</label>
          <div className="flex items-center justify-between border border-outline-variant/50 rounded-lg p-2 bg-surface-container-lowest">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-dim text-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="font-medium w-8 text-center text-primary">{guests}</span>
            <button
              onClick={() => setGuests(guests + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container hover:bg-surface-dim text-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

        {/* Accommodation Selection */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">Accommodation</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value as 'shared' | 'private')}
            className="w-full p-3 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
          >
            <option value="shared">Shared Twin Room (Standard)</option>
            <option value="private">Private Standard Room (+{formatPrice(pricePrivate - priceShared)})</option>
          </select>
        </div>

        {/* Total calculation */}
        <div className="flex justify-between items-center pt-2">
          <span className="font-medium text-primary">Total Amount</span>
          <span className="font-label-price text-2xl text-primary">{formatPrice(total)}</span>
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <button
            onClick={handleBookNow}
            className="w-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-body-lg font-bold py-4 rounded-full text-center hover:bg-tertiary-fixed transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            Book Now
          </button>
          
          <a
            href="https://wa.me/919999876349"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border-2 border-secondary text-secondary py-3 rounded-full font-body-md font-bold text-center flex justify-center items-center gap-2 hover:bg-secondary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            WhatsApp Inquiry
          </a>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-secondary">lock</span>
          <span>Secure encrypted checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-secondary">event_available</span>
          <span>Free cancellation up to 30 days before</span>
        </div>
      </div>
    </div>
  )
}
