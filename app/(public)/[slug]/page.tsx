import { prisma } from '@/lib/prisma'
import { SITE_URL, toPreferredUrl } from '@/lib/siteUrl'
import HeadTags from '@/components/HeadTags'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
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
    if (!page) return { robots: { index: false, follow: false } }
    if (!page.published) {
      return {
        title: page.metaTitle || page.title,
        robots: { index: false, follow: false },
      }
    }

    const title = page.metaTitle || page.title
    const description = page.metaDescription || page.title
    const keywords = page.metaKeywords ? page.metaKeywords.split(',').map((k: string) => k.trim()) : undefined
    const canonical = toPreferredUrl(page.canonicalUrl) || `${SITE_URL}/${slug}`
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

  if (!page) {
    notFound()
  }

  let isDraftPreview = false
  if (!page.published) {
    try {
      const { userId } = await auth()
      if (userId) {
        const [clerkUser, dbUser] = await Promise.all([
          currentUser(),
          prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }),
        ])
        const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
        isDraftPreview = dbUser?.role === 'admin' || email === 'indiayogatourism@gmail.com'
      }
    } catch (error) {
      console.error('Error authorizing CMS page preview:', error)
    }
    if (!isDraftPreview) notFound()
  }

  return (
    <>
      <HeadTags html={page.customHtmlTags} />
      <main className="min-h-screen bg-[#f8f6f0] pb-24">
        {isDraftPreview && (
          <div className="bg-amber-100 px-4 py-3 text-center text-xs font-bold text-amber-950">
            Draft preview — only administrators can view this page until it is published.
          </div>
        )}
        <header className="relative overflow-hidden bg-[#17372b] px-6 pb-20 pt-32 text-white md:pb-28 md:pt-40">
          <div className="pointer-events-none absolute -right-24 -top-36 h-[26rem] w-[26rem] rounded-full border border-white/10" />
          <div className="relative mx-auto max-w-5xl">
            <Link href="/know-more" className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#e5cf9a] transition hover:text-white">
              <span aria-hidden="true">←</span> Know more
            </Link>
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e5cf9a]">India Yoga Tourism&nbsp; / &nbsp;Field guide</p>
            <h1 className="mt-5 max-w-4xl font-display-lg text-4xl leading-[1.1] md:text-6xl">{page.title}</h1>
            {page.metaDescription && <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg">{page.metaDescription}</p>}
          </div>
        </header>

        <article className="mx-auto -mt-10 max-w-5xl px-5 md:-mt-16 md:px-8">
          {page.ogImage && (
            <div className="relative mb-8 aspect-[16/7] overflow-hidden rounded-2xl bg-[#e2e6dc] shadow-[0_24px_70px_rgba(20,45,34,.18)] md:rounded-3xl">
              <img src={page.ogImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="rounded-2xl border border-[#17372b]/10 bg-white px-6 py-9 shadow-[0_20px_70px_rgba(23,55,43,.07)] md:rounded-3xl md:px-16 md:py-14">
            <div className="rich-article" dangerouslySetInnerHTML={{ __html: page.content }} />
            <div className="mt-14 border-t border-[#17372b]/10 pt-7">
              <Link href="/know-more" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17372b] hover:text-[#8b7040]">
                <span aria-hidden="true">←</span> Explore all guides
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
