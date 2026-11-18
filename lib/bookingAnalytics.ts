import { createHash } from 'node:crypto'
import type { EventParams } from '@/lib/analytics'

interface PaidBooking {
  id: string
  status: string
  totalAmount: number
  pricePerPerson: number
  currency: string
  guests: number
  package: { id: string; slug: string }
  payment: { status: string; amount: number; currency: string } | null
}

/** Call only AFTER the existing owner/admin access check. No gateway or booking writes. */
export function getVerifiedPurchase(booking: PaidBooking): EventParams | null {
  const payment = booking.payment
  if (booking.status !== 'CONFIRMED' || payment?.status !== 'PAID') return null
  if (booking.currency !== 'USD' || payment.currency !== booking.currency) return null
  if (![booking.totalAmount, booking.pricePerPerson, payment.amount].every((value) => Number.isFinite(value) && value > 0)) return null
  if (!Number.isInteger(booking.guests) || booking.guests < 1 || booking.guests > 100) return null
  if (Math.round(payment.amount * 100) !== Math.round(booking.totalAmount * 100) || Math.round(booking.pricePerPerson * booking.guests * 100) !== Math.round(booking.totalAmount * 100)) return null
  return {
    source: 'confirmation', package_id: booking.package.id, package_slug: booking.package.slug,
    value: booking.totalAmount, currency: booking.currency, price: booking.pricePerPerson, quantity: booking.guests,
    transaction_id: `iyt_${createHash('sha256').update(`iyt-ga4-purchase-v1:${booking.id}`).digest('hex')}`,
  }
}
