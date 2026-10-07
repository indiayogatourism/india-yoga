import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | India Yoga Tourism',
  description:
    'Get in touch with India Yoga Tourism. Reach out about Rishikesh retreats, Panchakarma packages, online yoga classes, or any other enquiry.',
  keywords: [
    'contact india yoga tourism',
    'yoga retreat enquiry',
    'rishikesh contact',
    'book yoga retreat india',
    'yoga tour enquiry',
  ],
  alternates: {
    canonical: 'https://indiayogatourism.com/contact',
  },
  openGraph: {
    title: 'Contact Us | India Yoga Tourism',
    description:
      'We are here to help you plan your perfect Himalayan yoga and Ayurveda journey.',
    url: 'https://indiayogatourism.com/contact',
    siteName: 'India Yoga Tourism',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | India Yoga Tourism',
    description: 'Plan your perfect Himalayan yoga and Ayurveda journey.',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
