import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all programme/retreat bookings for admin
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    const isAdmin = dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      include: {
        package: {
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, bookings })
  } catch (error: any) {
    console.error('Error fetching admin bookings:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT: Update booking status, payment status, or admin notes
export async function PUT(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    const isAdmin = dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { id, status, adminNote, paymentStatus } = body

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote }),
        ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      },
      include: {
        payment: true,
      },
    })

    if (paymentStatus && updatedBooking.payment) {
      await prisma.payment.update({
        where: { id: updatedBooking.payment.id },
        data: {
          status: paymentStatus,
          ...(paymentStatus === 'PAID' && { paidAt: new Date() }),
        },
      })
    } else if (paymentStatus && !updatedBooking.payment) {
      await prisma.payment.create({
        data: {
          bookingId: updatedBooking.id,
          amount: updatedBooking.totalAmount,
          currency: updatedBooking.currency || 'USD',
          status: paymentStatus,
          method: 'admin_manual',
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
        },
      })
    }

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: any) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
