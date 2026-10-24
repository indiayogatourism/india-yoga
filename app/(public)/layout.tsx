import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import { getSiteConfig } from '@/lib/siteConfig'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch site settings on the server so the navbar/footer render the real
  // name & tagline on first paint instead of swapping text after an API call.
  const config = await getSiteConfig()
  const shared = {
    siteName: config.siteName,
    siteTagline: config.siteTagline,
    announcementText: config.announcementText,
    footerText: config.footerText,
    destinations: config.destinations,
  }

  return (
    <>
      <Navbar initialConfig={shared} />
      <div className="flex-grow">
        {children}
      </div>
      <Footer initialConfig={shared} />
      <FloatingWhatsApp />
    </>
  )
}
