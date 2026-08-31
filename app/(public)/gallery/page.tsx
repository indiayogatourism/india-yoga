'use client'

import { useState } from 'react'

export default function GalleryPage() {
  const [filter, setFilter] = useState('all')

  const photos = [
    { title: 'Himalayan Sunrise Yoga', category: 'retreats', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb' },
    { title: 'Ayurvedic Massage Treatment', category: 'activities', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ4PkqcD83cx3q9NfEA2D4D0dACa2KEUrl3ocyJqQEj8MsZiKp7yVUjfsz1PhCLoRpbOpTPCoSruI3zUdpAXV495u5Nx2wyRvMXsbWoFsC8TpG2X0Rq4esc3tdBCS7oprShHV2A_7yXUHsa8M_BcP9MXTc2RSEM0uCMoKYPbsZe5DZsZM13f-jaDBBnIrbBe6i7bndREoFQiDr5xm7JKp_iXQ2Z8BSeyFbYuAFCn22z3Nhf5-im3Iko54LI1Rq4pmjJJZPzbrJGjh' },
    { title: 'Sattvic Organic Meal', category: 'food', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWCF3FNkFJLbVzL3jqGHa73fPpDI6Eih62gOI6ascq2xyzfCWb_p_tKmSBHMk1_W6r9aRBFx_DeSTW8t9NmWEihpsnAxgC7sKy77fHdsQFJABetSWSc8tuLwzW4Z9rrHY543Dv8KNCdiwnLZU84GDjA0h2USiT4sfOempqu1qZxhRQoBhJAZQRqnUhIHSmEFeQ72J-oJOOZ2v_GjbWy2G16WBKPTkNmy9iwXeV8c2gWGlZ1K_loofjKke13dNcEj1u2Q0R8eeeqQ3_' },
    { title: 'Holy Ganges Aarti', category: 'activities', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsp1ohJUUm13w0goBUZadNiTv4u_MRoXwO2fX6rZiVHoSkkd7vLLPNgriZMi67_cHAerB5rJLczMvqs_yyz26gTCkhc1u6oDVIGQ9_yfcEaFhCleqCq4VoXqeHjrnDYbM2NyMxpz6nNIAkgZuXL96ueCVzSUMhp7RrRAY2WaZp1IzbGH4Fvn79EkCVmwVkT-SrjOYRCvFPWGa8MeOOZEBbu7wrY12x58cNSTI2cTlO6AXCjH-csyKrFZ3Eb7nJ2UNMsWsPXWE20USb' },
    { title: 'Meditation in Forest Garden', category: 'retreats', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk30QEObl2k8oh7fcQBueTF65N9BWmaV3ZkFEx-IwV9X8AbWEGvDjdZsVeKDa6UjgtvTWYRkKdjnkPVJtV_3Nw8OPt-i6-1QwTChz_JIbN5Ajhbnk2Iiaa-OsDxXuHkjd2sEGQZieRNh469JeWf3tdoxY0lRn-r-qpLXngXofLaYSYrEE-fV_ga7ucnNT3Gme80JOeBQYFv0cPjN8Ysq3Nqh-SRqn8Y7DrMXS4hhXKsWN1m3KaUNhvQIohglA5nqLCXdQLDykF_B0o' },
    { title: 'Ayurvedic Herbal Remedies', category: 'food', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGhb-UANOYh1QNZEkGZqKHsOehwvG2xg-wHpSZhbDbT9JXEhuNwdnSM0-DnoEU-RBPKjpsVk8xlkrGyDUrUqrQ2-sU6pLXWHofqkdUJxcJVGd1VxIUV2-FZ_wqIUL04b7h1WvDd18dgAsWc_c48NvJWzmRhRZUZLGuzQLq-S3xL5904yF5OqXhg3IUIKMZwHMGjPK1QeIvd9JvNT6pjuWGtrLdhGf_XR_bylxmku8OoomMj7vVMDvd0kCFba6QpGZG0A_-_8nrGPnA' }
  ]

  const filteredPhotos = filter === 'all' ? photos : photos.filter(p => p.category === filter)

  return (
    <main className="bg-surface pb-20">
      {/* Header Banner */}
      <section className="relative min-h-[360px] pt-28 md:pt-32 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/45 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Meditation practitioner looking at Himalayan valley"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGhb-UANOYh1QNZEkGZqKHsOehwvG2xg-wHpSZhbDbT9JXEhuNwdnSM0-DnoEU-RBPKjpsVk8xlkrGyDUrUqrQ2-sU6pLXWHofqkdUJxcJVGd1VxIUV2-FZ_wqIUL04b7h1WvDd18dgAsWc_c48NvJWzmRhRZUZLGuzQLq-S3xL5904yF5OqXhg3IUIKMZwHMGjPK1QeIvd9JvNT6pjuWGtrLdhGf_XR_bylxmku8OoomMj7vVMDvd0kCFba6QpGZG0A_-_8nrGPnA"
          />
        </div>
        <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12">
          <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-3">✦ Visual Meditation ✦</span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-primary font-bold">Sanctuary Photo Gallery</h1>
        </div>
      </section>

      {/* Selector Tabs */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-16 text-center">
        <div className="flex justify-center gap-3 border-b border-outline-variant/30 pb-4 max-w-md mx-auto">
          {['all', 'retreats', 'activities', 'food'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                filter === tab
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-primary/5 text-on-surface-variant hover:bg-primary/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Grid Canvas */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPhotos.map((photo, index) => (
            <div
              key={index}
              className="break-inside-avoid bg-surface-container-low rounded-2xl overflow-hidden shadow-md border border-outline-variant/10 relative group cursor-zoom-in"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-left">
                  <span className="text-[9px] font-label-price text-tertiary-fixed-dim uppercase tracking-wider block mb-1">
                    {photo.category}
                  </span>
                  <h3 className="font-headline-md text-on-primary text-lg font-bold">{photo.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
