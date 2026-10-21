import { prisma } from '@/lib/prisma'

export const HOME_EXPERIENCE_SECTION_KEY = 'site_section_home_before_experience'
export const PROGRAMME_RETREAT_SECTION_KEY = 'site_section_package_after_reviews'

export async function getSiteSectionHtml(key: string): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } })
    return setting?.value || ''
  } catch (error) {
    console.error(`Error loading site section ${key}:`, error)
    return ''
  }
}
