import Link from 'next/link'

export default function ProgrammesPage() {
  const programs = [
    {
      title: 'Panchakarma Clinical Detoxification',
      desc: 'The ultimate Ayurvedic body purification and cellular recovery program, customized by doctor consults.',
      duration: '14 to 28 Days',
      price: '$1,499 USD',
      features: ['Personal Ayurveda Physician consultation', 'Dual therapist Abhyanga massage daily', 'Tailored Sattvic herbal diet plan', 'Daily customized Yoga Therapy & Nidra'],
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh'
    },
    {
      title: 'Stress Management & Mind Sanative',
      desc: 'Deep psychological recovery program targeting burnouts, sleep insomnia, and anxiety.',
      duration: '7 to 14 Days',
      price: '$899 USD',
      features: ['Daily Shirodhara oil-pour therapy', 'Personal Pranayama (breathing science) sessions', 'Vedic psychology consulting', 'Himalayan sound bowl healing rituals'],
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk30QEObl2k8oh7fcQBueTF65N9BWmaV3ZkFEx-IwV9X8AbWEGvDjdZsVeKDa6UjgtvTWYRkKdjnkPVJtV_3Nw8OPt-i6-1QwTChz_JIbN5Ajhbnk2Iiaa-OsDxXuHkjd2sEGQZieRNh469JeWf3tdoxY0lRn-r-qpLXngXofLaYSYrEE-fV_ga7ucnNT3Gme80JOeBQYFv0cPjN8Ysq3Nqh-SRqn8Y7DrMXS4hhXKsWN1m3KaUNhvQIohglA5nqLCXdQLDykF_B0o'
    },
    {
      title: 'Weight Control & Metabolism Reset',
      desc: 'Clinical weight balance program targeting metabolic sluggishness, utilizing traditional dry powder therapies.',
      duration: '10 to 21 Days',
      price: '$1,199 USD',
      features: ['Udvartana dry-powder fat scrubbing', 'Detoxifying herbal paste wraps', 'Metabolism-stimulating yoga sequencing', 'Internal detoxifying ghee supplements'],
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWCF3FNkFJLbVzL3jqGHa73fPpDI6Eih62gOI6ascq2xyzfCWb_p_tKmSBHMk1_W6r9aRBFx_DeSTW8t9NmWEihpsnAxgC7sKy77fHdsQFJABetSWSc8tuLwzW4Z9rrHY543Dv8KNCdiwnLZU84GDjA0h2USiT4sfOempqu1qZxhRQoBhJAZQRqnUhIHSmEFeQ72J-oJOOZ2v_GjbWy2G16WBKPTkNmy9iwXeV8c2gWGlZ1K_loofjKke13dNcEj1u2Q0R8eeeqQ3_'
    }
  ]

  return (
    <main className="bg-surface pb-20">
      {/* Hero Banner */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/45 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Ayurvedic oil pouring treatment"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh"
          />
        </div>
        <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12 mt-16">
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

        <div className="grid grid-cols-1 gap-12">
          {programs.map((p, idx) => (
            <div key={idx} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/20 grid grid-cols-1 lg:grid-cols-12">
              {/* Image Block */}
              <div className="lg:col-span-5 h-[280px] lg:h-auto relative">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover absolute inset-0" />
              </div>
              {/* Info Block */}
              <div className="lg:col-span-7 p-8 md:p-12 text-left flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="font-headline-md text-2xl md:text-3xl text-primary font-bold leading-tight">{p.title}</h3>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-outline uppercase tracking-wider block">Duration</span>
                      <span className="font-label-price text-primary font-bold text-lg">{p.duration}</span>
                    </div>
                  </div>

                  <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed">{p.desc}</p>
                  
                  <h4 className="font-label-price font-bold text-xs uppercase tracking-wider text-outline mb-3">Program Inclusions:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant font-medium mb-8">
                    {p.features.map((f, fIdx) => (
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
                    <span className="font-label-price text-primary font-bold text-2xl">{p.price}</span>
                  </div>
                  <Link href="/contact" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-primary hover:bg-primary-container text-on-primary font-bold px-8 py-3.5 rounded-xl transition-all duration-300 text-xs cursor-pointer shadow-md flex items-center justify-center gap-2">
                      Inquire Programme
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
