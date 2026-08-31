import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all gallery images
export async function GET() {
  try {
    const images = await (prisma as any).galleryImage.findMany({
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json({ success: true, images })
  } catch (error: any) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Create a new gallery image (Admin only)
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    const isAdmin = dbUser?.role === 'admin' || userEmail === 'indiayogatourism@gmail.com'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { title, category, url, description } = body

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 })
    }

    const newImage = await (prisma as any).galleryImage.create({
      data: {
        title,
        category: category || 'retreats',
        url,
        description: description || '',
      }
    })

    return NextResponse.json({ success: true, image: newImage })
  } catch (error: any) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
