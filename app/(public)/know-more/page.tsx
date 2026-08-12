import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
    <main className="bg-[#FAF7F2] min-h-screen pb-20">
      {/* Hero Header */}
      <section className="bg-[#1C2E26] text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-[#E2C799] text-xs font-bold uppercase tracking-widest block">
            ✦ Resource &amp; Information Hub ✦
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-display-lg">Know More</h1>
          <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base">
            Explore complete guides, legal disclosures, ashram rules, and wellness wisdom.
          </p>
          <p className="text-white/50 text-xs font-medium">
            {pages.length} published page{pages.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </section>

      {/* Pages Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        {pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-black/5 shadow-sm max-w-xl mx-auto">
            <span className="material-symbols-outlined text-4xl text-[#1C2E26]/40 mb-2">description</span>
            <h3 className="text-lg font-bold text-[#1C2E26]">No Custom Pages Created Yet</h3>
            <p className="text-xs text-gray-500 mt-1">Use the Admin Panel (/admin/pages) to publish new custom pages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pages.map((p: any) => (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm hover:shadow-md hover:border-[#1C2E26] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#1C2E26]">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <h2 className="text-base font-bold text-[#1C2E26]">{p.title}</h2>
                  <p className="text-xs text-gray-500 line-clamp-3">
                    {p.metaDescription || p.content.replace(/<[^>]*>?/gm, '').substring(0, 120)}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-xs text-[#1C2E26] font-bold">
                  <span>Read Guide</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
