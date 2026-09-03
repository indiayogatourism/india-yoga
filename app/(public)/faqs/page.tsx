import React from 'react'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import FaqClientView from '@/components/FaqClientView'

export const dynamic = 'force-dynamic'

const DEFAULT_FAQS = [
  {
    question: 'What makes India Yoga Tourism retreats authentic and unique?',
    answer: 'Our retreats are located in sacred Himalayan sanctuaries such as Rishikesh and Uttarkashi. We collaborate directly with traditional ashram masters, certified Ayurvedic doctors, and experienced yogis to offer genuine traditional Hatha, Ashtanga, Pranayama, and Panchakarma detox without commercialization.',
    category: 'Retreats & Ashram',
    orderIndex: 1,
    isPublished: true,
  },
  {
    question: 'What is included in a retreat booking package?',
    answer: 'All our retreat packages include private or shared luxury ashram accommodation, 3 daily organic sattvic vegetarian meals, herbal teas, daily yoga & meditation classes, Ganga Aarti excursions, and airport/station transfer support.',
    category: 'Retreats & Ashram',
    orderIndex: 2,
    isPublished: true,
  },
  {
    question: 'Do I need prior yoga experience to join a retreat?',
    answer: 'No prior experience is required. Our experienced gurus tailor daily sessions for beginners, intermediate, and advanced practitioners alike.',
    category: 'Retreats & Ashram',
    orderIndex: 3,
    isPublished: true,
  },
  {
    question: 'How do live online yoga classes work?',
    answer: 'Upon enrolling in an online class, you receive a direct live stream join link in your user dashboard and via email. You can join live interactive sessions led by Rishikesh masters or access recorded replays at your convenience.',
    category: 'Online Classes',
    orderIndex: 1,
    isPublished: true,
  },
  {
    question: 'What payment methods do you accept for bookings and online classes?',
    answer: 'We accept international credit/debit cards via Razorpay, PayPal, and direct bank wire transfers. All transactions are encrypted and processed securely.',
    category: 'Booking & Payments',
    orderIndex: 1,
    isPublished: true,
  },
  {
    question: 'What is your cancellation and refund policy?',
    answer: 'Retreat bookings can be rescheduled up to 14 days before arrival without penalty. Cancellations requested 30+ days prior to arrival receive a full refund minus minimal transaction processing fees.',
    category: 'Booking & Payments',
    orderIndex: 2,
    isPublished: true,
  },
  {
    question: 'Do international guests need an Indian Tourist Visa?',
    answer: 'Yes, most international travelers require an e-Tourist Visa (e-Visa) for India, which can be easily obtained online via the official Government of India portal prior to travel. We provide official booking confirmation vouchers to support your visa application.',
    category: 'Visa & Travel',
    orderIndex: 1,
    isPublished: true,
  },
]

// Server-side Dynamic Metadata Generation
export async function generateMetadata(): Promise<Metadata> {
  const seoMeta = await prisma.seoMeta.findUnique({
    where: { pageKey: 'faqs' },
  })

  const title = seoMeta?.title || 'Frequently Asked Questions | India Yoga Tourism'
  const description =
    seoMeta?.description ||
    'Answers to common questions about Rishikesh retreats, Panchakarma ayurvedic detox, online classes, visas, and booking.'
  const keywords =
    seoMeta?.keywords ||
    'yoga faq, rishikesh retreat questions, panchakarma faq, online class info, india visa'

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: seoMeta?.ogImage ? [{ url: seoMeta.ogImage }] : [],
    },
  }
}

export default async function FaqPage() {
  let faqs = await prisma.faqItem.findMany({
    where: { isPublished: true },
    orderBy: [
      { category: 'asc' },
      { orderIndex: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  // Auto-seed if empty
  if (faqs.length === 0) {
    await prisma.faqItem.createMany({
      data: DEFAULT_FAQS,
    })
    faqs = await prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
        { createdAt: 'asc' },
      ],
    })
  }

  // Generate Google FAQPage Schema.org JSON-LD Structured Data for SEO
  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-[#2C3E35]">
      {/* FAQPage JSON-LD Structured Data Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E2C799] bg-[#1C2E26] px-3 py-1 rounded-full inline-block shadow-sm">
            ✦ Knowledge Base &amp; Assistance ✦
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display-lg text-[#1C2E26] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-body-md">
            Everything you need to know about our Himalayan retreats, Panchakarma detoxification, online live classes, international travel, and bookings.
          </p>
        </div>

        {/* Client Interactive FAQ View */}
        <FaqClientView
          faqs={faqs.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category,
            orderIndex: f.orderIndex,
            isPublished: f.isPublished,
          }))}
        />
      </div>
    </div>
  )
}
