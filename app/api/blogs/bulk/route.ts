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
    const blogs = Array.isArray(body) ? body : body.blogs

    if (!Array.isArray(blogs) || blogs.length === 0) {
      return NextResponse.json({ error: 'Please provide a valid array of blog posts to import' }, { status: 400 })
    }

    const createdBlogs = []
    const errors = []

    for (let i = 0; i < blogs.length; i++) {
      const item = blogs[i]
      try {
        if (!item.title || !item.content) {
          errors.push(`Blog ${i + 1}: Missing title or content`)
          continue
        }

        const slug = (item.slug || item.title)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')

        const tagsArray = Array.isArray(item.tags)
          ? item.tags
          : typeof item.tags === 'string'
          ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : []

        const blog = await prisma.blogPost.upsert({
          where: { slug },
          update: {
            title: item.title,
            content: item.content,
            excerpt: item.excerpt || item.content.slice(0, 200),
            category: item.category || 'Retreats & Wellness',
            authorName: item.authorName || item.author || 'Yogini Arundhati',

            coverImage: item.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
            tags: tagsArray,
            metaTitle: item.metaTitle || item.title,
            metaDescription: item.metaDescription || item.excerpt || item.content.slice(0, 160),
            metaKeywords: item.metaKeywords || '',
            canonicalUrl: item.canonicalUrl || '',
            ogTitle: item.ogTitle || item.metaTitle || item.title,
            ogDescription: item.ogDescription || item.metaDescription || item.excerpt,
            ogImage: item.ogImage || item.coverImage || null,
            customHtmlTags: item.customHtmlTags || null,
            published: item.published !== undefined ? Boolean(item.published) : true,
          },
          create: {
            title: item.title,
            slug,
            content: item.content,
            excerpt: item.excerpt || item.content.slice(0, 200),
            category: item.category || 'Retreats & Wellness',
            authorName: item.authorName || item.author || 'Yogini Arundhati',

            coverImage: item.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
            tags: tagsArray,
            metaTitle: item.metaTitle || item.title,
            metaDescription: item.metaDescription || item.excerpt || item.content.slice(0, 160),
            metaKeywords: item.metaKeywords || '',
            canonicalUrl: item.canonicalUrl || '',
            ogTitle: item.ogTitle || item.metaTitle || item.title,
            ogDescription: item.ogDescription || item.metaDescription || item.excerpt,
            ogImage: item.ogImage || item.coverImage || null,
            customHtmlTags: item.customHtmlTags || null,
            published: item.published !== undefined ? Boolean(item.published) : true,
          },
        })

        createdBlogs.push(blog)
      } catch (err: any) {
        errors.push(`Blog ${i + 1} (${item.title || 'Untitled'}): ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      count: createdBlogs.length,
      blogs: createdBlogs,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error bulk uploading blog posts:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
