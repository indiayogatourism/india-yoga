import { prisma } from '@/lib/prisma'
import { SITE_URL, toPreferredUrl, withBrand } from '@/lib/siteUrl'
import HeadTags from '@/components/HeadTags'
import { notFound } from 'next/navigation'
import { isAdminViewer } from '@/lib/adminPreview'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const blog: any = await (prisma as any).blogPost.findUnique({
      where: { slug },
    })
    if (!blog) return {}
    if (!blog.published) {
      // Draft preview: never index
      return { title: withBrand(blog.metaTitle || blog.title), robots: { index: false, follow: false } }
    }

    const title = blog.metaTitle || blog.title
    const description = blog.metaDescription || blog.excerpt
    const keywords = blog.metaKeywords ? blog.metaKeywords.split(',').map((k: string) => k.trim()) : undefined
    const canonical = toPreferredUrl(blog.canonicalUrl) || `${SITE_URL}/blog/${slug}`
    const ogImage = blog.ogImage || blog.coverImage

    return {
      title: withBrand(title),
      description,
      keywords,
      alternates: {
        canonical,
      },
      openGraph: {
        title: blog.ogTitle || title,
        description: blog.ogDescription || description,
        url: canonical,
        siteName: 'India Yoga Tourism',
        images: ogImage ? [{ url: ogImage }] : [],
        type: 'article',
        publishedTime: blog.publishedAt ? new Date(blog.publishedAt).toISOString() : undefined,
        authors: [blog.authorName || 'India Yoga Tourism Team'],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.ogTitle || title,
        description: blog.ogDescription || description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch (error) {
    return {}
  }
}

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

  if (!blog) notFound()

  // Unpublished posts are visible to signed-in admins only (draft preview)
  const isDraftPreview = !blog.published
  if (isDraftPreview && !(await isAdminViewer())) notFound()

  return (
    <>
      <HeadTags html={blog.customHtmlTags} />
      <main className="min-h-screen bg-[#f8f6f0] pb-24">
        {isDraftPreview && (
          <div className="relative z-40 border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-950 mt-20">
            Draft preview — only administrators can view this post until it is published.
          </div>
        )}
        <header className="bg-[#17372b] px-6 pb-20 pt-32 text-white md:pb-28 md:pt-40">
          <div className="mx-auto max-w-4xl">
            <Link href="/blog" className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#e5cf9a] transition hover:text-white">
              <span aria-hidden="true">←</span> Journal
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e5cf9a]">{blog.category || 'From the journal'}</p>
            <h1 className="mt-5 font-display-lg text-4xl leading-[1.1] md:text-6xl">{blog.title}</h1>
            {blog.excerpt && <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg">{blog.excerpt}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[.13em] text-white/55">
              <span>{blog.authorName || 'India Yoga Tourism Team'}</span>
              <span className="h-1 w-1 rounded-full bg-[#e5cf9a]" />
              <time dateTime={new Date(blog.createdAt).toISOString()}>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            </div>
          </div>
        </header>

        <article className="mx-auto -mt-10 max-w-5xl px-5 md:-mt-16 md:px-8">
          {blog.coverImage && (
            <div className="relative mb-8 aspect-[16/8] overflow-hidden rounded-2xl bg-[#e2e6dc] shadow-[0_24px_70px_rgba(20,45,34,.18)] md:rounded-3xl">
              <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="rounded-2xl border border-[#17372b]/10 bg-white px-6 py-9 shadow-[0_20px_70px_rgba(23,55,43,.07)] md:rounded-3xl md:px-16 md:py-14">
            <div className="rich-article" dangerouslySetInnerHTML={{ __html: blog.content }} />
            <div className="mt-14 border-t border-[#17372b]/10 pt-7">
              <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17372b] hover:text-[#8b7040]">
                <span aria-hidden="true">←</span> Back to all stories
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
