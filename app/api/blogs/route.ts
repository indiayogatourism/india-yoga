import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all blogs (Admin sees all, public queries filter published)
export async function GET() {
  try {
    const blogs = await (prisma as any).blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, blogs })
  } catch (error: any) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Create a new blog post with full SEO fields (Admin only)
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
      excerpt,
      content,
      coverImage,
      authorName,
      category,
      tags,
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
      return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 })
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    const newBlog = await (prisma as any).blogPost.create({
      data: {
        title,
        slug: cleanSlug,
        excerpt: excerpt || '',
        content,
        coverImage: coverImage || null,
        authorName: authorName || 'India Yoga Tourism Team',
        category: category || 'Ayurveda & Wellness',
        tags: Array.isArray(tags) ? tags : [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || '',
        metaKeywords: metaKeywords || '',
        canonicalUrl: canonicalUrl || '',
        ogTitle: ogTitle || metaTitle || title,
        ogDescription: ogDescription || metaDescription || excerpt || '',
        ogImage: ogImage || coverImage || null,
        customHtmlTags: customHtmlTags || null,
        published: published !== undefined ? published : true,
      },
    })

    return NextResponse.json({ success: true, blog: newBlog })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
