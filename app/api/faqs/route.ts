import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function GET() {
  try {
    let faqs = await prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    // Auto-seed default FAQs if DB table is empty
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

    // Fetch SEO metadata for FAQ page
    const seoMeta = await prisma.seoMeta.findUnique({
      where: { pageKey: 'faqs' },
    })

    return NextResponse.json({
      success: true,
      faqs,
      seoMeta: seoMeta || {
        title: 'Frequently Asked Questions | India Yoga Tourism',
        description: 'Find answers to common questions about Rishikesh yoga retreats, Panchakarma ayurvedic detox, online classes, travel visas, and booking.',
        keywords: 'yoga faq, rishikesh retreat questions, panchakarma faq, online class info, india travel visa',
      },
    })
  } catch (error: any) {
    console.error('Error fetching public FAQs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
