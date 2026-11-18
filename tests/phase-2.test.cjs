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

const content = load('lib/retreatContent.ts')
const dates = load('lib/packageAvailability.ts')
const fixedNow = new Date('2026-11-17T08:00:00Z')
const pkg = {
  id: 'target', slug: content.TARGET_RETREAT_SLUG, title: 'CMS retreat title', status: 'PUBLISHED', category: 'RETREAT',
  shortDescription: 'A saved retreat introduction.', description: 'Saved yoga and meditation overview.',
  location: 'Rishikesh', durationDays: 5, durationNights: 4, difficultyLevel: 'Beginner', maxGroupSize: 12,
  startDate: '2026-11-24', endDate: '2026-11-28', upcomingDates: ['01 Oct 2026 - 05 Oct 2026', '24 Nov 2026 - 28 Nov 2026'],
  enableDormitory: false, priceDormitory: 10, enableShared: true, priceShared: 250, enablePrivate: true, pricePrivate: 350,
  highlights: ['Yoga and meditation'], inclusions: ['Four nights accommodation'], exclusions: ['Airfare'],
  featuredImage: '/test-real-package-photo.jpg', gallery: [], itinerary: [],
  contentHtml: '<h1>Saved CMS itinerary</h1><p>Day 1: saved arrival schedule.</p>', customHtmlTags: '<script type="application/ld+json">{"@type":"TouristTrip","offers":{"price":"1499","availability":"https://schema.org/InStock"}}</script><meta name="target-verification" content="keep"/>', reviews: [],
}
const navigation = { useRouter: () => ({ push() {} }), notFound: () => { throw new Error('NOT_FOUND') }, redirect: (url) => { throw new Error(`REDIRECT ${url}`) } }
const baseMocks = {
  'next/link': ({ children, ...props }) => React.createElement('a', props, children),
  'next/navigation': navigation,
  '@/lib/adminPreview': { isAdminViewer: async () => false },
  '@/lib/siteConfig': { getSiteConfig: async () => ({ whatsappNumber: '+91 88009 19486', contactPhone: '+91 88009 19486', contactEmail: 'info@indiayogatourism.com', officeAddress: '' }) },
  '@/lib/siteSections': { getSiteSectionHtml: async () => '', PROGRAMME_RETREAT_SECTION_KEY: 'test' },
  '@/lib/packageAvailability': { ...dates, getPackageDateOptions: (schedule) => dates.getPackageDateOptions(schedule, fixedNow) },
  '@/lib/retreatCatalog': { getPackageDetail: async () => pkg, getRetreatCatalog: async () => [pkg] },
}
const render = (element) => renderToStaticMarkup(element)

test('target metadata, single H1, saved itinerary, real prices and current dates survive rendering', async () => {
  const page = load('app/(public)/packages/[slug]/page.tsx', baseMocks)
  const props = { params: Promise.resolve({ slug: pkg.slug }) }
  const meta = await page.generateMetadata(props)
  assert.equal(meta.title, content.TARGET_RETREAT_TITLE)
  assert.equal(meta.alternates.canonical, `https://www.indiayogatourism.com${content.TARGET_RETREAT_PATH}`)
  const html = render(await page.default(props))
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.ok(html.includes('<h2>Saved CMS itinerary</h2>'))
  assert.ok(html.includes('Day 1: saved arrival schedule.'))
  assert.ok(html.includes('$250.00 USD') && html.includes('$350.00 USD'))
  assert.ok(!html.includes('01 Oct 2026'))
  assert.ok(!html.includes('Early Bird') && !html.includes('Free cancellation'))
  assert.ok(!html.includes('Verified guest reviews'))
  assert.ok(!html.includes('1499') && !html.includes('InStock'))
  assert.ok(html.includes('TouristTrip') && html.includes('target-verification'))
  assert.ok(html.includes('/contact?retreat=' + pkg.slug))
  assert.ok(html.includes('/refund-policy') && html.includes('/terms-and-conditions'))
})

test('draft packages remain private and noindex; expired schedules cannot expose a booking action', async () => {
  const mock = { ...baseMocks, '@/lib/retreatCatalog': { getPackageDetail: async () => ({ ...pkg, status: 'DRAFT' }), getRetreatCatalog: async () => [] } }
  const page = load('app/(public)/packages/[slug]/page.tsx', mock)
  const props = { params: Promise.resolve({ slug: pkg.slug }) }
  assert.equal((await page.generateMetadata(props)).robots.index, false)
  await assert.rejects(page.default(props), /NOT_FOUND/)
  const expired = { ...pkg, startDate: '2026-10-01', endDate: '2026-10-05', upcomingDates: [] }
  mock['@/lib/retreatCatalog'].getPackageDetail = async () => expired
  const html = render(await load('app/(public)/packages/[slug]/page.tsx', mock).default(props))
  assert.ok(!html.includes('Continue to booking'))
  assert.ok(html.includes('No current dates are listed'))
})

test('retreat hub, About, Contact and guide have distinct metadata and one H1', async () => {
  const routes = [
    ['app/(public)/yoga-retreats-india/page.tsx', '/yoga-retreats-india'],
    ['app/(public)/about/page.tsx', '/about'],
    ['app/(public)/destinations/rishikesh/page.tsx', '/destinations/rishikesh'],
  ]
  const titles = new Set()
  for (const [file, url] of routes) {
    const page = load(file, baseMocks)
    assert.equal(page.metadata.alternates.canonical, `https://www.indiayogatourism.com${url}`)
    assert.ok(page.metadata.description.length > 80)
    titles.add(page.metadata.title)
    const html = render(await page.default())
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file)
    assert.ok(html.includes('/contact'))
  }
  assert.equal(titles.size, routes.length)
  const contact = load('app/(public)/contact/page.tsx', baseMocks)
  const html = render(await contact.default({ searchParams: Promise.resolve({ retreat: pkg.slug }) }))
  assert.equal((html.match(/<h1\b/g) || []).length, 1)
  assert.ok(html.includes(`value="${pkg.slug}" selected=""`))
  for (const field of ['guests', 'preferredStartDate', 'preferredEndDate', 'destination', 'email', 'message']) assert.ok(html.includes(`name="${field}"`))
  assert.ok(html.includes('/privacy-policy'))
})

test('real enabled room prices include zero; missing photos never become stock package photos', () => {
  assert.deepEqual(content.getRetreatRooms({ ...pkg, enablePrivate: false, priceShared: 0 }).map((room) => room.price), [0])
  assert.deepEqual(content.getRetreatRooms({ ...pkg, enablePrivate: false, enableShared: false }), [])
  const gallery = load('components/PackageGalleryViewer.tsx', baseMocks).default
  const html = render(React.createElement(gallery, { title: pkg.title, featuredImage: null, gallery: [] }))
  assert.ok(!html.includes('<img'))
})

test('checkout carries the actual selected batch arrival and ignores stale dates or disabled rooms', async () => {
  let received
  const page = load('app/(public)/booking/checkout/page.tsx', {
    ...baseMocks,
    '@/lib/prisma': { prisma: { package: { findUnique: async () => pkg } } },
    '@/components/CheckoutWizard': (props) => { received = props; return null },
  })
  assert.equal(page.metadata.robots.index, false)
  render(await page.default({ searchParams: Promise.resolve({ packageId: pkg.id, selectedBatch: '01 Oct 2026 - 05 Oct 2026', roomType: 'dormitory', guests: '-3' }) }))
  assert.equal(received.initialSelectedBatch, '24 Nov 2026 - 28 Nov 2026')
  assert.equal(received.initialArrivalDate, '2026-11-24')
  assert.equal(received.initialRoomType, 'shared')
  assert.equal(received.initialGuests, 1)
})

test('public FAQ reads never create database content; safe fallbacks remain available without a DB', async () => {
  const page = load('app/(public)/faqs/page.tsx', { ...baseMocks, '@/lib/prisma': { prisma: {
    faqItem: { findMany: async () => [], createMany: async () => { throw new Error('Public write attempted') } },
    seoMeta: { findUnique: async () => null },
  } } })
  const html = render(await page.default())
  assert.ok(html.includes('Beginner') || html.includes('beginner'))
  assert.ok(!html.includes('30+ days') && !html.includes('without penalty'))
  assert.ok(html.includes('/refund-policy'))
  assert.equal((await page.generateMetadata()).alternates.canonical, 'https://www.indiayogatourism.com/faqs')
})

test('checkout room controls use only enabled CMS options with USD amounts and no unsupported promotion', () => {
  const Checkout = load('components/CheckoutWizard.tsx', {
    ...baseMocks,
    '@clerk/nextjs': { useUser: () => ({ isLoaded: true, isSignedIn: true }), SignInButton: ({ children }) => children },
    '@paypal/react-paypal-js': { PayPalScriptProvider: ({ children }) => children, PayPalButtons: () => null },
  }).default
  const html = render(React.createElement(Checkout, { pkg: { ...pkg, enablePrivate: false }, initialGuests: 2, initialRoomType: 'shared', initialSelectedBatch: '24 Nov 2026 - 28 Nov 2026', initialArrivalDate: '2026-11-24' }))
  assert.ok(html.includes('value="2026-11-24"'))
  assert.ok(html.includes('name="checkout-room"'))
  assert.ok(!html.includes('value="private"') && !html.includes('value="dormitory"'))
  assert.ok(html.includes('$250.00 USD'))
  assert.ok(!html.includes('PEACE10') && !html.includes('Private Suite'))
})

test('checkout offers sign-in before payment when the visitor is not authenticated', () => {
  let stateIndex = 0
  const Checkout = load('components/CheckoutWizard.tsx', {
    ...baseMocks,
    react: { ...React, useState: (initial) => React.useState(++stateIndex === 1 ? 3 : initial) },
    '@clerk/nextjs': { useUser: () => ({ isLoaded: true, isSignedIn: false }), SignInButton: ({ children }) => children },
    '@paypal/react-paypal-js': { PayPalScriptProvider: ({ children }) => children, PayPalButtons: () => React.createElement('button', null, 'Gateway payment') },
  }).default
  const html = render(React.createElement(Checkout, { pkg, initialGuests: 1, initialRoomType: 'shared' }))
  assert.ok(html.includes('Sign in to continue'))
  assert.ok(!html.includes('with Razorpay') && !html.includes('Gateway payment'))
})

test('enquiry validation rejects invalid dates, reversed ranges, malformed email and guest counts', () => {
  const { parseEnquiryInput } = load('lib/enquiry.ts')
  const valid = { name: 'Guest', email: 'guest@example.com', message: 'Please confirm dates.', guests: 2 }
  assert.ok(parseEnquiryInput(valid).data)
  for (const extra of [{ email: 'bad' }, { guests: 0 }, { guests: 1.2 }, { preferredStartDate: '2026-02-31' }, { preferredStartDate: '2026-12-02', preferredEndDate: '2026-12-01' }, { packageSlug: '<script>' }, { name: {} }]) assert.ok(parseEnquiryInput({ ...valid, ...extra }).error)
})

test('enquiry endpoint saves context and package ID without returning personal data; notification failure does not lose a saved enquiry', async () => {
  let saved
  const route = load('app/api/enquiry/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ status: options?.status || 200, json: async () => body }) } },
    '@/lib/prisma': { prisma: { package: { findUnique: async () => pkg }, enquiry: { create: async ({ data }) => { saved = data; return { id: 'enquiry', ...data } } } } },
    '@/lib/email': { sendEmail: async () => { throw new Error('Mock provider failure') } },
  })
  const body = { name: '<b>Guest</b>', email: 'guest@example.com', message: 'Ask about rooms', packageSlug: pkg.slug, destination: 'Rishikesh', preferredStartDate: '2026-11-24', preferredEndDate: '2026-11-28', guests: 2 }
  const response = await route.POST({ json: async () => body })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { success: true, analytics: { package_id: pkg.id, package_slug: pkg.slug } })
  assert.equal(saved.packageId, pkg.id)
  for (const text of ['Rishikesh', '2026-11-24', '2026-11-28', 'Guests: 2', 'Ask about rooms']) assert.ok(saved.message.includes(text))
  const templates = load('lib/emails/templates.ts')
  assert.ok(!templates.getEnquiryReceivedTemplate(body.name).includes('<b>Guest</b>'))
  assert.ok(templates.getEnquiryAlertTemplate(body.name, body.email, null, '<script>bad</script>').includes('&lt;script&gt;'))
  assert.equal((await route.POST({ json: async () => ({}) })).status, 400)
})

test('enquiry rejects unpublished interests and hides database errors from the visitor', async () => {
  const mocks = {
    'next/server': { NextResponse: { json: (body, options) => ({ status: options?.status || 200, json: async () => body }) } },
    '@/lib/prisma': { prisma: { package: { findUnique: async () => ({ ...pkg, status: 'DRAFT' }) }, enquiry: { create: async () => { throw new Error('secret database details') } } } },
    '@/lib/email': { sendEmail: async () => { throw new Error('Must not send') } },
  }
  const route = load('app/api/enquiry/route.ts', mocks)
  const request = { json: async () => ({ name: 'Guest', email: 'guest@example.com', message: 'Hello', packageSlug: pkg.slug }) }
  assert.equal((await route.POST(request)).status, 400)
  const failure = await route.POST({ json: async () => ({ name: 'Guest', email: 'guest@example.com', message: 'Hello' }) })
  assert.equal(failure.status, 503)
  assert.ok(!JSON.stringify(await failure.json()).includes('secret'))
})

test('analytics requires explicit consent/provider and excludes personal fields; confirmed events deduplicate', () => {
  const previous = global.window
  const calls = []
  const store = new Map()
  global.window = { location: { origin: 'https://www.indiayogatourism.com', pathname: '/booking/confirmation', search: '?ref=private-reference' }, gtag: (...args) => calls.push(args), sessionStorage: { getItem: (key) => store.get(key), setItem: (key, value) => store.set(key, value) } }
  try {
    const analytics = load('lib/analytics.ts')
    const params = { source: 'contact', package_slug: pkg.slug, name: 'Guest', email: 'guest@example.com', phone: '0000000000', message: 'private' }
    assert.equal(analytics.trackConversion('enquiry_submit', params), false)
    window.iytAnalyticsConsent = true
    assert.equal(analytics.trackConversion('enquiry_submit', params), true)
    assert.equal(calls[0][1], 'generate_lead')
    assert.deepEqual(calls[0][2], { source: 'contact', package_slug: pkg.slug, page_location: 'https://www.indiayogatourism.com/booking/confirmation', page_referrer: '', page_title: 'India Yoga Tourism' })
    const purchase = { source: 'confirmation', package_id: pkg.id, package_slug: pkg.slug, value: 250, price: 250, quantity: 1, currency: 'USD', transaction_id: `iyt_${'a'.repeat(64)}` }
    assert.equal(analytics.trackConversionOnce('booking_confirmed', purchase, 'local-only-booking-key'), true)
    assert.equal(analytics.trackConversionOnce('booking_confirmed', purchase, 'local-only-booking-key'), false)
    assert.ok(!JSON.stringify(calls).includes('local-only-booking-key'))
    assert.ok(!JSON.stringify(calls).includes('private-reference'))
    window.iytAnalyticsConsent = false
    assert.equal(analytics.trackConversion('booking_cta_click', { source: 'package' }), false)
  } finally { global.window = previous }
})

test('mocked booking preserves server pricing/gateway flow and uses four nights for departure', async () => {
  let bookingData, gatewayArgs
  const route = load('app/api/bookings/create/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ status: options?.status || 200, json: async () => body }) } },
    '@clerk/nextjs/server': { auth: async () => ({ userId: 'mock-user' }), currentUser: async () => ({ emailAddresses: [{ emailAddress: 'qa@example.com' }] }) },
    '@/lib/prisma': { prisma: {
      user: { findUnique: async () => ({ id: 'mock-db-user' }) },
      package: { findFirst: async () => pkg },
      booking: { create: async ({ data }) => { bookingData = data; return { id: 'mock-booking' } } },
      payment: { create: async () => ({ id: 'mock-payment' }), update: async () => ({}) },
    } },
    '@/lib/utils': { generateBookingRef: async () => 'IYT-MOCK-ONLY' },
    '@/lib/razorpay': { createRazorpayOrder: async (...args) => { gatewayArgs = args; return { id: 'mock-order', amount: 50000, currency: 'USD' } } },
    '@/lib/paypal': { createPaypalOrder: async () => { throw new Error('Wrong provider') } },
  })
  const result = await route.POST({ json: async () => ({ packageId: pkg.id, guestsCount: 2, roomType: 'shared', arrivalDate: '2026-11-24', fullName: 'QA Guest', email: 'qa@example.com', phone: '0000000000', country: 'IN', paymentMethod: 'razorpay' }) })
  assert.equal(result.status, 200)
  assert.equal(bookingData.status, 'PENDING')
  assert.equal(bookingData.totalAmount, 500)
  assert.equal(bookingData.departureDate.toISOString().slice(0, 10), '2026-11-28')
  assert.deepEqual(gatewayArgs, [500, 'USD', 'IYT-MOCK-ONLY'])
})

test('confirmation tracking only renders for an authorized paid and confirmed booking', async () => {
  const booking = { id: 'mock-booking', package: pkg, payment: { status: 'PENDING', amount: 250, currency: 'USD' }, status: 'PENDING', totalAmount: 250, currency: 'USD', guests: 1, pricePerPerson: 250, arrivalDate: new Date('2026-11-24'), departureDate: new Date('2026-11-28'), fullName: 'QA Guest', email: 'qa@example.com', createdAt: new Date('2026-11-17') }
  const page = load('app/(public)/booking/confirmation/page.tsx', {
    ...baseMocks,
    '@/lib/prisma': { prisma: { booking: { findUnique: async () => booking } } },
    '@/lib/bookingAccess': { getAuthorizedBookingByRef: async () => ({ id: booking.id }) },
    '@/lib/utils': { formatPrice: (value) => `$${value}`, formatDate: () => '24 Nov 2026' },
    '@/components/ConversionTracking': ({ event }) => React.createElement('span', { 'data-conversion': event }),
  })
  assert.equal(page.metadata.robots.index, false)
  const props = { searchParams: Promise.resolve({ ref: 'mock-only' }) }
  assert.ok(!render(await page.default(props)).includes('data-conversion="purchase"'))
  booking.status = 'CONFIRMED'; booking.payment.status = 'PAID'
  assert.ok(render(await page.default(props)).includes('data-conversion="purchase"'))
})
