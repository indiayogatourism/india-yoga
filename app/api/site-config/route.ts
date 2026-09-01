import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch global site configuration
export async function GET() {
  try {
    let config = await (prisma as any).siteConfig.findUnique({
      where: { id: 'global' },
    })

    if (!config) {
      config = await (prisma as any).siteConfig.create({
        data: {
          id: 'global',
          siteName: 'India Yoga Tourism',
          siteTagline: 'Ancient Wisdom. Modern Journey.',
          announcementText: '✦ Join Rishikesh Yoga Masters Live Stream ✦',
          heroTitle: 'Immerse in Authentic Himalayan Healing',
          heroSubtitle: 'Traditional Ashram practice, Panchakarma detoxification, and spiritual retreats in Rishikesh.',
          contactEmail: 'info@indiayogatourism.com',
          contactPhone: '+91 99998 76349',
          whatsappNumber: '+91 99998 76349',
          officeAddress: 'Cloud 9 Tower, Sec-1, Ghaziabad, UP 201010',
          footerText: '© 2026 India Yoga Tourism. All rights reserved.',
          metaTitle: 'India Yoga Tourism | Authentic Rishikesh Retreats & Online Classes',
          metaDescription: 'Discover authentic Panchakarma detoxification, Ayurvedic retreats, and live stream online classes with certified masters in Rishikesh.',
          metaKeywords: 'yoga retreats, panchakarma rishikesh, ayurveda detox, online yoga classes',
          canonicalUrl: 'https://indiayogatourism.com',
          destinationsJson: JSON.stringify([
            { id: '1', name: 'Rishikesh', subtitle: 'Yoga Capital of the World', locationQuery: 'Rishikesh', icon: 'landscape' },
            { id: '2', name: 'Kerala', subtitle: 'Traditional Ayurvedic Sanctuary', locationQuery: 'Kerala', icon: 'spa' },
            { id: '3', name: 'Dharamshala', subtitle: 'Peace in the Himalayan foothills', locationQuery: 'Dharamshala', icon: 'filter_drama' },
          ]),
        },
      })
    }

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    console.error('Error fetching site config:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT: Update global site configuration (Admin only)
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
    const {
      siteName,
      siteTagline,
      announcementText,
      heroTitle,
      heroSubtitle,
      contactEmail,
      contactPhone,
      whatsappNumber,
      officeAddress,
      footerText,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      customHtmlTags,
      destinationsJson,
    } = body

    const updatedConfig = await (prisma as any).siteConfig.upsert({
      where: { id: 'global' },
      update: {
        siteName,
        siteTagline,
        announcementText,
        heroTitle,
        heroSubtitle,
        contactEmail,
        contactPhone,
        whatsappNumber,
        officeAddress,
        footerText,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        customHtmlTags,
        destinationsJson,
      },
      create: {
        id: 'global',
        siteName: siteName || 'India Yoga Tourism',
        siteTagline: siteTagline || 'Ancient Wisdom. Modern Journey.',
        announcementText: announcementText || '',
        heroTitle,
        heroSubtitle,
        contactEmail: contactEmail || 'info@indiayogatourism.com',
        contactPhone: contactPhone || '+91 99998 76349',
        whatsappNumber: whatsappNumber || '+91 99998 76349',
        officeAddress: officeAddress || 'Cloud 9 Tower, Sec-1, Ghaziabad, UP 201010',
        footerText,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        customHtmlTags,
        destinationsJson,
      },
    })

    return NextResponse.json({ success: true, config: updatedConfig })
  } catch (error: any) {
    console.error('Error updating site config:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
