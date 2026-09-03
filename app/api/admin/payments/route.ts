import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch consolidated payment records across Bookings & Online Class Enrolments
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

    // 1. Fetch all Payments linked to Bookings
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            package: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                location: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 2. Fetch Bookings that do not have a Payment record (pending payments)
    const bookingsWithoutPayment = await prisma.booking.findMany({
      where: {
        payment: null,
      },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 3. Fetch Online Class Enrolments
    const onlineEnrolments = await prisma.onlineClassEnrolment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
          },
        },
        onlineClass: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            timeSlot: true,
            instructor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Map Payments
    const mappedPayments = payments.map((p) => {
      const cat = p.booking?.package?.category || 'PROGRAMME'
      let catLabel = 'Programme & Retreat'
      if (cat === 'ONLINE_CLASS') catLabel = 'Online Class'
      else if (cat === 'TEACHER_TRAINING') catLabel = 'Teacher Training'
      else if (cat === 'TREK') catLabel = 'Trek'
      else if (cat === 'RETREAT') catLabel = 'Retreat'
      else if (cat === 'PROGRAMME') catLabel = 'Programme'

      return {
        id: p.id,
        source: 'booking_payment',
        bookingId: p.bookingId,
        transactionRef: p.booking?.bookingRef || p.razorpayPaymentId || p.paypalPaymentId || p.id,
        category: cat,
        categoryLabel: catLabel,
        itemTitle: p.booking?.package?.title || 'Yoga Package',
        itemId: p.booking?.package?.id,
        itemSlug: p.booking?.package?.slug,
        user: {
          id: p.booking?.user?.id,
          name: p.booking?.fullName || p.booking?.user?.name || 'Guest User',
          email: p.booking?.email || p.booking?.user?.email || 'N/A',
          phone: p.booking?.phone || p.booking?.user?.phone,
          country: p.booking?.country || p.booking?.user?.country,
        },
        amount: p.amount || p.booking?.totalAmount || 0,
        currency: p.currency || p.booking?.currency || 'USD',
        status: p.status || 'PENDING',
        paymentMethod: p.method || 'online',
        razorpayPaymentId: p.razorpayPaymentId,
        paypalPaymentId: p.paypalPaymentId,
        createdAt: p.createdAt.toISOString(),
        paidAt: p.paidAt ? p.paidAt.toISOString() : null,
        voucherUrl: p.booking?.voucherUrl,
        receiptUrl: p.booking?.receiptUrl,
        adminNote: p.booking?.adminNote,
      }
    })

    // Map Bookings without Payment
    const mappedPendingBookings = bookingsWithoutPayment.map((b) => {
      const cat = b.package?.category || 'PROGRAMME'
      let catLabel = 'Programme & Retreat'
      if (cat === 'ONLINE_CLASS') catLabel = 'Online Class'
      else if (cat === 'TEACHER_TRAINING') catLabel = 'Teacher Training'
      else if (cat === 'TREK') catLabel = 'Trek'
      else if (cat === 'RETREAT') catLabel = 'Retreat'
      else if (cat === 'PROGRAMME') catLabel = 'Programme'

      return {
        id: `pending-booking-${b.id}`,
        source: 'booking_pending',
        bookingId: b.id,
        transactionRef: b.bookingRef,
        category: cat,
        categoryLabel: catLabel,
        itemTitle: b.package?.title || 'Yoga Package',
        itemId: b.package?.id,
        itemSlug: b.package?.slug,
        user: {
          id: b.user?.id,
          name: b.fullName || b.user?.name || 'Guest User',
          email: b.email || b.user?.email || 'N/A',
          phone: b.phone || b.user?.phone,
          country: b.country || b.user?.country,
        },
        amount: b.totalAmount || 0,
        currency: b.currency || 'USD',
        status: b.status === 'CONFIRMED' ? 'PAID' : (b.status === 'CANCELLED' ? 'FAILED' : 'PENDING'),
        paymentMethod: 'pending_checkout',
        createdAt: b.createdAt.toISOString(),
        voucherUrl: b.voucherUrl,
        receiptUrl: b.receiptUrl,
        adminNote: b.adminNote,
      }
    })

    // Map Online Class Enrolments
    const mappedEnrolments = onlineEnrolments.map((e) => {
      let mappedStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' = 'PAID'
      if (e.status === 'CANCELLED' || e.status === 'EXPIRED') mappedStatus = 'FAILED'

      return {
        id: `enrolment-${e.id}`,
        source: 'online_enrolment',
        enrolmentId: e.id,
        transactionRef: `ENR-${e.id.substring(e.id.length - 8).toUpperCase()}`,
        category: 'ONLINE_CLASS',
        categoryLabel: 'Online Class',
        itemTitle: e.onlineClass?.title || 'Online Yoga Class',
        itemId: e.onlineClass?.id,
        itemSlug: e.onlineClass?.slug,
        user: {
          id: e.user?.id,
          name: e.user?.name || 'Student',
          email: e.user?.email || 'N/A',
          phone: e.user?.phone,
          country: e.user?.country,
        },
        amount: e.onlineClass?.price || 49,
        currency: 'USD',
        status: mappedStatus,
        paymentMethod: 'online_enrolment',
        createdAt: e.createdAt.toISOString(),
        paidAt: e.createdAt.toISOString(),
      }
    })

    // Combine and sort by createdAt descending
    const allRecords = [...mappedPayments, ...mappedPendingBookings, ...mappedEnrolments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Calculate Summary Stats
    const totalRevenue = allRecords
      .filter((r) => r.status === 'PAID')
      .reduce((sum, r) => sum + (r.amount || 0), 0)

    const onlineClassesRevenue = allRecords
      .filter((r) => r.category === 'ONLINE_CLASS' && r.status === 'PAID')
      .reduce((sum, r) => sum + (r.amount || 0), 0)

    const programmeRevenue = totalRevenue - onlineClassesRevenue

    const paidCount = allRecords.filter((r) => r.status === 'PAID').length
    const pendingCount = allRecords.filter((r) => r.status === 'PENDING').length
    const failedCount = allRecords.filter((r) => r.status === 'FAILED' || r.status === 'REFUNDED').length

    return NextResponse.json({
      success: true,
      records: allRecords,
      stats: {
        totalRevenue,
        onlineClassesRevenue,
        programmeRevenue,
        paidCount,
        pendingCount,
        failedCount,
        totalCount: allRecords.length,
      },
    })
  } catch (error: any) {
    console.error('Error fetching admin payment records:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT: Update Payment or Booking Status
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
    const { id, source, bookingId, enrolmentId, status, paymentMethod, adminNote } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Record ID and target status are required' }, { status: 400 })
    }

    if (source === 'booking_payment') {
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status,
          ...(paymentMethod && { method: paymentMethod }),
          ...(status === 'PAID' && { paidAt: new Date() }),
        },
      })

      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            ...(status === 'PAID' && { status: 'CONFIRMED', confirmedAt: new Date() }),
            ...(status === 'FAILED' && { status: 'CANCELLED' }),
            ...(adminNote !== undefined && { adminNote }),
          },
        })
      }

      return NextResponse.json({ success: true, payment: updatedPayment })
    }

    if (source === 'booking_pending' && bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      // Create new payment record
      const newPayment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: booking.currency || 'USD',
          status,
          method: paymentMethod || 'manual_admin',
          paidAt: status === 'PAID' ? new Date() : null,
        },
      })

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          ...(status === 'PAID' && { status: 'CONFIRMED', confirmedAt: new Date() }),
          ...(status === 'FAILED' && { status: 'CANCELLED' }),
          ...(adminNote !== undefined && { adminNote }),
        },
      })

      return NextResponse.json({ success: true, payment: newPayment })
    }

    if (source === 'online_enrolment' && enrolmentId) {
      const enrolmentStatus = status === 'PAID' ? 'ACTIVE' : 'CANCELLED'
      const updatedEnrolment = await prisma.onlineClassEnrolment.update({
        where: { id: enrolmentId },
        data: { status: enrolmentStatus },
      })
      return NextResponse.json({ success: true, enrolment: updatedEnrolment })
    }

    return NextResponse.json({ error: 'Invalid source type' }, { status: 400 })
  } catch (error: any) {
    console.error('Error updating payment status:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
