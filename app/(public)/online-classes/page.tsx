import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { PackageCategory } from '@prisma/client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const canonical = 'https://indiayogatourism.com/online-classes'
  return {
    title: 'Online Sanctuary Classes & Live Streams | India Yoga Tourism',
    description: 'Connect via live stream with certified yoga masters in Rishikesh. Join traditional Hatha Flow, Vinyasa, Pranayama, and Meditation classes directly from your home.',
    keywords: ['online yoga classes', 'live stream yoga rishikesh', 'hatha yoga online', 'pranayama live stream', 'india yoga tourism'],
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'Online Sanctuary Classes & Live Streams | India Yoga Tourism',
      description: 'Traditional Ashram practice directly in your home with Rishikesh masters.',
      url: canonical,
      siteName: 'India Yoga Tourism',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Online Sanctuary Classes & Live Streams | India Yoga Tourism',
      description: 'Traditional Ashram practice directly in your home with Rishikesh masters.',
    },
  }
}

export default async function OnlineClassesPage() {
  const onlinePackages = await prisma.package.findMany({
    where: {
      category: PackageCategory.ONLINE_CLASS,
      status: 'PUBLISHED',
    },
  })

  // Fetch real online classes from database
  const classes = await (prisma as any).onlineClass.findMany({
    where: {
      published: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Collect custom HTML SEO tags from published classes if present
  const customHtmlTagsCombined = classes
    .map((c: any) => c.customHtmlTags)
    .filter(Boolean)
    .join('\n')

  return (
    <>
      {customHtmlTagsCombined && (
        <head dangerouslySetInnerHTML={{ __html: customHtmlTagsCombined }} />
      )}
      <main className="bg-surface pb-20">
        {/* Hero Banner */}
        <section className="relative min-h-[360px] pt-28 md:pt-32 pb-16 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-black/45 z-10"></div>
            <img
              className="object-cover w-full h-full absolute inset-0"
              alt="Practitioner streaming yoga class online"
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80"
            />
          </div>
          <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12">
            <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-3">✦ Join from Anywhere in the World ✦</span>
            <h1 className="font-display-lg text-4xl md:text-6xl text-on-primary font-bold">Online Sanctuary Classes</h1>
          </div>
        </section>

        {/* Intro and schedules */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 text-left flex flex-col justify-between">
            <div>
              <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Live Stream Wisdom</span>
              <h2 className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-6">Traditional Ashram practice, directly in your home</h2>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed mb-6">
                Connect via live stream with our certified yoga masters in Rishikesh. We maintain small class sizes to offer feedback and alignment checks.
              </p>
              {onlinePackages.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-outline">Available Online Passes:</h4>
                  {onlinePackages.map((pkg) => (
                    <div key={pkg.id} className="p-4 rounded-xl bg-[#F8F3E3] border border-outline-variant/10 flex justify-between items-center">
                      <div>
                        <h5 className="font-bold text-primary text-sm">{pkg.title}</h5>
                        <p className="text-xs text-on-surface-variant">{pkg.durationDays} Days Access</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary text-sm block">{formatPrice(pkg.priceShared)}</span>
                        <Link href={`/packages/${pkg.slug}`} className="text-xs font-bold text-secondary hover:underline">
                          Book Pass →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Stream Daily Schedule (DB items) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-headline-md text-2xl text-primary font-bold text-left mb-6">Live Stream Daily Schedule</h3>

            {classes.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 text-center text-xs text-on-surface-variant space-y-2">
                <p className="font-bold text-primary text-sm">No Live Classes Currently Scheduled</p>
                <p>New online sanctuary sessions are added regularly. Inquire below to get notified of upcoming live streams.</p>
              </div>
            ) : (
              classes.map((cls: any) => (
                <div key={cls.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left hover:border-secondary transition-all">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h4 className="font-headline-md text-xl text-primary font-bold">{cls.title}</h4>
                      <span className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                        {cls.level}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{cls.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-secondary pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {cls.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {cls.instructor}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        ${cls.price} USD
                      </span>
                    </div>
                  </div>
                  <Link href="/contact" className="shrink-0 w-full md:w-auto">
                    <button className="w-full md:w-auto border border-primary text-primary hover:bg-primary hover:text-on-primary font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer">
                      Inquire Class
                    </button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  )
}
