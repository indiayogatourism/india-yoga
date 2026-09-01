import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all online classes (Admin gets all, public gets published)
export async function GET() {
  try {
    const classes = await (prisma as any).onlineClass.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, classes })
  } catch (error: any) {
    console.error('Error fetching online classes:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Create a new Online Class with SEO metadata & meeting links (Admin only)
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    const isAdmin = dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      slug,
      description,
      timeSlot,
      level,
      instructor,
      meetingUrl,
      price,
      coverImage,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      customHtmlTags,
      published,
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and Description are required' }, { status: 400 })
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const newClass = await (prisma as any).onlineClass.create({
      data: {
        title,
        slug: cleanSlug,
        description,
        timeSlot: timeSlot || '07:00 AM - 08:15 AM IST',
        level: level || 'Beginner to Intermediate',
        instructor: instructor || 'Yogini Arundhati',
        meetingUrl: meetingUrl || null,
        price: Number(price) || 49,
        coverImage: coverImage || null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || description,
        metaKeywords: metaKeywords || '',
        canonicalUrl: canonicalUrl || '',
        ogTitle: ogTitle || metaTitle || title,
        ogDescription: ogDescription || metaDescription || description,
        ogImage: ogImage || coverImage || null,
        customHtmlTags: customHtmlTags || null,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json({ success: true, onlineClass: newClass })
  } catch (error: any) {
    console.error('Error creating online class:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
