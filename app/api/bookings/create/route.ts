import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { generateBookingRef } from '@/lib/utils'
import { createRazorpayOrder } from '@/lib/razorpay'
import { createPaypalOrder } from '@/lib/paypal'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'User info not found' }, { status: 400 })
    }

    // Auto-sync User in local DB
    let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Guest',
          role: 'guest'
        }
      })
    }

    const body = await req.json()
    const {
      packageId,
      guestsCount,
      roomType,
      arrivalDate,
      fullName,
      email,
      phone,
      country,
      passportNumber,
      dietaryReqs,
      medicalInfo,
      specialRequests,
      paymentMethod
    } = body

    // Validate Package
    const pkg = await prisma.package.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ error: 'Retreat package not found' }, { status: 404 })
    }

    // Calculations
    const pricePerPerson = roomType === 'shared' ? pkg.priceShared : pkg.pricePrivate
    const totalAmount = pricePerPerson * parseInt(guestsCount)

    const bookingRef = await generateBookingRef()
    const arrival = new Date(arrivalDate)
    const departure = new Date(arrival)
    departure.setDate(arrival.getDate() + pkg.durationDays)

    // Save Booking
    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        userId: dbUser.id,
        packageId,
        arrivalDate: arrival,
        departureDate: departure,
        guests: parseInt(guestsCount),
        roomType,
        fullName,
        email,
        phone,
        country,
        passportNumber,
        dietaryReqs,
        medicalInfo,
        specialRequests,
        pricePerPerson,
        totalAmount,
        status: 'PENDING',
      }
    })

    // Save Payment
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        currency: 'USD',
        status: 'PENDING',
        method: paymentMethod,
      }
    })

    let gatewayData = {}

    if (paymentMethod === 'razorpay') {
      const order = await createRazorpayOrder(totalAmount, 'USD', bookingRef)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { razorpayOrderId: order.id }
      })
      gatewayData = {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    } else if (paymentMethod === 'paypal') {
      const order = await createPaypalOrder(totalAmount, 'USD', bookingRef)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paypalOrderId: order.id }
      })
      gatewayData = {
        orderId: order.id
      }
    }

    return NextResponse.json({
      success: true,
      bookingRef,
      totalAmount,
      gatewayData
    })
  } catch (error: any) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
