import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { PackageCategory } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ProgrammesPage() {
  const dbProgrammes = await prisma.package.findMany({
    where: {
      category: PackageCategory.PROGRAMME,
      status: 'PUBLISHED',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <main className="bg-surface pb-20">
      {/* Hero Banner */}
      <section className="relative min-h-[420px] pt-28 md:pt-32 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/45 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Ayurvedic oil pouring treatment"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh"
          />
        </div>
        <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12">
          <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-3">✦ Clinical Wellness &amp; Healing ✦</span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-primary font-bold">Ayurvedic Programmes</h1>
        </div>
      </section>

      {/* Main Listing Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 space-y-12">
        <div className="max-w-2xl text-left mb-12">
          <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Ayurvedic Sanctuaries</span>
          <h2 className="font-headline-md text-3xl md:text-5xl text-primary font-bold">Targeted Ayurvedic Clinical Therapy</h2>
          <p className="font-body-md text-on-surface-variant text-sm md:text-base mt-3">
            Our wellness programs combine daily clinical procedures guided by expert Ayurvedic physicians with sattvic dietary plans and targeted breathing classes.
          </p>
        </div>

        {dbProgrammes.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">sentiment_dissatisfied</span>
            <h3 className="font-headline-md text-xl text-primary mb-2">No Programmes Found</h3>
            <p className="font-body-md text-on-surface-variant">Check back soon for new wellness programmes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {dbProgrammes.map((p) => (
              <div key={p.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/20 grid grid-cols-1 lg:grid-cols-12">
                {/* Image Block */}
                <div className="lg:col-span-5 h-[280px] lg:h-auto relative">
                  <img
                    src={p.featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuACbK16cIbE1HnZhwzRdYZd3DaCUYzNasG8Bm0wMbeeSmdF8pAzvVRmWV0GDQTmSLhYIrG4uXxtx4DtfFOIhV0YdbQQfixpRRRf2iCVSm_WFuDTLhQ7cDrDKK0G2eFjJ_KXV8fWuYL3wuNcy865XWfB5tKvzSqUDWJ69b6UmBiU_Zu9CAjm-22SDFPU8RV1YBE7chA3Q3G2cebkitsQWte5moyWhsg_YGsZQTY3VOjSqCu-YgmtAGDo6R5Sia3MMNn9FVkTjrfu3pqQ'}
                    alt={p.title}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>
                {/* Info Block */}
                <div className="lg:col-span-7 p-8 md:p-12 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h3 className="font-headline-md text-2xl md:text-3xl text-primary font-bold leading-tight">{p.title}</h3>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-outline uppercase tracking-wider block">Duration</span>
                        <span className="font-label-price text-primary font-bold text-lg">{p.durationDays} Days</span>
                      </div>
                    </div>

                    <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed">{p.shortDescription}</p>
                    
                    <h4 className="font-label-price font-bold text-xs uppercase tracking-wider text-outline mb-3">Program Highlights:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant font-medium mb-8">
                      {p.highlights.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-sm">spa</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-outline-variant/20 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-left w-full sm:w-auto">
                      <span className="text-[10px] text-outline uppercase tracking-wider block">Starting From</span>
                      <span className="font-label-price text-primary font-bold text-2xl">{formatPrice(p.priceShared)}</span>
                    </div>
                    <Link href={`/packages/${p.slug}`} className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto bg-primary hover:bg-primary-container text-on-primary font-bold px-8 py-3.5 rounded-xl transition-all duration-300 text-xs cursor-pointer shadow-md flex items-center justify-center gap-2">
                        View Details &amp; Book
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
