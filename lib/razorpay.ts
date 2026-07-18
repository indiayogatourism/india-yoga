import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function createRazorpayOrder(amount: number, currency: string, bookingRef: string) {
  const options = {
    amount: Math.round(amount * 100), // convert to cents/paise
    currency: currency.toUpperCase(),
    receipt: bookingRef,
  }
  return await razorpay.orders.create(options)
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || ''
  const text = `${orderId}|${paymentId}`
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex')
  return generatedSignature === signature
}
