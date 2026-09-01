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
      itinerary,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      customHtmlTags,
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
        category: category || 'PROGRAMME',
        location: location || 'Rishikesh, Himalayas',
        locationTag: locationTag || 'Himalayan Retreat',
        durationDays: Number(durationDays) || 14,
        durationNights: Number(durationNights) || 14,
        priceShared: Number(priceShared) || 1499,
        pricePrivate: Number(pricePrivate) || 2199,
        maxGroupSize: Number(maxGroupSize) || 12,
        difficultyLevel: difficultyLevel || 'Beginner',
        shortDescription: shortDescription || '',
        description: description || shortDescription || '',
        featuredImage: featuredImage || null,
        highlights: Array.isArray(highlights) ? highlights : [],
        inclusions: Array.isArray(inclusions) ? inclusions : [],
        exclusions: Array.isArray(exclusions) ? exclusions : [],
        itinerary: itinerary || [],
        status: status || 'PUBLISHED',
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || shortDescription || '',
        metaKeywords: metaKeywords || '',
        canonicalUrl: canonicalUrl || '',
        ogTitle: ogTitle || metaTitle || title,
        ogDescription: ogDescription || metaDescription || shortDescription || '',
        ogImage: ogImage || featuredImage || null,
        customHtmlTags: customHtmlTags || null,
      }
    })

    return NextResponse.json({ success: true, package: newPackage })
  } catch (error: any) {
    console.error('Package creation error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
