const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

function load(relative, mocks = {}) {
  const filename = path.join(__dirname, '..', relative)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  } }).outputText
  const module = { exports: {} }
  const resolve = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    if (name.startsWith('@/')) {
      const stem = name.slice(2)
      return load(fs.existsSync(path.join(__dirname, '..', `${stem}.tsx`)) ? `${stem}.tsx` : `${stem}.ts`, mocks)
    }
    return require(name)
  }
  new Function('require', 'module', 'exports', code)(resolve, module, module.exports)
  return module.exports
}
const slug = '5-days-yoga-spiritual-retreat-rishikesh-4n-5d'
const item = { package_id: 'cm-real-public-package', package_slug: slug, source: 'package', value: 250, price: 250, currency: 'USD', quantity: 1 }
const payment = () => ({ id: 'private-database-booking', status: 'CONFIRMED', totalAmount: 500, pricePerPerson: 250, currency: 'USD', guests: 2, package: { id: item.package_id, slug }, payment: { status: 'PAID', amount: 500, currency: 'USD' } })
const store = () => { const data = new Map(); return { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) } }
function browser(callback) {
  const previous = global.window
  const calls = []
  global.window = { iytAnalyticsConsent: true, gtag: (...args) => calls.push(args), location: { origin: 'https://www.indiayogatourism.com', pathname: '/booking/confirmation', search: '?ref=PRIVATE&email=guest@example.com', hash: '#private' }, localStorage: store(), sessionStorage: store() }
  try { return callback(calls) } finally { global.window = previous }
}

test('existing call names map to one canonical GA4 event, with real item IDs and no page_view/config calls', () => browser((calls) => {
  const analytics = load('lib/analytics.ts')
  const purchase = load('lib/bookingAnalytics.ts').getVerifiedPurchase(payment())
  const pairs = { package_view: 'view_item', retreat_listing_click: 'select_item', whatsapp_enquiry_click: 'retreat_whatsapp_click', enquiry_submit: 'generate_lead', checkout_start: 'begin_checkout', booking_confirmed: 'purchase' }
  for (const [old, current] of Object.entries(pairs)) {
    assert.equal(analytics.trackConversion(old, old === 'booking_confirmed' ? purchase : item), true)
    assert.equal(calls.at(-1)[1], current)
    assert.equal(calls.at(-1)[2].items[0].item_id, item.package_id)
  }
  assert.equal(calls.length, 6)
  assert.ok(calls.every(([command, event]) => command === 'event' && event !== 'page_view'))
  assert.equal(calls[1][2].item_list_id, 'package')
}))

test('events require explicit analytics consent AND an existing provider; reject unknown events/sources and missing item IDs', () => browser((calls) => {
  const { trackConversion } = load('lib/analytics.ts')
  for (const consent of [undefined, false]) { window.iytAnalyticsConsent = consent; assert.equal(trackConversion('view_item', item), false) }
  window.iytAnalyticsConsent = true
  const provider = window.gtag; delete window.gtag
  assert.equal(trackConversion('view_item', item), false)
  window.gtag = provider
  for (const event of ['view_item', 'select_item', 'begin_checkout', 'purchase']) assert.equal(trackConversion(event, { source: 'package' }), false)
  assert.equal(trackConversion('unknown', item), false)
  assert.equal(trackConversion('view_item', { ...item, source: 'email=guest@example.com' }), false)
  assert.equal(calls.length, 0)
  window.gtag = () => { throw new Error('Analytics provider unavailable') }
  assert.equal(trackConversion('view_item', item), false)
  Object.defineProperty(window, 'gtag', { configurable: true, get() { throw new Error('Blocked analytics extension') } })
  assert.doesNotThrow(() => assert.equal(trackConversion('view_item', item), false))
}))

test('reuse an existing GTM container, clear stale ecommerce and prefer one transport when gtag also exists', () => browser((calls) => {
  const { trackConversion } = load('lib/analytics.ts')
  const provider = window.gtag
  delete window.gtag
  window.dataLayer = []
  assert.equal(trackConversion('view_item', item), false, 'a dataLayer alone is not proof of a loaded GTM container')
  window.google_tag_manager = { 'GTM-EXISTING': {} }
  assert.equal(trackConversion('view_item', item), true)
  assert.deepEqual(window.dataLayer[0], { ecommerce: null })
  assert.equal(window.dataLayer[1].event, 'view_item')
  assert.equal(window.dataLayer[1].ecommerce.items[0].item_id, item.package_id)
  assert.equal(window.dataLayer[1].ecommerce.value, 250)
  trackConversion('generate_lead', item)
  assert.deepEqual(window.dataLayer[2], { ecommerce: null })
  assert.equal(window.dataLayer[3].event, 'generate_lead')
  assert.equal(window.dataLayer[3].ecommerce.value, undefined)
  window.gtag = provider
  trackConversion('view_item', item)
  assert.equal(calls.length, 1)
  assert.equal(window.dataLayer.length, 4, 'never send to gtag and GTM in parallel')
}))

test('payloads redact queries/referrers, personal fields and arbitrary parameters; lead/WhatsApp clicks have no revenue', () => browser((calls) => {
  const { trackConversion } = load('lib/analytics.ts')
  const unsafe = { ...item, email: 'guest@example.com', phone: '9999999999', medicalInfo: 'private-health', bookingRef: 'IYT-PRIVATE', user_id: 'customer', page_location: 'https://evil/?email=guest@example.com', debug_mode: true }
  for (const event of ['view_item', 'generate_lead', 'retreat_whatsapp_click']) assert.equal(trackConversion(event, unsafe), true)
  const payload = JSON.stringify(calls)
  for (const personal of ['guest@example.com', '9999999999', 'private-health', 'IYT-PRIVATE', 'customer', 'debug_mode', 'PRIVATE', '#private', '?ref']) assert.ok(!payload.includes(personal))
  assert.equal(calls[0][2].page_referrer, '')
  assert.equal(calls[0][2].page_location, 'https://www.indiayogatourism.com/booking/confirmation')
  for (const [, , params] of calls.slice(1)) { assert.equal(params.value, undefined); assert.equal(params.currency, undefined); assert.equal(params.items[0].price, undefined) }
}))

test('money must have verified USD currency and finite nonnegative values; invalid values are omitted', () => browser((calls) => {
  const { trackConversion } = load('lib/analytics.ts')
  for (const extra of [{ currency: undefined }, { currency: 'ABC' }, { currency: 'INR' }, { value: NaN }, { value: Infinity }, { value: -1 }]) {
    assert.equal(trackConversion('view_item', { ...item, ...extra }), true)
    assert.equal(calls.at(-1)[2].value, undefined)
    assert.equal(calls.at(-1)[2].items[0].price, undefined)
  }
  trackConversion('view_item', { ...item, value: 0, price: 0 })
  assert.equal(calls.at(-1)[2].value, 0)
}))

test('purchase requires persisted PAID and CONFIRMED, matching currency/amounts and valid guests', () => {
  const { getVerifiedPurchase } = load('lib/bookingAnalytics.ts')
  for (const extra of [{ status: 'PENDING' }, { status: 'CANCELLED' }, { payment: null }, { payment: { status: 'PENDING', amount: 500, currency: 'USD' } }, { payment: { status: 'PAID', amount: 600, currency: 'USD' } }, { payment: { status: 'PAID', amount: 500.01, currency: 'USD' } }, { payment: { status: 'PAID', amount: 500, currency: 'INR' } }, { currency: 'INR' }, { totalAmount: NaN }, { pricePerPerson: 100 }, { guests: 1.5 }, { guests: 0 }]) assert.equal(getVerifiedPurchase({ ...payment(), ...extra }), null)
  const verified = getVerifiedPurchase(payment())
  assert.equal(verified.value, 500)
  assert.equal(verified.price, 250)
  assert.equal(verified.quantity, 2)
  assert.equal(verified.currency, 'USD')
  assert.match(verified.transaction_id, /^iyt_[a-f0-9]{64}$/)
  assert.equal(verified.transaction_id, getVerifiedPurchase(payment()).transaction_id)
  assert.notEqual(verified.transaction_id, getVerifiedPurchase({ ...payment(), id: 'different-booking' }).transaction_id)
  assert.ok(!JSON.stringify(verified).includes('private-database-booking'))
})

test('purchase deduplicates across refresh/module reload, and denied consent does not consume its key', () => browser((calls) => {
  const verified = load('lib/bookingAnalytics.ts').getVerifiedPurchase(payment())
  let analytics = load('lib/analytics.ts')
  window.iytAnalyticsConsent = false
  assert.equal(analytics.trackConversionOnce('purchase', verified, 'private-key'), false)
  window.iytAnalyticsConsent = true
  assert.equal(analytics.trackConversionOnce('purchase', verified, 'private-key'), true)
  assert.equal(analytics.trackConversionOnce('purchase', verified, 'another-key'), false)
  analytics = load('lib/analytics.ts')
  assert.equal(analytics.trackConversionOnce('purchase', verified, 'after-refresh'), false)
  assert.equal(calls.length, 1)
  assert.ok(!JSON.stringify(calls).includes('private-key'))
}))

test('purchase rejects missing/unsafe transaction IDs, inconsistent totals and duplicates when storage is blocked', () => browser((calls) => {
  const verified = load('lib/bookingAnalytics.ts').getVerifiedPurchase(payment())
  const { trackConversion, trackConversionOnce } = load('lib/analytics.ts')
  for (const extra of [{ transaction_id: '' }, { transaction_id: 'guest@example.com' }, { currency: undefined }, { value: 700 }, { quantity: 0 }, { quantity: 101 }, { price: -1 }]) assert.equal(trackConversion('purchase', { ...verified, ...extra }), false)
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked storage') } })
  assert.equal(trackConversionOnce('purchase', verified, 'x'), true)
  assert.equal(trackConversionOnce('purchase', verified, 'x'), false)
  assert.equal(calls.length, 1)
}))

test('mounted item waits for consent/provider, records once after readiness and removes listeners/timer', () => browser((calls) => {
  const listeners = new Map(), timers = new Map()
  window.addEventListener = (name, callback) => listeners.set(name, callback)
  window.removeEventListener = (name) => listeners.delete(name)
  window.setInterval = (callback) => { timers.set(1, callback); return 1 }
  window.clearInterval = (id) => timers.delete(id)
  const effects = []
  const component = load('components/ConversionTracking.tsx', {
    react: { useRef: () => ({ current: '' }), useEffect: (effect) => effects.push(effect) },
    '@/lib/analytics': load('lib/analytics.ts'),
  }).default
  window.iytAnalyticsConsent = false
  component({ event: 'view_item', packageId: item.package_id, packageSlug: slug, value: 250, price: 250, currency: 'USD' })
  const cleanup = effects[0]()
  assert.equal(calls.length, 0)
  window.iytAnalyticsConsent = true
  listeners.get('iyt:analytics-ready')()
  listeners.get('iyt:analytics-consent')()
  timers.get(1)()
  assert.equal(calls.length, 1)
  assert.equal(calls[0][1], 'view_item')
  cleanup()
  assert.equal(listeners.size, 0); assert.equal(timers.size, 0)
}))

test('delegated WhatsApp clicks emit only click interest, with actual page item context', () => browser((calls) => {
  const previous = { document: global.document, Element: global.Element }
  let click
  const main = { dataset: { retreatId: item.package_id, retreatSlug: slug } }
  global.document = { addEventListener: (_, fn) => { click = fn }, removeEventListener() {}, querySelector: () => main }
  global.Element = class { closest(selector) { if (selector === 'a[href]') return { href: 'https://wa.me/918800919486?text=private-question' }; return null } }
  try {
    const effects = []
    load('components/ConversionTracking.tsx', { react: { useRef: () => ({ current: '' }), useEffect: (effect) => effects.push(effect) }, '@/lib/analytics': load('lib/analytics.ts') }).default({})
    const cleanup = effects[0]()
    click({ target: new Element() })
    assert.equal(calls.length, 1); assert.equal(calls[0][1], 'retreat_whatsapp_click')
    assert.equal(calls[0][2].items[0].item_id, item.package_id)
    assert.ok(!JSON.stringify(calls).includes('private-question'))
    cleanup()
  } finally { Object.assign(global, previous) }
}))

test('enquiry emits generate_lead only after successful API save, using server-resolved public package context', async () => {
  const previous = { fetch: global.fetch, FormData: global.FormData }
  const calls = []
  const effects = []
  const form = load('components/RetreatEnquiryForm.tsx', {
    react: { useEffect: (effect) => effects.push(effect), useRef: () => ({ current: null }), useState: (initial) => [initial, () => {}] },
    'next/link': 'a', '@/lib/analytics': { trackConversion: (...args) => calls.push(args) },
  }).default
  const tree = form({ options: [], initialRetreat: slug, initialDestination: '' })
  const node = tree.props.children.find((child) => child?.type === 'form')
  global.FormData = class { get(name) { return name === 'guests' ? '1' : 'private-test-data' } }
  try {
    global.fetch = async () => ({ ok: false, json: async () => ({ success: false, error: 'Save failed' }) })
    await node.props.onSubmit({ preventDefault() {}, currentTarget: {} })
    assert.equal(calls.length, 0)
    global.fetch = async () => ({ ok: true, json: async () => ({ success: true, analytics: { package_id: item.package_id, package_slug: slug } }) })
    await node.props.onSubmit({ preventDefault() {}, currentTarget: {} })
    assert.deepEqual(calls, [['generate_lead', { package_id: item.package_id, package_slug: slug, source: 'contact' }]])
  } finally { Object.assign(global, previous) }
})

const jpg = `data:image/jpeg;base64,${Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(256 * 1024, 42)]).toString('base64')}`
const imagePackage = { id: item.package_id, featuredImage: jpg, gallery: ['/real-upload.jpg', jpg], ogImage: jpg }

test('saved embedded photos become versioned URLs without mutating CMS data; real remote/upload URLs stay intact', () => {
  const images = load('lib/packageImages.ts')
  const result = images.withPackageImageUrls(imagePackage)
  assert.match(result.featuredImage, /^\/retreat-images\/cm-real-public-package\/0-[a-f0-9]{24}\.jpg$/)
  assert.equal(result.gallery[0], '/real-upload.jpg')
  assert.match(result.gallery[1], /\/2-[a-f0-9]{24}\.jpg$/)
  assert.equal(result.ogImage, result.featuredImage)
  assert.equal(imagePackage.featuredImage, jpg)
  for (const invalid of ['data:image/svg+xml;base64,PHN2Zz4=', 'data:image/jpeg;base64,bm90LWEtanBlZw==', 'data:image/jpeg;base64,!!!!', 'https://remote.example/image.jpg']) assert.equal(images.decodePackageImage(invalid), null)
})

test('image route serves only published saved raster bytes, caches with ETag and rejects stale or invalid paths', async () => {
  const images = load('lib/packageImages.ts')
  let published = true, unavailable = false
  const route = load('app/retreat-images/[packageId]/[image]/route.ts', {
    '@/lib/prisma': { prisma: { package: { findFirst: async (query) => {
      assert.deepEqual(query.where, { id: item.package_id, status: 'PUBLISHED' })
      if (unavailable) throw new Error('private database failure')
      return published ? imagePackage : null
    } } } },
  })
  const url = images.getPackageImageUrl(imagePackage, 0)
  const params = { params: Promise.resolve({ packageId: item.package_id, image: url.split('/').pop() }) }
  const response = await route.GET(new Request(`https://example.com${url}`), params)
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'image/jpeg')
  assert.equal((await response.arrayBuffer()).byteLength, 256 * 1024 + 3)
  assert.match(response.headers.get('cache-control'), /public, max-age=86400/)
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.equal((await route.GET(new Request(`https://example.com${url}`, { headers: { 'if-none-match': response.headers.get('etag') } }), params)).status, 304)
  published = false
  assert.equal((await route.GET(new Request(`https://example.com${url}`), params)).status, 404)
  published = true; unavailable = true
  assert.equal((await route.GET(new Request(`https://example.com${url}`), params)).status, 503)
  for (const image of ['-1-bad.jpg', '0-000000000000000000000000.jpg', '99-000000000000000000000000.jpg', '0-test.svg']) {
    unavailable = false
    assert.equal((await route.GET(new Request('https://example.com'), { params: Promise.resolve({ packageId: item.package_id, image }) })).status, 404)
  }
})

test('target server render/schema use image URLs, retain one H1 and expose actual item/value tracking', async () => {
  const pkg = { ...imagePackage, slug, title: 'Saved retreat', status: 'PUBLISHED', category: 'RETREAT', shortDescription: 'Published description', description: 'Saved overview', location: 'Rishikesh', durationDays: 5, durationNights: 4, difficultyLevel: 'Beginner', maxGroupSize: 12, startDate: '2099-11-24', endDate: '2099-11-28', upcomingDates: [], enableDormitory: false, enableShared: true, priceShared: 250, enablePrivate: true, pricePrivate: 350, highlights: [], inclusions: ['Accommodation'], exclusions: ['Airfare'], itinerary: [], contentHtml: '<h1>Saved itinerary</h1>', customHtmlTags: '', reviews: [] }
  let tracking
  const page = load('app/(public)/packages/[slug]/page.tsx', {
    'next/link': 'a', '@/lib/adminPreview': { isAdminViewer: async () => false },
    '@/lib/retreatCatalog': { getPackageDetail: async () => pkg, getRetreatCatalog: async () => [] },
    '@/lib/siteConfig': { getSiteConfig: async () => ({ whatsappNumber: '+918800919486' }) },
    '@/lib/siteSections': { getSiteSectionHtml: async () => '', PROGRAMME_RETREAT_SECTION_KEY: 'test' },
    '@/components/ConversionTracking': (props) => { tracking = props; return null },
    '@/components/BookingCard': () => null,
  })
  const props = { params: Promise.resolve({ slug }) }
  const html = renderToStaticMarkup(await page.default(props))
  assert.ok(!html.includes('data:image'))
  assert.ok(html.length < 40000)
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.ok(html.includes('<h2>Saved itinerary</h2>'))
  const schema = JSON.parse([...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => match[1]).find((json) => json.includes('TouristTrip')))
  assert.ok(schema.image.every((src) => src.startsWith('https://www.indiayogatourism.com/')))
  assert.equal(schema.offers, undefined)
  assert.equal(tracking.event, 'view_item'); assert.equal(tracking.packageId, item.package_id); assert.equal(tracking.value, 250)
  assert.ok(!(await page.generateMetadata(props)).openGraph.images[0].url.startsWith('data:'))
})

test('malformed Markdown blog canonicals fall back to the existing indexed route; valid CMS overrides survive', async () => {
  const route = '/blog/the-ultimate-guide-to-luxury-yoga-retreats-in-rishikesh-2026'
  const blog = { published: true, title: 'Rishikesh retreat planning', excerpt: 'Saved excerpt', canonicalUrl: 'https://www.indiayogatourism.com/blog/luxury-yoga-retreats-rishikesh](https://www.indiayogatourism.com/blog/luxury-yoga-retreats-rishikesh' }
  const page = load('app/(public)/blog/[slug]/page.tsx', {
    '@/lib/prisma': { prisma: { blogPost: { findUnique: async () => blog } } },
    '@/lib/adminPreview': { isAdminViewer: async () => false },
    '@/lib/retreatCatalog': { getRetreatCatalog: async () => [] }, 'next/link': 'a',
  })
  const props = { params: Promise.resolve({ slug: route.split('/').pop() }) }
  assert.equal((await page.generateMetadata(props)).alternates.canonical, `https://www.indiayogatourism.com${route}`)
  blog.canonicalUrl = 'http://indiayogatourism.com/blog/existing-valid-canonical'
  assert.equal((await page.generateMetadata(props)).alternates.canonical, 'https://www.indiayogatourism.com/blog/existing-valid-canonical')
})

test('staff views and unauthorized confirmations never render purchase tracking', async () => {
  let staff = true, authorized = true
  const booking = { ...payment(), package: { ...payment().package, title: 'Saved retreat', location: 'Rishikesh' }, arrivalDate: new Date(), departureDate: new Date(), fullName: 'QA Guest', email: 'qa@example.com' }
  const page = load('app/(public)/booking/confirmation/page.tsx', {
    '@/lib/prisma': { prisma: { booking: { findUnique: async () => booking } } },
    '@/lib/bookingAccess': { getAuthorizedBookingByRef: async () => authorized ? { id: booking.id } : null },
    '@/lib/adminPreview': { isAdminViewer: async () => staff },
    '@/lib/utils': { formatDate: () => 'Saved date', formatPrice: (value) => `$${value}` },
    'next/link': 'a', 'next/navigation': { notFound: () => { throw new Error('NOT_FOUND') }, redirect() {} },
    '@/components/ConversionTracking': ({ event }) => React.createElement('span', { 'data-conversion': event }),
  })
  const props = { searchParams: Promise.resolve({ ref: 'PRIVATE' }) }
  assert.ok(!renderToStaticMarkup(await page.default(props)).includes('data-conversion="purchase"'))
  staff = false
  assert.ok(renderToStaticMarkup(await page.default(props)).includes('data-conversion="purchase"'))
  authorized = false
  const log = console.error; console.error = () => {}
  try { await assert.rejects(page.default(props), /NOT_FOUND/) } finally { console.error = log }
})
