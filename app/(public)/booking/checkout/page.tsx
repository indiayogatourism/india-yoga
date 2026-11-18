import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CheckoutWizard from '@/components/CheckoutWizard'
import ConversionTracking from '@/components/ConversionTracking'
import type { Package } from '@prisma/client'
import { getPackageDateOptions } from '@/lib/packageAvailability'
import { getRetreatRooms } from '@/lib/retreatContent'
import { withPackageImageUrls } from '@/lib/packageImages'

interface PageProps {
  searchParams: Promise<{
    packageId?: string
    guests?: string
    roomType?: string
    selectedBatch?: string
  }>
}

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Checkout | India Yoga Tourism', robots: { index: false, follow: false } }

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { packageId, guests = '1', roomType = 'shared', selectedBatch = '' } = params

  if (!packageId) {
    redirect('/packages')
  }

  let pkg: Package | null = null
  try {
    pkg = await prisma.package.findUnique({
      where: { id: packageId }
    })
  } catch (error) {
    console.error('Error fetching package for checkout:', error)
  }

  if (!pkg || pkg.status !== 'PUBLISHED') {
    notFound()
  }
  const schedule = getPackageDateOptions(pkg)
  const rooms = getRetreatRooms(pkg)
  if (!schedule.canBook || !rooms.length) redirect(`/packages/${pkg.slug}`)
  const chosenRoom = rooms.find((room) => room.type === roomType) || rooms[0]
  const chosenBatch = schedule.dates.includes(selectedBatch) ? selectedBatch : schedule.dates[0] || ''
  const guestCount = Math.max(1, Math.min(pkg.maxGroupSize, Number.isInteger(Number(guests)) ? Number(guests) : 1))
  const images = withPackageImageUrls(pkg)
  // Send only the fields used by the wizard, not the full CMS HTML/gallery record.
  const checkoutPackage = {
    id: pkg.id, title: pkg.title, location: pkg.location, durationDays: pkg.durationDays,
    maxGroupSize: pkg.maxGroupSize, enableDormitory: pkg.enableDormitory, enableShared: pkg.enableShared, enablePrivate: pkg.enablePrivate,
    priceDormitory: pkg.priceDormitory, priceShared: pkg.priceShared, pricePrivate: pkg.pricePrivate, featuredImage: images.featuredImage,
  }

  return (
    <div className="bg-surface min-h-screen">
      <ConversionTracking event="begin_checkout" packageId={pkg.id} packageSlug={pkg.slug} source="checkout" value={chosenRoom.price * guestCount} price={chosenRoom.price} quantity={guestCount} currency="USD" />
      {/* Minimal Checkout Header (Navigation Suppressed per rules) */}
      <header className="w-full py-6 px-6 md:px-12 border-b border-surface-container-highest bg-surface sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center">
          <Link href="/" className="font-display-lg text-[24px] text-primary tracking-tight font-bold">
            India Yoga Tourism
          </Link>
          <Link
            href={`/packages/${pkg.slug}`}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Return to Retreat
          </Link>
        </div>
      </header>

      {/* Checkout Wizard */}
      <CheckoutWizard
        pkg={checkoutPackage}
        initialGuests={guestCount}
        initialRoomType={chosenRoom.type}
        initialSelectedBatch={chosenBatch}
        initialArrivalDate={schedule.arrivals[chosenBatch] || ''}
      />
    </div>
  )
}

import Link from 'next/link'
