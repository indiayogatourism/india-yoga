import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indiayogatourism.com'
  const currentDate = new Date()

  // 1. Core Public Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/packages',
    '/programmes',
    '/online-classes',
    '/blog',
    '/gallery',
    '/about',
    '/contact',
    '/know-more',
    '/faqs',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }))

  let packageRoutes: MetadataRoute.Sitemap = []
  let blogRoutes: MetadataRoute.Sitemap = []
  let pageRoutes: MetadataRoute.Sitemap = []

  try {
    // 2. Dynamic Retreat Packages
    const packages = await prisma.package.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })

    packageRoutes = packages.map((pkg) => ({
      url: `${baseUrl}/packages/${pkg.slug}`,
      lastModified: pkg.updatedAt ? new Date(pkg.updatedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    // 3. Dynamic Blog Posts
    const blogs = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })

    blogRoutes = blogs.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // 4. Dynamic Custom Pages
    const pages = await prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })

    pageRoutes = pages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  } catch (err) {
    console.error('Error generating dynamic sitemap routes:', err)
  }

  return [...staticRoutes, ...packageRoutes, ...blogRoutes, ...pageRoutes]
}
