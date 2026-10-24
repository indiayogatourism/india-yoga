/**
 * Single source of truth for the site's preferred (canonical) origin.
 *
 * Preferred domain: https://www.indiayogatourism.com
 * Any URL pointing at the bare / http domain (from env vars, admin-entered
 * canonical URLs, sitemap settings stored in the DB, etc.) is normalised to
 * the www + https version so we never emit conflicting canonical signals.
 */

export const PREFERRED_HOST = 'www.indiayogatourism.com'
export const BARE_HOST = 'indiayogatourism.com'

/** Google Search Console HTML-tag verification token */
export const GOOGLE_SITE_VERIFICATION = 'MGeXdi4DY-_dhFfD_5Jc1smDv_Uh-YIZwBWZh27DCJM'

const OWN_DOMAIN_RE = /^https?:\/\/(?:www\.)?indiayogatourism\.com(?=\/|\?|#|$)/i

/** Rewrite any indiayogatourism.com URL (www or not, http or https) to the preferred origin. */
export function toPreferredUrl(url: string | null | undefined): string {
  if (!url) return ''
  return url.trim().replace(OWN_DOMAIN_RE, `https://${PREFERRED_HOST}`)
}

export const SITE_URL = toPreferredUrl(
  process.env.NEXT_PUBLIC_SITE_URL || `https://${PREFERRED_HOST}`
).replace(/\/+$/, '')

/** Build an absolute URL on the preferred domain from a path ("/about"). */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const SITE_NAME = 'India Yoga Tourism'

/**
 * Append " | India Yoga Tourism" to a page title only if the brand isn't
 * already in it — prevents "… | India Yoga Tourism | India Yoga Tourism".
 */
export function withBrand(title: string | null | undefined): string {
  const t = (title || '').trim()
  if (!t) return SITE_NAME
  return t.toLowerCase().includes(SITE_NAME.toLowerCase()) ? t : `${t} | ${SITE_NAME}`
}
