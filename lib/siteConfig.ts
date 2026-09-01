import { prisma } from '@/lib/prisma'

export interface DestinationItem {
  id: string
  name: string
  subtitle: string
  locationQuery: string
  icon: string
}

export interface SiteConfigValues {
  siteName: string
  siteTagline: string
  announcementText: string
  heroTitle: string
  heroSubtitle: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  officeAddress: string
  footerText: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  customHtmlTags: string
  destinationsJson: string
  destinations: DestinationItem[]
}

export const defaultDestinations: DestinationItem[] = [
  { id: '1', name: 'Rishikesh', subtitle: 'Yoga Capital of the World', locationQuery: 'Rishikesh', icon: 'landscape' },
  { id: '2', name: 'Kerala', subtitle: 'Traditional Ayurvedic Sanctuary', locationQuery: 'Kerala', icon: 'spa' },
  { id: '3', name: 'Dharamshala', subtitle: 'Peace in the Himalayan foothills', locationQuery: 'Dharamshala', icon: 'filter_drama' },
]

export const defaultSiteConfig: SiteConfigValues = {
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
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  customHtmlTags: '',
  destinationsJson: JSON.stringify(defaultDestinations),
  destinations: defaultDestinations,
}

export async function getSiteConfig(): Promise<SiteConfigValues> {
  try {
    const config = await (prisma as any).siteConfig.findUnique({
      where: { id: 'global' },
    })

    if (!config) return defaultSiteConfig

    let parsedDestinations: DestinationItem[] = defaultDestinations
    if (config.destinationsJson) {
      try {
        const temp = JSON.parse(config.destinationsJson)
        if (Array.isArray(temp) && temp.length > 0) {
          parsedDestinations = temp
        }
      } catch (e) {
        // use default
      }
    }

    return {
      siteName: config.siteName || defaultSiteConfig.siteName,
      siteTagline: config.siteTagline || defaultSiteConfig.siteTagline,
      announcementText: config.announcementText || defaultSiteConfig.announcementText,
      heroTitle: config.heroTitle || defaultSiteConfig.heroTitle,
      heroSubtitle: config.heroSubtitle || defaultSiteConfig.heroSubtitle,
      contactEmail: config.contactEmail || defaultSiteConfig.contactEmail,
      contactPhone: config.contactPhone || defaultSiteConfig.contactPhone,
      whatsappNumber: config.whatsappNumber || defaultSiteConfig.whatsappNumber,
      officeAddress: config.officeAddress || defaultSiteConfig.officeAddress,
      footerText: config.footerText || defaultSiteConfig.footerText,
      metaTitle: config.metaTitle || defaultSiteConfig.metaTitle,
      metaDescription: config.metaDescription || defaultSiteConfig.metaDescription,
      metaKeywords: config.metaKeywords || defaultSiteConfig.metaKeywords,
      canonicalUrl: config.canonicalUrl || defaultSiteConfig.canonicalUrl,
      ogTitle: config.ogTitle || defaultSiteConfig.ogTitle,
      ogDescription: config.ogDescription || defaultSiteConfig.ogDescription,
      ogImage: config.ogImage || defaultSiteConfig.ogImage,
      customHtmlTags: config.customHtmlTags || defaultSiteConfig.customHtmlTags,
      destinationsJson: config.destinationsJson || JSON.stringify(defaultDestinations),
      destinations: parsedDestinations,
    }
  } catch (err) {
    console.error('Error fetching site config from database:', err)
    return defaultSiteConfig
  }
}
