import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import BookingCard from '@/components/BookingCard'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params

  let pkg: any = null
  try {
    pkg = await prisma.package.findUnique({
      where: { slug },
      include: {
        reviews: {
          where: { isPublished: true },
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching package detail:', error)
  }

  if (!pkg) {
    notFound()
  }

  // Parse itinerary if it is a JSON array
  let itineraryList: Array<{ day: number; title: string; activities: string[] }> = []
  if (pkg.itinerary && typeof pkg.itinerary === 'object') {
    if (Array.isArray(pkg.itinerary)) {
      itineraryList = pkg.itinerary as any
    }
  }

  return (
    <main className="pt-28 pb-16 md:pb-24">
      {/* Breadcrumbs */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 mb-6">
        <nav aria-label="Breadcrumb" className="flex text-sm text-on-surface-variant">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                <Link href="/packages" className="hover:text-primary transition-colors">Retreats</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                <span className="text-primary font-medium">{pkg.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              {pkg.location}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {pkg.durationDays} Days / {pkg.durationNights} Nights
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">group</span>
              Max {pkg.maxGroupSize} People
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <div className="flex text-tertiary-fixed-dim">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined icon-fill"
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm font-medium ml-1">
                {pkg.avgRating.toFixed(1)} ({pkg.totalReviews} reviews)
              </span>
            </div>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-4">
            {pkg.title}
          </h1>
        </div>

        {/* Gallery Section */}
        <div className="mb-12">
          <div className="w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-4 bg-surface-variant">
            <img
              alt={pkg.title}
              className="w-full h-full object-cover"
              src={pkg.featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6P5RumoAovjaxcJxXzx8MtypuRV478k897UkJqQx406a4AZq7-3gEtK2C1RWtcaZW16EuLRW_twBg15rgGUXPviSzeyZdRbUJpWs7ug29FehnvTo6oumLOySd768TTviKJc0MPnaHHR8Y6H2OoPe2Mg19zbsM_xvlxoQyKcZOLsQ9xrhaVpPwlEHUnekmX4rsKtDycSuW919JHTGvrAoRE3saDMZU4slyLM1CPS_vVpnw-jF9QrlYt27zhV7-IJWHbvPH_D4nfTpN'}
            />
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
          {/* Left Column: Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview */}
            <section id="overview" className="scroll-mt-32">
              <h2 className="font-headline-lg text-primary mb-6">Discover Your Inner Silence</h2>
              <p className="font-body-lg text-on-surface-variant mb-6 whitespace-pre-line">
                {pkg.description}
              </p>
              
              <h3 className="font-headline-md text-primary mb-4 mt-8">Retreat Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(pkg.highlights || []).map((highlight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 bg-surface-container-low p-4 rounded-lg">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-sm font-body-md text-on-surface">{highlight}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            {itineraryList.length > 0 && (
              <section id="itinerary" className="scroll-mt-32">
                <h2 className="font-headline-md text-primary mb-6">Retreat Itinerary</h2>
                <div className="space-y-4">
                  {itineraryList.map((dayPlan, idx) => (
                    <details
                      key={idx}
                      className="group bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden"
                      open={idx === 0}
                    >
                      <summary className="flex justify-between items-center cursor-pointer p-6 bg-surface-container-low/50 hover:bg-surface-container-low transition-colors select-none">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary-container/40 flex items-center justify-center text-on-secondary-container font-bold">
                            D{dayPlan.day}
                          </div>
                          <h3 className="font-bold text-primary text-lg">{dayPlan.title}</h3>
                        </div>
                        <span className="material-symbols-outlined text-outline transition-transform duration-300 group-open:rotate-180">
                          expand_more
                        </span>
                      </summary>
                      <div className="p-6 pt-2 text-on-surface-variant border-t border-outline-variant/10">
                        <ul className="space-y-3 relative before:absolute before:inset-y-0 before:left-2.5 before:w-px before:bg-outline-variant/30 pl-8">
                          {dayPlan.activities.map((activity, actIdx) => (
                            <li key={actIdx} className="relative">
                              <div className="absolute -left-[1.65rem] top-1.5 w-2 h-2 rounded-full bg-secondary"></div>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            <section id="inclusions" className="scroll-mt-32 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-headline-md text-primary mb-4">What's Included</h3>
                <ul className="space-y-3">
                  {(pkg.inclusions || []).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-lg">done</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-headline-md text-primary mb-4">What's Excluded</h3>
                <ul className="space-y-3">
                  {(pkg.exclusions || []).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-error text-lg font-bold">close</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="scroll-mt-32">
              <h2 className="font-headline-md text-primary mb-6">Guest Reviews</h2>
              {(!pkg.reviews || pkg.reviews.length === 0) ? (
                <p className="text-on-surface-variant italic bg-surface-container-low p-6 rounded-lg border border-outline-variant/20">
                  No reviews yet for this retreat. Be one of the first to share your experience!
                </p>
              ) : (
                <div className="space-y-6">
                  {pkg.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-outline-variant/30 pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex text-tertiary-fixed-dim mb-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <span key={i} className="material-symbols-outlined icon-fill text-sm">star</span>
                            ))}
                          </div>
                          <h4 className="font-bold text-primary">{review.title || 'Incredible experience'}</h4>
                        </div>
                        <span className="text-xs text-on-surface-variant">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm italic mb-3">"{review.content}"</p>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="font-bold">{review.user.name}</span>
                        {review.country && <span>• {review.country}</span>}
                        {review.isVerified && (
                          <span className="flex items-center gap-0.5 text-secondary font-bold">
                            <span className="material-symbols-outlined text-[12px] icon-fill">verified</span>
                            Verified Guest
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-4 relative mt-8 lg:mt-0">
            <BookingCard
              packageId={pkg.id}
              priceShared={pkg.priceShared}
              pricePrivate={pkg.pricePrivate}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
