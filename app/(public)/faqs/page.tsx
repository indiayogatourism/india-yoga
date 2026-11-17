import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL, withBrand } from '@/lib/siteUrl'
import { retreatFaqs, retreatEnquiryUrl } from '@/lib/retreatContent'
import FaqClientView from '@/components/FaqClientView'
import { Breadcrumbs, PageHero } from '@/components/retreats/Editorial'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await prisma.seoMeta.findUnique({ where: { pageKey: 'faqs' } }).catch(() => null)
  const title = withBrand(seo?.title || 'Yoga Retreat & Booking FAQs')
  const description = seo?.description || 'Find answers about choosing yoga retreats, listed prices and dates, enquiries, booking confirmation and where to review cancellation policies.'
  return { title, description, alternates: { canonical: `${SITE_URL}/faqs` }, openGraph: { title, description, url: `${SITE_URL}/faqs`, type: 'website', images: seo?.ogImage ? [{ url: seo.ogImage }] : [] } }
}

export default async function FaqPage() {
  // Public page views never create records or publish default refund promises.
  const saved = await prisma.faqItem.findMany({ where: { isPublished: true }, orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }, { createdAt: 'asc' }] }).catch(() => [])
  const faqs = saved.length ? saved : retreatFaqs.map((item, index) => ({ id: `guide-${index}`, ...item, category: 'Retreats & Ashram', orderIndex: index, isPublished: true }))
  return <main className="bg-[#f8f6f0] pb-20">
    <PageHero eyebrow="A few details before you decide" title="Yoga Retreat & Booking FAQs" intro="Explore common retreat questions and the details to confirm before travelling. Each program has its own inclusions, operator and booking conditions." />
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Frequently asked questions' }]} />
    <div className="mx-auto max-w-6xl space-y-10 px-5 py-8 md:px-8">
      <FaqClientView faqs={faqs} />
      <section className="rounded-3xl bg-white p-6 md:p-8"><h2 className="font-display-lg text-3xl text-[#17372b]">Before you pay</h2><p className="mt-5 leading-8 text-[#536457]">Review the <Link href="/refund-policy" className="underline">refund and cancellation policy</Link>, <Link href="/terms-and-conditions" className="underline">terms and conditions</Link> and <Link href="/privacy-policy" className="underline">privacy policy</Link>. Ask how the terms apply to your specific retreat instead of assuming one cancellation rule covers every program.</p><p className="mt-4 leading-8 text-[#536457]">After checkout, check your booking status. A pending booking or payment is not a confirmed booking. <Link href={retreatEnquiryUrl()} className="font-semibold text-[#17372b] underline">Contact us about the five-day Rishikesh retreat</Link> if you need help choosing.</p></section>
    </div>
  </main>
}
