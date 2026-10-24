import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/siteUrl'

const LAST_UPDATED = '24 October 2026'
const CONTACT_EMAIL = 'info@indiayogatourism.com'

export const metadata: Metadata = {
  title: 'Privacy Policy | India Yoga Tourism',
  description:
    'How India Yoga Tourism collects, uses and protects your personal information when you browse, book a retreat or join an online class.',
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: 'Privacy Policy | India Yoga Tourism',
    url: `${SITE_URL}/privacy-policy`,
    siteName: 'India Yoga Tourism',
    type: 'website',
  },
}

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'who-we-are',
    title: '1. Who we are',
    body: (
      <p>
        India Yoga Tourism (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is operated by Globazon Enterprises LLC,
        30 N Gould St Ste R, Sheridan, WY 82801, USA. This policy explains how we handle personal information collected
        through <Link href="/" className="underline">www.indiayogatourism.com</Link>, our booking system and our online
        classes.
      </p>
    ),
  },
  {
    id: 'what-we-collect',
    title: '2. Information we collect',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Account details</strong> – name, email address and login credentials when you create an account or sign in.</li>
        <li><strong>Booking &amp; enquiry details</strong> – contact number, nationality, travel dates, number of guests, preferences, dietary or medical notes you choose to share, and messages sent through our contact or WhatsApp channels.</li>
        <li><strong>Payment information</strong> – payments are processed by Razorpay and PayPal. We receive confirmation of the transaction (amount, status, reference ID) but do not store your full card or bank details.</li>
        <li><strong>Technical data</strong> – IP address, browser type, device information and pages visited, collected through server logs and essential cookies.</li>
      </ul>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How we use your information',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>To create and manage your account and bookings, and to deliver retreats and online classes.</li>
        <li>To process payments, issue confirmations and invoices, and handle refunds.</li>
        <li>To respond to enquiries and send service-related emails (booking confirmations, class links, schedule changes).</li>
        <li>To improve our website, prevent fraud and keep our services secure.</li>
        <li>To send newsletters or offers – only where you have opted in. You can unsubscribe at any time.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: '4. Who we share it with',
    body: (
      <>
        <p>We do not sell your personal information. We share it only with service providers that help us run the website and your booking:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Clerk</strong> – account sign-in and authentication.</li>
          <li><strong>Razorpay</strong> and <strong>PayPal</strong> – payment processing.</li>
          <li><strong>Amazon Web Services</strong> – website hosting, database and file storage.</li>
          <li><strong>Resend</strong> – delivery of transactional emails.</li>
          <li><strong>Retreat partners, teachers and accommodation providers</strong> – only the details needed to deliver the programme you booked.</li>
        </ul>
        <p className="mt-3">We may also disclose information where required by law or to protect our legal rights.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies',
    body: (
      <p>
        We use essential cookies to keep you signed in, secure your session and remember your preferences. You can block
        cookies in your browser settings, but parts of the site (such as sign-in and checkout) may not work without them.
      </p>
    ),
  },
  {
    id: 'retention',
    title: '6. How long we keep it',
    body: (
      <p>
        We keep personal information for as long as your account is active or as needed to provide our services, and
        afterwards only as long as required for legal, tax and accounting purposes. You can ask us to delete your account
        at any time.
      </p>
    ),
  },
  {
    id: 'international',
    title: '7. International transfers',
    body: (
      <p>
        Our guests come from around the world and our retreats take place in India. Your information may be processed in
        India, the United States and other countries where our service providers operate. We take reasonable steps to
        ensure it remains protected wherever it is processed.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: '8. Your rights',
    body: (
      <p>
        Depending on where you live (including under India&apos;s Digital Personal Data Protection Act, the EU/UK GDPR and
        applicable US state laws), you may have the right to access, correct, delete or obtain a copy of your personal
        information, to withdraw consent and to object to certain processing. To exercise any of these rights, email us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>. We will respond within a reasonable
        time and in line with applicable law.
      </p>
    ),
  },
  {
    id: 'security',
    title: '9. Security',
    body: (
      <p>
        We use encrypted (HTTPS) connections, access controls and reputable infrastructure providers to protect your
        information. No method of transmission or storage is completely secure, but we work to protect your data and will
        notify you where required by law in the event of a breach.
      </p>
    ),
  },
  {
    id: 'children',
    title: '10. Children',
    body: (
      <p>
        Our services are intended for adults. Bookings for anyone under 18 must be made by a parent or guardian, and we do
        not knowingly collect personal information directly from children.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '11. Changes to this policy',
    body: (
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date below shows when it was last
        changed. Significant changes will be highlighted on this page.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '12. Contact us',
    body: (
      <p>
        Questions about this policy or your data? Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a> or visit our{' '}
        <Link href="/contact" className="underline">contact page</Link>.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f8f6f0] pb-24">
      <header className="bg-[#17372b] px-6 pb-16 pt-32 text-white md:pb-20 md:pt-40">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e5cf9a]">Legal</p>
          <h1 className="mt-4 font-display-lg text-4xl leading-tight md:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-white/60">Last updated: {LAST_UPDATED}</p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 pt-12">
        <nav aria-label="On this page" className="mb-10 rounded-2xl border border-black/5 bg-white p-6 text-sm shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#2c694e]">On this page</p>
          <ol className="grid gap-1.5 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#17372b] hover:underline">{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-10 text-[15px] leading-7 text-gray-800">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="mb-3 font-display-lg text-xl font-bold text-[#17372b] md:text-2xl">{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
