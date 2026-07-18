import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, DM_Sans, Sora, EB_Garamond } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['500', '600'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['700'],
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  weight: ['400'],
  style: ['italic', 'normal'],
})

export const metadata: Metadata = {
  title: {
    default: 'India Yoga Tourism',
    template: '%s | India Yoga Tourism'
  },
  description: 'Ancient Wisdom. Modern Journey. Discover premium retreats and clinical wellness programmes in the Himalayas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${playfair.variable} ${cormorant.variable} ${dmSans.variable} ${sora.variable} ${ebGaramond.variable} h-full antialiased`}
      >
        <head>
          {/* Material Symbols Outlined Icon Font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col bg-background text-on-background">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
