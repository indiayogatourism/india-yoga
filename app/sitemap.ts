import type { MetadataRoute } from 'next'
import { getSitemapData } from '@/lib/sitemap-helper'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { entries } = await getSitemapData()
    return entries.map((entry) => ({
      url: entry.loc,
      lastModified: new Date(entry.lastmod),
      changeFrequency: entry.changefreq as any,
      priority: parseFloat(entry.priority),
    }))
  } catch (err) {
    console.error('Error generating Next.js sitemap metadata:', err)
    return []
  }
}
