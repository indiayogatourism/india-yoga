export type FunnelEvent = 'view_item' | 'select_item' | 'retreat_whatsapp_click' | 'generate_lead' | 'begin_checkout' | 'purchase' | 'booking_cta_click'
// Existing callers send ONE canonical GA4 event, never both old and new names.
export type ConversionEvent = FunnelEvent | 'package_view' | 'retreat_listing_click' | 'whatsapp_enquiry_click' | 'enquiry_submit' | 'checkout_start' | 'booking_confirmed'
export type ConversionSource = 'package' | 'retreat_hub' | 'booking_card' | 'contact' | 'checkout' | 'confirmation' | 'homepage' | 'about' | 'rishikesh_guide' | 'blog' | 'package_listing'
export interface EventParams {
  package_id?: string
  package_slug?: string
  source: ConversionSource
  value?: number
  currency?: string
  price?: number
  quantity?: number
  transaction_id?: string
}
type AnalyticsWindow = Window & {
  iytAnalyticsConsent?: boolean
  gtag?: (...args: unknown[]) => void
  dataLayer?: unknown[]
  google_tag_manager?: Record<string, unknown>
}
const aliases: Partial<Record<ConversionEvent, FunnelEvent>> = {
  package_view: 'view_item', retreat_listing_click: 'select_item', whatsapp_enquiry_click: 'retreat_whatsapp_click',
  enquiry_submit: 'generate_lead', checkout_start: 'begin_checkout', booking_confirmed: 'purchase',
}
const events: FunnelEvent[] = ['view_item', 'select_item', 'retreat_whatsapp_click', 'generate_lead', 'begin_checkout', 'purchase', 'booking_cta_click']
const sources: ConversionSource[] = ['package', 'retreat_hub', 'booking_card', 'contact', 'checkout', 'confirmation', 'homepage', 'about', 'rishikesh_guide', 'blog', 'package_listing']
const sent = new Set<string>()
const idIsValid = (value?: string) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value)
const moneyIsValid = (value?: number) => typeof value === 'number' && Number.isFinite(value) && value >= 0
// Current checkout providers and persisted booking totals use USD. Never guess a conversion.
const currencyIsValid = (value?: string) => value === 'USD'

/** Connect to the EXISTING CMP's analytics choice; this does not install a Google tag. */
export function setAnalyticsConsent(granted: boolean) {
  if (typeof window === 'undefined') return
  ;(window as AnalyticsWindow).iytAnalyticsConsent = granted === true
  window.dispatchEvent(new Event('iyt:analytics-consent'))
}

/** Never forward form objects, URLs with queries, booking references or customer IDs. */
export function trackConversion(event: ConversionEvent, params: EventParams): boolean {
  // Tracking is optional: provider extensions/getters must never interrupt checkout
  // navigation or turn a successfully saved enquiry into a visible failure.
  try { return dispatchConversion(event, params) } catch { return false }
}

function dispatchConversion(event: ConversionEvent, params: EventParams): boolean {
  if (typeof window === 'undefined') return false
  const client = window as AnalyticsWindow
  if (client.iytAnalyticsConsent !== true) return false
  const usingGtag = typeof client.gtag === 'function'
  const usingGtm = Array.isArray(client.dataLayer) && !!client.google_tag_manager && Object.keys(client.google_tag_manager).some((key) => /^GTM-[A-Z0-9]+$/.test(key))
  if (!usingGtag && !usingGtm) return false
  const name = aliases[event] || event as FunnelEvent
  if (!events.includes(name) || !sources.includes(params.source)) return false
  const itemId = idIsValid(params.package_id) ? params.package_id : undefined
  if (['view_item', 'select_item', 'begin_checkout', 'purchase'].includes(name) && !itemId) return false
  const safe: Record<string, unknown> = { source: params.source, page_referrer: '', page_title: 'India Yoga Tourism' }
  if (client.location) safe.page_location = `${client.location.origin}${client.location.pathname}`
  if (typeof params.package_slug === 'string' && /^[a-z0-9-]{1,160}$/.test(params.package_slug)) safe.package_slug = params.package_slug
  const quantity = Number.isInteger(params.quantity) && params.quantity! > 0 && params.quantity! <= 100 ? params.quantity! : 1
  const monetary = moneyIsValid(params.value) && currencyIsValid(params.currency)
  // An enquiry or WhatsApp click has no assigned revenue value.
  if (monetary && ['view_item', 'select_item', 'begin_checkout', 'purchase'].includes(name)) {
    safe.value = params.value
    safe.currency = params.currency
  }
  if (itemId) {
    const item: Record<string, unknown> = { item_id: itemId, quantity }
    if (safe.package_slug) item.item_name = safe.package_slug
    if (safe.currency && moneyIsValid(params.price)) item.price = params.price
    safe.items = [item]
  }
  if (name === 'select_item') safe.item_list_id = params.source
  if (name === 'purchase') {
    if (!monetary || !moneyIsValid(params.price) || !Number.isInteger(params.quantity) || params.quantity! < 1 || params.quantity! > 100 || !/^iyt_[a-f0-9]{64}$/.test(params.transaction_id || '')) return false
    if (Math.round(params.price! * quantity * 100) !== Math.round(params.value! * 100)) return false
    safe.transaction_id = params.transaction_id
  }
  try {
    if (usingGtag) client.gtag!('event', name, safe)
    else {
      // Reuse a running GTM container. Its GA4 custom-event tag must consume these
      // events/ecommerce data. Clear previous ecommerce so a lead cannot inherit revenue.
      const ecommerce: Record<string, unknown> = {}
      const context = { ...safe }
      for (const key of ['items', 'value', 'currency', 'transaction_id', 'item_list_id']) {
        if (key in context) { ecommerce[key] = context[key]; delete context[key] }
      }
      client.dataLayer!.push({ ecommerce: null })
      client.dataLayer!.push({ event: name, ...context, ...(Object.keys(ecommerce).length ? { ecommerce } : {}) })
    }
    return true
  } catch { return false }
}

export function trackConversionOnce(event: ConversionEvent, params: EventParams, key: string): boolean {
  if (typeof window === 'undefined') return false
  const purchase = (aliases[event] || event) === 'purchase'
  const storageKey = `iyt:ga4:${aliases[event] || event}:${purchase ? params.transaction_id : key}`
  if (sent.has(storageKey)) return false
  let storage: Storage | undefined
  try { storage = purchase ? window.localStorage : window.sessionStorage; if (storage?.getItem(storageKey)) return false } catch { /* Storage may be unavailable. */ }
  if (!trackConversion(event, params)) return false
  sent.add(storageKey)
  try { storage?.setItem(storageKey, '1') } catch { /* Memory + GA4 transaction deduplication remain. */ }
  return true
}
