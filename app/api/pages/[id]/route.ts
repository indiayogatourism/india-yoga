import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { indexNowPage } from '@/lib/indexnow'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

// PUT: Update an existing custom page (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
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

    const existingPage = await (prisma as any).page.findUnique({ where: { id } })
    if (!existingPage) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) {
      const baseSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      if (!baseSlug) {
        return NextResponse.json({ success: false, error: 'URL slug must contain letters or numbers' }, { status: 400 })
      }
      let cleanSlug = baseSlug
      let suffix = 1
      while (await (prisma as any).page.findFirst({ where: { slug: cleanSlug, NOT: { id } }, select: { id: true } })) {
        cleanSlug = `${baseSlug}-${suffix++}`
      }
      updateData.slug = cleanSlug
    }
    if (content !== undefined) updateData.content = content
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl
    if (ogTitle !== undefined) updateData.ogTitle = ogTitle
    if (ogDescription !== undefined) updateData.ogDescription = ogDescription
    if (ogImage !== undefined) updateData.ogImage = ogImage
    if (customHtmlTags !== undefined) updateData.customHtmlTags = customHtmlTags
    if (published !== undefined) updateData.published = published

    const updatedPage = await (prisma as any).page.update({
      where: { id },
      data: updateData,
    })

    revalidatePath(`/${existingPage.slug}`)
    revalidatePath(`/${updatedPage.slug}`)
    revalidatePath('/know-more')
    revalidatePath('/sitemap.xml')
    if (updatedPage.published || existingPage.published !== updatedPage.published) {
      indexNowPage(updatedPage.slug).catch(() => {})
    }

    return NextResponse.json({ success: true, page: updatedPage })
  } catch (error: any) {
    console.error('Error updating page:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a custom page (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const existingPage = await (prisma as any).page.findUnique({ where: { id }, select: { slug: true } })
    await (prisma as any).page.delete({
      where: { id },
    })

    if (existingPage?.slug) revalidatePath(`/${existingPage.slug}`)
    revalidatePath('/know-more')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ success: true, message: 'Custom page deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting page:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
