import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { isAdminViewer } from '@/lib/adminPreview'
import { SITE_URL, toPreferredUrl, withBrand } from '@/lib/siteUrl'
import { getPackageDetail, getRetreatCatalog } from '@/lib/retreatCatalog'
import { getPackageDateOptions } from '@/lib/packageAvailability'
import { getRetreatRooms, RETREATS_PATH, retreatEnquiryUrl, TARGET_RETREAT_SLUG, TARGET_RETREAT_NAME, TARGET_RETREAT_TITLE, TARGET_RETREAT_DESCRIPTION, usdPrice } from '@/lib/retreatContent'
import { getSiteConfig } from '@/lib/siteConfig'
import { getSiteSectionHtml, PROGRAMME_RETREAT_SECTION_KEY } from '@/lib/siteSections'
import HeadTags from '@/components/HeadTags'
import BookingCard from '@/components/BookingCard'
import PackageGalleryViewer from '@/components/PackageGalleryViewer'
import RetreatCard from '@/components/retreats/RetreatCard'
import { Breadcrumbs, Questions } from '@/components/retreats/Editorial'
import ConversionTracking from '@/components/ConversionTracking'
import { withPackageImageUrls } from '@/lib/packageImages'

interface PageProps { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const saved = await getPackageDetail(slug)
  if (!saved) return { robots: { index: false, follow: false } }
  const pkg = saved.status === 'PUBLISHED' ? withPackageImageUrls(saved) : saved
  if (pkg.status !== 'PUBLISHED') return { title: withBrand(pkg.metaTitle || pkg.title), robots: { index: false, follow: false } }
  const target = slug === TARGET_RETREAT_SLUG
  const title = target ? TARGET_RETREAT_TITLE : withBrand(pkg.metaTitle || pkg.title)
  const description = target ? TARGET_RETREAT_DESCRIPTION : pkg.metaDescription || pkg.shortDescription
  const canonical = target ? `${SITE_URL}/packages/${slug}` : toPreferredUrl(pkg.canonicalUrl) || `${SITE_URL}/packages/${slug}`
  const image = pkg.ogImage || pkg.featuredImage
  return {
    title, description, alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'India Yoga Tourism', type: 'website', images: image ? [{ url: image, alt: pkg.title }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] },
  }
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params
  const saved = await getPackageDetail(slug)
  if (!saved) notFound()
  const pkg = saved.status === 'PUBLISHED' ? withPackageImageUrls(saved) : saved
  const isDraftPreview = pkg.status !== 'PUBLISHED'
  if (isDraftPreview && !(await isAdminViewer())) notFound()
  const [config, catalog, sharedHtml] = await Promise.all([getSiteConfig(), getRetreatCatalog(), getSiteSectionHtml(PROGRAMME_RETREAT_SECTION_KEY)])
  const target = slug === TARGET_RETREAT_SLUG
  const title = target && pkg.durationDays === 5 && pkg.durationNights === 4 ? TARGET_RETREAT_NAME : pkg.title
  const rooms = getRetreatRooms(pkg)
  const startingPrice = rooms.length ? Math.min(...rooms.map((room) => room.price)) : undefined
  const schedule = getPackageDateOptions(pkg)
  const canBook = !isDraftPreview && schedule.canBook && rooms.length > 0
  const enquiryUrl = retreatEnquiryUrl(slug)
  const whatsapp = config.whatsappNumber.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`I would like to enquire about ${pkg.title}. ${SITE_URL}/packages/${slug}`)}`
  const related = catalog.filter((retreat) => retreat.id !== pkg.id).slice(0, 3)
  const practiceActivities = pkg.highlights.filter((item) => /yoga|meditation|pranayama|breathwork|sound healing/i.test(item))
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.title !== 'string' || !Array.isArray(entry.activities)) return []
    return [{ title: entry.title, day: entry.day, activities: entry.activities.filter((activity): activity is string => typeof activity === 'string') }]
  }) : []
  const normalizeHeadings = (html: string) => html.replace(/<(\/?)h1(?=[\s>])/gi, '<$1h2')
  // The target's saved JSON-LD contains an outdated USD 1499/InStock offer.
  // Replace only its JSON-LD at render time; preserve the CMS record and other custom tags.
  const customTags = target ? (pkg.customHtmlTags || '').replace(/<script\b(?=[^>]*\btype\s*=\s*["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script\s*>/gi, '') : pkg.customHtmlTags
  const tripSchema = { '@context': 'https://schema.org', '@type': 'TouristTrip', '@id': `${SITE_URL}/packages/${slug}#retreat`, name: title, description: pkg.shortDescription, url: `${SITE_URL}/packages/${slug}`, image: [...new Set([pkg.featuredImage, ...pkg.gallery].filter((image): image is string => !!image))].map((image) => new URL(image, SITE_URL).href) }
  const questions = [
    { question: 'What is the duration and location?', answer: `This retreat lists ${pkg.durationDays} days and ${pkg.durationNights} nights in ${pkg.location}. Review the itinerary for arrival, departure and activity details.` },
    { question: 'Which room options and prices can I choose?', answer: rooms.length ? `Currently listed options: ${rooms.map((room) => `${room.label}: ${usdPrice(room.price)} USD per person`).join('; ')}. The booking card calculates the total for your guest count. Confirm room arrangements and any extras with the team.` : 'Current accommodation prices are not listed. Please enquire before making travel plans.' },
    { question: 'Are my preferred dates available?', answer: schedule.dates.length ? `The current listed schedule is ${schedule.dates.join('; ')}. These dates do not guarantee remaining room inventory; contact the team to confirm your preferred arrangements.` : 'Please contact the team with your preferred travel dates. Do not assume that an undated listing guarantees availability.' },
    { question: 'What are the cancellation and booking terms?', answer: 'Read the published refund and cancellation policy and terms and conditions linked below. Ask how they apply to this retreat, including any partner-operated services, before paying.' },
  ]
  return <>
    <HeadTags html={customTags} skipMetadataTags />
    {target && !isDraftPreview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tripSchema).replace(/</g, '\\u003c') }} />}
    {!isDraftPreview && <ConversionTracking event="view_item" packageId={pkg.id} packageSlug={slug} source="package" value={startingPrice} price={startingPrice} currency={startingPrice !== undefined ? 'USD' : undefined} />}
    <main data-retreat-id={isDraftPreview ? undefined : pkg.id} data-retreat-slug={slug} className="bg-[#f8f6f0] pb-36 pt-28 lg:pb-20">
      {isDraftPreview && <p className="bg-amber-50 p-4 text-center text-sm text-amber-950">Draft preview — only administrators can view this package.</p>}
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Yoga retreats', href: RETREATS_PATH }, { label: pkg.title }]} />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#64774d]">{pkg.location} · {pkg.durationDays} days / {pkg.durationNights} nights</p>
          <h1 className="mt-4 max-w-4xl font-display-lg text-4xl leading-tight text-[#17372b] md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-3xl leading-8 text-[#536457]">{pkg.shortDescription}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={canBook ? '#booking-card-section' : enquiryUrl} data-track-event={canBook ? 'booking_cta_click' : undefined} data-track-package={slug} className="inline-flex min-h-12 items-center rounded-full bg-[#17372b] px-6 text-sm font-bold text-white">{canBook ? 'View dates & continue to booking' : 'Enquire about this retreat'}</a>
            <Link href={enquiryUrl} className="inline-flex min-h-12 items-center rounded-full border border-[#17372b]/30 px-6 text-sm font-semibold text-[#17372b]">Ask our team</Link>
            {rooms.length > 0 && <p className="text-sm font-semibold text-[#17372b]">From {usdPrice(Math.min(...rooms.map((room) => room.price)))} USD / person</p>}
          </div>
          <p className="mt-4 text-sm text-[#536457]">{schedule.dates.length ? `Listed dates: ${schedule.dates.join(' · ')}` : schedule.flexible ? 'Flexible travel dates — confirm arrangements with the team.' : 'No current dates are listed. Enquire about the next departure.'}</p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#17372b]"><a href="#inclusions" className="underline underline-offset-4">Inclusions &amp; exclusions</a><a href="#accommodation" className="underline underline-offset-4">Room details</a><a href="#booking-policy" className="underline underline-offset-4">Cancellation information</a></p>
        </header>
        <PackageGalleryViewer featuredImage={pkg.featuredImage} gallery={pkg.gallery} title={pkg.title} />
        <nav aria-label="Retreat sections" className="mb-8 flex flex-wrap gap-x-5 gap-y-3 border-y border-[#17372b]/15 py-5 text-sm font-semibold text-[#17372b]">
          <a href="#overview">Overview</a><a href="#retreat-details">Itinerary &amp; details</a><a href="#accommodation">Rooms</a><a href="#dates">Dates</a><a href="#inclusions">Inclusions</a><a href="#booking-policy">Booking information</a>
        </nav>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-12">
            <section id="overview" className="scroll-mt-32">
              <h2 className="font-display-lg text-3xl text-[#17372b]">{target ? 'Your five-day Rishikesh retreat' : 'Retreat overview'}</h2>
              <p className="mt-5 whitespace-pre-line leading-8 text-[#536457]">{pkg.description}</p>
              {pkg.highlights.length > 0 && <><h3 className="mb-4 mt-7 text-lg font-bold text-[#17372b]">Package highlights</h3><ul className="grid gap-3 sm:grid-cols-2">{pkg.highlights.map((item, index) => <li key={index} className="rounded-2xl bg-white p-4 text-sm leading-6 text-[#536457]">{item}</li>)}</ul></>}
              <p className="mt-5 text-sm text-[#536457]">Listed difficulty: {pkg.difficultyLevel}. {pkg.maxGroupSize > 0 ? `Maximum group size: ${pkg.maxGroupSize}.` : ''} Ask about suitability for your practice and planned activities.</p>
            </section>
            {practiceActivities.length > 0 && <section><h2 className="font-display-lg text-3xl text-[#17372b]">Yoga &amp; meditation activities</h2><ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-[#536457]">{practiceActivities.map((activity, index) => <li key={index}>{activity}</li>)}</ul><p className="mt-4 text-sm leading-7 text-[#536457]">These activities are listed in the package highlights. Check the detailed schedule and ask about any adaptations before booking.</p></section>}
            <section id="retreat-details" className="scroll-mt-32">
              <h2 className="mb-5 font-display-lg text-3xl text-[#17372b]">Itinerary &amp; retreat details</h2>
              {itinerary.length > 0 && <div className="mb-8 space-y-3">{itinerary.map((day, index) => <details key={index} open={index === 0} className="rounded-2xl border border-[#17372b]/15 bg-white p-5"><summary className="cursor-pointer font-bold text-[#17372b]">Day {typeof day.day === 'number' ? day.day : index + 1}: {day.title}</summary><ul className="mt-4 list-disc space-y-2 pl-5 text-[#536457]">{day.activities.map((activity, i) => <li key={i}>{activity}</li>)}</ul></details>)}</div>}
              {pkg.contentHtml && <div className="package-custom-content" dangerouslySetInnerHTML={{ __html: normalizeHeadings(pkg.contentHtml) }} />}
              {!itinerary.length && !pkg.contentHtml && <p className="leading-7 text-[#536457]">A detailed itinerary has not been published. Ask the team for the day-wise schedule before booking.</p>}
            </section>
            <section id="accommodation" className="scroll-mt-32 rounded-3xl bg-white p-6 md:p-8">
              <h2 className="font-display-lg text-3xl text-[#17372b]">Accommodation &amp; pricing</h2>
              {rooms.length ? <ul className="mt-5 divide-y divide-[#17372b]/10">{rooms.map((room) => <li key={room.type} className="flex flex-wrap justify-between gap-3 py-4 text-[#17372b]"><span>{room.label}</span><strong>{usdPrice(room.price)} USD / person</strong></li>)}</ul> : <p className="mt-5 text-[#536457]">Please enquire for current room options and pricing.</p>}
              <p className="mt-5 text-sm leading-7 text-[#536457]">Confirm the property name, room setup, sharing arrangements and facilities with the team. Prices are per person for the listed room options; inclusions and exclusions are listed separately.</p>
              <Link href={enquiryUrl} className="mt-4 inline-block font-semibold text-[#17372b] underline underline-offset-4">Ask about accommodation</Link>
            </section>
            <section id="dates" className="scroll-mt-32">
              <h2 className="font-display-lg text-3xl text-[#17372b]">Current dates &amp; booking options</h2>
              {schedule.dates.length ? <ul className="mt-5 space-y-3">{schedule.dates.map((date) => <li key={date} className="rounded-2xl border border-[#17372b]/15 bg-white p-4 font-semibold text-[#17372b]">{date}</li>)}</ul> : <p className="mt-5 leading-7 text-[#536457]">{schedule.flexible ? 'No fixed batch dates are listed. Choose your travel dates in checkout or enquire to confirm arrangements.' : 'The previous dates have ended or need confirmation. Ask about the next retreat before making a booking.'}</p>}
              <p className="mt-4 text-sm leading-7 text-[#536457]">Published dates are a schedule, not a live guarantee of room availability. Enquire if you need confirmation before payment.</p>
            </section>
            <section id="inclusions" className="grid scroll-mt-32 gap-8 sm:grid-cols-2">
              {[{ title: 'What is included', items: pkg.inclusions }, { title: 'What is excluded', items: pkg.exclusions }].map((group) => <div key={group.title}><h2 className="font-display-lg text-2xl text-[#17372b]">{group.title}</h2>{group.items.length ? <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7 text-[#536457]">{group.items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="mt-5 text-[#536457]">Please ask the team to confirm these details.</p>}</div>)}
            </section>
            <section className="rounded-3xl bg-[#e9ecdf] p-6 md:p-8">
              <h2 className="font-display-lg text-3xl text-[#17372b]">Your instructors &amp; retreat operator</h2>
              <p className="mt-5 leading-8 text-[#536457]">India Yoga Tourism offers its own services and third-party retreat bookings. Ask who operates this particular retreat, the teaching team and language of instruction. Contact the team for instructor profiles and property details before you decide.</p>
              <Link href={enquiryUrl} className="mt-4 inline-block font-semibold text-[#17372b] underline underline-offset-4">Request instructor and operator details</Link>
            </section>
            {pkg.reviews.length > 0 && <section id="reviews"><h2 className="font-display-lg text-3xl text-[#17372b]">Verified guest reviews</h2><div className="mt-5 space-y-5">{pkg.reviews.map((review) => <figure key={review.id} className="rounded-2xl bg-white p-6"><p className="text-sm font-semibold text-[#17372b]">Rated {review.rating} / 5</p><blockquote className="mt-3 leading-7 text-[#536457]">{review.content}</blockquote><figcaption className="mt-4 text-sm text-[#536457]">{review.user.name}{review.country ? ` · ${review.country}` : ''}</figcaption></figure>)}</div></section>}
            <section id="booking-policy" className="scroll-mt-32">
              <h2 className="font-display-lg text-3xl text-[#17372b]">Booking, confirmation &amp; cancellation</h2>
              <ol className="mt-5 list-decimal space-y-3 pl-5 leading-7 text-[#536457]"><li>Review the dates, room type, guest count, inclusions and total amount.</li><li>Use the existing checkout to provide traveller details and choose a payment option.</li><li>Check the confirmation screen and your booking dashboard for the payment and booking status. A pending payment is not a confirmed booking.</li></ol>
              <p className="mt-5 leading-7 text-[#536457]">Read the <Link href="/refund-policy" className="underline underline-offset-4">refund and cancellation policy</Link> and <Link href="/terms-and-conditions" className="underline underline-offset-4">terms and conditions</Link>. Ask which conditions apply to this retreat before paying.</p>
            </section>
            <section><h2 className="mb-4 font-display-lg text-3xl text-[#17372b]">Retreat questions, answered</h2><Questions items={questions} /></section>
            {(pkg.category === 'RETREAT' || pkg.category === 'PROGRAMME') && sharedHtml && <div dangerouslySetInnerHTML={{ __html: normalizeHeadings(sharedHtml) }} />}
          </div>
          <BookingCard packageId={pkg.id} packageSlug={slug} packageTitle={pkg.title} rooms={rooms} bookingDates={schedule.dates} canBook={canBook} maxGuests={Math.max(1, pkg.maxGroupSize)} flexibleDates={schedule.flexible} enquiryUrl={enquiryUrl} whatsappUrl={whatsappUrl} />
        </div>
        {related.length > 0 && <section className="mt-20"><h2 className="mb-7 font-display-lg text-3xl text-[#17372b]">Explore other yoga retreats</h2><div className="grid gap-6 md:grid-cols-3">{related.map((retreat) => <RetreatCard key={retreat.id} retreat={retreat} />)}</div><Link href={RETREATS_PATH} className="mt-6 inline-block font-semibold text-[#17372b] underline underline-offset-4">Compare yoga retreats in India</Link></section>}
      </div>
    </main>
  </>
}
