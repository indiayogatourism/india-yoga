import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'
import { getRetreatCatalog } from '@/lib/retreatCatalog'
import { RETREATS_PATH, retreatEnquiryUrl, TARGET_RETREAT_SLUG, retreatFaqs } from '@/lib/retreatContent'
import RetreatCard from '@/components/retreats/RetreatCard'
import { Breadcrumbs, PageHero, Questions, primaryLinkClass, outlineLinkClass } from '@/components/retreats/Editorial'

export const dynamic = 'force-dynamic'
const title = 'Yoga Retreats in India | Rishikesh Yoga Retreat Packages'
const description = 'Compare yoga retreats in India, including the five-day Rishikesh yoga and spiritual retreat. Explore real packages, durations, destinations and booking options.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: `${SITE_URL}${RETREATS_PATH}` },
  openGraph: { title, description, url: `${SITE_URL}${RETREATS_PATH}`, siteName: 'India Yoga Tourism', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}

export default async function RetreatsPage() {
  const retreats = await getRetreatCatalog()
  const featured = retreats.find((retreat) => retreat.slug === TARGET_RETREAT_SLUG)
  const destinations = [...new Set(retreats.map((retreat) => retreat.location))]
  const durations = [...new Set(retreats.map((retreat) => retreat.durationDays))].sort((a, b) => a - b)
  const listSchema = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Yoga retreats in India', itemListElement: retreats.map((retreat, index) => ({ '@type': 'ListItem', position: index + 1, name: retreat.title, url: `${SITE_URL}/packages/${retreat.slug}` })) }
  return <main className="bg-[#f8f6f0] pb-20">
    {retreats.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema).replace(/</g, '\\u003c') }} />}
    <PageHero eyebrow="A little space for yourself" title="Yoga Retreats in India – Explore Authentic Yoga Experiences" intro="Make room for yoga, meditation and a different rhythm of travel. Compare the places, schedules and practical details, then choose an experience that fits you." image={featured?.featuredImage}>
      <a href={featured ? '#featured-retreat' : '#retreat-packages'} className={primaryLinkClass}>{featured ? 'Explore the five-day Rishikesh retreat' : 'Explore current retreats'}</a>
      <Link href={retreatEnquiryUrl()} className={outlineLinkClass}>Help me plan my retreat</Link>
    </PageHero>
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Yoga retreats in India' }]} />
    <div className="mx-auto max-w-6xl space-y-16 px-5 pt-6 md:px-8 md:pt-10">
      {featured && <section id="featured-retreat" className="scroll-mt-32"><h2 className="mb-6 font-display-lg text-3xl text-[#17372b]">Five days to explore yoga &amp; spiritual Rishikesh</h2><RetreatCard retreat={featured} featured /></section>}
      <section className="grid gap-8 md:grid-cols-[1fr_1.4fr]"><h2 className="font-display-lg text-3xl text-[#17372b]">A retreat, at your own pace</h2><div className="space-y-4 leading-8 text-[#536457]"><p>A yoga retreat brings practice and travel into the same stay. The experience can include guided yoga, time for meditation and activities beyond the studio, depending on the program you choose.</p><p>Compare each itinerary, difficulty level, room option and inclusion. India Yoga Tourism offers its own services and third-party bookings, so ask who operates your selected retreat before confirming.</p></div></section>
      <section id="retreat-packages" className="scroll-mt-32"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><h2 className="font-display-lg text-3xl text-[#17372b]">Explore current yoga retreat packages</h2><Link href="/packages" className="text-sm font-semibold text-[#17372b] underline underline-offset-4">Browse the full catalogue</Link></div>
        {retreats.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{retreats.filter((retreat) => retreat.id !== featured?.id).map((retreat) => <RetreatCard key={retreat.id} retreat={retreat} />)}{retreats.length === 1 && <p className="leading-7 text-[#536457]">The featured retreat above is the current yoga retreat listing. Ask the team about other dates or requirements.</p>}</div> : <p className="rounded-2xl bg-white p-6 leading-7 text-[#536457]">Current retreat details are not available here. <Link href={retreatEnquiryUrl()} className="font-semibold underline">Enquire about the five-day Rishikesh retreat</Link> or ask the team to help with your dates.</p>}
      </section>
      <section><h2 className="mb-6 font-display-lg text-3xl text-[#17372b]">Yoga retreat destinations</h2><div className="flex flex-wrap gap-3">{destinations.map((location) => <Link key={location} href={`/packages?category=RETREAT&location=${encodeURIComponent(location)}`} className="rounded-full border border-[#17372b]/20 bg-white px-5 py-3 text-sm font-semibold text-[#17372b]">{location}</Link>)}</div><Link href="/destinations/rishikesh" className="mt-5 inline-block text-[#17372b] underline underline-offset-4">Plan your Rishikesh retreat visit</Link></section>
      <section className="grid gap-10 rounded-3xl bg-[#e9ecdf] p-6 md:grid-cols-2 md:p-10"><div><h2 className="font-display-lg text-3xl text-[#17372b]">New to yoga retreats?</h2><p className="mt-5 leading-8 text-[#536457]">You do not need to choose the most demanding schedule. Read the listed difficulty level and ask about support for your experience, mobility and comfort with the planned activities. Check which excursions are optional.</p></div><div><h2 className="font-display-lg text-3xl text-[#17372b]">Compare retreat durations</h2>{durations.length > 0 ? <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm text-[#536457]"><caption className="sr-only">Durations in the current published retreat catalogue</caption><thead><tr><th className="pb-3 pr-4">Stay</th><th className="pb-3">What to compare</th></tr></thead><tbody>{durations.map((days) => <tr key={days} className="border-t border-[#17372b]/15"><th className="py-3 pr-4 font-semibold">{days} days</th><td className="py-3">{days <= 5 ? 'Arrival time, daily activities and time to rest' : 'Practice schedule, free time and travel commitments'}</td></tr>)}</tbody></table></div> : <p className="mt-5 leading-8 text-[#536457]">Ask about the dates and duration that fit your travel plans. Include time for arrival and onward travel.</p>}</div></section>
      <section><h2 className="mb-6 font-display-lg text-3xl text-[#17372b]">Choose with the details in view</h2><div className="grid gap-6 md:grid-cols-3">{[
        ['Your practice', 'Compare the difficulty level, teaching language, daily yoga and meditation schedule. Ask who will teach your sessions.'],
        ['Your stay', 'Review enabled room types, the property location and what is included. Check whether transfers and excursions are part of your package.'],
        ['Your booking', 'Review actual USD prices, listed dates and published cancellation terms. Ask for clarification before paying.'],
      ].map(([heading, text]) => <div key={heading} className="rounded-2xl border border-[#17372b]/15 bg-white p-6"><h3 className="text-lg font-bold text-[#17372b]">{heading}</h3><p className="mt-3 leading-7 text-[#536457]">{text}</p></div>)}</div></section>
      <section><h2 className="mb-4 font-display-lg text-3xl text-[#17372b]">Questions before you go</h2><Questions items={retreatFaqs} /></section>
      <section className="rounded-3xl bg-[#17372b] p-7 text-white md:p-12"><h2 className="font-display-lg text-3xl">Let’s plan your time in Rishikesh</h2><p className="mb-7 mt-4 max-w-2xl leading-8 text-white/85">Share your dates, group size and retreat interests. Our enquiry form keeps those details together so the team can help you choose.</p><Link href={retreatEnquiryUrl()} className={primaryLinkClass}>Enquire about the five-day retreat</Link></section>
    </div>
  </main>
}
