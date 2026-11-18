import Link from 'next/link'
import type { Metadata } from 'next'
import { getSiteConfig } from '@/lib/siteConfig'
import { prisma } from '@/lib/prisma'
import WhyChooseUsInteractive from '@/components/WhyChooseUsInteractive'
import HeroSearchBar from '@/components/home/HeroSearchBar'
import { getSiteSectionHtml, HOME_EXPERIENCE_SECTION_KEY } from '@/lib/siteSections'
import { HOME_URL, HOME_TITLE, HOME_DESCRIPTION, homeServices, homeFaqs } from '@/lib/homepageContent'
import { filterAvailablePackages } from '@/lib/packageAvailability'
import { TARGET_RETREAT_SLUG, TARGET_RETREAT_PATH } from '@/lib/retreatContent'

// Date-based availability must be checked on every request, including at midnight IST.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const image = config.ogImage || '/og-default.jpg'

  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    keywords: null,
    alternates: { canonical: HOME_URL },
    openGraph: {
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      url: HOME_URL,
      siteName: 'India Yoga Tourism',
      type: 'website',
      images: [{ url: image, alt: 'India Yoga Tourism' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [{ url: image, alt: 'India Yoga Tourism' }],
    },
  }
}

async function getAvailablePackages() {
  try {
    const packages = await prisma.package.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, slug: true, location: true, startDate: true, endDate: true, upcomingDates: true, durationDays: true },
      orderBy: { totalBookings: 'desc' },
    })
    return filterAvailablePackages(packages)
  } catch {
    return []
  }
}

async function getFeaturedPackages(ids: string[]) {
  if (ids.length === 0) return []
  try {
    return await prisma.package.findMany({
      where: { status: 'PUBLISHED', id: { in: ids } },
      orderBy: { totalBookings: 'desc' },
    })
  } catch {
    return []
  }
}

async function getTestimonials() {
  try {
    return await prisma.review.findMany({
      where: { isPublished: true, isVerified: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
  } catch {
    return []
  }
}

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

export default async function HomePage() {
  const [availablePackages, testimonials, config, homeExperienceSectionHtml] = await Promise.all([
    getAvailablePackages(),
    getTestimonials(),
    getSiteConfig(),
    getSiteSectionHtml(HOME_EXPERIENCE_SECTION_KEY),
  ])
  // Apply the four-card limit after filtering so expired popular retreats cannot hide current ones.
  const featuredPackages = await getFeaturedPackages(availablePackages.slice(0, 4).map(({ id }) => id))

  // A configured destination is displayed only when an available published listing matches it.
  const destinations = config.destinations.filter((destination) => {
    const query = (destination.locationQuery || destination.name).trim().toLowerCase()
    return query && availablePackages.some(({ location }) => location.toLowerCase().includes(query))
  })
  const whatsappNumber = config.whatsappNumber.replace(/\D/g, '')
  const phoneNumber = config.contactPhone.replace(/[^\d+]/g, '')
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${HOME_URL}#website`,
    name: 'India Yoga Tourism',
    url: HOME_URL,
    description: HOME_DESCRIPTION,
    inLanguage: 'en',
  }
  const hasWebsiteSchema = /"@type"\s*:\s*(?:"WebSite"|\[[^\]]*"WebSite")/i.test(config.customHtmlTags)
  // Keep the CMS section while reserving the homepage's single H1 for its main title.
  const experienceHtml = homeExperienceSectionHtml.replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2')

  return (
    <main className="bg-surface relative pb-12">
      {!hasWebsiteSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c') }} />}

      <section className="relative min-h-[600px] flex items-center justify-center pt-40 pb-16 md:pt-44 md:pb-20" aria-labelledby="home-title">
        <div className="absolute inset-0 overflow-hidden">
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Yoga practice on a terrace overlooking a mountain valley"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width={1600}
            height={1000}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-20 w-full max-w-[1280px] mx-auto px-6 md:px-12 text-center">
          <span className="inline-block px-4 py-1.5 bg-primary/70 border border-tertiary-fixed-dim/40 text-tertiary-fixed rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            Yoga · Meditation · Ayurveda
          </span>
          <h1 id="home-title" className="font-display-lg text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white max-w-5xl mx-auto leading-tight mb-6">
            Yoga Retreats in India{' – '}
            <span className="text-tertiary-fixed font-headline-lg">Discover Yoga, Meditation &amp; Ayurveda</span>
          </h1>
          <p className="font-body-md text-sm md:text-base text-white max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover India&apos;s rich traditions of yoga, meditation and Ayurveda with India Yoga Tourism. Explore yoga retreats, guided wellness experiences, yoga classes and traditional Ayurveda programs across destinations such as Rishikesh, Kerala and Dharamshala. Whether you&apos;re travelling from within India or overseas, find experiences that match your interests, schedule and wellness goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
            <Link href="/packages?category=RETREAT" className="bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold px-7 py-3.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Explore Yoga Retreats
            </Link>
            <Link href="/programmes" className="border border-white text-white hover:bg-white/10 font-bold px-7 py-3.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Browse Wellness Programs
            </Link>
          </div>
          <HeroSearchBar />
          <p className="mt-6 text-sm text-white/90">Explore direct and partner-operated experiences. Review each provider&apos;s program details before booking.</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-surface" aria-labelledby="services-title">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 id="services-title" className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-4">Explore Yoga Tourism &amp; Wellness Experiences in India</h2>
          <p className="text-on-surface-variant max-w-3xl mb-10 leading-relaxed">Find a starting point for your journey, from yoga and meditation retreats in India to Ayurveda retreats and guided classes.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homeServices.map((service) => (
              <article key={service.title} className="bg-white border border-outline-variant/40 rounded-2xl p-6 flex flex-col ambient-shadow">
                <span className="material-symbols-outlined text-secondary text-3xl mb-4" aria-hidden="true">{service.icon}</span>
                <h3 className="font-headline-md text-2xl font-bold text-primary mb-3">{service.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-5">{service.description}</p>
                <Link href={service.href} className="mt-auto text-sm text-secondary font-bold underline underline-offset-4 hover:text-primary">{service.linkText}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-surface-container-low" aria-labelledby="destinations-title">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 id="destinations-title" className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-4">Discover the Best Yoga Retreat Destinations in India</h2>
          <p className="text-on-surface-variant max-w-3xl mb-8 leading-relaxed">Explore India&apos;s diverse wellness destinations. From the Himalayan setting of Rishikesh to Kerala&apos;s Ayurveda traditions and Dharamshala&apos;s mountain atmosphere, each location offers a distinctive environment for yoga and mindful travel. Check current listings for available experiences.</p>
          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <Link key={destination.id} href={`/packages?location=${encodeURIComponent(destination.locationQuery || destination.name)}`} className="group block bg-white border border-outline-variant/40 rounded-2xl p-6 hover:border-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary">
                  <span className="material-symbols-outlined text-secondary text-3xl mb-3" aria-hidden="true">{destination.icon || 'landscape'}</span>
                  <h3 className="font-headline-md text-2xl text-primary font-bold mb-2">{destination.name}</h3>
                  <p className="text-sm text-on-surface-variant mb-4">{destination.subtitle}</p>
                  <span className="text-sm text-secondary font-bold underline underline-offset-4">Explore experiences in {destination.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/packages" className="inline-block text-secondary font-bold underline underline-offset-4">Browse listings by destination</Link>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#F8F3E3]" aria-labelledby="packages-title">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 id="packages-title" className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-4">Find Yoga Retreats &amp; Wellness Packages That Suit You</h2>
          <p className="text-on-surface-variant max-w-3xl mb-6 leading-relaxed">Compare yoga and wellness programs by destination, duration, activities and accommodation options. Browse available experiences, review program inclusions and explore booking options before planning your journey.</p>
          <Link href="/packages" className="inline-block text-secondary font-bold underline underline-offset-4 mb-8">View all yoga retreat and wellness packages</Link>
          {featuredPackages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPackages.map((pkg) => {
                const roomPrices = [
                  pkg.enableDormitory ? pkg.priceDormitory : null,
                  pkg.enableShared ? pkg.priceShared : null,
                  pkg.enablePrivate ? pkg.pricePrivate : null,
                ].filter((price): price is number => typeof price === 'number' && Number.isFinite(price) && price >= 0)
                const startingPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : null
                const hasRating = pkg.totalReviews > 0 && pkg.avgRating > 0 && pkg.avgRating <= 5

                return (
                  <article key={pkg.id} className="bg-white rounded-2xl overflow-hidden ambient-shadow flex flex-col border border-outline-variant/30">
                    <div className="relative aspect-[4/3] bg-surface-container-low overflow-hidden">
                      {pkg.featuredImage ? (
                        <img src={pkg.featuredImage} alt={`${pkg.title} in ${pkg.location}`} loading="lazy" decoding="async" width={480} height={360} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-secondary"><span className="material-symbols-outlined text-4xl" aria-hidden="true">spa</span></div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs text-secondary font-bold mb-2">{pkg.location}</p>
                      <h3 className="font-headline-md text-xl text-primary font-bold mb-3"><Link href={`/packages/${pkg.slug}`} className="hover:underline">{pkg.title}</Link></h3>
                      <p className="text-sm text-on-surface-variant mb-3">{pkg.durationDays} {pkg.durationDays === 1 ? 'day' : 'days'} / {pkg.durationNights} {pkg.durationNights === 1 ? 'night' : 'nights'}</p>
                      {pkg.inclusions.length > 0 && (
                        <ul className="list-disc pl-4 text-sm text-on-surface-variant space-y-1 mb-4">
                          {pkg.inclusions.slice(0, 3).map((inclusion, index) => <li key={index}>{inclusion}</li>)}
                        </ul>
                      )}
                      {hasRating && <p className="text-xs text-on-surface-variant mb-3">Rated {pkg.avgRating.toFixed(1)} / 5 · {pkg.totalReviews} {pkg.totalReviews === 1 ? 'review' : 'reviews'}</p>}
                      <p className="mt-auto text-primary font-bold mb-4">{startingPrice !== null ? `From ${priceFormatter.format(startingPrice)} USD per person` : 'Contact us for pricing'}</p>
                      <Link href={`/packages/${pkg.slug}`} aria-label={`View details and booking options for ${pkg.title}`} className="block text-center text-sm font-bold rounded-xl px-4 py-3 bg-primary text-white hover:bg-primary-container">View Details &amp; Booking Options</Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="text-on-surface-variant">Package details are currently unavailable here. <Link href="/contact" className="text-secondary underline underline-offset-4">Contact our team about current programs.</Link></p>
          )}
          <p className="text-sm text-on-surface-variant mt-6">Prices shown are in USD. Inclusions, dates, operator details and cancellation terms vary by program; confirm them before booking.</p>
        </div>
      </section>

      {experienceHtml && <div dangerouslySetInnerHTML={{ __html: experienceHtml }} />}

      <section className="py-16 md:py-24 bg-surface" aria-labelledby="ayurveda-title">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 id="ayurveda-title" className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-5">Experience Traditional Ayurveda &amp; Panchakarma in India</h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">Discover Ayurveda wellness programs that introduce visitors to traditional Indian approaches to daily routines, relaxation and holistic well-being. Some centres also offer Panchakarma programs under qualified practitioner supervision. Program suitability, treatment details and medical considerations should be discussed with the relevant practitioner before booking.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-4 text-sm font-bold text-secondary">
              <Link href="/programmes" className="underline underline-offset-4">Explore Ayurveda programs</Link>
              <Link href="/panchakarma-retreat-rishikesh" className="underline underline-offset-4">Learn about Panchakarma in Rishikesh</Link>
            </div>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 border border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary text-4xl mb-4" aria-hidden="true">spa</span>
            <h3 className="font-headline-md text-2xl text-primary font-bold mb-3">Choose a program with individual guidance</h3>
            <p className="text-on-surface-variant leading-relaxed">Ask who provides the program, what a consultation includes, which activities are optional and whether the experience is appropriate for your circumstances. Wellness packages differ between centres.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white border-y border-outline-variant/30" aria-labelledby="why-title">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 id="why-title" className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-4">Why Choose India Yoga Tourism?</h2>
          <p className="text-on-surface-variant max-w-3xl mb-10 leading-relaxed">Our platform brings together yoga, meditation and Ayurveda experiences in one place. Explore programs offered directly by our team alongside options from independent retreat providers, with information to help you compare experiences and make informed booking decisions.</p>
          <WhyChooseUsInteractive />
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-16" aria-labelledby="reviews-title">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12">
            <h2 id="reviews-title" className="font-headline-md text-3xl text-primary font-bold mb-8">What Our Guests Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((review) => (
                <figure key={review.id} className="bg-white border border-outline-variant/30 rounded-2xl p-6">
                  <p className="text-sm text-secondary mb-3">{review.rating} / 5</p>
                  <blockquote className="text-sm text-on-surface-variant leading-relaxed mb-4">{review.content}</blockquote>
                  <figcaption className="text-sm text-primary font-bold">{review.user.name}{review.country ? ` · ${review.country}` : ''}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 bg-surface-container-low" aria-labelledby="faq-title">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <h2 id="faq-title" className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-8">Frequently Asked Questions About Yoga Retreats in India</h2>
          <div className="space-y-4">
            {homeFaqs.map((faq) => (
              <details key={faq.question} className="group bg-white border border-outline-variant/40 rounded-xl p-5">
                <summary className="cursor-pointer font-bold text-primary text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"><h3 className="inline font-body-md">{faq.question}</h3></summary>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-4">{faq.answer}</p>
              </details>
            ))}
          </div>
          <Link href="/faqs" className="inline-block mt-6 text-secondary font-bold underline underline-offset-4">More booking and travel FAQs</Link>
        </div>
      </section>

      <section className="relative py-16 md:py-24 bg-primary text-white overflow-hidden" aria-labelledby="journey-title">
        <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80" alt="" aria-hidden="true" loading="lazy" decoding="async" width={1600} height={1000} className="absolute inset-0 object-cover w-full h-full opacity-20" />
        <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 text-center">
          <h2 id="journey-title" className="font-display-lg text-3xl md:text-4xl font-bold mb-5">Start Planning Your Yoga &amp; Wellness Journey in India</h2>
          <p className="text-white leading-relaxed mb-8">Explore retreats, compare wellness experiences and discover programs that fit your travel plans.{availablePackages.find((pkg) => pkg.slug === TARGET_RETREAT_SLUG) && <> Planning a shorter stay? <Link href={TARGET_RETREAT_PATH} data-track-event="select_item" data-retreat-id={availablePackages.find((pkg) => pkg.slug === TARGET_RETREAT_SLUG)?.id} data-retreat-slug={TARGET_RETREAT_SLUG} className="font-semibold underline underline-offset-4">Review the five-day yoga and spiritual retreat in Rishikesh</Link>.</>}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/packages" className="bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold px-7 py-3.5 rounded-full">Explore Retreats</Link>
            <Link href="/contact" className="border border-white hover:bg-white/10 text-white font-bold px-7 py-3.5 rounded-full">Contact Our Team</Link>
          </div>
          {whatsappNumber && <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-white underline underline-offset-4 mt-6">Ask our team on WhatsApp</a>}
        </div>
      </section>

      <div className="md:hidden fixed bottom-4 left-4 right-24 z-40 flex gap-2 items-center">
        {whatsappNumber && (
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-primary text-white px-4 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 border border-white/30 text-xs font-bold">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">chat</span>Ask on WhatsApp
          </a>
        )}
        {phoneNumber && <a href={`tel:${phoneNumber}`} aria-label={`Call India Yoga Tourism on ${config.contactPhone}`} className="w-12 h-12 rounded-full bg-white border border-outline-variant flex items-center justify-center text-primary shadow-lg shrink-0"><span className="material-symbols-outlined text-lg" aria-hidden="true">call</span></a>}
      </div>
    </main>
  )
}
