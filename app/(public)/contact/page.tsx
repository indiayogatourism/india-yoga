import Link from 'next/link'
import { getSiteConfig } from '@/lib/siteConfig'
import { getPackageDetail, getRetreatCatalog } from '@/lib/retreatCatalog'
import { TARGET_RETREAT_SLUG, TARGET_RETREAT_NAME, TARGET_RETREAT_PATH } from '@/lib/retreatContent'
import { Breadcrumbs, PageHero } from '@/components/retreats/Editorial'
import RetreatEnquiryForm from '@/components/RetreatEnquiryForm'

export const dynamic = 'force-dynamic'

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ retreat?: string }> }) {
  const { retreat = '' } = await searchParams
  const selectedSlug = /^[a-z0-9-]{1,160}$/.test(retreat) ? retreat : ''
  const [config, catalog, selected] = await Promise.all([getSiteConfig(), getRetreatCatalog(), selectedSlug ? getPackageDetail(selectedSlug) : null])
  const options = catalog.map((pkg) => ({ slug: pkg.slug, title: pkg.title }))
  // The owner-supplied target remains an enquiry interest when dates need confirmation.
  if (!options.some((pkg) => pkg.slug === TARGET_RETREAT_SLUG)) options.unshift({ slug: TARGET_RETREAT_SLUG, title: TARGET_RETREAT_NAME })
  if (selected?.status === 'PUBLISHED' && !options.some((pkg) => pkg.slug === selected.slug)) options.push({ slug: selected.slug, title: selected.title })
  const initialRetreat = options.some((pkg) => pkg.slug === selectedSlug) ? selectedSlug : ''
  const whatsapp = config.whatsappNumber.replace(/\D/g, '')
  const phone = config.contactPhone.replace(/[^\d+]/g, '')
  return <main className="bg-[#f8f6f0] pb-20">
    <PageHero eyebrow="Your journey starts with a conversation" title="Contact India Yoga Tourism – Plan Your Yoga Retreat" intro="Tell us where you would like to go, your preferred dates and who is travelling. Ask about the program, room arrangements or booking details before you decide." />
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 md:px-8 lg:grid-cols-[.8fr_1.2fr]">
      <section>
        <h2 className="font-display-lg text-3xl text-[#17372b]">Let’s plan your retreat</h2>
        <p className="mt-5 leading-8 text-[#536457]">Use the form to keep your travel preferences in one enquiry, or contact us directly. An enquiry helps you confirm details; it does not reserve a room or create a paid booking.</p>
        <div className="mt-7 space-y-5 rounded-3xl border border-[#17372b]/15 bg-white p-6">
          <div><h3 className="text-sm font-bold text-[#536457]">WhatsApp enquiries</h3><a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(initialRetreat ? `I would like to enquire about ${options.find((pkg) => pkg.slug === initialRetreat)?.title}.` : 'I would like help planning a yoga retreat.')}`} target="_blank" rel="noopener noreferrer" data-track-event="whatsapp_enquiry_click" data-track-package={initialRetreat || undefined} className="mt-2 inline-block text-lg font-semibold text-[#17372b] underline underline-offset-4">{config.whatsappNumber}</a></div>
          <div><h3 className="text-sm font-bold text-[#536457]">Email</h3><a href={`mailto:${config.contactEmail}`} className="mt-2 inline-block break-all font-semibold text-[#17372b] underline underline-offset-4">{config.contactEmail}</a></div>
          <div><h3 className="text-sm font-bold text-[#536457]">Phone</h3><a href={`tel:${phone}`} className="mt-2 inline-block font-semibold text-[#17372b] underline underline-offset-4">{config.contactPhone}</a></div>
          {config.officeAddress && <div><h3 className="text-sm font-bold text-[#536457]">Registered business address</h3><p className="mt-2 text-sm leading-7 text-[#536457]">{config.officeAddress}</p><p className="mt-1 text-xs leading-6 text-[#536457]">This is not a retreat arrival address. Confirm the location of your selected stay before travelling.</p></div>}
        </div>
        <p className="mt-7 leading-7 text-[#536457]">Considering Rishikesh? <Link href={TARGET_RETREAT_PATH} className="font-semibold text-[#17372b] underline underline-offset-4">Review the five-day yoga and spiritual retreat</Link> before sending your questions.</p>
      </section>
      <RetreatEnquiryForm key={initialRetreat} options={options} initialRetreat={initialRetreat} initialDestination={selected?.status === 'PUBLISHED' ? selected.location : initialRetreat === TARGET_RETREAT_SLUG ? 'Rishikesh' : ''} />
    </div>
  </main>
}
