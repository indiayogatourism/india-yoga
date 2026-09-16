import { NextResponse } from 'next/server'
import { getSitemapData, generateSitemapXml } from '@/lib/sitemap-helper'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { entries } = await getSitemapData()
    const xml = generateSitemapXml(entries)

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error: any) {
    console.error('Error serving sitemap.xml:', error)
    return new Response('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>', {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    })
  }
}
