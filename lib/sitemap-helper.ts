import { prisma } from '@/lib/prisma'

export interface SitemapCustomItem {
  id: string
  url: string
  priority: number
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  enabled: boolean
  lastmod?: string
}

export interface SitemapConfig {
  baseUrl: string
  includeStatic: boolean
  includePackages: boolean
  includeBlogs: boolean
  includePages: boolean
  includeClasses: boolean
  customXml?: string
}

export const DEFAULT_SITEMAP_CONFIG: SitemapConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://indiayogatourism.com',
  includeStatic: true,
  includePackages: true,
  includeBlogs: true,
  includePages: true,
  includeClasses: true,
  customXml: '',
}

export const DEFAULT_STATIC_ROUTES = [
  { path: '', priority: 1.0, changefreq: 'daily' },
  { path: '/packages', priority: 0.9, changefreq: 'daily' },
  { path: '/programmes', priority: 0.9, changefreq: 'daily' },
  { path: '/online-classes', priority: 0.8, changefreq: 'weekly' },
  { path: '/blog', priority: 0.8, changefreq: 'daily' },
  { path: '/gallery', priority: 0.7, changefreq: 'weekly' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/know-more', priority: 0.6, changefreq: 'monthly' },
  { path: '/faqs', priority: 0.6, changefreq: 'monthly' },
]

export async function getSitemapData() {
  let config: SitemapConfig = { ...DEFAULT_SITEMAP_CONFIG }
  let customUrls: SitemapCustomItem[] = []

  try {
    const configSetting = await prisma.setting.findUnique({
      where: { key: 'sitemap_config' },
    })
    if (configSetting?.value) {
      config = { ...config, ...JSON.parse(configSetting.value) }
    }

    const customUrlsSetting = await prisma.setting.findUnique({
      where: { key: 'sitemap_custom_urls' },
    })
    if (customUrlsSetting?.value) {
      customUrls = JSON.parse(customUrlsSetting.value)
    }
  } catch (err) {
    console.error('Error reading sitemap config from database:', err)
  }

  const cleanBaseUrl = config.baseUrl.replace(/\/+$/, '')
  const currentDateISO = new Date().toISOString()

  interface UrlEntry {
    loc: string
    lastmod: string
    changefreq: string
    priority: string
  }

  const entries: UrlEntry[] = []
  const seenUrls = new Set<string>()

  const addEntry = (pathOrUrl: string, priorityNum: number, changefreq: string, lastmodDate?: string | Date | null) => {
    let fullUrl = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
      ? pathOrUrl
      : `${cleanBaseUrl}${pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl}`

    if (seenUrls.has(fullUrl)) return
    seenUrls.add(fullUrl)

    let formattedDate = currentDateISO
    if (lastmodDate) {
      try {
        formattedDate = new Date(lastmodDate).toISOString()
      } catch (e) {
        formattedDate = currentDateISO
      }
    }

    entries.push({
      loc: fullUrl,
      lastmod: formattedDate,
      changefreq,
      priority: priorityNum.toFixed(1),
    })
  }

  // 1. Static Routes
  if (config.includeStatic) {
    for (const route of DEFAULT_STATIC_ROUTES) {
      addEntry(route.path, route.priority, route.changefreq)
    }
  }

  // 2. Dynamic Retreat Packages
  if (config.includePackages) {
    try {
      const packages = await prisma.package.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      })
      for (const pkg of packages) {
        addEntry(`/packages/${pkg.slug}`, 0.9, 'weekly', pkg.updatedAt)
      }
    } catch (e) {
      console.error('Error fetching packages for sitemap:', e)
    }
  }

  // 3. Dynamic Blog Posts
  if (config.includeBlogs) {
    try {
      const blogs = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      })
      for (const post of blogs) {
        addEntry(`/blog/${post.slug}`, 0.8, 'weekly', post.updatedAt)
      }
    } catch (e) {
      console.error('Error fetching blog posts for sitemap:', e)
    }
  }

  // 4. Dynamic Custom Pages
  if (config.includePages) {
    try {
      const pages = await prisma.page.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      })
      for (const page of pages) {
        addEntry(`/${page.slug}`, 0.7, 'monthly', page.updatedAt)
      }
    } catch (e) {
      console.error('Error fetching custom pages for sitemap:', e)
    }
  }

  // 5. Dynamic Online Classes
  if (config.includeClasses) {
    try {
      const classes = await prisma.onlineClass.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      })
      for (const cls of classes) {
        addEntry(`/online-classes/${cls.slug}`, 0.8, 'weekly', cls.updatedAt)
      }
    } catch (e) {
      console.error('Error fetching online classes for sitemap:', e)
    }
  }

  // 6. Custom User-Defined Sitemap Items
  for (const item of customUrls) {
    if (item.enabled && item.url) {
      addEntry(item.url, Number(item.priority) || 0.5, item.changefreq || 'weekly', item.lastmod)
    }
  }

  return { config, customUrls, entries }
}

export function generateSitemapXml(
  entries: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>,
  customXml?: string
): string {
  const xmlEntries = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n')

  const extraBlock = customXml && customXml.trim() ? `\n${customXml.trim()}` : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlEntries}${extraBlock}
</urlset>`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
