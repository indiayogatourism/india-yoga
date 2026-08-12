import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CheckoutWizard from '@/components/CheckoutWizard'

interface PageProps {
  searchParams: Promise<{
    packageId?: string
    guests?: string
    roomType?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { packageId, guests = '1', roomType = 'shared' } = params

  if (!packageId) {
    redirect('/packages')
  }

  let pkg: any = null
  try {
    pkg = await prisma.package.findUnique({
      where: { id: packageId }
    })
  } catch (error) {
    console.error('Error fetching package for checkout:', error)
  }

  if (!pkg) {
    notFound()
  }

  return (
    <div className="bg-surface min-h-screen">
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
        pkg={pkg}
        initialGuests={parseInt(guests)}
        initialRoomType={roomType as 'shared' | 'private'}
      />
    </div>
  )
}

import Link from 'next/link'
