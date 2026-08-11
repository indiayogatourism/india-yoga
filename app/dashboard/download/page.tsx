import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Download, FileText, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DownloadPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bookings: {
        where: {
          status: { in: ["CONFIRMED", "COMPLETED", "PENDING"] },
        },
        include: { package: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!dbUser) redirect("/sign-in")

  const bookings = dbUser.bookings

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-headline-md font-bold text-2xl text-primary">
          Download Center
        </h1>
        <p className="text-sm text-on-surface-variant">
          Access your official retreat vouchers, payment receipts, and ashram preparation documents.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-surface border border-outline-variant/30 rounded-2xl p-10 text-center">
          <Download className="w-10 h-10 text-outline mx-auto mb-3" />
          <p className="text-sm font-bold text-primary">No downloadable documents yet</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Once your booking is processed, travel vouchers and receipts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-outline-variant/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary bg-surface-container px-2.5 py-1 rounded-md">
                      #{b.bookingRef}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h2 className="font-headline-md font-bold text-xl text-primary mt-2">
                    {b.package.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {b.package.location} · {formatDate(b.arrivalDate)} to {formatDate(b.departureDate)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Booking</span>
                  </span>
                </div>
              </div>

              {/* PDF Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`/api/download/voucher/${b.bookingRef}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary rounded-xl py-3.5 px-4 font-bold text-xs shadow-xs transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Travel Voucher (PDF)</span>
                </a>

                <a
                  href={`/api/download/receipt/${b.bookingRef}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-on-primary rounded-xl py-3.5 px-4 font-bold text-xs transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Payment Receipt (PDF)</span>
                </a>
              </div>

              <div className="bg-surface-container/60 rounded-xl p-3 text-xs text-on-surface-variant flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Present voucher upon arrival at ashram reception for seamless check-in.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
