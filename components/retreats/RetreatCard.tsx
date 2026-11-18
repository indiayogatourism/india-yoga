import Link from 'next/link'
import type { RetreatListing } from '@/lib/retreatCatalog'
import { getRetreatRooms, retreatEnquiryUrl, usdPrice } from '@/lib/retreatContent'

export default function RetreatCard({ retreat, featured = false }: { retreat: RetreatListing; featured?: boolean }) {
  const rooms = getRetreatRooms(retreat)
  const startingPrice = rooms.length ? Math.min(...rooms.map((room) => room.price)) : undefined
  return <article data-retreat-id={retreat.id} data-retreat-slug={retreat.slug} data-retreat-price={startingPrice} data-retreat-currency={startingPrice !== undefined ? 'USD' : undefined} className={`overflow-hidden rounded-3xl border border-[#17372b]/15 bg-white ${featured ? 'grid md:grid-cols-2' : 'flex h-full flex-col'}`}>
    {retreat.featuredImage && <div className="aspect-[4/3] overflow-hidden bg-[#e9ecdf]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={retreat.featuredImage} alt={retreat.title} width={800} height={600} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>}
    <div className="flex flex-1 flex-col p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-[#64774d]">{featured ? 'Featured Rishikesh retreat' : retreat.location}</p>
      <h3 className="mt-3 font-display-lg text-2xl leading-tight text-[#17372b]">{retreat.title}</h3>
      <p className="mt-3 text-sm font-semibold text-[#536457]">{retreat.durationDays} days / {retreat.durationNights} nights · {retreat.location}</p>
      <p className="mt-4 text-sm leading-7 text-[#536457]">{retreat.shortDescription}</p>
      <p className="mt-5 font-semibold text-[#17372b]">{rooms.length ? `From ${usdPrice(Math.min(...rooms.map((room) => room.price)))} USD / person` : 'Enquire for current pricing'}</p>
      <div className="mt-auto flex flex-wrap gap-4 pt-6 text-sm font-bold text-[#17372b]">
        <Link href={`/packages/${retreat.slug}`} data-track-event="select_item" data-track-package={retreat.slug} className="inline-flex min-h-11 items-center rounded-full bg-[#17372b] px-5 text-white hover:bg-[#294e3e]">View dates &amp; retreat</Link>
        <Link href={retreatEnquiryUrl(retreat.slug)} className="inline-flex min-h-11 items-center underline underline-offset-4">Ask a question</Link>
      </div>
    </div>
  </article>
}
