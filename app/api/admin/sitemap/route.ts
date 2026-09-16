import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getSitemapData, generateSitemapXml, SitemapConfig, SitemapCustomItem } from '@/lib/sitemap-helper'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function checkAdminAuth() {
  const { userId } = await auth()
  if (!userId) return false

  const clerkUser = await currentUser()
  const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  if (userEmail === 'indiayogatourism@gmail.com') return true

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  return dbUser?.role === 'admin'
}

export async function GET() {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { config, customUrls, entries } = await getSitemapData()
    const xml = generateSitemapXml(entries)

    return NextResponse.json({
      success: true,
      config,
      customUrls,
      totalUrls: entries.length,
      xmlPreview: xml,
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/sitemap:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch sitemap data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { config, customUrls } = body

    if (config) {
      await prisma.setting.upsert({
        where: { key: 'sitemap_config' },
        update: { value: JSON.stringify(config) },
        create: { key: 'sitemap_config', value: JSON.stringify(config) },
      })
    }

    if (Array.isArray(customUrls)) {
      await prisma.setting.upsert({
        where: { key: 'sitemap_custom_urls' },
        update: { value: JSON.stringify(customUrls) },
        create: { key: 'sitemap_custom_urls', value: JSON.stringify(customUrls) },
      })
    }

    revalidatePath('/sitemap.xml')
    revalidatePath('/sitemap')

    const updatedData = await getSitemapData()
    const xml = generateSitemapXml(updatedData.entries)

    return NextResponse.json({
      success: true,
      message: 'Sitemap configuration updated successfully',
      config: updatedData.config,
      customUrls: updatedData.customUrls,
      totalUrls: updatedData.entries.length,
      xmlPreview: xml,
    })
  } catch (error: any) {
    console.error('Error in POST /api/admin/sitemap:', error)
    return NextResponse.json({ error: error.message || 'Failed to update sitemap settings' }, { status: 500 })
  }
}
