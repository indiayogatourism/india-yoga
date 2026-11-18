import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'
import { RETREATS_PATH, retreatEnquiryUrl, TARGET_RETREAT_SLUG, TARGET_RETREAT_PATH } from '@/lib/retreatContent'
import { getRetreatCatalog } from '@/lib/retreatCatalog'
import { Breadcrumbs, PageHero, primaryLinkClass, outlineLinkClass } from '@/components/retreats/Editorial'

const title = 'About India Yoga Tourism | Our Wellness Mission'
const description = 'Learn about India Yoga Tourism, our approach to yoga and wellness travel, and our direct and partner-operated retreat experiences for Indian and international guests.'
export const metadata: Metadata = {
  title, description, alternates: { canonical: `${SITE_URL}/about` },
  openGraph: { title, description, url: `${SITE_URL}/about`, siteName: 'India Yoga Tourism', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
}

export default async function AboutPage() {
  const target = (await getRetreatCatalog()).find((pkg) => pkg.slug === TARGET_RETREAT_SLUG)
  return <main className="bg-[#f8f6f0] pb-20">
    <PageHero eyebrow="The people behind your planning" title="About India Yoga Tourism – Our Story & Wellness Mission" intro="We help Indian and international travellers explore yoga, meditation and wellness experiences, with the practical details they need to choose a retreat thoughtfully.">
      <Link href={RETREATS_PATH} className={primaryLinkClass}>Explore yoga retreats</Link><Link href="/contact" className={outlineLinkClass}>Speak with our team</Link>
    </PageHero>
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About India Yoga Tourism' }]} />
    <div className="mx-auto max-w-6xl space-y-14 px-5 py-8 md:px-8">
      <section className="grid gap-7 md:grid-cols-[1fr_1.5fr]"><h2 className="font-display-lg text-3xl text-[#17372b]">Who we are</h2><div className="space-y-4 leading-8 text-[#536457]"><p>India Yoga Tourism brings retreat discovery, enquiries and booking into one place. Our website covers yoga retreats, meditation, Ayurveda programs and online yoga classes.</p><p>Our business includes our own services and third-party retreat bookings. The program, location and operating arrangements vary by experience; ask us about the provider for the retreat you are considering.</p></div></section>
      <section className="rounded-3xl bg-[#e9ecdf] p-7 md:p-10"><p className="text-xs font-bold uppercase tracking-widest text-[#536457]">Our mission</p><h2 className="mt-4 max-w-3xl font-display-lg text-3xl leading-snug text-[#17372b] md:text-4xl">Make space for meaningful practice, with clarity before you travel.</h2><p className="mt-5 max-w-3xl leading-8 text-[#536457]">Our aim is to make yoga and wellness travel easier to explore: what a program involves, where you will stay, how long it lasts and what questions to ask before booking.</p></section>
      <section className="grid gap-8 md:grid-cols-2"><div><h2 className="font-display-lg text-3xl text-[#17372b]">Yoga tourism in India</h2><p className="mt-5 leading-8 text-[#536457]">A retreat can bring a different rhythm to a journey: time for practice, reflection and discovering a place through its daily life. Compare the schedule and travel commitments with what you hope to get from your stay.</p><Link href="/destinations/rishikesh" className="mt-5 inline-block font-semibold text-[#17372b] underline underline-offset-4">Explore our Rishikesh planning guide</Link></div><div><h2 className="font-display-lg text-3xl text-[#17372b]">Our wellness experiences</h2><p className="mt-5 leading-8 text-[#536457]">Browse <Link href={RETREATS_PATH} className="underline">yoga retreats</Link>, <Link href="/programmes" className="underline">Ayurveda programs</Link> and <Link href="/online-classes" className="underline">online classes</Link>. Use each published listing to review its actual duration, activities and inclusions. Wellness programs differ; suitability and expectations should be discussed with the provider.</p></div></section>
      <section><h2 className="font-display-lg text-3xl text-[#17372b]">Direct &amp; partner-operated programs</h2><p className="mt-5 max-w-4xl leading-8 text-[#536457]">Some services are offered directly and others are booked with third-party providers. Before deciding, confirm who operates the experience, who teaches it, where it takes place and which terms apply. The website does not imply that every retreat is owned or operated by India Yoga Tourism.</p>{target && <p className="mt-4 max-w-4xl leading-8 text-[#536457]">For a practical example, review the dates, room options and inclusions for our <Link href={TARGET_RETREAT_PATH} data-track-event="select_item" data-retreat-id={target.id} data-retreat-slug={target.slug} className="font-semibold text-[#17372b] underline underline-offset-4">five-day yoga and spiritual retreat in Rishikesh</Link>.</p>}</section>
      <section><h2 className="font-display-lg text-3xl text-[#17372b]">Why explore retreats with us?</h2><p className="mt-5 max-w-4xl leading-8 text-[#536457]">Compare published retreat details, send your questions and continue to the booking flow from one website. Your booking dashboard keeps the status of your booking available after checkout. Our aim is to support a considered choice with details you can review.</p></section>
      <section><h2 className="mb-6 font-display-lg text-3xl text-[#17372b]">Our approach to your experience</h2><div className="grid gap-5 md:grid-cols-3">{[
        ['Start with your needs', 'Share your travel dates, group size and practice preferences so the enquiry focuses on what matters to you.'],
        ['Keep the details visible', 'Compare the saved itinerary, accommodation choices, currency, inclusions and exclusions before payment.'],
        ['Ask before confirming', 'Use our contact form or WhatsApp to clarify provider details, arrival plans and applicable booking policies.'],
      ].map(([heading, text]) => <div key={heading} className="rounded-2xl border border-[#17372b]/15 bg-white p-6"><h3 className="text-lg font-bold text-[#17372b]">{heading}</h3><p className="mt-3 leading-7 text-[#536457]">{text}</p></div>)}</div></section>
      <section className="rounded-3xl bg-[#17372b] p-7 text-white md:p-10"><h2 className="font-display-lg text-3xl">Find a retreat that fits your journey</h2><p className="mb-6 mt-4 max-w-2xl leading-8 text-white/85">Start with our yoga retreat guide, or ask about the five-day yoga and spiritual retreat in Rishikesh.</p><div className="flex flex-wrap gap-3"><Link href={RETREATS_PATH} className={primaryLinkClass}>Compare yoga retreats</Link><Link href={retreatEnquiryUrl()} className={outlineLinkClass}>Enquire about the five-day retreat</Link></div></section>
    </div>
  </main>
}
