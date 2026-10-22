import Link from 'next/link'
import { SITE_URL } from '@/lib/siteUrl'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Learn More | India Yoga Tourism',
  description:
    'Explore in-depth guides and resources on Himalayan yoga traditions, Ayurveda, retreat preparation, and conscious travel with India Yoga Tourism.',
  keywords: [
    'yoga resources india',
    'ayurveda guides',
    'rishikesh retreat info',
    'himalayan yoga traditions',
    'india yoga travel',
  ],
  alternates: { canonical: `${SITE_URL}/know-more` },
  openGraph: {
    title: 'Learn More | India Yoga Tourism',
    description: 'In-depth guides and resources on yoga, Ayurveda, and conscious Himalayan travel.',
    url: `${SITE_URL}/know-more`,
    siteName: 'India Yoga Tourism',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn More | India Yoga Tourism',
    description: 'In-depth guides on yoga, Ayurveda, and Himalayan travel.',
  },
}

function getExcerpt(page: any) {
  return (page.metaDescription || page.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()).slice(0, 180)
}

export default async function KnowMorePage() {
  let pages: any[] = []
  try {
    pages = await (prisma as any).page.findMany({
      where: { published: true },
      orderBy: { title: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching know-more pages:', error)
  }

  return (
    <main className="min-h-screen bg-[#f8f6f0] pb-24">
      <section className="relative overflow-hidden bg-[#17372b] px-6 pb-20 pt-32 text-white md:pb-28 md:pt-40">
        <div className="pointer-events-none absolute -right-28 -top-36 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-12 -top-20 h-[22rem] w-[22rem] rounded-full border border-[#d7bd83]/20" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-12 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.24em] text-[#e5cf9a]">
              <span className="h-px w-8 bg-[#e5cf9a]" /> The India Yoga Tourism Library
            </div>
            <h1 className="max-w-3xl font-display-lg text-5xl leading-[1.04] md:text-7xl">
              Know more.<br /><span className="text-[#e5cf9a]">Travel deeper.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/70 md:text-lg">
              Thoughtful guides to yoga, Ayurveda, retreat life, and the details that make a journey feel at ease.
            </p>
          </div>
          <div className="hidden justify-self-end md:block">
            <div className="w-64 border-l border-[#e5cf9a]/60 pl-6 pb-1">
              <p className="font-quote-italic text-3xl leading-snug text-white/90">“The journey inward begins with a little understanding.”</p>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[.22em] text-[#e5cf9a]">A field guide to mindful travel</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-12 md:px-10 md:pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#18372b]/15 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#997c43]">Explore the library</p>
            <h2 className="mt-2 font-display-lg text-3xl text-[#17372b] md:text-4xl">Guides &amp; useful information</h2>
          </div>
          <span className="text-xs font-medium text-[#68746c]">{pages.length} published {pages.length === 1 ? 'guide' : 'guides'}</span>
        </div>

        {pages.length === 0 ? (
          <div className="rounded-3xl border border-[#18372b]/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(23,55,43,.06)]">
            <span className="material-symbols-outlined text-4xl text-[#9b8758]">auto_stories</span>
            <h3 className="mt-4 font-display-lg text-2xl text-[#17372b]">The library is taking shape</h3>
            <p className="mt-2 text-sm text-[#68746c]">New guides and helpful information will appear here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {pages.map((page: any, index: number) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="group flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[#17372b]/10 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#b99b60]/60 hover:shadow-[0_22px_55px_rgba(23,55,43,.12)]"
              >
                {page.ogImage ? (
                  <div className="relative h-44 overflow-hidden bg-[#e8e4d8]">
                    <img src={page.ogImage} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#17372b]">Guide {String(index + 1).padStart(2, '0')}</span>
                  </div>
                ) : (
                  <div className="relative flex h-36 items-end overflow-hidden bg-[#e9eee8] px-6 pb-5">
                    <div className="absolute -right-4 -top-16 h-40 w-40 rounded-full border border-[#17372b]/10" />
                    <div className="absolute -right-1 -top-10 h-28 w-28 rounded-full border border-[#b99b60]/30" />
                    <span className="relative text-[10px] font-bold uppercase tracking-[.2em] text-[#63756a]">Field notes&nbsp; / &nbsp;{String(index + 1).padStart(2, '0')}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display-lg text-2xl leading-snug text-[#17372b] transition-colors group-hover:text-[#8b7040]">{page.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#68746c]">{getExcerpt(page)}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-[#17372b]/10 pt-5 mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-[#17372b]">
                    <span>Read the guide</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#17372b]/15 transition group-hover:border-[#17372b] group-hover:bg-[#17372b] group-hover:text-white">↗</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
