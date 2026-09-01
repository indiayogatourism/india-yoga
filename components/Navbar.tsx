'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const defaultDests = [
    { id: '1', name: 'Rishikesh', subtitle: 'Yoga Capital of the World', locationQuery: 'Rishikesh', icon: 'landscape' },
    { id: '2', name: 'Kerala', subtitle: 'Traditional Ayurvedic Sanctuary', locationQuery: 'Kerala', icon: 'spa' },
    { id: '3', name: 'Dharamshala', subtitle: 'Peace in the Himalayan foothills', locationQuery: 'Dharamshala', icon: 'filter_drama' },
  ]

  const [siteConfig, setSiteConfig] = useState({
    siteName: 'India Yoga Tourism',
    siteTagline: 'Himalayan Wellness & Wisdom',
    announcementText: '',
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
            siteTagline: data.config.siteTagline || 'Himalayan Wellness & Wisdom',
            announcementText: data.config.announcementText || '',
            destinations: dests,
          })
        }
      } catch (err) {
        // Fallback
      }
    }
    fetchConfig()
  }, [])

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const isAdmin = userEmail === 'indiayogatourism@gmail.com' || user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHoveredLink(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { name: 'Retreats', href: '/packages', hasDropdown: true },
    { name: 'Programs', href: '/programmes', hasDropdown: false },
    { name: 'Blog', href: '/blog', hasDropdown: false },
    { name: 'Know More', href: '/know-more', hasDropdown: false },
    { name: 'Online Classes', href: '/online-classes', hasDropdown: false },
    { name: 'Gallery', href: '/gallery', hasDropdown: false },
    { name: 'About', href: '/about', hasDropdown: false },
    { name: 'Contact', href: '/contact', hasDropdown: false },
  ]

  const featuredDestinations = [
    { title: 'Rishikesh', desc: 'Yoga Capital of the World', href: '/packages?location=Rishikesh', icon: 'landscape' },
    { title: 'Kerala', desc: 'Traditional Ayurvedic Sanctuary', href: '/packages?location=Kerala', icon: 'spa' },
    { title: 'Dharamshala', desc: 'Peace in the Himalayan foothills', href: '/packages?location=Dharamshala', icon: 'filter_drama' }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled ? 'p-0' : 'py-3 md:py-4 px-3 sm:px-6 md:px-8'
      }`}
    >
      <nav
        className={`transition-all duration-500 ease-in-out relative ${
          scrolled
            ? 'w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-black/10 py-3 px-6 md:px-12 shadow-md rounded-none'
            : 'max-w-[1280px] mx-auto bg-[#012d1d]/85 backdrop-blur-xl border border-white/20 py-3.5 px-6 md:px-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)] rounded-2xl md:rounded-full'
        }`}
      >
        <div className="flex justify-between items-center relative">
          
          {/* Brand Logo with Dynamic Transition */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
            <div
              className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-500 shrink-0 ${
                scrolled ? 'bg-[#012d1d]/10 group-hover:bg-[#012d1d]/20' : 'bg-white/15 border border-white/25 group-hover:bg-white/25'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl sm:text-2xl group-hover:rotate-12 transition-transform duration-500 ${
                  scrolled ? 'text-[#012d1d]' : 'text-[#f6be39]'
                }`}
              >
                self_improvement
              </span>
              <div
                className={`absolute inset-0 rounded-full transition-transform duration-500 group-hover:scale-110 ${
                  scrolled ? 'border border-[#f6be39]/40' : 'border border-white/30'
                }`}
              ></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-display-lg text-base sm:text-xl md:text-2xl font-bold tracking-tight leading-none transition-colors truncate ${
                  scrolled ? 'text-[#012d1d]' : 'text-white'
                }`}
              >
                {siteConfig.siteName}
              </span>
              <span
                className={`text-[8px] sm:text-[9px] font-label-price uppercase tracking-widest mt-1 truncate transition-colors ${
                  scrolled ? 'text-[#2c694e] font-bold' : 'text-[#e2c799] font-medium'
                }`}
              >
                {siteConfig.siteTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8" ref={dropdownRef}>
            <div className="flex items-center gap-6 relative">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative py-2"
                  onMouseEnter={() => setHoveredLink(link.hasDropdown ? link.name : null)}
                >
                  <Link
                    href={link.href}
                    className={`relative font-body-md text-sm md:text-base transition-colors duration-300 py-1 px-1 flex items-center gap-1 ${
                      scrolled
                        ? isActive(link.href)
                          ? 'text-[#012d1d] font-bold'
                          : 'text-[#1C2E26] hover:text-[#2c694e] font-semibold'
                        : isActive(link.href)
                        ? 'text-[#f6be39] font-bold'
                        : 'text-white/90 hover:text-[#f6be39] font-medium'
                    }`}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <span
                        className={`material-symbols-outlined text-xs transition-transform duration-300 ${
                          hoveredLink === link.name ? 'rotate-180' : ''
                        } ${scrolled ? 'text-[#1C2E26]/70' : 'text-white/70'}`}
                      >
                        keyboard_arrow_down
                      </span>
                    )}
                    
                    {/* Animated indicator bar */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 ${
                        scrolled ? 'bg-[#012d1d]' : 'bg-[#f6be39]'
                      } ${isActive(link.href) ? 'w-full' : 'w-0 hover:w-full'}`}
                      style={{
                        left: isActive(link.href) ? '0' : '50%',
                        transform: isActive(link.href) ? 'none' : 'translateX(-50%)',
                      }}
                    ></span>
                  </Link>
                </div>
              ))}

              {/* Mega Dropdown Panel for Retreats */}
              {hoveredLink === 'Retreats' && (
                <div
                  className={`absolute top-full left-0 mt-3 w-[480px] rounded-2xl shadow-2xl p-6 grid grid-cols-1 gap-4 animate-fade-in z-50 ${
                    scrolled
                      ? 'bg-[#FAF7F2] text-[#1C2E26] border border-black/10'
                      : 'bg-[#012d1d]/95 text-white border border-white/20 backdrop-blur-xl'
                  }`}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <div className={`border-b pb-3 ${scrolled ? 'border-black/10' : 'border-white/15'}`}>
                    <h4 className={`font-headline-md text-lg font-bold ${scrolled ? 'text-[#012d1d]' : 'text-[#f6be39]'}`}>
                      Explore Retreat Sanctuaries
                    </h4>
                    <p className={`text-xs ${scrolled ? 'text-gray-600' : 'text-white/70'}`}>
                      Carefully selected destinations for traditional practice.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {siteConfig.destinations.map((dest) => (
                      <Link
                        key={dest.id || dest.name}
                        href={`/packages?location=${encodeURIComponent(dest.locationQuery || dest.name)}`}
                        onClick={() => setHoveredLink(null)}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group/item ${
                          scrolled ? 'hover:bg-[#012d1d]/5' : 'hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                            scrolled
                              ? 'bg-[#2c694e]/10 text-[#2c694e] group-hover/item:bg-[#2c694e] group-hover/item:text-white'
                              : 'bg-white/10 text-[#f6be39] group-hover/item:bg-[#f6be39] group-hover/item:text-[#012d1d]'
                          }`}
                        >
                          <span className="material-symbols-outlined">{dest.icon || 'landscape'}</span>
                        </div>
                        <div>
                          <h5
                            className={`font-bold text-sm transition-colors ${
                              scrolled
                                ? 'text-[#012d1d] group-hover/item:text-[#2c694e]'
                                : 'text-white group-hover/item:text-[#f6be39]'
                            }`}
                          >
                            {dest.name}
                          </h5>
                          <p className={`text-xs ${scrolled ? 'text-gray-500' : 'text-white/60'}`}>{dest.subtitle}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div
                    className={`rounded-xl p-3 flex justify-between items-center mt-2 ${
                      scrolled ? 'bg-[#012d1d]/5' : 'bg-white/10'
                    }`}
                  >
                    <span className={`text-xs font-bold ${scrolled ? 'text-[#012d1d]' : 'text-white'}`}>
                      Need personalized help?
                    </span>
                    <Link
                      href="/contact"
                      className={`text-xs hover:underline font-bold flex items-center gap-0.5 ${
                        scrolled ? 'text-[#2c694e]' : 'text-[#f6be39]'
                      }`}
                      onClick={() => setHoveredLink(null)}
                    >
                      Contact Guru <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Sign In and Booking CTAs */}
            <div className="flex items-center gap-5">
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <Link
                    href={isAdmin ? '/admin' : '/dashboard'}
                    className={`font-body-md font-bold text-sm transition-colors flex items-center gap-1.5 ${
                      scrolled ? 'text-[#012d1d] hover:text-[#2c694e]' : 'text-white hover:text-[#f6be39]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isAdmin ? 'admin_panel_settings' : 'dashboard'}
                    </span>
                    {isAdmin ? 'Admin' : 'Dashboard'}
                  </Link>
                  <div
                    className={`p-0.5 rounded-full border-2 hover:scale-105 transition-transform ${
                      scrolled ? 'border-[#f6be39]' : 'border-white/50'
                    }`}
                  >
                    <UserButton />
                  </div>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className={`font-body-md font-bold transition-colors text-sm cursor-pointer ${
                      scrolled ? 'text-[#1C2E26] hover:text-[#012d1d]' : 'text-white/90 hover:text-[#f6be39]'
                    }`}
                  >
                    Login
                  </button>
                </SignInButton>
              )}

              <Link href="/packages">
                <button
                  className={`relative px-6 py-3 rounded-full transition-all duration-300 font-bold active:scale-95 cursor-pointer shadow-md overflow-hidden group ${
                    scrolled
                      ? 'bg-[#012d1d] text-white hover:bg-[#1b4332]'
                      : 'bg-gradient-to-r from-[#f6be39] to-[#d19e14] text-[#012d1d] hover:shadow-[0_0_20px_rgba(246,190,57,0.5)] hover:scale-105'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5 text-sm">
                    Book Sanctuary
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 cursor-pointer focus:outline-none w-11 h-11 min-w-[44px] min-h-[44px] rounded-full active:scale-95 flex items-center justify-center transition-all ${
              scrolled ? 'text-[#012d1d] hover:bg-black/5' : 'text-white hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden absolute top-full left-0 w-full shadow-2xl py-6 px-6 max-h-[calc(100vh-80px)] overflow-y-auto animate-fade-in z-50 ${
              scrolled
                ? 'bg-[#FAF7F2] text-[#1C2E26] border-t border-black/10'
                : 'bg-[#012d1d]/95 text-white border-t border-white/20 backdrop-blur-xl rounded-b-2xl'
            }`}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-body-md text-base py-2.5 px-1 border-b flex justify-between items-center ${
                    scrolled
                      ? isActive(link.href)
                        ? 'text-[#012d1d] font-bold border-black/10'
                        : 'text-[#1C2E26] font-semibold border-black/5'
                      : isActive(link.href)
                      ? 'text-[#f6be39] font-bold border-white/20'
                      : 'text-white/90 font-medium border-white/10'
                  }`}
                >
                  {link.name}
                  <span className="material-symbols-outlined text-xs opacity-70">
                    chevron_right
                  </span>
                </Link>
              ))}
              
              <hr className={`my-1 ${scrolled ? 'border-black/10' : 'border-white/20'}`} />

              {isSignedIn ? (
                <div className="flex items-center justify-between py-2.5">
                  <Link
                    href={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-body-md font-bold flex items-center gap-2 text-sm ${
                      scrolled ? 'text-[#012d1d]' : 'text-[#f6be39]'
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {isAdmin ? 'admin_panel_settings' : 'dashboard'}
                    </span>
                    {isAdmin ? 'Admin Panel' : 'Guest Dashboard'}
                  </Link>
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className={`w-full text-left font-body-md font-bold py-2.5 flex items-center gap-2 text-sm ${
                      scrolled ? 'text-[#1C2E26]' : 'text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined">login</span>
                    Login to Account
                  </button>
                </SignInButton>
              )}

              <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="mt-2">
                <button
                  className={`w-full py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform text-sm ${
                    scrolled
                      ? 'bg-[#012d1d] text-white'
                      : 'bg-gradient-to-r from-[#f6be39] to-[#d19e14] text-[#012d1d]'
                  }`}
                >
                  Book Sanctuary
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
