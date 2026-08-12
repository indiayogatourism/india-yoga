import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PublicBlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let blog: any = null
  try {
    blog = await (prisma as any).blogPost.findUnique({
      where: { slug },
    })
  } catch (error) {
    console.error('Error fetching blog detail:', error)
  }

  if (!blog || !blog.published) {
    notFound()
  }

  return (
    <main className="bg-[#FAF7F2] min-h-screen pb-20">
      {/* Header */}
      <section className="bg-[#1C2E26] text-white py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <Link href="/blog" className="text-xs text-[#E2C799] hover:underline font-bold inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">arrow_back</span> Back to Journal
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold">{blog.title}</h1>
          <p className="text-white/60 text-xs">{blog.authorName} • {new Date(blog.createdAt).toLocaleDateString()}</p>
        </div>
      </section>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} className="w-full h-80 object-cover rounded-2xl shadow-md" />
        )}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-black/5 leading-relaxed text-sm md:text-base text-gray-800 whitespace-pre-wrap">
          {blog.content}
        </div>
      </article>
    </main>
  )
}
