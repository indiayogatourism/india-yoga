import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all online class enrolments for admin
export async function GET() {
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

    const enrolments = await prisma.onlineClassEnrolment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        onlineClass: {
          select: {
            id: true,
            title: true,
            slug: true,
            timeSlot: true,
            instructor: true,
            meetingUrl: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, enrolments })
  } catch (error: any) {
    console.error('Error fetching admin enrolments:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST: Manually enroll student in an online class
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
    const { targetUserId, classId, status = 'ACTIVE' } = body

    if (!targetUserId || !classId) {
      return NextResponse.json({ error: 'targetUserId and classId are required' }, { status: 400 })
    }

    // Check if enrolment already exists
    const existing = await prisma.onlineClassEnrolment.findFirst({
      where: {
        userId: targetUserId,
        classId,
      },
    })

    if (existing) {
      const updated = await prisma.onlineClassEnrolment.update({
        where: { id: existing.id },
        data: { status },
        include: {
          user: true,
          onlineClass: true,
        },
      })
      return NextResponse.json({ success: true, enrolment: updated, message: 'Enrolment status updated' })
    }

    const newEnrolment = await prisma.onlineClassEnrolment.create({
      data: {
        userId: targetUserId,
        classId,
        status,
      },
      include: {
        user: true,
        onlineClass: true,
      },
    })

    return NextResponse.json({ success: true, enrolment: newEnrolment })
  } catch (error: any) {
    console.error('Error creating enrolment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT: Update enrolment status
export async function PUT(req: Request) {
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
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Enrolment ID and status are required' }, { status: 400 })
    }

    const updated = await prisma.onlineClassEnrolment.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        onlineClass: true,
      },
    })

    return NextResponse.json({ success: true, enrolment: updated })
  } catch (error: any) {
    console.error('Error updating enrolment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE: Revoke enrolment
export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Enrolment ID is required' }, { status: 400 })
    }

    await prisma.onlineClassEnrolment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Enrolment revoked' })
  } catch (error: any) {
    console.error('Error deleting enrolment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
