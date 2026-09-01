import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PUT: Update an online class (Admin only)
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

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) {
      updateData.slug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }
    if (description !== undefined) updateData.description = description
    if (timeSlot !== undefined) updateData.timeSlot = timeSlot
    if (level !== undefined) updateData.level = level
    if (instructor !== undefined) updateData.instructor = instructor
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl
    if (price !== undefined) updateData.price = Number(price)
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl
    if (ogTitle !== undefined) updateData.ogTitle = ogTitle
    if (ogDescription !== undefined) updateData.ogDescription = ogDescription
    if (ogImage !== undefined) updateData.ogImage = ogImage
    if (customHtmlTags !== undefined) updateData.customHtmlTags = customHtmlTags
    if (published !== undefined) updateData.published = published

    const updatedClass = await (prisma as any).onlineClass.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, onlineClass: updatedClass })
  } catch (error: any) {
    console.error('Error updating online class:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE: Delete an online class (Admin only)
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
    await (prisma as any).onlineClass.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Online class deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting online class:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
