import { NextResponse } from 'next/server'
import { getPresignedUrl } from '@/lib/s3'
import { getAuthorizedBookingByRef } from '@/lib/bookingAccess'

interface RouteParams {
  params: Promise<{
    ref: string
  }>
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { ref } = await params

    const booking = await getAuthorizedBookingByRef(ref)

    if (!booking || !booking.voucherUrl) {
      return new Response('Voucher PDF not generated yet or booking not found', { status: 404 })
    }

    const signedUrl = await getPresignedUrl(booking.voucherUrl)
    
    return NextResponse.redirect(signedUrl)
  } catch (error: any) {
    console.error('Voucher redirect error:', error)
    return new Response(error.message || 'Internal Server Error', { status: 500 })
  }
}
