import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import {
  Calendar,
  Wallet,
  CheckCircle2,
  Sparkles,
  Download,
  Receipt,
  MessageCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  FileCheck,
  UserCheck,
  Sun,
  MapPin
} from "lucide-react"

export const dynamic = "force-dynamic"

type Notification = {
  id: string
  type: "success" | "warning" | "error" | "info" | "action"
  icon: string
  title: string
  body: string
  cta?: { label: string; href: string }
  time?: string
}

function buildNotifications(user: any, bookings: any[]): Notification[] {
  const notes: Notification[] = []

  // Profile incomplete alert
  if (!user?.phone || !user?.country) {
    notes.push({
      id: "profile-incomplete",
      type: "action",
      icon: "👤",
      title: "Complete your guest profile",
      body: "Add your contact phone number and country of residence for smooth check-in.",
      cta: { label: "Complete Profile →", href: "/dashboard/profile" },
    })
  }

  // Active bookings notification check
  for (const b of bookings) {
    const isUpcoming = b.status === "CONFIRMED" && new Date(b.arrivalDate) > new Date()
    const isPending = b.status === "PENDING"

    if (isUpcoming && (!b.passportNumber || !b.dietaryReqs)) {
      notes.push({
        id: `docs-${b.id}`,
        type: "action",
        icon: "📋",
        title: `Submit travel & dietary details for #${b.bookingRef}`,
        body: `Your retreat "${b.package.title}" is confirmed! Please upload your passport copy & dietary preferences.`,
        cta: { label: "Upload Info →", href: "/dashboard/upload" },
      })
    } else if (isUpcoming) {
      notes.push({
        id: `ready-${b.id}`,
        type: "success",
        icon: "🎉",
        title: `Retreat voucher ready for #${b.bookingRef}`,
        body: `Everything is set for your stay at ${b.package.location}. Download your travel voucher & receipt.`,
        cta: { label: "Download Voucher →", href: "/dashboard/download" },
      })
    } else if (isPending) {
      notes.push({
        id: `pending-${b.id}`,
        type: "warning",
        icon: "⏳",
        title: `Booking #${b.bookingRef} is under review`,
        body: `Our host team is processing your reservation for ${b.package.title}. We will confirm shortly.`,
        cta: { label: "View Bookings →", href: "/dashboard/bookings" },
      })
    }
  }

  return notes
}

export default async function DashboardOverviewPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const clerkUser = await currentUser()
  if (!clerkUser) redirect("/sign-in")

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bookings: {
        include: { package: true },
        orderBy: { arrivalDate: "asc" },
      },
    },
  })

  if (!dbUser) redirect("/sign-in")

  const bookings = dbUser.bookings
  const activeBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.arrivalDate) > new Date()
  )
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED" || (b.status === "CONFIRMED" && new Date(b.departureDate) < new Date())
  )
  const totalInvestment = bookings.reduce(
    (sum, b) => (b.status === "CONFIRMED" || b.status === "COMPLETED" ? sum + b.totalAmount : sum),
    0
  )

  const nextBooking = activeBookings[0] || bookings[0]
  const notifications = buildNotifications(dbUser, bookings)

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-container to-secondary p-6 sm:p-8 rounded-2xl text-on-primary shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(255,223,160,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-tertiary-fixed/20 text-tertiary-fixed border border-tertiary-fixed/30 text-xs font-bold rounded-full mb-3">
            Welcome to India Yoga Tourism
          </span>
          <h1 className="font-headline-lg font-bold text-2xl sm:text-3xl md:text-4xl text-on-primary mb-2">
            Namaste, {dbUser.name} 🙏
          </h1>
          <p className="font-body-md text-on-primary-container text-sm sm:text-base leading-relaxed">
            Your sacred sanctuary awaits. Manage your retreat bookings, travel vouchers, and preparation checklists below.
          </p>
        </div>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md font-bold text-primary text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-tertiary-container" />
              <span>Action Items & Notifications</span>
            </h2>
            <span className="text-xs font-bold text-outline bg-surface-container px-2.5 py-1 rounded-full">
              {notifications.length} updates
            </span>
          </div>

          <div className="grid gap-3">
            {notifications.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  note.type === "action"
                    ? "bg-amber-50/60 border-amber-200 text-amber-900"
                    : note.type === "success"
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                    : "bg-blue-50/60 border-blue-200 text-blue-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{note.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm">{note.title}</h3>
                    <p className="text-xs opacity-90 mt-0.5">{note.body}</p>
                  </div>
                </div>
                {note.cta && (
                  <Link
                    href={note.cta.href}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white shadow-xs border border-black/10 hover:bg-black/5 transition-all text-primary"
                  >
                    <span>{note.cta.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Active Retreats
            </p>
            <p className="font-headline-md font-bold text-2xl text-primary mt-0.5">
              {activeBookings.length}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/30 text-tertiary-container flex items-center justify-center font-bold">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Total Investment
            </p>
            <p className="font-headline-md font-bold text-2xl text-primary mt-0.5">
              {formatPrice(totalInvestment)}
            </p>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
              Journeys Completed
            </p>
            <p className="font-headline-md font-bold text-2xl text-primary mt-0.5">
              {completedBookings.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Upcoming Journey) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md font-bold text-primary text-xl">
              Upcoming Journey
            </h2>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {nextBooking ? (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-56 sm:h-64 bg-surface-container-high overflow-hidden">
                <img
                  src={
                    nextBooking.package.featuredImage ||
                    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={nextBooking.package.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <StatusBadge status={nextBooking.status} />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <span className="text-xs font-mono bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
                    Ref: #{nextBooking.bookingRef}
                  </span>
                  <h3 className="font-headline-md font-bold text-xl sm:text-2xl mt-1 text-white">
                    {nextBooking.package.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-on-surface-variant border-b border-outline-variant/30 pb-6">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      <strong>Dates:</strong> {formatDate(nextBooking.arrivalDate)} - {formatDate(nextBooking.departureDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      <strong>Location:</strong> {nextBooking.package.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/api/download/voucher/${nextBooking.bookingRef}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Voucher</span>
                  </a>

                  <a
                    href={`/api/download/receipt/${nextBooking.bookingRef}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-container border border-outline-variant text-primary hover:bg-surface-container-high text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Payment Receipt</span>
                  </a>

                  <a
                    href="https://wa.me/919999876349"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Contact Host</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-10 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-tertiary-container mx-auto" />
              <div>
                <h3 className="font-headline-md font-bold text-xl text-primary">No Active Retreats</h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  Discover sacred ashrams and yoga teacher training programs across India.
                </p>
              </div>
              <Link href="/packages">
                <button className="bg-primary text-on-primary font-bold text-xs px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  Explore Programs
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column (Preparation & Weather) */}
        <div className="space-y-6">
          {/* Checklist */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-headline-md font-bold text-primary text-lg">
                Pre-Retreat Checklist
              </h3>
              <span className="text-xs font-bold bg-secondary-container text-secondary px-2.5 py-0.5 rounded-full">
                {nextBooking?.passportNumber ? "3/4" : "2/4"}
              </span>
            </div>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/50 text-emerald-900 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold line-through">Retreat Reserved</p>
                  <p className="text-[11px] opacity-80">Deposit payment verified.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/50 text-emerald-900 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold line-through">Account Created</p>
                  <p className="text-[11px] opacity-80">Profile synced with Clerk.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/50 text-amber-900 border border-amber-200">
                <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <Link href="/dashboard/upload" className="font-bold hover:underline block">
                    Upload Travel Documents
                  </Link>
                  <p className="text-[11px] opacity-80">Passport & dietary info needed.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-container border border-outline-variant/30">
                <UserCheck className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                <div>
                  <Link href="/dashboard/profile" className="font-bold text-primary hover:underline block">
                    Review Emergency Contact
                  </Link>
                  <p className="text-[11px] text-on-surface-variant">Update contact details.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Location & Weather Widget */}
          <div className="relative rounded-2xl overflow-hidden h-52 border border-outline-variant/30 shadow-xs bg-primary">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
              alt="Rishikesh"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent p-5 flex flex-col justify-between text-on-primary">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-tertiary-fixed" />
                  <span>Rishikesh, Himalayas</span>
                </span>
                <Sun className="w-6 h-6 text-tertiary-fixed animate-spin-slow" />
              </div>
              <div>
                <p className="text-xs opacity-80">Current Ashram Weather</p>
                <p className="font-headline-md font-bold text-2xl sm:text-3xl text-tertiary-fixed">
                  24°C / Sunny ☀️
                </p>
                <p className="text-[11px] opacity-90 mt-1">
                  Perfect conditions for morning Pranayama & Meditation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
