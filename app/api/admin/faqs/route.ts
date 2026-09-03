import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper to check admin authorization
async function checkAdminAuth() {
  const { userId } = await auth()
  if (!userId) return false

  const clerkUser = await currentUser()
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  return dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'
}

// GET: Fetch all FAQ items for admin (including unpublished)
export async function GET() {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const faqs = await prisma.faqItem.findMany({
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    // Fetch FAQ Page SEO Meta if present
    const seoMeta = await prisma.seoMeta.findUnique({
      where: { pageKey: 'faqs' },
    })

    return NextResponse.json({ success: true, faqs, seoMeta })
  } catch (error: any) {
    console.error('Error fetching admin FAQs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Create a new FAQ item
export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { question, answer, category = 'General', orderIndex = 0, isPublished = true } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const faq = await prisma.faqItem.create({
      data: {
        question,
        answer,
        category,
        orderIndex: Number(orderIndex) || 0,
        isPublished: Boolean(isPublished),
      },
    })

    return NextResponse.json({ success: true, faq })
  } catch (error: any) {
    console.error('Error creating FAQ item:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT: Update an existing FAQ item OR update FAQ SEO Meta
export async function PUT(req: Request) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { isSeoUpdate, id, question, answer, category, orderIndex, isPublished, title, description, keywords, ogImage } = body

    // 1. FAQ SEO Update
    if (isSeoUpdate) {
      const updatedSeo = await prisma.seoMeta.upsert({
        where: { pageKey: 'faqs' },
        update: {
          title: title || 'Frequently Asked Questions | India Yoga Tourism',
          description: description || 'Answers to common questions about Rishikesh retreats, Panchakarma detox, online yoga classes, visas, and booking.',
          keywords: keywords || 'yoga faq, rishikesh retreat questions, panchakarma faq, online class info',
          ogImage: ogImage || null,
        },
        create: {
          pageKey: 'faqs',
          title: title || 'Frequently Asked Questions | India Yoga Tourism',
          description: description || 'Answers to common questions about Rishikesh retreats, Panchakarma detox, online yoga classes, visas, and booking.',
          keywords: keywords || 'yoga faq, rishikesh retreat questions, panchakarma faq, online class info',
          ogImage: ogImage || null,
        },
      })

      return NextResponse.json({ success: true, seoMeta: updatedSeo, message: 'FAQ SEO metadata updated' })
    }

    // 2. FAQ Item Update
    if (!id) {
      return NextResponse.json({ error: 'FAQ item ID is required' }, { status: 400 })
    }

    const updatedFaq = await prisma.faqItem.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(category !== undefined && { category }),
        ...(orderIndex !== undefined && { orderIndex: Number(orderIndex) }),
        ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      },
    })

    return NextResponse.json({ success: true, faq: updatedFaq })
  } catch (error: any) {
    console.error('Error updating FAQ item:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE: Delete an FAQ item
export async function DELETE(req: Request) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    await prisma.faqItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'FAQ deleted' })
  } catch (error: any) {
    console.error('Error deleting FAQ item:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
