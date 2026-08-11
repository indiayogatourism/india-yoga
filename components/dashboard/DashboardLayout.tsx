"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Calendar,
  Upload,
  Download,
  Compass,
  User,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react"

const navLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/upload", label: "Upload Documents", icon: Upload },
  { href: "/dashboard/download", label: "Download Center", icon: Download },
  { href: "/dashboard/tracking", label: "Track Journey", icon: Compass },
  { href: "/dashboard/profile", label: "Profile Settings", icon: User },
]

interface SidebarProps {
  pathname: string
  setSidebarOpen: (open: boolean) => void
}

function Sidebar({ pathname, setSidebarOpen }: SidebarProps) {
  const { user } = useUser()

  return (
    <aside className="flex flex-col h-full bg-primary text-on-primary border-r border-primary-container/40">
      {/* Brand Header */}
      <div className="px-6 pt-7 pb-6 border-b border-primary-container/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-fixed text-primary font-bold text-sm shadow-md transition-transform group-hover:scale-105">
            🧘‍♂️
          </div>
          <div>
            <span className="font-headline-lg font-bold text-lg leading-tight tracking-tight block text-on-primary">
              India Yoga Tourism
            </span>
            <span className="text-[11px] text-on-primary-container tracking-wider uppercase font-semibold">
              Guest Portal
            </span>
          </div>
        </Link>
      </div>

      {/* User Info Bar */}
      <div className="px-5 py-4 border-b border-primary-container/40 bg-primary-container/20 flex items-center gap-3">
        <UserButton />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-on-primary truncate">
            {user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Guest"}
          </p>
          <p className="text-[10px] text-on-primary-container truncate">
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-primary-container text-tertiary-fixed shadow-sm border border-secondary/30"
                  : "text-on-primary-container hover:bg-primary-container/50 hover:text-on-primary"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-tertiary-fixed" : "opacity-70"}`} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Explore Retreats CTA */}
      <div className="p-4 border-t border-primary-container/40">
        <Link
          href="/packages"
          className="flex items-center justify-center gap-2 w-full bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-primary font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-md group"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Explore Retreats</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>
    </aside>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeTabLabel = navLinks.find((l) =>
    l.href === pathname || (l.href !== "/dashboard" && pathname.startsWith(l.href))
  )?.label ?? "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 flex-col">
        <Sidebar pathname={pathname} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 flex-shrink-0 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar pathname={pathname} setSidebarOpen={setSidebarOpen} />
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="bg-surface border-b border-outline-variant/30 px-4 md:px-8 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-primary hover:bg-surface-container-high transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-headline-md font-bold text-primary text-lg md:text-xl">
              {activeTabLabel}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/packages"
              className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3.5 py-2 rounded-lg transition-colors border border-primary/20"
            >
              <PlusCircle className="w-4 h-4 text-primary" />
              <span>Book New Retreat</span>
            </Link>
            
            <div className="flex items-center gap-2 border-l border-outline-variant/40 pl-3">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
