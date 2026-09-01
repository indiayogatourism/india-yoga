import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
    const pages = Array.isArray(body) ? body : body.pages

    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json({ error: 'Please provide a valid array of pages to import' }, { status: 400 })
    }

    const createdPages = []
    const errors = []

    for (let i = 0; i < pages.length; i++) {
      const item = pages[i]
      try {
        if (!item.title || !item.content) {
          errors.push(`Item ${i + 1}: Missing title or content`)
          continue
        }

        const slug = (item.slug || item.title)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')

        const page = await prisma.page.upsert({
          where: { slug },
          update: {
            title: item.title,
            content: item.content,
            metaTitle: item.metaTitle || item.title,
            metaDescription: item.metaDescription || item.content.slice(0, 160),
            metaKeywords: item.metaKeywords || '',
            canonicalUrl: item.canonicalUrl || '',
            ogTitle: item.ogTitle || item.metaTitle || item.title,
            ogDescription: item.ogDescription || item.metaDescription || item.content.slice(0, 160),
            ogImage: item.ogImage || null,
            customHtmlTags: item.customHtmlTags || null,
            published: item.published !== undefined ? Boolean(item.published) : true,
          },
          create: {
            title: item.title,
            slug,
            content: item.content,
            metaTitle: item.metaTitle || item.title,
            metaDescription: item.metaDescription || item.content.slice(0, 160),
            metaKeywords: item.metaKeywords || '',
            canonicalUrl: item.canonicalUrl || '',
            ogTitle: item.ogTitle || item.metaTitle || item.title,
            ogDescription: item.ogDescription || item.metaDescription || item.content.slice(0, 160),
            ogImage: item.ogImage || null,
            customHtmlTags: item.customHtmlTags || null,
            published: item.published !== undefined ? Boolean(item.published) : true,
          },
        })

        createdPages.push(page)
      } catch (err: any) {
        errors.push(`Item ${i + 1} (${item.title || 'Untitled'}): ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      count: createdPages.length,
      pages: createdPages,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error bulk uploading pages:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
