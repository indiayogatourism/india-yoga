import Link from 'next/link'
import type { ReactNode } from 'react'
import { SITE_URL } from '@/lib/siteUrl'

export function PageHero({ eyebrow, title, intro, image, children }: { eyebrow: string; title: string; intro: string; image?: string | null; children?: ReactNode }) {
  return (
    <header className="overflow-hidden bg-[#17372b] px-5 pb-14 pt-32 text-white md:px-10 md:pb-20 md:pt-40">
      <div className={`mx-auto grid max-w-6xl items-center gap-10 ${image ? 'lg:grid-cols-[1.15fr_1fr]' : ''}`}>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#e5cf9a]">{eyebrow}</p>
          <h1 className="max-w-4xl font-display-lg text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/85">{intro}</p>
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {image && <div className="aspect-[5/4] overflow-hidden rounded-[2rem] border border-white/15">
          {/* CMS photography can be hosted on different provider domains. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Retreat photograph supplied for the featured yoga program" width={900} height={720} fetchPriority="high" className="h-full w-full object-cover" />
        </div>}
      </div>
    </header>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const data = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}) })),
  }
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-5 py-6 text-sm text-[#536457] md:px-0">
      <ol className="flex flex-wrap gap-x-2 gap-y-1">{items.map((item, index) => <li key={item.label} className="flex items-center gap-2">
        {index > 0 && <span aria-hidden="true">/</span>}
        {item.href ? <Link href={item.href} className="underline-offset-4 hover:underline">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
      </li>)}</ol>
    </nav>
  </>
}

export function Questions({ items }: { items: readonly { question: string; answer: string }[] }) {
  return <div className="divide-y divide-[#17372b]/15">{items.map((item) => <details key={item.question} className="group py-5">
    <summary className="cursor-pointer text-lg font-semibold text-[#17372b]">{item.question}</summary>
    <p className="mt-3 max-w-3xl leading-7 text-[#536457]">{item.answer}</p>
  </details>)}</div>
}

export const primaryLinkClass = 'inline-flex min-h-12 items-center justify-center rounded-full bg-[#e5cf9a] px-6 py-3 text-sm font-bold text-[#17372b] transition hover:bg-[#f1dfb8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4'
export const outlineLinkClass = 'inline-flex min-h-12 items-center justify-center rounded-full border border-current px-6 py-3 text-sm font-bold transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4'
