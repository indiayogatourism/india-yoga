import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

  return (
    <main className="bg-[#FAF7F2] min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="bg-[#1C2E26] text-white pt-28 md:pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[#E2C799] text-xs font-bold uppercase tracking-widest block">
            ✦ Himalayan Wisdom &amp; Ayurvedic Insights ✦
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display-lg">The Yoga &amp; Wellness Journal</h1>
          <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base">
            Articles, guides, and ancient Ayurvedic healing rituals written by our practitioners.
          </p>
        </div>
      </section>

      {/* Blogs Listing */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-black/5 shadow-sm max-w-xl mx-auto">
            <span className="material-symbols-outlined text-4xl text-[#1C2E26]/40 mb-2">article</span>
            <h3 className="text-lg font-bold text-[#1C2E26]">No Articles Published Yet</h3>
            <p className="text-xs text-gray-500 mt-1">Check back soon for new articles and guides.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((b: any) => (
              <article
                key={b.id}
                className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {b.coverImage && (
                    <div className="h-48 overflow-hidden relative">
                      <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C2E26] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-black/5 inline-block">
                      {b.category}
                    </span>
                    <h2 className="text-lg font-bold text-[#1C2E26] leading-snug hover:text-emerald-800 transition-colors">
                      <Link href={`/blog/${b.slug}`}>{b.title}</Link>
                    </h2>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{b.excerpt}</p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-black/5 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">{b.authorName}</span>
                  <Link
                    href={`/blog/${b.slug}`}
                    className="font-bold text-[#1C2E26] hover:underline flex items-center gap-1"
                  >
                    Read Article <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
