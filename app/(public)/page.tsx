import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import WhyChooseUsInteractive from '@/components/WhyChooseUsInteractive'
import HeroSearchBar from '@/components/home/HeroSearchBar'

export const revalidate = 3600 // Revalidate home page every hour

async function getFeaturedPackages() {
  try {
    const pkgs = await prisma.package.findMany({
      where: {
        status: 'PUBLISHED'
      },
      take: 4,
      orderBy: {
        totalBookings: 'desc'
      }
    })
    return pkgs
  } catch (e) {
    return []
  }
}

async function getTestimonials() {
  try {
    return await prisma.review.findMany({
      where: {
        isPublished: true,
        rating: 5
      },
      take: 3,
      include: {
        user: true,
        package: true
      }
    })
  } catch (e) {
    return []
  }
}

export default async function HomePage() {
  const featuredPackages = await getFeaturedPackages()
  const dbTestimonials = await getTestimonials()

  const displayPackages = featuredPackages
  const displayTestimonials = dbTestimonials.map(t => ({
    name: t.user.name,
    country: t.country || 'International Guest',
    content: t.content,
    rating: t.rating
  }))

  return (
    <main className="bg-surface relative pb-12">
      {/* 1. HERO SECTION WITH SEARCH WIDGET */}
      <section className="relative min-h-[600px] lg:h-[95vh] flex items-center justify-center overflow-visible pt-24 pb-20">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-primary/30 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0 scale-105"
            alt="A breathtaking yoga session overlooking Rishikesh and the holy Ganges"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh"
          />
        </div>

        <div className="relative z-20 w-full max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col items-center text-center">
          <span className="inline-block px-4 py-1.5 bg-tertiary-fixed-dim/20 backdrop-blur-sm border border-tertiary-fixed-dim/30 text-tertiary-fixed rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
            ✦ RISHIKESH · KERALA · DHARAMSHALA ✦
          </span>

          <h1 className="font-display-lg text-4xl md:text-5xl lg:text-7xl text-on-primary max-w-5xl mx-auto leading-[1.1] mb-4 md:mb-6 drop-shadow-lg">
            Transform Your Life <br />
            <span className="text-tertiary-fixed-dim font-headline-lg italic">in Rishikesh, India</span>
          </h1>

          <p className="font-body-md text-sm md:text-lg text-on-primary/95 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed drop-shadow-sm">
            Discover handpicked yoga retreats, schools & wellness experiences in the Yoga Capital of the World.
          </p>

          {/* Interactive Search Bento Widget */}
          <HeroSearchBar />

          {/* Desktop trust badges row */}
          <div className="hidden md:flex mt-12 flex-wrap justify-center gap-6 text-on-primary/95 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-black/15 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm icon-fill">star</span>
              <span>Trusted by International Travellers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm icon-fill">verified_user</span>
              <span>Verified Retreats &amp; Centers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm icon-fill">local_offer</span>
              <span>Best Price Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-sm icon-fill">support_agent</span>
              <span>24/7 Support Speaking Team</span>
            </div>
          </div>

          {/* Mobile trust badges row (Horizontal scroll) */}
          <div className="md:hidden mt-8 w-full overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-3 whitespace-nowrap min-w-max">
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-2 rounded-full border border-white/10 backdrop-blur-sm text-[10px] text-on-primary font-bold">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xs icon-fill">star</span>
                <span>Trusted by Travellers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-2 rounded-full border border-white/10 backdrop-blur-sm text-[10px] text-on-primary font-bold">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xs icon-fill">verified_user</span>
                <span>Verified Retreats</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-2 rounded-full border border-white/10 backdrop-blur-sm text-[10px] text-on-primary font-bold">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xs icon-fill">local_offer</span>
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/15 px-3 py-2 rounded-full border border-white/10 backdrop-blur-sm text-[10px] text-on-primary font-bold">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xs icon-fill">support_agent</span>
                <span>24/7 Support English Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED RETREATS */}
      <section className="py-16 md:py-24 bg-[#F8F3E3]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-10">
            <div className="max-w-2xl text-left">
              <h2 className="font-headline-md text-2xl md:text-4xl text-primary font-bold">
                Featured Yoga Retreats in Rishikesh
              </h2>
            </div>
            <Link
              href="/packages"
              className="flex items-center gap-1 text-primary hover:text-secondary font-bold transition-colors border-b border-primary hover:border-secondary pb-0.5 text-xs md:text-sm whitespace-nowrap"
            >
              View All
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          {/* Desktop & Mobile Card Wrapper (Horizontal Snap Scroll on Mobile, Grid on Desktop) */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-x-visible no-scrollbar gap-5 pb-4 md:pb-0 snap-x snap-mandatory">
            {displayPackages.map((pkg) => {
              const inclusionList = Array.isArray(pkg.inclusions) 
                ? pkg.inclusions.slice(0, 3).join(' • ') 
                : ((pkg as any).inclusions || 'Daily Yoga • Meditation • Meals');

              return (
                <div
                  key={pkg.id}
                  className="snap-start shrink-0 w-[82vw] md:w-auto bg-surface rounded-2xl overflow-hidden ambient-shadow flex flex-col group hover:-translate-y-2 transition-transform duration-300 border border-outline-variant/10 relative"
                >
                  {/* Image + Badges */}
                  <div className="relative h-44 w-full overflow-hidden">
                    <div className="absolute top-3 left-3 z-10 flex gap-1">
                      <span className="bg-primary/95 text-on-primary text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        {pkg.durationDays} Days / {pkg.durationNights || (pkg.durationDays - 1)} Nights
                      </span>
                      {pkg.isBestseller && (
                        <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                          Bestseller
                        </span>
                      )}
                    </div>

                    {/* Heart Icon Toggle */}
                    <button className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-primary/80 hover:bg-white hover:text-error transition-all duration-300">
                      <span className="material-symbols-outlined text-[16px]">favorite</span>
                    </button>

                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={pkg.title}
                      src={pkg.featuredImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb'}
                    />
                  </div>

                  {/* Content info */}
                  <div className="p-4 flex flex-col flex-1 text-left">
                    <div className="flex items-center gap-0.5 text-[9px] font-bold text-secondary uppercase tracking-widest mb-1.5">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {pkg.location}
                    </div>

                    <h3 className="font-headline-md text-primary text-lg font-bold leading-tight line-clamp-2 mb-2 group-hover:text-secondary transition-colors duration-300">
                      {pkg.title}
                    </h3>

                    {/* Highlights/Inclusions details */}
                    <div className="bg-surface-container-low p-2 rounded-lg text-[10px] text-on-surface-variant mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-secondary">spa</span>
                      <span className="font-body-md line-clamp-1">
                        {inclusionList}
                      </span>
                    </div>

                    <hr className="border-outline-variant/10 mb-3" />

                    {/* Rating + Price block */}
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-tertiary-fixed-dim text-xs icon-fill">star</span>
                        <span className="text-xs font-bold text-on-surface">
                          {(pkg as any).avgRating || 4.8}
                        </span>
                        <span className="text-[9px] text-outline">
                          ({(pkg as any).totalReviews || 65} Reviews)
                        </span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-outline uppercase tracking-wider">From</span>
                        <span className="font-label-price text-primary font-bold text-sm">
                          {formatPrice(pkg.priceShared)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/packages/${pkg.slug}`} className="mt-3 block w-full">
                      <button className="w-full bg-primary/5 hover:bg-primary text-primary hover:text-on-primary font-bold text-[10px] py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-0.5 cursor-pointer">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BROWSE BY EXPERIENCE */}
      <section className="py-16 bg-surface border-b border-outline-variant/10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto mb-10 text-left md:text-center">
            <span className="text-xs text-secondary font-bold uppercase tracking-widest mb-2 block">
              EXPLORE MODALITIES
            </span>
            <h2 className="font-headline-md text-2xl md:text-4xl text-primary font-bold mb-4">
              Browse by Experience
            </h2>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant/80 max-w-xl mx-auto">
              Filter and find the exact path of wisdom matching your inner journey.
            </p>
          </div>

          {/* Premium modaility circle row (Horizontal scroll on mobile, wrap on desktop) */}
          <div className="flex overflow-x-auto no-scrollbar gap-5 py-4 px-2 snap-x snap-mandatory md:justify-center md:flex-wrap md:overflow-visible">
            {[
              { 
                label: 'Yoga Retreats', 
                href: '/packages?category=RETREAT',
                img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Meditation Retreats', 
                href: '/packages?category=RETREAT',
                img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Ayurveda & Healing', 
                href: '/programmes',
                img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Detox Retreats', 
                href: '/packages?category=RETREAT',
                img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Wellness Retreats', 
                href: '/packages?category=RETREAT',
                img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Solo Female Retreats', 
                href: '/packages',
                img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Couples Retreats', 
                href: '/packages',
                img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&q=80'
              },
              { 
                label: 'Himalayan Retreats', 
                href: '/packages?category=TREK',
                img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=150&q=80'
              }
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="snap-start shrink-0 flex flex-col items-center w-24 group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-secondary transition-all duration-300 relative">
                  <img
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    src={cat.img}
                    alt={cat.label}
                  />
                </div>
                <span className="font-body-md text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors text-center mt-2 leading-tight truncate w-full">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE INDIA YOGA TOURISM? */}
      <section className="py-16 md:py-24 bg-surface-container-lowest border-b border-outline-variant/10 text-left">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <span className="text-xs text-secondary font-bold uppercase tracking-widest mb-2 block">
            OUR LINEAGE
          </span>
          <h2 className="font-headline-md text-2xl md:text-4xl text-primary font-bold mb-4">
            Why Choose India Yoga Tourism (IYT)?
          </h2>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant/80 max-w-2xl mb-10">
            We make your journey simple, safe, and deeply transformative. By bridging traditional guru-disciple lineages with high-end comforts, we deliver verified retreats.
          </p>

          {/* Interactive Why Choose Us Component (Tabs on left, dynamic info cards on right) */}
          <WhyChooseUsInteractive />
        </div>
      </section>

      {/* 5. WHAT OUR GUESTS SAY */}
      <section className="py-16 bg-surface border-b border-outline-variant/10 text-left">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="mb-8">
            <h2 className="font-headline-md text-2xl md:text-4xl text-primary font-bold">
              What Our Guests Say
            </h2>
          </div>

          {/* Horizontal Snap Scroll row for reviews & video play preview */}
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 snap-x snap-mandatory">
            {displayTestimonials.map((t, idx) => (
              <div
                key={idx}
                className="snap-start shrink-0 w-[80vw] md:w-[400px] bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-500 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm icon-fill">star</span>
                    ))}
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                    "{t.content}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary font-bold text-xs flex items-center justify-center uppercase">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-primary">— {t.name}</p>
                    <p className="text-[9px] text-outline">{t.country}</p>
                  </div>
                </div>
              </div>
            ))}


          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="relative py-20 overflow-hidden bg-[#012d1d] text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80"
            alt="Rishikesh Sunset Ganges"
            className="object-cover w-full h-full object-center opacity-40 scale-105"
          />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="inline-block text-tertiary-fixed-dim font-bold text-xs uppercase tracking-widest mb-3">
              ✦ Start Your Pilgrimage ✦
            </span>
            <h2 className="font-display-lg text-3xl md:text-5xl font-bold leading-tight mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-on-primary-container/90 text-sm md:text-lg max-w-xl leading-relaxed">
              Book your perfect yoga retreat in Rishikesh today and learn directly from the traditional sages.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
            <Link href="/packages" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-tertiary-fixed-dim hover:bg-tertiary-fixed text-on-tertiary-fixed font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-center text-sm md:text-base">
                Explore Retreats
              </button>
            </Link>
            <a
              href="https://wa.me/918800919486"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/60 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-md cursor-pointer text-center text-sm md:text-base"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              Talk to Retreat Expert
            </a>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM VALUE PROPS BAR */}
      <section className="bg-surface-container-low border-t border-outline-variant/30 py-8 relative z-10 mb-16 md:mb-0">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">event_repeat</span>
            <div>
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Flexible Booking</h4>
              <p className="text-[10px] text-on-surface-variant">Easy online rescheduling</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">shield</span>
            <div>
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Secure Payments</h4>
              <p className="text-[10px] text-on-surface-variant">100% safe checkout</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">cancel</span>
            <div>
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">Free Cancellation</h4>
              <p className="text-[10px] text-on-surface-variant">Up to 7 days departure</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
            <div>
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider">24/7 Support</h4>
              <p className="text-[10px] text-on-surface-variant">We are here to guide you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Footer Action Bar (WhatsApp & Call shortcuts) */}
      <div className="md:hidden fixed bottom-4 left-4 right-20 z-40 flex gap-2 items-center">
        <a
          href="https://wa.me/918800919486"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#1b4332] text-white hover:bg-primary-container px-4 py-3 rounded-full shadow-lg flex items-center gap-2 border border-white/20"
        >
          <span className="material-symbols-outlined text-sm bg-white/25 p-1 rounded-full text-white">chat</span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold leading-none">Book on WhatsApp</span>
            <span className="text-[8px] opacity-80 leading-none mt-0.5">Get Dates, Prices &amp; Instant Help</span>
          </div>
        </a>

        <a
          href="tel:+918800919486"
          className="w-12 h-12 rounded-full bg-white border border-outline-variant/30 flex flex-col items-center justify-center text-primary shadow-lg hover:bg-surface shrink-0"
        >
          <span className="material-symbols-outlined text-lg">call</span>
          <span className="text-[7px] font-bold uppercase tracking-wider -mt-0.5">Call Us</span>
        </a>
      </div>
    </main>
  )
}
