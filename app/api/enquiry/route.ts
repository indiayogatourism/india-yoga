import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getEnquiryAlertTemplate, getEnquiryReceivedTemplate } from '@/lib/emails/templates'
import { parseEnquiryInput } from '@/lib/enquiry'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ success: false, error: 'Please send a valid enquiry.' }, { status: 400 }) }
  const parsed = parseEnquiryInput(body)
  if (!parsed.data) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 })
  const data = parsed.data
  try {
    const pkg = data.packageSlug ? await prisma.package.findUnique({ where: { slug: data.packageSlug }, select: { id: true, title: true, status: true } }) : null
    if (data.packageSlug && (!pkg || pkg.status !== 'PUBLISHED')) return NextResponse.json({ success: false, error: 'This retreat could not be confirmed. Please choose another interest or contact the team directly.' }, { status: 400 })
    const message = [
      `Category: ${data.category}`, pkg ? `Retreat: ${pkg.title}` : '',
      data.destination ? `Destination: ${data.destination}` : '',
      data.preferredStartDate ? `Preferred arrival: ${data.preferredStartDate}` : '',
      data.preferredEndDate ? `Preferred departure: ${data.preferredEndDate}` : '',
      `Guests: ${data.guests}`, '', data.message,
    ].filter((line) => line !== '').join('\n')
    await prisma.enquiry.create({ data: { name: data.name, email: data.email, phone: data.phone || null, packageId: pkg?.id || null, message, source: data.category } })

    // A saved enquiry remains successful if the email provider is unavailable; do not invite duplicate submissions.
    await Promise.allSettled([
      sendEmail({ to: process.env.ADMIN_NOTIFICATION_EMAIL || 'indiayogatourism@gmail.com', subject: 'New retreat enquiry | India Yoga Tourism', html: getEnquiryAlertTemplate(data.name, data.email, data.phone || null, message, pkg?.title) }),
      sendEmail({ to: data.email, subject: 'Your enquiry has been received | India Yoga Tourism', html: getEnquiryReceivedTemplate(data.name) }),
    ])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'We could not save your enquiry right now. Please try again or contact us by email or WhatsApp.' }, { status: 503 })
  }
}
