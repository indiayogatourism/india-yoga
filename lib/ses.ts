import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'info@indianyogatourism.com'
  const fromName = process.env.AWS_SES_FROM_NAME || 'Indian Yoga Tourism'

  if (attachments && attachments.length > 0) {
    // Construct raw MIME email
    const boundary = `----=_Part_${Math.random().toString(36).substr(2, 9)}`
    
    let rawMessage = `From: "${fromName}" <${fromEmail}>\n`
    rawMessage += `To: ${to}\n`
    rawMessage += `Subject: ${subject}\n`
    rawMessage += `MIME-Version: 1.0\n`
    rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`
    
    // HTML Body Part
    rawMessage += `--${boundary}\n`
    rawMessage += `Content-Type: text/html; charset=UTF-8\n`
    rawMessage += `Content-Transfer-Encoding: 7bit\n\n`
    rawMessage += `${html}\n\n`
    
    // Attachments Part
    for (const attachment of attachments) {
      rawMessage += `--${boundary}\n`
      rawMessage += `Content-Type: ${attachment.contentType}; name="${attachment.filename}"\n`
      rawMessage += `Content-Description: ${attachment.filename}\n`
      rawMessage += `Content-Disposition: attachment; filename="${attachment.filename}"; size=${attachment.content.length};\n`
      rawMessage += `Content-Transfer-Encoding: base64\n\n`
      rawMessage += `${attachment.content.toString('base64')}\n\n`
    }
    
    rawMessage += `--${boundary}--`

    const command = new SendRawEmailCommand({
      RawMessage: {
        Data: new Uint8Array(Buffer.from(rawMessage))
      }
    })

    return await ses.send(command)
  } else {
    // Normal HTML email
    const command = new SendEmailCommand({
      Source: `"${fromName}" <${fromEmail}>`,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8'
          }
        }
      }
    })

    return await ses.send(command)
  }
}
