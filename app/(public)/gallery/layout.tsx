import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'

export const metadata: Metadata = {
  title: 'Gallery | India Yoga Tourism',
  description:
    'Browse our gallery of authentic Himalayan yoga retreats, Ayurveda wellness spaces, serene ashram grounds, and sacred Rishikesh landscapes.',
  keywords: [
    'yoga retreat gallery',
    'rishikesh ashram photos',
    'himalayan retreat images',
    'ayurveda wellness centre',
    'india yoga tourism gallery',
  ],
  alternates: {
    canonical: `${SITE_URL}/gallery`,
  },
  openGraph: {
    title: 'Gallery | India Yoga Tourism',
    description:
      'A visual journey through our Himalayan sanctuary — serene spaces for yoga, Ayurveda, and deep spiritual renewal.',
    url: `${SITE_URL}/gallery`,
    siteName: 'India Yoga Tourism',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | India Yoga Tourism',
    description: 'Visual journey through our Himalayan yoga sanctuary.',
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
