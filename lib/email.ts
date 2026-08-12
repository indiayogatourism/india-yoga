import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY || ''
const resend = resendApiKey ? new Resend(resendApiKey) : null

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const fromName = process.env.RESEND_FROM_NAME || 'India Yoga Tourism'

  if (!resend) {
    console.warn('[Email Warning] RESEND_API_KEY is not set in environment variables. Email was skipped:', { to, subject })
    return null
  }

  try {
    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments: attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    })

    return response
  } catch (error) {
    console.error('[Email Error] Failed to send email via Resend:', error)
    return null
  }
}
