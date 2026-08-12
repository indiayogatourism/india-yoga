import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { PackageCategory } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    search?: string
    category?: string
    duration?: string
    location?: string
  }>
}

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = params.search || ''
  const categoryParam = params.category || ''
  const durationParam = params.duration || ''
  const locationParam = params.location || ''

  // Build prisma filter query
  const whereClause: any = {
    status: 'PUBLISHED'
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (categoryParam) {
    whereClause.category = categoryParam as PackageCategory
  }

  if (locationParam) {
    whereClause.location = { contains: locationParam, mode: 'insensitive' }
  }

  if (durationParam) {
    if (durationParam === 'short') {
      whereClause.durationDays = { lte: 5 }
    } else if (durationParam === 'medium') {
      whereClause.durationDays = { gt: 5, lte: 10 }
    } else if (durationParam === 'long') {
      whereClause.durationDays = { gt: 10 }
    }
  }

  let packages: any[] = []
  try {
    packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
  }

  // List of active filters to generate queries easily
  const getFilterUrl = (type: 'category' | 'duration', value: string) => {
    const searchParamsObj = new URLSearchParams()
    if (search) searchParamsObj.set('search', search)
    if (locationParam) searchParamsObj.set('location', locationParam)
    
    if (type === 'category') {
      if (value) searchParamsObj.set('category', value)
      if (durationParam) searchParamsObj.set('duration', durationParam)
    } else if (type === 'duration') {
      if (categoryParam) searchParamsObj.set('category', categoryParam)
      if (value) searchParamsObj.set('duration', value)
    }
    
    return `/packages?${searchParamsObj.toString()}`
  }

  return (
    <main className="pt-32 pb-section-padding-desktop">
      {/* Header Section */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-16 text-center">
        <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-6">
          Our Sanctuary Packages
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Discover transformative journeys curated to restore balance, deepen your practice, and reconnect you with nature in the heart of the Himalayas.
        </p>
      </section>

      {/* Filters Section */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-16">
        <div className="flex flex-col gap-4 items-center justify-center">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={getFilterUrl('category', '')}
              className={`px-5 py-2.5 rounded-full font-body-md text-sm border transition-all ${
                !categoryParam
                  ? 'bg-secondary/15 text-secondary border-transparent font-bold'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-secondary/5 hover:border-secondary'
              }`}
            >
              All Categories
            </Link>
            {Object.values(PackageCategory).map((cat) => (
              <Link
                key={cat}
                href={getFilterUrl('category', cat)}
                className={`px-5 py-2.5 rounded-full font-body-md text-sm border transition-all ${
                  categoryParam === cat
                    ? 'bg-secondary/15 text-secondary border-transparent font-bold'
                    : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-secondary/5 hover:border-secondary'
                }`}
              >
                {cat.replace('_', ' ')}
              </Link>
            ))}
          </div>

          {/* Duration Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Link
              href={getFilterUrl('duration', '')}
              className={`px-4 py-2 rounded-full font-body-md text-xs border transition-all ${
                !durationParam
                  ? 'bg-primary text-on-primary border-transparent'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-primary/10'
              }`}
            >
              Any Duration
            </Link>
            <Link
              href={getFilterUrl('duration', 'short')}
              className={`px-4 py-2 rounded-full font-body-md text-xs border transition-all ${
                durationParam === 'short'
                  ? 'bg-primary text-on-primary border-transparent'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-primary/10'
              }`}
            >
              3 - 5 Days
            </Link>
            <Link
              href={getFilterUrl('duration', 'medium')}
              className={`px-4 py-2 rounded-full font-body-md text-xs border transition-all ${
                durationParam === 'medium'
                  ? 'bg-primary text-on-primary border-transparent'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-primary/10'
              }`}
            >
              6 - 10 Days
            </Link>
            <Link
              href={getFilterUrl('duration', 'long')}
              className={`px-4 py-2 rounded-full font-body-md text-xs border transition-all ${
                durationParam === 'long'
                  ? 'bg-primary text-on-primary border-transparent'
                  : 'bg-transparent text-on-surface-variant border-outline-variant hover:bg-primary/10'
              }`}
            >
              10+ Days
            </Link>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12">
        {packages.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">sentiment_dissatisfied</span>
            <h3 className="font-headline-md text-xl text-primary mb-2">No Sanctuaries Found</h3>
            <p className="font-body-md text-on-surface-variant">Try refining your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <article
                key={pkg.id}
                className="bg-surface rounded-xl overflow-hidden ambient-shadow flex flex-col group h-full transition-transform hover:-translate-y-1 duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    alt={pkg.title}
                    src={pkg.featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIFA6hknquQPohifChXu_cQ63MM264jx5ZJaji4EqSJimKAiI2UTy-fXnigoCyl0LO2AtqvL-iFAD6lDgujcAgTGaN3KJ97hMds5bufumdDA3qCkl2omLQTke0vGWvWv0rPXOALro0Ddz1v58CFzvNxWEj76buYsv2fwXpcDbCj12thTTljBR9GM99ax6Gboe__vJCELNZfpSg6q-TFoQDu3g8jxZzg32SlECMJ7rzsOP-qrRypCs-dPLzfmENOPsrysiiZ8k4tKU7'}
                  />
                  {pkg.isBestseller && (
                    <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase text-primary border border-surface/50">
                      Bestseller
                    </div>
                  )}
                  {pkg.isLimitedSpots && (
                    <div className="absolute top-4 left-4 bg-error-container/90 backdrop-blur-md px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase text-on-error-container border border-error-container/50">
                      Limited Spots
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow relative bg-surface">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h2 className="font-headline-md text-primary text-2xl leading-tight font-bold group-hover:text-secondary transition-colors">
                      {pkg.title}
                    </h2>
                    <span className="font-label-price text-on-tertiary-container shrink-0 mt-1">
                      {formatPrice(pkg.priceShared)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-md text-sm mb-6">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>
                      {pkg.durationDays} Days / {pkg.durationNights} Nights
                    </span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-8 line-clamp-3 flex-grow">
                    {pkg.shortDescription}
                  </p>
                  <Link href={`/packages/${pkg.slug}`} className="mt-auto">
                    <button className="w-full py-3.5 border-2 border-on-tertiary-container text-on-tertiary-container font-label-price text-sm tracking-wider uppercase rounded hover:bg-on-tertiary-container hover:text-white transition-colors cursor-pointer">
                      View Retreat
                    </button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
