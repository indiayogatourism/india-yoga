import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'
import { getRetreatCatalog } from '@/lib/retreatCatalog'
import { RETREATS_PATH, TARGET_RETREAT_SLUG, retreatEnquiryUrl } from '@/lib/retreatContent'
import { Breadcrumbs, PageHero, primaryLinkClass, outlineLinkClass } from '@/components/retreats/Editorial'
import RetreatCard from '@/components/retreats/RetreatCard'

export const dynamic = 'force-dynamic'
const title = 'Rishikesh Yoga Retreat Guide | India Yoga Tourism'
const description = 'Plan a yoga retreat in Rishikesh. Compare published retreat schedules, room options and practical arrival questions, including the five-day yoga and spiritual retreat.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: `${SITE_URL}/destinations/rishikesh` },
  openGraph: { title, description, url: `${SITE_URL}/destinations/rishikesh`, type: 'website', siteName: 'India Yoga Tourism' },
  twitter: { card: 'summary_large_image', title, description },
}

export default async function RishikeshPage() {
  const catalog = await getRetreatCatalog()
  const retreats = catalog.filter((retreat) => /rishikesh/i.test(retreat.location))
  const featured = retreats.find((retreat) => retreat.slug === TARGET_RETREAT_SLUG)
  return <main className="bg-[#f8f6f0] pb-20">
    <PageHero eyebrow="A place for practice & exploration" title="Plan Your Yoga Retreat in Rishikesh" intro="Build your visit around the retreat that suits you. Compare the daily practice, room arrangements and local activities, and leave room in your travel plans to arrive comfortably." image={featured?.featuredImage}>
      <a href="#rishikesh-retreats" className={primaryLinkClass}>Explore Rishikesh retreats</a><Link href={retreatEnquiryUrl()} className={outlineLinkClass}>Ask about the five-day retreat</Link>
    </PageHero>
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Yoga retreats', href: RETREATS_PATH }, { label: 'Rishikesh guide' }]} />
    <div className="mx-auto max-w-6xl space-y-14 px-5 py-8 md:px-8">
      <section className="grid gap-7 md:grid-cols-2"><h2 className="font-display-lg text-3xl text-[#17372b]">Choose the experience, then plan the journey</h2><p className="leading-8 text-[#536457]">The location name alone does not tell you what your stay will be like. Read the retreat itinerary for yoga and meditation sessions, excursions and free time. Confirm the exact property and arrival instructions with the operator before booking transport.</p></section>
      <section id="rishikesh-retreats" className="scroll-mt-32"><h2 className="mb-6 font-display-lg text-3xl text-[#17372b]">Explore current Rishikesh yoga retreats</h2>{featured && <RetreatCard retreat={featured} featured />}{retreats.filter((retreat) => retreat.id !== featured?.id).length > 0 && <div className="mt-6 grid gap-6 md:grid-cols-2">{retreats.filter((retreat) => retreat.id !== featured?.id).map((retreat) => <RetreatCard key={retreat.id} retreat={retreat} />)}</div>}{!retreats.length && <p className="leading-8 text-[#536457]">Please <Link href={retreatEnquiryUrl()} className="font-semibold underline">ask about the five-day Rishikesh retreat</Link> and current dates. No scheduled Rishikesh retreat details are available here right now.</p>}</section>
      <section className="rounded-3xl bg-[#e9ecdf] p-6 md:p-10"><h2 className="font-display-lg text-3xl text-[#17372b]">Before you arrange your travel</h2><ul className="mt-6 list-disc space-y-4 pl-5 leading-8 text-[#536457]"><li>Confirm the retreat property’s address and check-in and check-out times.</li><li>Ask whether transport is included, optional or arranged independently.</li><li>Check the physical demands of planned walks and other activities, and whether alternatives are available.</li><li>Ask about room sharing, meals, teaching language and what to bring.</li><li>Review current transport arrangements and your own travel documents before departure.</li></ul></section>
      <section><h2 className="font-display-lg text-3xl text-[#17372b]">Travelling for five days?</h2><p className="mt-5 max-w-3xl leading-8 text-[#536457]">The five-day yoga and spiritual retreat is a starting point for comparing a shorter Rishikesh stay. Read its current itinerary and dates, then ask which arrival plans work for your trip. Travel time to and from the retreat is separate from the program schedule unless stated in the package.</p><Link href={retreatEnquiryUrl()} className="mt-6 inline-flex rounded-full bg-[#17372b] px-6 py-3 font-bold text-white">Plan my Rishikesh retreat</Link></section>
    </div>
  </main>
}
