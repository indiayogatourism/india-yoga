'use client'

import { useState, useEffect } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', category: 'Retreat', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [siteConfig, setSiteConfig] = useState({
    contactEmail: 'info@indiayogatourism.com',
    contactPhone: '+91 99998 76349',
    whatsappNumber: '+91 99998 76349',
    officeAddress: '30 N Gould St Ste R, Sheridan, WY 82801',
  })

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config')
        const data = await res.json()
        if (data.success && data.config) {
          setSiteConfig({
            contactEmail: data.config.contactEmail || 'info@indiayogatourism.com',
            contactPhone: data.config.contactPhone || '+91 99998 76349',
            whatsappNumber: data.config.whatsappNumber || '+91 99998 76349',
            officeAddress: data.config.officeAddress || '30 N Gould St Ste R, Sheridan, WY 82801',
          })
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchConfig()
  }, [])

  const cleanWhatsappNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '') || '919999876349'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', category: 'Retreat', message: '' })
      } else {
        setErrorMsg(data.error || 'Failed to send inquiry. Please try again.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting inquiry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-surface pb-20">
      {/* Header banner */}
      <section className="relative min-h-[360px] pt-28 md:pt-32 pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/45 z-10"></div>
          <img
            className="object-cover w-full h-full absolute inset-0"
            alt="Beautiful Himalayan sanctuary landscape"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDk30QEObl2k8oh7fcQBueTF65N9BWmaV3ZkFEx-IwV9X8AbWEGvDjdZsVeKDa6UjgtvTWYRkKdjnkPVJtV_3Nw8OPt-i6-1QwTChz_JIbN5Ajhbnk2Iiaa-OsDxXuHkjd2sEGQZieRNh469JeWf3tdoxY0lRn-r-qpLXngXofLaYSYrEE-fV_ga7ucnNT3Gme80JOeBQYFv0cPjN8Ysq3Nqh-SRqn8Y7DrMXS4hhXKsWN1m3KaUNhvQIohglA5nqLCXdQLDykF_B0o"
          />
        </div>
        <div className="relative z-20 text-center max-w-[1280px] mx-auto px-6 md:px-12">
          <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-3">✦ Connect With Our Sages ✦</span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-primary font-bold">Contact Our Sanctuary</h1>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Contact Methods */}
        <div className="lg:col-span-5 flex flex-col justify-between text-left">
          <div>
            <span className="text-secondary font-label-price text-xs uppercase tracking-widest block mb-2">Speak to a Guide</span>
            <h2 className="font-headline-md text-3xl md:text-4xl text-primary font-bold mb-6">We are here to help your journey</h2>
            <p className="font-body-md text-on-surface-variant text-sm md:text-base leading-relaxed mb-8">
              Whether you need customization for clinical therapies, want to query group bookings, or need help matching a retreat to your spiritual experience.
            </p>

            <div className="space-y-6">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${cleanWhatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/5"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">chat</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">WhatsApp Support</h4>
                  <p className="text-xs text-on-surface-variant">{siteConfig.whatsappNumber} (Realtime)</p>
                </div>
              </a>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/5">
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Sanctuary Desk Email</h4>
                  <p className="text-xs text-on-surface-variant">{siteConfig.contactEmail}</p>
                </div>
              </div>

              {/* Office Address */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/5">
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Himalayan Retreat Office</h4>
                  <p className="text-xs text-on-surface-variant">{siteConfig.officeAddress}</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-2">
                <h4 className="font-bold text-primary text-sm mb-3">Connect With Us</h4>
                <div className="flex flex-wrap gap-2.5">
                  <a href="https://www.facebook.com/share/1D1aRiMwFp/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                    aria-label="Facebook" title="Facebook"
                    className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white flex items-center justify-center transition-all text-primary/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/indiayogatourismm?stkn=MWR3OHQ1OHF6ejcwcw==" target="_blank" rel="noopener noreferrer"
                    aria-label="Instagram" title="Instagram"
                    className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white flex items-center justify-center transition-all text-primary/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://x.com/indiayogatou?s=11&t=kMtmwEBJvVxacSVU1uRRHA" target="_blank" rel="noopener noreferrer"
                    aria-label="X (Twitter)" title="X (Twitter)"
                    className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-black hover:border-black hover:text-white flex items-center justify-center transition-all text-primary/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.737l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://www.reddit.com/u/indiayogatourism/s/NFnMuneKBH" target="_blank" rel="noopener noreferrer"
                    aria-label="Reddit" title="Reddit"
                    className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-[#FF4500] hover:border-[#FF4500] hover:text-white flex items-center justify-center transition-all text-primary/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                  </a>
                  <a href="https://www.threads.com/@indiayogatourismm?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noopener noreferrer"
                    aria-label="Threads" title="Threads"
                    className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-black hover:border-black hover:text-white flex items-center justify-center transition-all text-primary/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.523-8.482C5.852 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.371-.887h-.048c-.848 0-1.835.271-2.452 1.092l-1.655-1.168c.986-1.364 2.5-2.072 4.109-2.072h.085c3.247.038 5.155 2.038 5.351 5.53l.003.07a8.4 8.4 0 0 1 1.179.59c1.088.659 1.906 1.575 2.363 2.649.849 1.966.827 5.002-1.302 7.096-1.763 1.74-3.963 2.517-7.157 2.545zm1.777-7.726c-1.878.096-3.003.904-2.947 2.119.04.827.636 1.497 1.867 1.574 1.327-.016 2.287-.48 2.924-1.416.354-.521.592-1.22.71-2.086a10.868 10.868 0 0 0-2.554-.191z"/></svg>
                  </a>
                  <a href="https://in.linkedin.com/in/india-yoga-tourism-130709436" target="_blank" rel="noopener noreferrer"
                    aria-label="LinkedIn" title="LinkedIn"
                    className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white flex items-center justify-center transition-all text-primary/60">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-xl">
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-secondary text-5xl mb-4 bg-secondary/10 p-4 rounded-full">check_circle</span>
              <h3 className="font-headline-md text-2xl text-primary font-bold mb-2">Message Sent Successfully!</h3>
              <p className="text-sm text-on-surface-variant max-w-sm">
                Thank you for connecting. Our retreat guides will review your enquiry and respond via email within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-primary text-on-primary font-bold px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors text-xs cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <h3 className="font-headline-md text-2xl text-primary font-bold mb-6">Send an Inquiry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Full Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors text-sm"
                    placeholder="Jane Doe"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Email Address *</label>
                  <input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors text-sm"
                    placeholder="jane@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Contact Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors text-sm"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Interest Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors appearance-none text-sm"
                  >
                    <option value="Retreat">Yoga Retreats</option>
                    <option value="Programme">Ayurveda Detox</option>
                    <option value="Online">Online Classes</option>
                    <option value="TeacherTraining">Teacher Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-outline uppercase font-bold tracking-wider mb-2">Your Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-outline-variant px-0 py-2 text-on-surface focus:ring-0 focus:border-tertiary-fixed-dim transition-colors resize-none text-sm"
                  placeholder="How can we help guide you?"
                  rows={4}
                  required
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    Submit Inquiry
                    <span className="material-symbols-outlined text-sm">send</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
