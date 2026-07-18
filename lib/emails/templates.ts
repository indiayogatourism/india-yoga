export interface BookingEmailData {
  guestName: string
  packageName: string
  bookingRef: string
  arrivalDate: string
  departureDate: string
  amount: number
  paymentLink?: string
  receiptUrl?: string
  voucherUrl?: string
}

export function getBookingConfirmedTemplate(data: BookingEmailData): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c1c8c2; border-radius: 8px; background-color: #fcf8ff; color: #1a1a2e;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #012d1d; padding-bottom: 20px;">
        <h1 style="color: #012d1d; font-family: 'Playfair Display', serif; margin: 0 0 10px 0;">Indian Yoga Tourism</h1>
        <p style="font-style: italic; color: #2c694e; margin: 0;">"Ancient Wisdom. Modern Journey."</p>
      </div>
      
      <div style="padding: 10px 0;">
        <h2 style="color: #012d1d; font-family: 'Cormorant Garamond', serif;">Namaste ${data.guestName}! 🙏</h2>
        <p style="font-size: 16px; line-height: 1.6;">Your retreat booking has been successfully confirmed. We are excited to welcome you on this transformative journey.</p>
        
        <div style="background-color: #efecff; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #012d1d;">Booking Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #414844;">Reference:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #012d1d;">${data.bookingRef}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #414844;">Retreat:</td>
              <td style="padding: 6px 0; text-align: right;">${data.packageName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #414844;">Arrival Date:</td>
              <td style="padding: 6px 0; text-align: right;">${data.arrivalDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #414844;">Departure Date:</td>
              <td style="padding: 6px 0; text-align: right;">${data.departureDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #414844;">Total Amount:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #012d1d; font-size: 16px;">$${data.amount}</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #012d1d; font-family: 'Cormorant Garamond', serif;">🌿 Pre-Arrival Checklist</h3>
        <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px;">
          <li>Download and keep your <strong>Booking Voucher</strong> handy.</li>
          <li>Join the WhatsApp community group: <a href="https://wa.me/919999876349" style="color: #2c694e; font-weight: bold; text-decoration: none;">Join WhatsApp Group</a></li>
          <li>Pack comfortable cotton clothing, a personal yoga mat (optional), sunscreen, and comfortable walking shoes.</li>
          <li>We will reach out to you 7 days before arrival with final check-in guidelines and details about your personal driver if booked.</li>
        </ul>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #012d1d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Go to Guest Dashboard</a>
        </div>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #c1c8c2; padding-top: 20px; font-size: 12px; text-align: center; color: #717973;">
        <p>Cloud 9 Tower, Vaishali Sec-1, Ghaziabad, UP 201010</p>
        <p>Phone: +91 99998 76349 | Email: info@indianyogatourism.com</p>
        <p>© ${new Date().getFullYear()} Indian Yoga Tourism. All rights reserved.</p>
      </div>
    </div>
  `
}

export function getBookingPendingTemplate(data: BookingEmailData): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c1c8c2; border-radius: 8px; background-color: #fcf8ff; color: #1a1a2e;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #012d1d; padding-bottom: 20px;">
        <h1 style="color: #012d1d; font-family: 'Playfair Display', serif; margin: 0 0 10px 0;">Indian Yoga Tourism</h1>
      </div>
      
      <div style="padding: 10px 0;">
        <h2 style="color: #012d1d; font-family: 'Cormorant Garamond', serif;">Complete Your Journey 🙏</h2>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for reserving a spot on the <strong>${data.packageName}</strong>. Your booking reference is <strong>${data.bookingRef}</strong>.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">To finalize your booking and secure your spot, please complete the payment of <strong>$${data.amount}</strong> using the link below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentLink || '#'}" style="background-color: #2c694e; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Complete Payment Now</a>
        </div>

        <p style="font-size: 14px; color: #717973;">Note: This reservation will expire if payment is not received within 48 hours.</p>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #c1c8c2; padding-top: 20px; font-size: 12px; text-align: center; color: #717973;">
        <p>Need help? Call us at +91 99998 76349 or reply directly to this email.</p>
      </div>
    </div>
  `
}

export function getPaymentReceiptTemplate(data: BookingEmailData): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c1c8c2; border-radius: 8px; background-color: #fcf8ff; color: #1a1a2e;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #012d1d; padding-bottom: 20px;">
        <h1 style="color: #012d1d; font-family: 'Playfair Display', serif; margin: 0 0 10px 0;">Payment Receipt</h1>
        <p style="color: #717973; margin: 0;">Receipt for ${data.bookingRef}</p>
      </div>
      
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; line-height: 1.6;">Dear ${data.guestName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Thank you for your payment. This email serves as confirmation that we have received your payment of <strong>$${data.amount}</strong> for <strong>${data.packageName}</strong>.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">You can download your detailed receipt PDF directly from your dashboard or via the link below (if available).</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing Indian Yoga Tourism 🙏</p>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #c1c8c2; padding-top: 20px; font-size: 12px; text-align: center; color: #717973;">
        <p>© Indian Yoga Tourism. All rights reserved.</p>
      </div>
    </div>
  `
}

export function getEnquiryReceivedTemplate(name: string): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c1c8c2; border-radius: 8px; background-color: #fcf8ff; color: #1a1a2e;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #012d1d; padding-bottom: 20px;">
        <h1 style="color: #012d1d; font-family: 'Playfair Display', serif;">Indian Yoga Tourism</h1>
      </div>
      
      <div style="padding: 10px 0;">
        <h2 style="color: #012d1d; font-family: 'Cormorant Garamond', serif;">Namaste ${name} 🙏</h2>
        <p style="font-size: 16px; line-height: 1.6;">We have received your enquiry and would like to thank you for contacting us.</p>
        <p style="font-size: 16px; line-height: 1.6;">One of our dedicated wellness planners will reach out to you within the next 24 hours to help you plan your spiritual journey.</p>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #c1c8c2; padding-top: 20px; font-size: 12px; text-align: center; color: #717973;">
        <p>Phone: +91 99998 76349 | Email: info@indianyogatourism.com</p>
      </div>
    </div>
  `
}

export function getEnquiryAlertTemplate(name: string, email: string, phone: string | null, message: string, packageTitle?: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
      <h2 style="color: #ba1a1a;">New Customer Enquiry Alert!</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      ${packageTitle ? `<p><strong>Package Interested:</strong> ${packageTitle}</p>` : ''}
      <p><strong>Message:</strong></p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-style: italic;">
        ${message}
      </div>
    </div>
  `
}

export function getReviewRequestTemplate(name: string, packageTitle: string, reviewLink: string): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c1c8c2; border-radius: 8px; background-color: #fcf8ff; color: #1a1a2e;">
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #012d1d; padding-bottom: 20px;">
        <h1 style="color: #012d1d; font-family: 'Playfair Display', serif;">Share Your Experience 🙏</h1>
      </div>
      
      <div style="padding: 10px 0;">
        <p style="font-size: 16px; line-height: 1.6;">Namaste ${name},</p>
        <p style="font-size: 16px; line-height: 1.6;">We hope you had a deeply rejuvenating and transformative stay during the <strong>${packageTitle}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">Your journey is unique, and sharing your experience helps other travelers find their path to wellness. Please take a few minutes to write a review.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewLink}" style="background-color: #012d1d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Write a Review</a>
        </div>
      </div>
    </div>
  `
}
