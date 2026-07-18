import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      slug,
      category,
      location,
      locationTag,
      durationDays,
      durationNights,
      priceShared,
      pricePrivate,
      maxGroupSize,
      difficultyLevel,
      shortDescription,
      description,
      featuredImage,
      highlights,
      inclusions,
      exclusions,
      itinerary
    } = body

    // Validate unique slug
    const existing = await prisma.package.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json({ error: 'A package with this URL slug already exists.' }, { status: 400 })
    }

    const newPackage = await prisma.package.create({
      data: {
        title,
        slug,
        category,
        location,
        locationTag,
        durationDays,
        durationNights,
        priceShared,
        pricePrivate,
        maxGroupSize,
        difficultyLevel,
        shortDescription,
        description,
        featuredImage,
        highlights,
        inclusions,
        exclusions,
        itinerary,
        status: 'PUBLISHED'
      }
    })

    return NextResponse.json({ success: true, package: newPackage })
  } catch (error: any) {
    console.error('Package creation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
