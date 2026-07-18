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

  const isAdmin = user?.publicMetadata?.role === 'admin'

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
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'bg-surface/90 backdrop-blur-md py-4 border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(27,67,50,0.04)]'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 max-w-[1280px] mx-auto relative">
        
        {/* Brand Logo with Premium Styling */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all-300 duration-500">
            <span className="material-symbols-outlined text-primary text-2xl group-hover:rotate-12 transition-transform duration-500">
              self_improvement
            </span>
            <div className="absolute inset-0 rounded-full border border-tertiary-fixed-dim/30 group-hover:scale-110 transition-transform duration-500"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-display-lg text-primary text-xl md:text-2xl font-bold tracking-tight leading-none group-hover:text-primary transition-colors">
              Indian Yoga Tourism
            </span>
            <span className="text-[9px] font-label-price text-secondary uppercase tracking-widest mt-1">
              Himalayan Wellness &amp; Wisdom
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
                  className={`relative font-body-md text-sm md:text-base transition-colors duration-300 font-medium py-1 px-1 flex items-center gap-1 ${
                    isActive(link.href)
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {link.name}
                  {link.hasDropdown && (
                    <span className={`material-symbols-outlined text-xs transition-transform duration-300 ${hoveredLink === link.name ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  )}
                  
                  {/* Premium animated bottom bar */}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-tertiary-fixed-dim transition-all duration-300 ${
                      isActive(link.href) ? 'w-full' : 'w-0 hover:w-full'
                    }`}
                    style={{ left: isActive(link.href) ? '0' : '50%', transform: isActive(link.href) ? 'none' : 'translateX(-50%)' }}
                  ></span>
                </Link>
              </div>
            ))}

            {/* Mega Dropdown Panel for Retreats */}
            {hoveredLink === 'Retreats' && (
              <div
                className="absolute top-full left-0 mt-2 w-[480px] bg-surface border border-outline-variant/30 rounded-2xl shadow-xl p-6 grid grid-cols-1 gap-4 animate-fade-in z-50 backdrop-blur-lg"
                onMouseLeave={() => setHoveredLink(null)}
              >
                <div className="border-b border-outline-variant/20 pb-3">
                  <h4 className="font-headline-md text-primary text-lg font-bold">Explore Retreat Sanctuaries</h4>
                  <p className="text-xs text-on-surface-variant">Carefully selected destinations for traditional practice.</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {featuredDestinations.map((dest) => (
                    <Link
                      key={dest.title}
                      href={dest.href}
                      onClick={() => setHoveredLink(null)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 group/item"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover/item:bg-secondary group-hover/item:text-on-secondary transition-colors duration-300">
                        <span className="material-symbols-outlined">{dest.icon}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-primary text-sm group-hover/item:text-secondary transition-colors">
                          {dest.title}
                        </h5>
                        <p className="text-xs text-on-surface-variant">{dest.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="bg-primary/5 rounded-xl p-3 flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-primary">Need personalized help?</span>
                  <Link
                    href="/contact"
                    className="text-xs text-secondary hover:underline font-bold flex items-center gap-0.5"
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
                  className="font-body-md font-bold text-primary text-sm hover:text-secondary transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isAdmin ? 'admin_panel_settings' : 'dashboard'}
                  </span>
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <div className="p-0.5 rounded-full border-2 border-tertiary-fixed-dim hover:scale-105 transition-transform">
                  <UserButton />
                </div>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="font-body-md font-bold text-on-surface-variant hover:text-primary transition-colors text-sm cursor-pointer">
                  Login
                </button>
              </SignInButton>
            )}

            <Link href="/packages">
              <button className="relative bg-primary text-on-primary px-6 py-3 rounded-full hover:bg-primary-container transition-all font-bold active:scale-95 cursor-pointer shadow-md overflow-hidden group">
                <span className="relative z-10 flex items-center gap-1.5 text-sm">
                  Book Sanctuary
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-primary p-2 cursor-pointer focus:outline-none w-10 h-10 rounded-full hover:bg-primary/5 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-lg absolute top-full left-0 w-full shadow-lg border-t border-outline-variant/20 py-6 px-6 animate-fade-in">
          <div className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-body-md text-base py-1 border-b border-outline-variant/10 flex justify-between items-center ${
                  isActive(link.href)
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant'
                }`}
              >
                {link.name}
                <span className="material-symbols-outlined text-xs text-outline-variant">
                  chevron_right
                </span>
              </Link>
            ))}
            
            <hr className="border-outline-variant/30 my-2" />

            {isSignedIn ? (
              <div className="flex items-center justify-between py-2">
                <Link
                  href={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-body-md font-bold text-primary flex items-center gap-2"
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
                <button className="w-full text-left font-body-md font-bold text-on-surface-variant py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined">login</span>
                  Login to Account
                </button>
              </SignInButton>
            )}

            <Link href="/packages" onClick={() => setMobileMenuOpen(false)} className="mt-2">
              <button className="bg-primary text-on-primary w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-md">
                Book Sanctuary
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
