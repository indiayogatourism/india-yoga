import Link from 'next/link'

export default function AboutPage() {
  const teachers = [
    { name: 'Swami Yogananda Saraswati', role: 'Spiritual Director & Lineage Holder', bio: 'With over 40 years of teaching in the Himalayas, Swamiji leads advanced meditation and Vedanta philosophy.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb' },
    { name: 'Acharya Dr. Ananda', role: 'Head Ayurveda Clinician', bio: 'Dr. Ananda holds a Ph.D. in Ayurvedic medicine and customizes all clinical detox treatments.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh' },
    { name: 'Yogini Arundhati', role: 'Lead Vinyasa & Hatha Instructor', bio: 'Expert in alignment-based physical practice and traditional breathing methodologies.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk30QEObl2k8oh7fcQBueTF65N9BWmaV3ZkFEx-IwV9X8AbWEGvDjdZsVeKDa6UjgtvTWYRkKdjnkPVJtV_3Nw8OPt-i6-1QwTChz_JIbN5Ajhbnk2Iiaa-OsDxXuHkjd2sEGQZieRNh469JeWf3tdoxY0lRn-r-qpLXngXofLaYSYrEE-fV_ga7ucnNT3Gme80JOeBQYFv0cPjN8Ysq3Nqh-SRqn8Y7DrMXS4hhXKsWN1m3KaUNhvQIohglA5nqLCXdQLDykF_B0o' }
  ]

  return (
    <main className="bg-surface pb-20">
      {/* Hero Banner */}
      <section className="relative min-h-[420px] pt-28 md:pt-32 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/45 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Ancient ashram temple near holy Ganges river"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb"
          />
        </div>
        <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12">
          <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-3">✦ Our Sanctuary Story ✦</span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-primary font-bold">About India Yoga Tourism</h1>
        </div>
      </section>

      {/* Philosophy/Story Block */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Our Origins</span>
          <h2 className="font-headline-md text-3xl md:text-5xl text-primary font-bold mb-6">Bridging Ancient Wisdom with Modern Paths</h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm md:text-base mb-6">
            India Yoga Tourism (IYT) was founded under the guidance of traditional Himalayan masters to preserve the integrity of ancient yoga and Ayurvedic clinical science. 
          </p>
          <p className="font-body-md text-on-surface-variant leading-relaxed text-sm md:text-base">
            We believe that spiritual practice does not require compromising on comfortable living conditions. Our sanctuaried locations provide peaceful ashram grounds alongside premium hospitality and nutrition, offering the perfect environment for self-study and deep recovery.
          </p>
        </div>
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-xl min-h-[300px] border border-outline-variant/20">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh"
            alt="Master guru teaching yoga"
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#F8F3E3] py-20">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 text-center">
          <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Core Foundations</span>
          <h2 className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-12">Our Sanctuary Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 bg-primary/5 p-3 rounded-full">spa</span>
              <h3 className="font-headline-md text-xl text-primary mb-3">Authentic Lineage</h3>
              <p className="font-body-md text-on-surface-variant text-sm">We strictly teach traditional methodologies derived from sacred texts without dilutions.</p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 bg-primary/5 p-3 rounded-full">volunteer_activism</span>
              <h3 className="font-headline-md text-xl text-primary mb-3">Conscious Care</h3>
              <p className="font-body-md text-on-surface-variant text-sm">Our retreat grounds utilize eco-friendly materials, support regional communities, and offer organic nutrition.</p>
            </div>
            <div className="bg-surface p-8 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col items-center">
              <span className="material-symbols-outlined text-primary text-4xl mb-4 bg-primary/5 p-3 rounded-full">stars</span>
              <h3 className="font-headline-md text-xl text-primary mb-3">Premium Hospitality</h3>
              <p className="font-body-md text-on-surface-variant text-sm">Clean spaces, premium comfortable suites, and a dedicated team ready to serve you 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Row */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 text-center">
        <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Yoga Gurus &amp; Clinicians</span>
        <h2 className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-16">Meet Our Master Teachers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teachers.map((t, idx) => (
            <div key={idx} className="bg-surface border border-outline-variant/20 rounded-2xl p-6 shadow-sm flex flex-col items-center group">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-2 border-tertiary-fixed-dim shadow-md group-hover:scale-105 transition-transform duration-300">
                <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-headline-md text-xl text-primary font-bold mb-1">{t.name}</h3>
              <span className="text-xs text-secondary font-semibold uppercase tracking-wider block mb-4">{t.role}</span>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{t.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
