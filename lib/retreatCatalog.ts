import { cache } from 'react'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { filterAvailablePackages } from '@/lib/packageAvailability'
import { withPackageImageUrls } from '@/lib/packageImages'

const retreatSelect = {
  id: true, slug: true, title: true, shortDescription: true, category: true,
  location: true, durationDays: true, durationNights: true, difficultyLevel: true,
  startDate: true, endDate: true, upcomingDates: true, featuredImage: true,
  priceDormitory: true, priceShared: true, pricePrivate: true,
  enableDormitory: true, enableShared: true, enablePrivate: true,
  highlights: true,
} satisfies Prisma.PackageSelect

export type RetreatListing = Prisma.PackageGetPayload<{ select: typeof retreatSelect }>

export const getRetreatCatalog = cache(async (): Promise<RetreatListing[]> => {
  try {
    const packages = await prisma.package.findMany({
      where: { status: 'PUBLISHED', category: 'RETREAT' },
      select: retreatSelect,
      orderBy: [{ totalBookings: 'desc' }, { title: 'asc' }],
    })
    return filterAvailablePackages(packages).map(withPackageImageUrls)
  } catch {
    return []
  }
})

export const getPackageDetail = cache(async (slug: string) => {
  try {
    return await prisma.package.findUnique({
      where: { slug },
      include: { reviews: { where: { isPublished: true, isVerified: true }, include: { user: true }, orderBy: { createdAt: 'desc' } } },
    })
  } catch {
    return null
  }
})
