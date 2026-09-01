import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { getEnquiryAlertTemplate, getEnquiryReceivedTemplate } from '@/lib/emails/templates'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, category, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, Email, and Message are required' }, { status: 400 })
    }

    // 1. Save Enquiry to Database
    const newEnquiry = await prisma.enquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        message: `${category ? `[Category: ${category}] ` : ''}${message}`,
        source: category || 'Contact Page',
      },
    })

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'indiayogatourism@gmail.com'

    // 2. Send instant Email Notification to Admin
    await sendEmail({
      to: adminEmail,
      subject: `🚨 New Inquiry Alert: ${name} (${category || 'General'})`,
      html: getEnquiryAlertTemplate(name, email, phone || null, message, category ? `Category: ${category}` : undefined),
    })

    // 3. Send Confirmation Email to Guest
    await sendEmail({
      to: email,
      subject: 'We Received Your Inquiry 🙏 | India Yoga Tourism',
      html: getEnquiryReceivedTemplate(name),
    })

    return NextResponse.json({ success: true, enquiry: newEnquiry })
  } catch (error: any) {
    console.error('Error submitting enquiry:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit inquiry' }, { status: 500 })
  }
}
