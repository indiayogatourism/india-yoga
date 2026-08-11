import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { CheckCircle2, Clock, MapPin, Compass, ShieldCheck, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TrackingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bookings: {
        include: { package: true },
        orderBy: { arrivalDate: "asc" },
      },
    },
  })

  if (!dbUser) redirect("/sign-in")

  const activeBooking =
    dbUser.bookings.find((b) => b.status === "CONFIRMED" && new Date(b.arrivalDate) > new Date()) ||
    dbUser.bookings[0]

  if (!activeBooking) {
    return (
      <div className="max-w-3xl space-y-6">
        <h1 className="font-headline-md font-bold text-2xl text-primary">Track Journey</h1>
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-10 text-center">
          <Compass className="w-10 h-10 text-outline mx-auto mb-3" />
          <p className="text-sm font-bold text-primary">No active retreat journey to track</p>
        </div>
      </div>
    )
  }

  // Calculate timeline status
  const steps = [
    {
      title: "Booking & Deposit Paid",
      desc: "Your reservation request and deposit were received successfully.",
      status: "completed",
    },
    {
      title: "Host Confirmation & Registration",
      desc: `Confirmed by ${activeBooking.package.location} retreat manager.`,
      status: activeBooking.status === "CONFIRMED" ? "completed" : "current",
    },
    {
      title: "Passport & Dietary Verification",
      desc: activeBooking.passportNumber
        ? "Guest identity and dietary preferences verified."
        : "Upload passport and dietary preferences in Upload portal.",
      status: activeBooking.passportNumber ? "completed" : "current",
    },
    {
      title: "Voucher & Check-In Pack Issued",
      desc: "Official PDF voucher ready for ashram check-in.",
      status: activeBooking.status === "CONFIRMED" ? "completed" : "upcoming",
    },
    {
      title: "Ashram Welcome & Commencement",
      desc: `Arrival scheduled for ${formatDate(activeBooking.arrivalDate)}.`,
      status: "upcoming",
    },
  ]

  // Days countdown
  const now = new Date()
  const arrival = new Date(activeBooking.arrivalDate)
  const diffDays = Math.ceil((arrival.getTime() - now.getTime()) / (1000 * 3600 * 24))

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-headline-md font-bold text-2xl text-primary">
          Track Retreat Journey
        </h1>
        <p className="text-sm text-on-surface-variant">
          Real-time status timeline for your upcoming retreat in {activeBooking.package.location}.
        </p>
      </div>

      {/* Hero Countdown Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-2xl text-on-primary shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-md text-tertiary-fixed">
            Ref: #{activeBooking.bookingRef}
          </span>
          <h2 className="font-headline-md font-bold text-xl sm:text-2xl mt-2 text-on-primary">
            {activeBooking.package.title}
          </h2>
          <p className="text-xs text-on-primary-container mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-tertiary-fixed" />
            <span>{activeBooking.package.location}</span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center shrink-0 self-stretch sm:self-auto min-w-[140px]">
          <p className="text-[10px] text-on-primary-container font-bold uppercase tracking-wider">
            Countdown
          </p>
          <p className="font-headline-md font-bold text-2xl text-tertiary-fixed mt-0.5">
            {diffDays > 0 ? `${diffDays} Days` : "Arriving Today"}
          </p>
        </div>
      </div>

      {/* Step-by-Step Timeline */}
      <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-headline-md font-bold text-lg text-primary border-b border-outline-variant/30 pb-3">
          Journey Preparation Status
        </h3>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                  step.status === "completed"
                    ? "bg-emerald-600 text-white"
                    : step.status === "current"
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                  <span>{step.title}</span>
                  {step.status === "completed" && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      Completed
                    </span>
                  )}
                  {step.status === "current" && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                      In Progress
                    </span>
                  )}
                </h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
