import type { Metadata } from 'next'
import { Playfair_Display, Cormorant_Garamond, DM_Sans, Sora, EB_Garamond } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { getSiteConfig } from '@/lib/siteConfig'
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

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  return {
    title: {
      default: config.metaTitle || config.siteName,
      template: `%s | ${config.siteName}`,
    },
    description: config.metaDescription || config.siteTagline,
    keywords: config.metaKeywords ? config.metaKeywords.split(',').map((k) => k.trim()) : undefined,
    alternates: config.canonicalUrl ? { canonical: config.canonicalUrl } : undefined,
    openGraph: {
      title: config.ogTitle || config.metaTitle || config.siteName,
      description: config.ogDescription || config.metaDescription || config.siteTagline,
      images: config.ogImage ? [{ url: config.ogImage }] : undefined,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteConfig = await getSiteConfig()

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
          {siteConfig.customHtmlTags && (
            <div dangerouslySetInnerHTML={{ __html: siteConfig.customHtmlTags }} />
          )}
        </head>
        <body className="min-h-full flex flex-col bg-background text-on-background">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
