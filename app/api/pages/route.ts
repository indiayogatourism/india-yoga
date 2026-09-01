import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all custom pages
export async function GET() {
  try {
    const pages = await (prisma as any).page.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, pages })
  } catch (error: any) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Create a new custom page with full SEO fields (Admin only)
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
      content,
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

    if (!title || !content) {
      return NextResponse.json({ error: 'Page title and Content are required' }, { status: 400 })
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const newPage = await (prisma as any).page.create({
      data: {
        title,
        slug: cleanSlug,
        content,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || title,
        metaKeywords: metaKeywords || '',
        canonicalUrl: canonicalUrl || '',
        ogTitle: ogTitle || metaTitle || title,
        ogDescription: ogDescription || metaDescription || title,
        ogImage: ogImage || null,
        customHtmlTags: customHtmlTags || null,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json({ success: true, page: newPage })
  } catch (error: any) {
    console.error('Error creating page:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
