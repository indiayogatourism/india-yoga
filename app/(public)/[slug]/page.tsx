import { prisma } from '@/lib/prisma'
import { SITE_URL, toPreferredUrl, withBrand } from '@/lib/siteUrl'
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
      title: withBrand(title),
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

  const intro = page.metaDescription?.trim()
  const plainContent = String(page.content).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
  const normalizedIntro = intro?.toLocaleLowerCase() || ''
  const showIntro = Boolean(
    intro &&
    normalizedIntro !== page.title.trim().toLocaleLowerCase() &&
    !plainContent.toLocaleLowerCase().startsWith(normalizedIntro),
  )
  const updatedDate = page.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      <HeadTags html={page.customHtmlTags} />
      <main className="min-h-screen bg-[#f8f6f0] pb-20">
        {isDraftPreview && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-950">
            Draft preview — only administrators can view this page until it is published.
          </div>
        )}
        <header className="relative isolate overflow-hidden bg-[#17372b] px-5 pb-16 pt-28 text-white md:px-8 md:pb-20 md:pt-36">
          <div className="pointer-events-none absolute -right-24 -top-36 h-[26rem] w-[26rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-20 h-[19rem] w-[19rem] rounded-full border border-[#e5cf9a]/15" />
          <div className="relative mx-auto max-w-6xl">
            <Link href="/know-more" className="mb-9 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#e5cf9a] transition hover:text-white">
              <span aria-hidden="true">←</span> Know more
            </Link>
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#e5cf9a]">
              <span className="h-px w-7 bg-[#e5cf9a]" /> India Yoga Tourism <span aria-hidden="true">/</span> Field guide
            </p>
            <h1 className="mt-5 max-w-5xl font-display-lg text-4xl leading-[1.08] md:text-6xl lg:text-7xl">{page.title}</h1>
            {showIntro && <p className="mt-6 max-w-3xl text-base leading-7 text-white/75 md:text-lg md:leading-8">{intro}</p>}
            {updatedDate && <p className="mt-7 text-[10px] font-semibold uppercase tracking-[.16em] text-white/50">A field guide <span className="mx-2 text-[#e5cf9a]/70">·</span> Updated {updatedDate}</p>}
          </div>
        </header>

        <article className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
          {page.ogImage && (
            <div className="relative mb-6 aspect-[16/7] overflow-hidden rounded-2xl bg-[#e2e6dc] shadow-[0_20px_60px_rgba(20,45,34,.12)] md:mb-8 md:rounded-3xl">
              <img src={page.ogImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="rounded-2xl border border-[#17372b]/10 bg-white px-5 py-7 shadow-[0_18px_60px_rgba(23,55,43,.06)] sm:px-8 sm:py-10 md:rounded-3xl md:px-12 md:py-14">
            <div className="rich-article mx-auto max-w-4xl" dangerouslySetInnerHTML={{ __html: page.content }} />
            <div className="mx-auto mt-10 max-w-4xl border-t border-[#17372b]/10 pt-6 md:mt-14 md:pt-7">
              <Link href="/know-more" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17372b] transition hover:text-[#8b7040]">
                <span aria-hidden="true">←</span> Explore all guides
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
