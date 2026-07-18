import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePaypalOrder } from '@/lib/paypal'
import { generateBookingVoucher, generatePaymentReceipt } from '@/lib/pdf'
import { sendEmail } from '@/lib/ses'
import { getBookingConfirmedTemplate, getPaymentReceiptTemplate, getEnquiryAlertTemplate } from '@/lib/emails/templates'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { paypalOrderId } = body

    // Call PayPal SDK/API to capture the payment
    const captureData = await capturePaypalOrder(paypalOrderId)

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'PayPal payment not completed', status: captureData.status }, { status: 400 })
    }

    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { paypalOrderId },
      include: {
        booking: {
          include: {
            package: true,
            user: true
          }
        }
      }
    })

    if (!payment) {
      // Create fallback if payment record not found (should not happen normally)
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Check if already paid to avoid duplicate executions
    if (payment.status === 'PAID') {
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paypalPaymentId: captureId,
        status: 'PAID',
        paidAt: new Date(),
        method: 'paypal'
      }
    })

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date()
      }
    })

    // Increment package totalBookings count
    await prisma.package.update({
      where: { id: booking.packageId },
      data: {
        totalBookings: { increment: 1 }
      }
    })

    // Generate PDFs
    const arrivalStr = booking.arrivalDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    const departureStr = booking.departureDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    
    // 1. Voucher
    const { buffer: voucherBuf, url: voucherUrl } = await generateBookingVoucher({
      bookingRef: booking.bookingRef,
      guestName: booking.fullName,
      packageName: payment.booking.package.title,
      location: payment.booking.package.location,
      arrivalDate: arrivalStr,
      departureDate: departureStr,
      guestsCount: booking.guests,
      roomType: booking.roomType
    })

    // 2. Receipt
    const receiptNo = `PAY-${new Date().getFullYear().toString().slice(2)}-${Math.floor(10000 + Math.random() * 90000)}`
    const { buffer: receiptBuf, url: receiptUrl } = await generatePaymentReceipt({
      receiptNo,
      bookingRef: booking.bookingRef,
      guestName: booking.fullName,
      packageName: payment.booking.package.title,
      amount: payment.amount,
      paymentMethod: 'paypal',
      transactionId: captureId,
      nightsCount: payment.booking.package.durationNights,
      pricePerNight: booking.pricePerPerson
    })

    // Update booking with PDF URLs
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        voucherUrl,
        receiptUrl
      }
    })

    // Email notifications
    const emailData = {
      guestName: booking.fullName,
      packageName: payment.booking.package.title,
      bookingRef: booking.bookingRef,
      arrivalDate: arrivalStr,
      departureDate: departureStr,
      amount: payment.amount,
      receiptUrl,
      voucherUrl
    }

    // Send confirmation to guest
    const confirmHtml = getBookingConfirmedTemplate(emailData)
    await sendEmail({
      to: booking.email,
      subject: `🌿 Booking Confirmed — ${payment.booking.package.title} — Ref: ${booking.bookingRef}`,
      html: confirmHtml
    })

    // Send receipt to guest with attachment
    const receiptHtml = getPaymentReceiptTemplate(emailData)
    await sendEmail({
      to: booking.email,
      subject: `Payment Receipt — $${payment.amount} — Ref: ${booking.bookingRef}`,
      html: receiptHtml,
      attachments: [
        {
          filename: 'receipt.pdf',
          content: receiptBuf,
          contentType: 'application/pdf'
        },
        {
          filename: 'voucher.pdf',
          content: voucherBuf,
          contentType: 'application/pdf'
        }
      ]
    })

    // Send alert to admin
    const adminAlertHtml = getEnquiryAlertTemplate(
      booking.fullName,
      booking.email,
      booking.phone,
      `New booking for ${payment.booking.package.title}. Reference: ${booking.bookingRef}. Amount paid: $${payment.amount}.`,
      payment.booking.package.title
    )
    await sendEmail({
      to: process.env.AWS_SES_FROM_EMAIL || 'info@indiayogatourism.com',
      subject: `🚨 Alert: New Booking Confirmed — ${booking.bookingRef}`,
      html: adminAlertHtml
    })

    return NextResponse.json({ success: true, bookingRef: booking.bookingRef })
  } catch (error: any) {
    console.error('PayPal capture error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
