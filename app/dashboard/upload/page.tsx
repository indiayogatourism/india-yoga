import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { UploadPortal } from "@/components/dashboard/UploadPortal"

export const dynamic = "force-dynamic"

export default async function UploadDocumentsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          bookingRef: true,
          passportNumber: true,
          dietaryReqs: true,
          medicalInfo: true,
          specialRequests: true,
          package: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  })

  if (!dbUser) redirect("/sign-in")

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-headline-md font-bold text-2xl text-primary">
          Upload Documents & Travel Requirements
        </h1>
        <p className="text-sm text-on-surface-variant">
          Provide your passport number, dietary preferences, and flight arrival details for ashram registration.
        </p>
      </div>

      <UploadPortal bookings={dbUser.bookings} />
    </div>
  )
}
