import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'

export const metadata: Metadata = {
  title: 'Contact India Yoga Tourism | Plan Your Yoga Retreat',
  description:
    'Plan your yoga retreat with India Yoga Tourism. Share your preferred destination, travel dates and guest count, or contact the team by email, phone and WhatsApp.',
  keywords: [
    'contact india yoga tourism',
    'yoga retreat enquiry',
    'rishikesh contact',
    'book yoga retreat india',
    'yoga tour enquiry',
  ],
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact India Yoga Tourism | Plan Your Yoga Retreat',
    description:
      'Ask about retreat dates, accommodation and booking details. Share your travel preferences with India Yoga Tourism.',
    url: `${SITE_URL}/contact`,
    siteName: 'India Yoga Tourism',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact India Yoga Tourism | Plan Your Yoga Retreat',
    description: 'Share your destination, dates and guest count to plan your yoga retreat.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
