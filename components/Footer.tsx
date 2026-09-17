'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const defaultDests = [
    { id: '1', name: 'Rishikesh', locationQuery: 'Rishikesh' },
    { id: '2', name: 'Kerala', locationQuery: 'Kerala' },
    { id: '3', name: 'Dharamshala', locationQuery: 'Dharamshala' },
  ]

  const [siteConfig, setSiteConfig] = useState({
    siteName: 'India Yoga Tourism',
    siteTagline: 'Ancient Wisdom. Modern Journey.',
    footerText: '© 2026 India Yoga Tourism. All rights reserved.',
    destinations: defaultDests,
  })

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/site-config')
        const data = await res.json()
        if (data.success && data.config) {
          let dests = defaultDests
          if (data.config.destinationsJson) {
            try {
              const parsed = JSON.parse(data.config.destinationsJson)
              if (Array.isArray(parsed) && parsed.length > 0) {
                dests = parsed
              }
            } catch (e) {
              // fallback
            }
          }

          setSiteConfig({
            siteName: data.config.siteName || 'India Yoga Tourism',
            siteTagline: data.config.siteTagline || 'Ancient Wisdom. Modern Journey.',
            footerText: data.config.footerText || '© 2026 India Yoga Tourism. All rights reserved.',
            destinations: dests,
          })
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchConfig()
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail('')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-primary text-on-primary w-full border-t border-outline-variant/20 relative overflow-hidden">
      {/* Decorative floral backgrounds */}
      <div className="absolute top-0 right-0 opacity-5 w-96 h-96 pointer-events-none">
        <span className="material-symbols-outlined text-[400px] leading-none select-none">spa</span>
      </div>
      <div className="absolute bottom-0 left-0 opacity-5 w-72 h-72 pointer-events-none">
        <span className="material-symbols-outlined text-[300px] leading-none select-none">yard</span>
      </div>

      {/* Premium Newsletter & Philosophy Section */}
      <div className="border-b border-on-primary-container/20 relative z-10 bg-primary-container/40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-tertiary-fixed font-label-price text-xs uppercase tracking-widest block mb-2">
              ✦ Vasudhaiva Kutumbakam ✦
            </span>
            <h3 className="font-headline-lg text-3xl md:text-4xl text-on-primary mb-3">
              Join Our Inner Sanctuary
            </h3>
            <p className="font-body-md text-on-primary-container/80 text-sm md:text-base leading-relaxed">
              Subscribe to receive sacred travel updates, traditional wellness philosophies, and priority access to upcoming retreats.
            </p>
          </div>
          <div className="w-full max-w-md lg:min-w-[450px]">
            {subscribed ? (
              <div className="p-5 bg-primary border-2 border-tertiary-fixed-dim/30 rounded-2xl text-center shadow-lg transform scale-100 transition-all">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-2">verified</span>
                <p className="font-bold text-on-primary">Namaste! You have successfully subscribed.</p>
                <p className="text-xs text-on-primary-container/70 mt-1">An invitation will arrive in your inbox shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full bg-white/5 p-2 rounded-2xl border border-on-primary-container/10">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-5 py-4 rounded-xl bg-transparent border-0 focus:ring-0 text-on-primary placeholder:text-on-primary-container/50 font-body-md w-full focus:outline-none"
                  placeholder="Your spiritual email address"
                  type="email"
                  required
                />
                <button
                  type="submit"
                  className="bg-tertiary-fixed-dim text-on-tertiary-fixed font-label-price text-sm font-bold px-8 py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all whitespace-nowrap cursor-pointer shadow-md"
                >
                  Join Inner Circle
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 px-6 md:px-12 py-20 max-w-[1280px] mx-auto relative z-10">
        
        {/* Brand Block */}
        <div className="md:col-span-4 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl">self_improvement</span>
            <span className="font-display-lg text-on-primary text-2xl font-bold tracking-tight">
              {siteConfig.siteName}
            </span>
          </div>
          <p className="font-body-md text-on-primary-container/70 text-sm leading-relaxed mt-1">
            Connecting global seekers with the authentic roots of Himalayan yoga, traditional Ayurveda, and sacred heritage. We offer luxury wellness sanctuaries for self-discovery and transformation.
          </p>

          <div className="flex items-start gap-2.5 text-xs text-on-primary-container/80 pt-1">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-base mt-0.5 select-none">location_on</span>
            <div>
              <p className="font-bold text-on-primary">Globazon Enterprises LLC</p>
              <p className="text-on-primary-container/70">30 N Gould St Ste R, Sheridan, WY 82801</p>
            </div>
          </div>

          <div className="bg-[#0c3c29] p-4 rounded-xl border border-on-primary-container/10 w-full mt-2">
            <span className="text-[10px] font-label-price text-tertiary-fixed-dim uppercase tracking-wider block mb-1">
              Sanctuary Mission
            </span>
            <p className="font-quote-italic text-sm text-on-primary/95 italic">
              "Yoga is the journey of the self, through the self, to the self." — The Bhagavad Gita
            </p>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="md:col-span-2 md:col-start-6 flex flex-col gap-4">
          <h4 className="font-label-price font-bold text-tertiary-fixed-dim uppercase tracking-wider text-xs">
            Destinations
          </h4>
          <ul className="space-y-3 text-sm text-on-primary-container/80">
            {siteConfig.destinations.map((dest) => (
              <li key={dest.id || dest.name}>
                <Link
                  href={`/packages?location=${encodeURIComponent(dest.locationQuery || dest.name)}`}
                  className="hover:text-tertiary-fixed transition-colors flex items-center gap-1 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  {dest.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="font-label-price font-bold text-tertiary-fixed-dim uppercase tracking-wider text-xs">
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm text-on-primary-container/80">
            <li>
              <Link href="/packages" className="hover:text-tertiary-fixed transition-colors">
                Retreat Packages
              </Link>
            </li>
            <li>
              <Link href="/programmes" className="hover:text-tertiary-fixed transition-colors">
                Ayurveda Programs
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-tertiary-fixed transition-colors">
                Wellness Journal &amp; Blog
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-tertiary-fixed transition-colors">
                Our Lineage &amp; Story
              </Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-tertiary-fixed transition-colors">
                Sacred Photo Gallery
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="hover:text-tertiary-fixed transition-colors">
                Help &amp; FAQs
              </Link>
            </li>
          </ul>
        </div>

        {/* Accreditations & Certifications */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <h4 className="font-label-price font-bold text-tertiary-fixed-dim uppercase tracking-wider text-xs">
            Accreditation &amp; Trust
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-on-primary-container/10">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl">verified_user</span>
              <div>
                <p className="text-xs font-bold text-on-primary">Ministry of Tourism India</p>
                <p className="text-[10px] text-on-primary-container/70">Approved Wellness Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-on-primary-container/10">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl">spa</span>
              <div>
                <p className="text-xs font-bold text-on-primary">Yoga Alliance USA</p>
                <p className="text-[10px] text-on-primary-container/70">Certified Retreat Directors</p>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-2">
            <h4 className="font-label-price font-bold text-tertiary-fixed-dim uppercase tracking-wider text-xs mb-3">
              Follow Our Journey
            </h4>
            <div className="flex flex-wrap gap-2">
              <a href="https://www.facebook.com/share/1D1aRiMwFp/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook" title="Facebook"
                className="w-9 h-9 rounded-full border border-on-primary-container/30 hover:border-[#1877F2] hover:bg-[#1877F2]/20 flex items-center justify-center transition-all text-on-primary-container hover:text-[#1877F2]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/indiayogatourismm?stkn=MWR3OHQ1OHF6ejcwcw==" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram" title="Instagram"
                className="w-9 h-9 rounded-full border border-on-primary-container/30 hover:border-[#E4405F] hover:bg-[#E4405F]/20 flex items-center justify-center transition-all text-on-primary-container hover:text-[#E4405F]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com/indiayogatou?s=11&t=kMtmwEBJvVxacSVU1uRRHA" target="_blank" rel="noopener noreferrer"
                aria-label="X (Twitter)" title="X (Twitter)"
                className="w-9 h-9 rounded-full border border-on-primary-container/30 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all text-on-primary-container hover:text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.737l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.reddit.com/u/indiayogatourism/s/NFnMuneKBH" target="_blank" rel="noopener noreferrer"
                aria-label="Reddit" title="Reddit"
                className="w-9 h-9 rounded-full border border-on-primary-container/30 hover:border-[#FF4500] hover:bg-[#FF4500]/20 flex items-center justify-center transition-all text-on-primary-container hover:text-[#FF4500]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              </a>
              <a href="https://www.threads.com/@indiayogatourismm?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noopener noreferrer"
                aria-label="Threads" title="Threads"
                className="w-9 h-9 rounded-full border border-on-primary-container/30 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all text-on-primary-container hover:text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.523-8.482C5.852 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.371-.887h-.048c-.848 0-1.835.271-2.452 1.092l-1.655-1.168c.986-1.364 2.5-2.072 4.109-2.072h.085c3.247.038 5.155 2.038 5.351 5.53l.003.07a8.4 8.4 0 0 1 1.179.59c1.088.659 1.906 1.575 2.363 2.649.849 1.966.827 5.002-1.302 7.096-1.763 1.74-3.963 2.517-7.157 2.545zm1.777-7.726c-1.878.096-3.003.904-2.947 2.119.04.827.636 1.497 1.867 1.574 1.327-.016 2.287-.48 2.924-1.416.354-.521.592-1.22.71-2.086a10.868 10.868 0 0 0-2.554-.191z"/></svg>
              </a>
              <a href="https://in.linkedin.com/in/india-yoga-tourism-130709436" target="_blank" rel="noopener noreferrer"
                aria-label="LinkedIn" title="LinkedIn"
                className="w-9 h-9 rounded-full border border-on-primary-container/30 hover:border-[#0A66C2] hover:bg-[#0A66C2]/20 flex items-center justify-center transition-all text-on-primary-container hover:text-[#0A66C2]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom bar */}
      <div className="border-t border-on-primary-container/10 bg-black/10 relative z-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <p className="font-body-md text-xs text-on-primary-container/60">
              © {new Date().getFullYear()} India Yoga Tourism. Crafted for pilgrims of self-transformation. All rights reserved.
            </p>
            <p className="font-body-md text-[11px] text-on-primary-container/50">
              Globazon Enterprises LLC · 30 N Gould St Ste R, Sheridan, WY 82801
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 sm:pr-48 md:pr-56">
            <button
              onClick={scrollToTop}
              className="bg-white/5 hover:bg-white/10 text-on-primary hover:text-tertiary-fixed px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border border-on-primary-container/10 cursor-pointer min-h-[40px]"
            >
              Back to Top
              <span className="material-symbols-outlined text-xs">arrow_upward</span>
            </button>

            <div className="flex gap-2.5 flex-wrap justify-center md:justify-end">
              <a href="https://www.facebook.com/share/1D1aRiMwFp/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-[#1877F2] hover:bg-[#1877F2]/20 hover:text-[#1877F2] flex items-center justify-center transition-all text-on-primary-container">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/indiayogatourismm?stkn=MWR3OHQ1OHF6ejcwcw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-[#E4405F] hover:bg-[#E4405F]/20 hover:text-[#E4405F] flex items-center justify-center transition-all text-on-primary-container">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com/indiayogatou?s=11&t=kMtmwEBJvVxacSVU1uRRHA" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" title="X (Twitter)"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-white hover:bg-white/10 hover:text-white flex items-center justify-center transition-all text-on-primary-container">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.737l7.73-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.reddit.com/u/indiayogatourism/s/NFnMuneKBH" target="_blank" rel="noopener noreferrer" aria-label="Reddit" title="Reddit"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-[#FF4500] hover:bg-[#FF4500]/20 hover:text-[#FF4500] flex items-center justify-center transition-all text-on-primary-container">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              </a>
              <a href="https://www.threads.com/@indiayogatourismm?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noopener noreferrer" aria-label="Threads" title="Threads"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-white hover:bg-white/10 hover:text-white flex items-center justify-center transition-all text-on-primary-container">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.858-6.43 2.523-8.482C5.852 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.371-.887h-.048c-.848 0-1.835.271-2.452 1.092l-1.655-1.168c.986-1.364 2.5-2.072 4.109-2.072h.085c3.247.038 5.155 2.038 5.351 5.53l.003.07a8.4 8.4 0 0 1 1.179.59c1.088.659 1.906 1.575 2.363 2.649.849 1.966.827 5.002-1.302 7.096-1.763 1.74-3.963 2.517-7.157 2.545zm1.777-7.726c-1.878.096-3.003.904-2.947 2.119.04.827.636 1.497 1.867 1.574 1.327-.016 2.287-.48 2.924-1.416.354-.521.592-1.22.71-2.086a10.868 10.868 0 0 0-2.554-.191z"/></svg>
              </a>
              <a href="https://in.linkedin.com/in/india-yoga-tourism-130709436" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-[#0A66C2] hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] flex items-center justify-center transition-all text-on-primary-container">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
