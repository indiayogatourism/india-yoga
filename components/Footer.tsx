'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

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
              India Yoga Tourism
            </span>
          </div>
          <p className="font-body-md text-on-primary-container/70 text-sm leading-relaxed mt-2">
            Connecting global seekers with the authentic roots of Himalayan yoga, traditional Ayurveda, and sacred heritage. We offer luxury wellness sanctuaries for self-discovery and transformation.
          </p>
          <div className="bg-[#0c3c29] p-4 rounded-xl border border-on-primary-container/10 w-full mt-4">
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
            <li>
              <Link href="/packages?location=Rishikesh" className="hover:text-tertiary-fixed transition-colors flex items-center gap-1 group">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Rishikesh Sanctuary
              </Link>
            </li>
            <li>
              <Link href="/packages?location=Kerala" className="hover:text-tertiary-fixed transition-colors flex items-center gap-1 group">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Kerala Backwaters
              </Link>
            </li>
            <li>
              <Link href="/packages?location=Dharamshala" className="hover:text-tertiary-fixed transition-colors flex items-center gap-1 group">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                Dharamshala Hills
              </Link>
            </li>
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
        </div>
      </div>

      {/* Footer Bottom bar */}
      <div className="border-t border-on-primary-container/10 bg-black/10 relative z-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body-md text-xs text-on-primary-container/60 text-center md:text-left">
            © {new Date().getFullYear()} India Yoga Tourism. Crafted for pilgrims of self-transformation. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6">
            <div className="flex gap-4">
              <a
                aria-label="Instagram"
                href="https://instagram.com/indiayogatourism"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-tertiary-fixed-dim hover:text-tertiary-fixed flex items-center justify-center transition-colors text-on-primary-container"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </a>
              <a
                aria-label="Facebook"
                href="https://facebook.com/indiayogatourism"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full border border-on-primary-container/30 hover:border-tertiary-fixed-dim hover:text-tertiary-fixed flex items-center justify-center transition-colors text-on-primary-container"
              >
                <span className="material-symbols-outlined text-base">public</span>
              </a>
            </div>
            
            <button
              onClick={scrollToTop}
              className="bg-white/5 hover:bg-white/10 text-on-primary hover:text-tertiary-fixed px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border border-on-primary-container/10 cursor-pointer min-h-[40px]"
            >
              Back to Top
              <span className="material-symbols-outlined text-xs">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
