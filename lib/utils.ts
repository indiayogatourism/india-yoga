import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { prisma } from './prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateBookingRef(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(2) // e.g. "26" for 2026
  const last = await prisma.booking.findFirst({
    where: { bookingRef: { startsWith: `IYT-${year}-` } },
    orderBy: { createdAt: 'desc' }
  })
  const num = last ? parseInt(last.bookingRef.split('-')[2]) + 1 : 1
  return `IYT-${year}-${num.toString().padStart(5, '0')}`
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
