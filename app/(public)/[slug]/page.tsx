import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const page: any = await (prisma as any).page.findUnique({
      where: { slug },
    })
    if (!page) return {}

    const title = page.metaTitle || page.title
    const description = page.metaDescription || page.title
    const keywords = page.metaKeywords ? page.metaKeywords.split(',').map((k: string) => k.trim()) : undefined
    const canonical = page.canonicalUrl || `https://indiayogatourism.com/${slug}`
    const ogImage = page.ogImage

    return {
      title: `${title} | India Yoga Tourism`,
      description,
      keywords,
      alternates: {
        canonical,
      },
      openGraph: {
        title: page.ogTitle || title,
        description: page.ogDescription || description,
        url: canonical,
        siteName: 'India Yoga Tourism',
        images: ogImage ? [{ url: ogImage }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: page.ogTitle || title,
        description: page.ogDescription || description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch (error) {
    return {}
  }
}

export default async function PublicDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let page: any = null
  try {
    page = await (prisma as any).page.findUnique({
      where: { slug },
    })
  } catch (error) {
    console.error('Error fetching page by slug:', error)
  }

  if (!page || !page.published) {
    notFound()
  }

  return (
    <>
      {page.customHtmlTags && (
        <head dangerouslySetInnerHTML={{ __html: page.customHtmlTags }} />
      )}
      <main className="bg-[#FAF7F2] min-h-screen pb-20">
        {/* Header */}
        <section className="bg-[#1C2E26] text-white pt-28 md:pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto space-y-3 text-center">
            <span className="text-[#E2C799] text-xs font-bold uppercase tracking-widest block">
              ✦ India Yoga Tourism ✦
            </span>
            <h1 className="text-3xl md:text-5xl font-bold">{page.title}</h1>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-black/5 leading-relaxed text-sm md:text-base text-gray-800 whitespace-pre-wrap">
            {page.content}
          </div>
        </article>
      </main>
    </>
  )
}
