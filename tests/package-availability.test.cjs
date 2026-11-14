const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

function load(relativePath, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', code)(
    (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), module, module.exports,
  )
  return module.exports
}

const { filterAvailablePackages } = load('lib/packageAvailability.ts')
const now = new Date('2026-11-14T08:00:00Z')
const available = (schedule, at = now) => filterAvailablePackages([schedule], at).length === 1

test('exclude the reported October retreat; retain ongoing, final-day and future schedules', () => {
  assert.equal(available({ startDate: '2026-10-24', endDate: '2026-10-27', upcomingDates: [] }), false)
  assert.equal(available({ startDate: '2026-11-12', endDate: '2026-11-16' }), true)
  assert.equal(available({ startDate: '2026-11-12', endDate: '2026-11-14' }), true)
  assert.equal(available({ startDate: '2026-12-01', endDate: '2026-12-04' }), true)
  assert.equal(available({ endDate: '2026-11-13' }), false)
})

test('expire at midnight in India, independently of the server timezone', () => {
  const schedule = { endDate: '2026-11-14' }
  assert.equal(available(schedule, new Date('2026-11-14T18:29:59.999Z')), true)
  assert.equal(available(schedule, new Date('2026-11-14T18:30:00.000Z')), false)
})

test('an upcoming or ongoing batch keeps an older primary retreat available', () => {
  const past = { startDate: '2026-10-24', endDate: '2026-10-27' }
  assert.equal(available({ ...past, upcomingDates: ['01 Oct 2026 - 14 Oct 2026'] }), false)
  assert.equal(available({ ...past, upcomingDates: ['01 Oct 2026 - 14 Oct 2026', '15 Nov 2026 - 18 Nov 2026'] }), true)
  assert.equal(available({ ...past, upcomingDates: ['01 November 2026 – 14 November 2026'] }), true)
  assert.equal(available({ ...past, upcomingDates: ['2026-11-15 to 2026-11-18'] }), true)
  assert.equal(available({ upcomingDates: ['2026-11-15'] }), true)
})

test('use duration for start-only schedules and single batch dates, including year changes', () => {
  assert.equal(available({ startDate: '2026-11-12', durationDays: 3 }), true)
  assert.equal(available({ startDate: '2026-11-11', durationDays: 3 }), false)
  assert.equal(available({ startDate: '2026-11-13' }), false)
  assert.equal(available({ upcomingDates: ['12 Nov 2026'], durationDays: 3 }), true)
  assert.equal(available({ startDate: '2026-12-30', durationDays: 4 }, new Date('2027-01-01T08:00:00Z')), true)
})

test('keep flexible undated listings; do not guess malformed or ambiguous explicit dates', () => {
  assert.equal(available({}), true)
  assert.equal(available({ startDate: '', endDate: null, upcomingDates: ['  '] }), true)
  for (const schedule of [
    { endDate: '2026-02-31' },
    { endDate: '2026-13-01' },
    { startDate: '2026-12-01', endDate: '2026-11-30' },
    { upcomingDates: ['15 Nov - 18 Nov'] },
    { upcomingDates: ['Dates to be confirmed'] },
    { upcomingDates: ['18 Nov 2026 - 15 Nov 2026'] },
    { upcomingDates: ['31 November 2026'] },
  ]) assert.equal(available(schedule), false, JSON.stringify(schedule))
  assert.equal(available({ endDate: '2028-02-29' }, new Date('2028-02-29T00:00:00Z')), true)
})

test('homepage filters before the four-card limit and excludes destinations with only expired listings', async () => {
  const old = Array.from({ length: 5 }, (_, i) => ({
    id: `old-${i}`, slug: `expired-${i}`, title: `Expired retreat ${i}`, location: 'Kerala', endDate: '2026-10-27',
  }))
  const current = Array.from({ length: 5 }, (_, i) => ({
    id: `current-${i}`, slug: `current-${i}`, title: `Current retreat ${i}`, location: 'Rishikesh', endDate: '2026-12-01',
    durationDays: 3, durationNights: 2, inclusions: [], enableShared: true, priceShared: 250,
    enablePrivate: false, enableDormitory: false, totalReviews: 0, avgRating: 0,
  }))
  const packages = [...old, ...current]
  let databaseUnavailable = false
  const page = load('app/(public)/page.tsx', {
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    '@/lib/prisma': { prisma: {
      package: { findMany: async (query) => {
        if (databaseUnavailable) throw new Error('Database unavailable')
        assert.equal(query.where.status, 'PUBLISHED')
        assert.equal(query.take, undefined, 'Do not limit the candidates before date filtering')
        return query.select ? packages : packages.filter((pkg) => query.where.id.in.includes(pkg.id))
      } },
      review: { findMany: async () => [] },
    } },
    '@/lib/packageAvailability': { filterAvailablePackages: (items) => filterAvailablePackages(items, now) },
    '@/lib/siteConfig': { getSiteConfig: async () => ({
      ogImage: '', whatsappNumber: '', contactPhone: '', customHtmlTags: '',
      destinations: [{ id: 'r', name: 'Rishikesh', locationQuery: 'Rishikesh' }, { id: 'k', name: 'Kerala', locationQuery: 'Kerala' }],
    }) },
    '@/lib/siteSections': { getSiteSectionHtml: async () => '', HOME_EXPERIENCE_SECTION_KEY: 'home' },
    '@/lib/homepageContent': load('lib/homepageContent.ts'),
    '@/components/WhyChooseUsInteractive': () => null,
    '@/components/home/HeroSearchBar': () => null,
  })
  assert.equal(page.dynamic, 'force-dynamic', 'Do not serve cached cards after the date changes')
  const html = renderToStaticMarkup(await page.default())
  for (let i = 0; i < 4; i++) assert.ok(html.includes(`/packages/current-${i}`))
  assert.ok(!html.includes('/packages/current-4'))
  assert.ok(!html.includes('/packages/expired-'))
  assert.ok(html.includes('location=Rishikesh'))
  assert.ok(!html.includes('location=Kerala'))
  databaseUnavailable = true
  assert.ok(renderToStaticMarkup(await page.default()).includes('Package details are currently unavailable'))
})

test('package search applies availability without changing category, location and duration filters', async () => {
  const page = load('app/(public)/packages/page.tsx', {
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    '@/lib/siteUrl': { SITE_URL: 'https://www.indiayogatourism.com' },
    '@/lib/utils': { formatPrice: (price) => `$${price}` },
    '@prisma/client': { PackageCategory: { RETREAT: 'RETREAT' } },
    '@/lib/packageAvailability': { filterAvailablePackages: (items) => filterAvailablePackages(items, now) },
    '@/lib/prisma': { prisma: { package: { findMany: async ({ where }) => {
      assert.equal(where.status, 'PUBLISHED')
      assert.equal(where.category, 'RETREAT')
      assert.deepEqual(where.location, { contains: 'Rishikesh', mode: 'insensitive' })
      assert.deepEqual(where.durationDays, { lte: 5 })
      assert.ok(where.OR.some((condition) => condition.title?.contains === 'yoga'))
      return [
        { id: 'old', slug: 'expired', title: 'Old retreat', endDate: '2026-10-27' },
        { id: 'future', slug: 'future', title: 'Future retreat', upcomingDates: ['15 Nov 2026 - 18 Nov 2026'] },
      ]
    } } } },
  })
  const html = renderToStaticMarkup(await page.default({ searchParams: Promise.resolve({
    search: 'yoga', category: 'RETREAT', location: 'Rishikesh', duration: 'short',
  }) }))
  assert.ok(html.includes('/packages/future'))
  assert.ok(!html.includes('/packages/expired'))
})
