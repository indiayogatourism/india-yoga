'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminUser {
  name: string | null
  email: string
}

interface AdminLayoutClientProps {
  dbUser: AdminUser
  children: React.ReactNode
}

export function AdminLayoutClient({ dbUser, children }: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: 'Overview', href: '/admin', icon: 'dashboard' },
    { label: 'Programs & Retreats', href: '/admin/packages', icon: 'spa' },
    { label: 'Blog Posts', href: '/admin/blogs', icon: 'article' },
    { label: 'CMS Pages', href: '/admin/pages', icon: 'description' },
    { label: 'View Public Site', href: '/', icon: 'open_in_new' },
  ]

  const activeItem = navItems.find(item => item.href === pathname || (item.href !== '/admin' && pathname.startsWith(item.href)))
  const pageTitle = activeItem ? activeItem.label : 'Admin Control Panel'

  return (
    <div className="bg-[#FAF7F2] text-[#2C3E35] font-body-md antialiased flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#1C2E26] text-white flex-col h-full flex-shrink-0 z-20 shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="font-display-lg text-xl font-bold text-[#E2C799] tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E2C799]">admin_panel_settings</span>
            India Yoga Admin
          </Link>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#E2C799] text-[#1C2E26] font-bold shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#1C2E26]' : 'text-[#E2C799]'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[#E2C799] text-[#1C2E26] flex items-center justify-center font-bold text-sm shadow-sm">
              {dbUser.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{dbUser.name}</p>
              <p className="text-[10px] text-white/60 truncate">{dbUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 bg-[#1C2E26] text-white flex-shrink-0 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300 z-50">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="font-display-lg text-lg font-bold text-[#E2C799] tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E2C799]">admin_panel_settings</span>
                India Yoga Admin
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                aria-label="Close admin menu"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <nav className="flex-1 py-6 overflow-y-auto px-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E2C799] text-[#1C2E26] font-bold shadow-md'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#1C2E26]' : 'text-[#E2C799]'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-[#E2C799] text-[#1C2E26] flex items-center justify-center font-bold text-sm">
                  {dbUser.name?.substring(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{dbUser.name}</p>
                  <p className="text-[10px] text-white/60 truncate">{dbUser.email}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-black/5 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#1C2E26] hover:bg-black/5 transition-colors focus:outline-none"
              aria-label="Toggle admin menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h1 className="text-base sm:text-lg font-bold text-[#1C2E26] truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Admin Access</span> Active
            </span>
          </div>
        </header>

        {/* Scrollable Content View */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  )
}
