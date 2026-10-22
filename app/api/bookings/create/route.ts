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

    if (!packageId || !['razorpay', 'paypal'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'A valid package and payment method are required' }, { status: 400 })
    }

    if (!['dormitory', 'shared', 'private'].includes(roomType)) {
      return NextResponse.json({ error: 'Choose a valid room type' }, { status: 400 })
    }

    if (![fullName, email, phone, country].every((value) => typeof value === 'string' && value.trim())) {
      return NextResponse.json({ error: 'Name, email, phone, and country are required' }, { status: 400 })
    }

    const guestCount = Number(guestsCount)
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return NextResponse.json({ error: 'Guest count must be a positive whole number' }, { status: 400 })
    }

    const arrival = new Date(arrivalDate)
    if (!arrivalDate || Number.isNaN(arrival.getTime())) {
      return NextResponse.json({ error: 'Choose a valid arrival date' }, { status: 400 })
    }

    // Validate Package
    const pkg = await prisma.package.findFirst({
      where: { id: packageId, status: 'PUBLISHED' },
    })
    if (!pkg) {
      return NextResponse.json({ error: 'Published retreat package not found' }, { status: 404 })
    }

    if (guestCount > pkg.maxGroupSize) {
      return NextResponse.json({ error: `Guest count cannot exceed ${pkg.maxGroupSize}` }, { status: 400 })
    }

    const roomChoice = {
      dormitory: { enabled: pkg.enableDormitory, price: pkg.priceDormitory },
      shared: { enabled: pkg.enableShared, price: pkg.priceShared },
      private: { enabled: pkg.enablePrivate, price: pkg.pricePrivate },
    }[roomType as 'dormitory' | 'shared' | 'private']

    if (!roomChoice.enabled || roomChoice.price === null || !Number.isFinite(roomChoice.price) || roomChoice.price <= 0) {
      return NextResponse.json({ error: 'That room type is not available for this retreat' }, { status: 400 })
    }

    const pricePerPerson = roomChoice.price
    const totalAmount = pricePerPerson * guestCount
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Unable to calculate the booking total' }, { status: 400 })
    }

    const bookingRef = await generateBookingRef()
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
        guests: guestCount,
        roomType,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
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
