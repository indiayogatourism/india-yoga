import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { bookingId, passportNumber, dietaryReqs, medicalInfo, specialRequests } = body

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    // Verify booking belongs to user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: dbUser.id,
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        passportNumber: passportNumber ? passportNumber.trim() : existingBooking.passportNumber,
        dietaryReqs: dietaryReqs ? dietaryReqs.trim() : existingBooking.dietaryReqs,
        medicalInfo: medicalInfo ? medicalInfo.trim() : existingBooking.medicalInfo,
        specialRequests: specialRequests ? specialRequests.trim() : existingBooking.specialRequests,
      },
    })

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: any) {
    console.error("Failed to update travel documents:", error)
    return NextResponse.json({ error: error.message || "Failed to update details" }, { status: 500 })
  }
}
