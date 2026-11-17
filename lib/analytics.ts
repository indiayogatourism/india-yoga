export type ConversionEvent = 'package_view' | 'retreat_listing_click' | 'whatsapp_enquiry_click' | 'booking_cta_click' | 'enquiry_submit' | 'checkout_start' | 'booking_confirmed'
type ConversionSource = 'package' | 'retreat_hub' | 'booking_card' | 'contact' | 'checkout' | 'confirmation'
interface EventParams { package_slug?: string; source: ConversionSource; value?: number; currency?: string }
type AnalyticsWindow = Window & { iytAnalyticsConsent?: boolean; gtag?: (...args: unknown[]) => void }
const sent = new Set<string>()

/** The site's consent manager must opt in explicitly; no analytics is installed here. */
export function trackConversion(event: ConversionEvent, params: EventParams): boolean {
  if (typeof window === 'undefined') return false
  const client = window as AnalyticsWindow
  if (client.iytAnalyticsConsent !== true || typeof client.gtag !== 'function') return false
  if (!['package_view', 'retreat_listing_click', 'whatsapp_enquiry_click', 'booking_cta_click', 'enquiry_submit', 'checkout_start', 'booking_confirmed'].includes(event)) return false
  if (!['package', 'retreat_hub', 'booking_card', 'contact', 'checkout', 'confirmation'].includes(params.source)) return false
  const safe: Record<string, string | number> = { source: params.source, page_referrer: '' }
  // GA adds page URLs automatically. Strip checkout/query references from our events too.
  if (client.location) safe.page_location = `${client.location.origin}${client.location.pathname}`
  if (params.package_slug && /^[a-z0-9-]{1,160}$/.test(params.package_slug)) safe.package_slug = params.package_slug
  if (typeof params.value === 'number' && Number.isFinite(params.value) && params.value >= 0) safe.value = params.value
  if (params.currency && /^[A-Z]{3}$/.test(params.currency)) safe.currency = params.currency
  try { client.gtag('event', event, safe); return true } catch { return false }
}

export function trackConversionOnce(event: ConversionEvent, params: EventParams, key: string): boolean {
  const storageKey = `iyt:${event}:${key}`
  if (sent.has(storageKey)) return false
  try { if (window.sessionStorage.getItem(storageKey)) return false } catch { /* Storage can be blocked. */ }
  if (!trackConversion(event, params)) return false
  sent.add(storageKey)
  try { window.sessionStorage.setItem(storageKey, '1') } catch { /* In-memory deduplication remains active. */ }
  return true
}
