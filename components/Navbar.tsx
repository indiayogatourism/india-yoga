'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { ArrowRight, ArrowUpRight, BookOpen, Camera, ChevronDown, Compass, Leaf, MapPin, Menu, Mountain, Play, UserRound, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DestinationItem } from '@/lib/siteConfig'

type NavbarConfig = {
  siteName: string
  siteTagline: string
  announcementText: string
  destinations: DestinationItem[]
}
type MenuKey = 'retreats' | 'wellness' | 'discover'
type MenuLink = { label: string; href: string; description: string; icon: LucideIcon }
type NavItem = MenuLink & { menu?: MenuKey }

const defaultDestinations: DestinationItem[] = [
  { id: '1', name: 'Rishikesh', subtitle: 'Yoga Capital of the World', locationQuery: 'Rishikesh', icon: 'landscape' },
  { id: '2', name: 'Kerala', subtitle: 'Traditional Ayurvedic Sanctuary', locationQuery: 'Kerala', icon: 'spa' },
  { id: '3', name: 'Dharamshala', subtitle: 'Peace in the Himalayan foothills', locationQuery: 'Dharamshala', icon: 'filter_drama' },
]

const menuGroups: Record<MenuKey, { eyebrow: string; title: string; description: string; href: string; linkText: string; links: MenuLink[] }> = {
  retreats: {
    eyebrow: 'A CHANGE OF PACE', title: 'A journey back to yourself.',
    description: 'Find a retreat that fits your practice, your pace and your travel plans.',
    href: '/packages', linkText: 'Explore all retreats',
    links: [
      { label: 'Yoga retreats', href: '/packages?category=RETREAT', description: 'Short escapes and longer immersions', icon: Compass },
      { label: 'Yoga & meditation', href: '/packages?search=meditation', description: 'Space to breathe and reconnect', icon: Leaf },
      { label: 'Himalayan journeys', href: '/packages?category=TREK', description: 'Explore mountain travel experiences', icon: Mountain },
    ],
  },
  wellness: {
    eyebrow: 'MAKE ROOM FOR WELL-BEING', title: 'Slow down. Find your balance.',
    description: 'Explore traditional approaches to well-being, with program details to guide your choice.',
    href: '/programmes', linkText: 'Browse wellness programs',
    links: [
      { label: 'Ayurveda programs', href: '/programmes', description: 'Explore programs and provider details', icon: Leaf },
      { label: 'Panchakarma', href: '/panchakarma-retreat-rishikesh', description: 'Learn about programs in Rishikesh', icon: Compass },
      { label: 'Yoga & meditation', href: '/packages?search=meditation', description: 'Discover mindful practices and stays', icon: Mountain },
    ],
  },
  discover: {
    eyebrow: 'BEYOND THE ITINERARY', title: 'A little inspiration goes a long way.',
    description: 'Get to know the places, practices and stories behind your next journey.',
    href: '/know-more', linkText: 'Explore our guides',
    links: [
      { label: 'The wellness journal', href: '/blog', description: 'Stories on yoga, Ayurveda and travel', icon: BookOpen },
      { label: 'Guides & resources', href: '/know-more', description: 'A thoughtful place to start planning', icon: Compass },
      { label: 'Photo gallery', href: '/gallery', description: 'A closer look at the experience', icon: Camera },
      { label: 'Our story', href: '/about', description: 'Meet India Yoga Tourism', icon: Leaf },
    ],
  },
}

const navItems: NavItem[] = [
  { label: 'Retreats', href: '/packages', description: 'Find your next mindful escape', icon: Compass, menu: 'retreats' },
  { label: 'Wellness', href: '/programmes', description: 'Ayurveda, Panchakarma & meditation', icon: Leaf, menu: 'wellness' },
  { label: 'Online Classes', href: '/online-classes', description: 'Make space for practice, wherever you are', icon: Play },
  { label: 'Discover', href: '/know-more', description: 'Stories, guides & a closer look', icon: BookOpen, menu: 'discover' },
  { label: 'Contact', href: '/contact', description: 'Let’s plan your next chapter', icon: ArrowUpRight },
]
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58b39] focus-visible:ring-offset-4'

export default function Navbar({ initialConfig }: { initialConfig?: Partial<NavbarConfig> }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<'explore' | 'destinations'>('explore')
  const [mobileGroup, setMobileGroup] = useState<MenuKey | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [siteConfig, setSiteConfig] = useState<NavbarConfig>({
    siteName: initialConfig?.siteName || 'India Yoga Tourism',
    siteTagline: initialConfig?.siteTagline || 'Ancient Wisdom. Modern Journey.',
    announcementText: initialConfig?.announcementText || '',
    destinations: initialConfig?.destinations ?? defaultDestinations,
  })

  useEffect(() => {
    if (initialConfig) return
    const controller = new AbortController()
    async function fetchConfig() {
      try {
        const response = await fetch('/api/site-config', { signal: controller.signal })
        const data = await response.json()
        if (!data.success || !data.config) return
        let destinations = defaultDestinations
        try {
          const parsed = JSON.parse(data.config.destinationsJson || 'null') as DestinationItem[] | null
          if (Array.isArray(parsed)) destinations = parsed.filter((destination) => destination && typeof destination.name === 'string')
        } catch { /* Keep the existing defaults if saved destination data is invalid. */ }
        setSiteConfig({
          siteName: data.config.siteName || 'India Yoga Tourism',
          siteTagline: data.config.siteTagline || 'Ancient Wisdom. Modern Journey.',
          announcementText: data.config.announcementText || '',
          destinations,
        })
      } catch { /* Server-provided settings or defaults remain available. */ }
    }
    fetchConfig()
    return () => controller.abort()
  }, [initialConfig])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setActiveMenu(null)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setActiveMenu(null)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const trigger = headerRef.current?.querySelector<HTMLButtonElement>('button[id^="nav-trigger-"][aria-expanded="true"]')
        setActiveMenu(null)
        trigger?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1280px)')
    const handleResize = () => { if (desktop.matches) setMobileMenuOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    desktop.addEventListener('change', handleResize)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
      desktop.removeEventListener('change', handleResize)
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const returnFocusTo = menuTriggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key === 'Escape') { setMobileMenuOpen(false); return }
      if (event.key !== 'Tab' || !dialogRef.current?.contains(document.activeElement)) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')).filter((element) => element.getClientRects().length > 0)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      returnFocusTo?.focus()
    }
  }, [mobileMenuOpen])

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const isAdmin = userEmail === 'indiayogatourism@gmail.com' || user?.publicMetadata?.role === 'admin'
  const closeMenus = () => { setActiveMenu(null); setMobileMenuOpen(false) }
  const openDesktopMenu = (menu: MenuKey) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setActiveMenu(menu)
  }
  const itemIsActive = (item: NavItem) => {
    const matches = (href: string) => !href.includes('?') && (pathname === href || pathname.startsWith(`${href}/`))
    return matches(item.href) || (item.menu ? menuGroups[item.menu].links.some((link) => matches(link.href)) : false)
  }
  const activeGroup = activeMenu ? menuGroups[activeMenu] : null
  const account = (mobile: boolean) => !isLoaded ? (
    <span className="inline-flex h-10 w-16 items-center justify-center" aria-label="Loading account"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-50" /></span>
  ) : isSignedIn ? (
    <div className="flex items-center gap-3">
      <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={closeMenus} className={`text-xs font-semibold whitespace-nowrap ${focusRing}`}>{isAdmin ? 'Admin' : 'Dashboard'}</Link>
      <UserButton />
    </div>
  ) : (
    <SignInButton mode="modal">
      <button type="button" onClick={mobile ? closeMenus : undefined} className={`inline-flex items-center gap-2 rounded-full px-2 py-2 text-xs font-semibold whitespace-nowrap ${focusRing}`}><UserRound size={16} aria-hidden="true" />Sign in</button>
    </SignInButton>
  )

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-6 md:py-4"
      onMouseEnter={() => { if (hoverTimer.current) clearTimeout(hoverTimer.current) }}
      onMouseLeave={() => { hoverTimer.current = setTimeout(() => setActiveMenu(null), 180) }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveMenu(null) }}>
      <div className={`relative mx-auto max-w-[1320px] rounded-[22px] border transition-colors duration-300 ${scrolled || activeMenu ? 'border-[#ddd9cc] bg-[#fcfaf5]/95 text-[#173d2e] shadow-[0_8px_32px_rgba(12,38,28,0.12)] backdrop-blur-xl' : 'border-white/20 bg-[#0d3328]/95 text-[#faf7ef] shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-xl'}`}>
        <nav aria-label="Main navigation" className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-7">
          <Link href="/" onClick={closeMenus} className={`flex min-w-0 items-center gap-3 rounded-lg ${focusRing}`} aria-label={`${siteConfig.siteName} home`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fffefb] ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="" width={240} height={201} className="h-auto w-8" />
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate font-display-lg text-[17px] leading-none tracking-[-0.04em] sm:text-[22px]">{siteConfig.siteName}</span>
              <span className={`max-w-[210px] truncate text-[7px] font-semibold uppercase tracking-[0.15em] sm:text-[8px] ${scrolled || activeMenu ? 'text-[#5f6e58]' : 'text-[#d6c29a]'}`}>{siteConfig.siteTagline}</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const selected = itemIsActive(item) || activeMenu === item.menu
              const className = `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5 text-[13px] font-medium transition-colors ${focusRing} ${selected ? scrolled || activeMenu ? 'bg-[#e9eee4] text-[#173d2e]' : 'bg-white/10 text-[#f0d79b]' : scrolled || activeMenu ? 'hover:bg-[#eeeee5]' : 'hover:bg-white/10'}`
              return item.menu ? (
                <button key={item.label} type="button" id={`nav-trigger-${item.menu}`} aria-expanded={activeMenu === item.menu} aria-controls={`nav-panel-${item.menu}`} className={className}
                  onMouseEnter={() => openDesktopMenu(item.menu!)}
                  onClick={(event) => { if (event.detail === 0) setActiveMenu(activeMenu === item.menu ? null : item.menu!); else openDesktopMenu(item.menu!) }}
                  onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); openDesktopMenu(item.menu!); requestAnimationFrame(() => document.querySelector<HTMLElement>(`#nav-panel-${item.menu} a`)?.focus()) } }}>
                  {item.label}<ChevronDown size={13} className={`transition-transform ${activeMenu === item.menu ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              ) : (
                <Link key={item.label} href={item.href} className={className} aria-current={itemIsActive(item) ? 'page' : undefined} onMouseEnter={() => setActiveMenu(null)} onClick={closeMenus}>{item.label}</Link>
              )
            })}
          </div>

          <div className="hidden shrink-0 items-center gap-4 xl:flex">
            <div className="border-r border-current/15 pr-4">{account(false)}</div>
            <Link href="/packages" onClick={closeMenus} className={`group inline-flex items-center gap-4 rounded-full bg-[#ecd59d] px-5 py-3 text-xs font-bold text-[#153c2b] transition-colors hover:bg-[#f5dfac] ${focusRing}`}>Find a retreat<ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></Link>
          </div>

          <button ref={menuTriggerRef} type="button" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => { setActiveMenu(null); setMobileMenuOpen(true) }} className={`flex h-11 shrink-0 items-center gap-2 rounded-full border border-current/20 px-3.5 transition-colors hover:bg-current/5 xl:hidden ${focusRing}`}>
            <span className="hidden text-xs font-medium sm:inline">Explore</span><Menu size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </nav>

        {activeGroup && activeMenu && (
          <div className="absolute inset-x-0 top-full hidden pt-3 xl:block" id={`nav-panel-${activeMenu}`} aria-labelledby={`nav-trigger-${activeMenu}`}>
            <div className="site-nav-panel overflow-hidden rounded-[22px] border border-[#deded1] bg-[#fcfaf5] text-[#173d2e] shadow-[0_24px_64px_rgba(12,38,28,0.2)]">
              <div className={`grid max-h-[calc(100svh-210px)] overflow-y-auto ${activeMenu === 'retreats' ? 'grid-cols-[0.9fr_1.1fr_1fr]' : 'grid-cols-[0.9fr_1.5fr]'}`}>
                <div className="relative flex flex-col justify-between overflow-hidden bg-[#173d2e] p-8 text-[#faf7ef]">
                  <Compass size={120} strokeWidth={0.5} className="pointer-events-none absolute -bottom-7 -right-7 text-[#d8c28f]/15" aria-hidden="true" />
                  <div className="relative">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#d6c29a]">{activeGroup.eyebrow}</span>
                    <p className="mt-5 max-w-[270px] font-headline-md text-[35px] leading-[1.08]">{activeGroup.title}</p>
                    <p className="mt-4 max-w-[265px] text-xs leading-relaxed text-[#d6dfd3]">{activeGroup.description}</p>
                  </div>
                  <Link href={activeGroup.href} onClick={closeMenus} className={`relative mt-7 inline-flex items-center gap-3 self-start border-b border-[#d6c29a]/50 pb-2 text-xs font-semibold text-[#ead6a8] ${focusRing}`}>{activeGroup.linkText}<ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
                <div className="p-7">
                  <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6e58]">{activeMenu === 'discover' ? 'Get inspired' : 'Explore experiences'}</p>
                  <div className={activeMenu === 'discover' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}>
                    {activeGroup.links.map((link) => <Link key={link.href} href={link.href} onClick={closeMenus} className={`group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[#eeeee4] ${focusRing}`}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dedfd1] bg-white text-[#63785a] transition-colors group-hover:border-[#b8c4ad] group-hover:bg-[#e1e9da]"><link.icon size={17} strokeWidth={1.5} aria-hidden="true" /></span>
                      <span><span className="block text-[13px] font-semibold">{link.label}</span><span className="mt-1 block text-[11px] leading-relaxed text-[#5f6e58]">{link.description}</span></span>
                      <ArrowUpRight size={14} className="ml-auto mt-1 shrink-0 text-[#87927d]" aria-hidden="true" />
                    </Link>)}
                  </div>
                </div>
                {activeMenu === 'retreats' && <div className="my-7 border-l border-[#e2e1d5] px-7">
                  <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6e58]">Find your destination</p>
                  <div className="space-y-1">{siteConfig.destinations.map((destination) => <Link key={destination.id || destination.name} href={`/packages?location=${encodeURIComponent(destination.locationQuery || destination.name)}`} onClick={closeMenus} className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[#eeeee4] ${focusRing}`}>
                    <MapPin size={17} strokeWidth={1.5} className="shrink-0 text-[#6c7e5f]" aria-hidden="true" /><span className="min-w-0"><span className="block text-[13px] font-semibold">{destination.name}</span><span className="mt-0.5 block text-[10px] leading-relaxed text-[#5f6e58]">{destination.subtitle}</span></span><ArrowUpRight size={14} className="ml-auto shrink-0 text-[#87927d]" aria-hidden="true" />
                  </Link>)}</div>
                </div>}
              </div>
              <div className="flex items-center justify-between border-t border-[#e2e1d5] bg-[#f3f0e7] px-8 py-3.5 text-xs"><span className="text-[#5f6e58]">Not sure where to begin?</span><Link href="/contact" onClick={closeMenus} className={`flex items-center gap-2 font-semibold ${focusRing}`}>Let&apos;s talk about your journey<ArrowUpRight size={14} aria-hidden="true" /></Link></div>
            </div>
          </div>
        )}
      </div>

      {mobileMenuOpen && <div className="fixed inset-0 z-[80] xl:hidden">
        <button type="button" className="site-nav-backdrop absolute inset-0 cursor-default bg-[#09271e]/55 backdrop-blur-sm" tabIndex={-1} aria-label="Close navigation overlay" onClick={() => setMobileMenuOpen(false)} />
        <div ref={dialogRef} id="mobile-navigation" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" className="site-nav-drawer absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-[#fcfaf5] text-[#173d2e] shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-[#e4e2d6] px-6 py-5">
            <Link href="/" onClick={closeMenus} className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}><Compass size={22} strokeWidth={1.25} className="text-[#8c7951]" aria-hidden="true" /><span className="text-[10px] font-semibold uppercase tracking-[0.18em]">{siteConfig.siteName}</span></Link>
            <button ref={closeButtonRef} type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu" className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dece] hover:bg-[#e9eee2] ${focusRing}`}><X size={18} strokeWidth={1.5} aria-hidden="true" /></button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-7">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#78653e]">Make room for a new perspective</p>
            <h2 id="mobile-menu-title" className="font-headline-md text-[38px] leading-[1.05]">Explore India.<br /><span className="italic text-[#738468]">Find your own pace.</span></h2>
            <div className="mb-5 mt-6 flex gap-1 rounded-full border border-[#e2e3d7] bg-[#f0f0e6] p-1">
              {(['explore', 'destinations'] as const).map((section) => <button key={section} type="button" aria-pressed={mobileSection === section} onClick={() => setMobileSection(section)} className={`flex-1 rounded-full py-2.5 text-xs font-semibold capitalize transition-colors ${focusRing} ${mobileSection === section ? 'bg-white text-[#173d2e] shadow-sm' : 'text-[#5f6e58]'}`}>{section}</button>)}
            </div>

            <nav aria-label={mobileSection === 'explore' ? 'Explore India Yoga Tourism' : 'Destinations'}>
              {mobileSection === 'explore' ? <div className="space-y-1">{navItems.map((item, index) => <div key={item.label} className={`rounded-2xl ${mobileGroup === item.menu && item.menu ? 'bg-[#eef0e5]' : ''}`}>
                {item.menu ? <button type="button" aria-expanded={mobileGroup === item.menu} aria-controls={`mobile-group-${item.menu}`} onClick={() => setMobileGroup(mobileGroup === item.menu ? null : item.menu!)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left ${focusRing}`}>
                  <span className="text-[10px] tabular-nums text-[#5f6e58]">0{index + 1}</span><span className="min-w-0 flex-1"><span className="block font-headline-md text-[25px] leading-none">{item.label}</span><span className="mt-1.5 block text-[10px] leading-relaxed text-[#5f6e58]">{item.description}</span></span><ChevronDown size={16} className={`shrink-0 text-[#6d7a61] transition-transform ${mobileGroup === item.menu ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button> : <Link href={item.href} onClick={closeMenus} aria-current={itemIsActive(item) ? 'page' : undefined} className={`flex items-center gap-3 rounded-2xl px-3 py-4 hover:bg-[#eef0e5] ${focusRing}`}><span className="text-[10px] tabular-nums text-[#5f6e58]">0{index + 1}</span><span className="min-w-0 flex-1"><span className="block font-headline-md text-[25px] leading-none">{item.label}</span><span className="mt-1.5 block text-[10px] leading-relaxed text-[#5f6e58]">{item.description}</span></span><ArrowUpRight size={16} className="shrink-0 text-[#6d7a61]" aria-hidden="true" /></Link>}
                {item.menu && mobileGroup === item.menu && <div id={`mobile-group-${item.menu}`} className="site-nav-panel space-y-1 px-4 pb-4 pl-10">
                  <Link href={item.href} onClick={closeMenus} className={`flex items-center justify-between rounded-lg px-2 py-2.5 text-xs font-semibold ${focusRing}`}>View all {item.label.toLowerCase()}<ArrowUpRight size={13} aria-hidden="true" /></Link>
                  {menuGroups[item.menu].links.map((link) => <Link key={link.href} href={link.href} onClick={closeMenus} className={`flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-xs text-[#607155] hover:bg-white/70 ${focusRing}`}><link.icon size={14} strokeWidth={1.5} aria-hidden="true" />{link.label}</Link>)}
                </div>}
              </div>)}</div> : <div className="space-y-3">{siteConfig.destinations.map((destination, index) => <Link key={destination.id || destination.name} href={`/packages?location=${encodeURIComponent(destination.locationQuery || destination.name)}`} onClick={closeMenus} className={`group flex items-center gap-4 rounded-2xl border border-[#e0e2d4] bg-white p-5 hover:bg-[#eef0e5] ${focusRing}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf0e4] text-[#728363]">{index % 2 === 0 ? <Mountain size={22} strokeWidth={1.25} aria-hidden="true" /> : <Leaf size={22} strokeWidth={1.25} aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span className="block font-headline-md text-[25px]">{destination.name}</span><span className="block text-[10px] leading-relaxed text-[#5f6e58]">{destination.subtitle}</span></span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>}
              <Link href="/faqs" onClick={closeMenus} className={`mt-5 inline-flex items-center gap-2 px-3 text-[11px] text-[#5f6e58] ${focusRing}`}>A few questions before you go?<ArrowRight size={13} aria-hidden="true" /></Link>
            </nav>
          </div>

          <div className="shrink-0 border-t border-[#e1e2d5] bg-[#f1f1e7] px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
            <div className="mb-4 flex items-center justify-between"><span className="text-[10px] text-[#5f6e58]">Your journey, all in one place.</span>{account(true)}</div>
            <Link href="/packages" onClick={closeMenus} className={`group flex items-center justify-between rounded-2xl bg-[#173d2e] px-6 py-4 text-sm font-semibold text-[#faf7ef] ${focusRing}`}>Find your retreat<ArrowUpRight size={19} className="text-[#e4ce9b]" aria-hidden="true" /></Link>
          </div>
        </div>
      </div>}
    </header>
  )
}
