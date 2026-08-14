import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
