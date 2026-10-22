import Link from 'next/link'
import { SITE_URL } from '@/lib/siteUrl'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Yoga & Ayurveda Journal | India Yoga Tourism',
  description:
    'Insights, guides, and stories from Himalayan yoga masters – covering Ayurveda, Panchakarma, meditation, pranayama, and conscious living.',
  keywords: ['yoga blog india', 'ayurveda articles', 'rishikesh yoga journal', 'panchakarma guide', 'himalayan wellness'],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Yoga & Ayurveda Journal | India Yoga Tourism',
    description: 'Stories and wisdom from Himalayan masters on yoga, Ayurveda, and mindful living.',
    url: `${SITE_URL}/blog`,
    siteName: 'India Yoga Tourism',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yoga & Ayurveda Journal | India Yoga Tourism',
    description: 'Stories and wisdom from Himalayan masters.',
  },
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function PublicBlogListPage() {
  let blogs: any[] = []
  try {
    blogs = await (prisma as any).blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }

  const [featured, ...articles] = blogs

  return (
    <main className="min-h-screen bg-[#f8f6f0] pb-24">
      <section className="relative overflow-hidden bg-[#17372b] px-6 pb-16 pt-32 text-white md:pb-20 md:pt-40">
        <div className="pointer-events-none absolute -right-20 -top-36 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-4 -top-20 h-[22rem] w-[22rem] rounded-full border border-[#d7bd83]/20" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.24em] text-[#e5cf9a]">
            <span className="h-px w-8 bg-[#e5cf9a]" /> Notes from the Himalayas
          </div>
          <h1 className="max-w-4xl font-display-lg text-5xl leading-[1.04] md:text-7xl">The Yoga &amp; Wellness <span className="text-[#e5cf9a]">Journal</span></h1>
          <div className="mt-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <p className="max-w-xl text-base leading-8 text-white/70 md:text-lg">Stories, practical wisdom, and considered guidance for a more meaningful journey.</p>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/50">Yoga&nbsp; · &nbsp;Ayurveda&nbsp; · &nbsp;Mindful travel</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-12 md:px-10 md:pt-16">
        {!featured ? (
          <div className="rounded-3xl border border-[#17372b]/10 bg-white px-6 py-16 text-center shadow-[0_18px_60px_rgba(23,55,43,.06)]">
            <span className="material-symbols-outlined text-4xl text-[#9b8758]">auto_stories</span>
            <h2 className="mt-4 font-display-lg text-2xl text-[#17372b]">A little wisdom is on its way</h2>
            <p className="mt-2 text-sm text-[#68746c]">Check back soon for new stories from our practitioners.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between border-b border-[#17372b]/15 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#997c43]">The latest from our journal</p>
                <h2 className="mt-2 font-display-lg text-3xl text-[#17372b] md:text-4xl">Ideas for a more mindful journey</h2>
              </div>
              <span className="hidden text-xs text-[#68746c] sm:block">{blogs.length} {blogs.length === 1 ? 'story' : 'stories'}</span>
            </div>

            <Link href={`/blog/${featured.slug}`} className="group relative grid min-h-[400px] overflow-hidden rounded-3xl bg-[#203d31] md:min-h-[500px] md:grid-cols-[1.05fr_.95fr]">
              <div className="relative min-h-[250px] overflow-hidden bg-[#d8d9cc] md:order-2">
                {featured.coverImage ? (
                  <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,#d8c795,transparent_30%),linear-gradient(135deg,#c4d0c2,#758e7c)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent md:bg-gradient-to-r md:from-[#203d31]/10 md:to-transparent" />
                <span className="absolute left-6 top-6 rounded-full border border-white/40 bg-black/15 px-4 py-2 text-[9px] font-bold uppercase tracking-[.18em] text-white backdrop-blur-sm">Editor’s pick</span>
              </div>
              <div className="flex flex-col justify-center p-7 text-white md:order-1 md:p-12 lg:p-16">
                <span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e5cf9a]">{featured.category || 'From the journal'}</span>
                <h3 className="mt-5 font-display-lg text-3xl leading-tight md:text-5xl">{featured.title}</h3>
                <p className="mt-5 line-clamp-3 max-w-xl text-sm leading-7 text-white/70 md:text-base">{featured.excerpt}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[.13em] text-white/55">
                  <span>{featured.authorName || 'India Yoga Tourism Team'}</span><span className="h-1 w-1 rounded-full bg-[#e5cf9a]" /><time dateTime={new Date(featured.createdAt).toISOString()}>{formatDate(featured.createdAt)}</time>
                </div>
                <span className="mt-9 inline-flex w-fit items-center gap-3 border-b border-[#e5cf9a]/70 pb-2 text-xs font-bold uppercase tracking-[.16em] text-[#e5cf9a]">Read the story <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </div>
            </Link>

            {articles.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                {articles.map((article: any) => (
                  <article key={article.id} className="group">
                    <Link href={`/blog/${article.slug}`} className="block">
                      <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl bg-[#e5e7dc]">
                        {article.coverImage ? (
                          <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="h-full w-full bg-[radial-gradient(circle_at_65%_35%,#d8c795,transparent_30%),linear-gradient(135deg,#c4d0c2,#758e7c)]" />
                        )}
                        <span className="absolute bottom-4 left-4 rounded-full bg-[#f8f6f0]/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-[#17372b]">{article.category || 'Journal'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#8a7550]">
                        <time dateTime={new Date(article.createdAt).toISOString()}>{formatDate(article.createdAt)}</time><span>·</span><span>{article.authorName || 'IYT Journal'}</span>
                      </div>
                      <h3 className="mt-3 font-display-lg text-2xl leading-snug text-[#17372b] transition-colors group-hover:text-[#8b7040]">{article.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#68746c]">{article.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17372b]">Continue reading <span className="transition-transform group-hover:translate-x-1">→</span></span>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
