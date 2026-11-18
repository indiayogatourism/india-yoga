# Phase 3: booking growth and analytics report

Audit date: 18 November 2026 (India). Implementation base: `92f93d28ef49c33bbb181448b4a42e1c306ad232`.

**Release scope:** the owner approved GitHub push and production deployment after a final review and repeat checks. The owner explicitly deferred GA4/GTM loaders and additional analytics configuration. No new tracking setup is part of this release. Deployment verification is reported in the final delivery message. No production data, booking, payment, legal terms or service credentials are to be changed.

## 1. Existing analytics status

The owner reports that GA4 and Google Search Console are connected. That account-level connection could not be verified from the available access.

- Repository search found no GA4 Measurement ID, GTM container ID, Google loader, analytics package or consent manager. No relevant local environment configuration is present. No environment values were printed or changed.
- Existing `app/layout.tsx` can render CMS `customHtmlTags`; this remains the integration injection point. It was preserved.
- Public homepage, target package and retreat hub HTML contained no GA4/GTM ID or analytics loader.
- A fresh headless Edge session on the actual mobile target page found `window.gtag` undefined, no `dataLayer`, no `google_tag_manager`, no analytics consent flag, and no requests to Google Analytics/Tag Manager during the sampled load.
- This is evidence that a working integration was **not observed on the sampled public load**, not a claim that the owner's GA property does not exist. Other consent states, regional behavior, property settings and authenticated dashboards were not inspected.
- No GA4 page-view duplication was observed because no Google tag was observed. This does not certify the property's configuration. This phase adds no Google loader, `config`, page-view publisher or history-change listener, so it introduces no second page-view mechanism.
- The existing Search Console HTML verification token was preserved. Verification markup is not proof of GA4 collection or Search Console index coverage.

**Owner decision after audit:** skip loader/configuration work. No GA4/GTM ID or consent-provider details are required for this release. Optional events remain inactive without explicit consent and an existing provider; booking, enquiry and page functionality do not depend on tracking.

## 2. Events already implemented

Phase 2 already had these application event hooks. They were consent-gated but not proven to reach a receiver:

| Previous application name | Existing trigger | Phase 3 GA4 name |
| --- | --- | --- |
| `package_view` | Published package detail view | `view_item` |
| `retreat_listing_click` | Retreat card/detail link | `select_item` |
| `whatsapp_enquiry_click` | Marked WhatsApp links | `retreat_whatsapp_click` |
| `enquiry_submit` | Enquiry API reports successful save | `generate_lead` |
| `checkout_start` | Valid published package checkout view | `begin_checkout` |
| `booking_confirmed` | Authorized CONFIRMED booking and PAID payment | `purchase` |
| `booking_cta_click` | Package booking action | `booking_cta_click` (retained diagnostic) |

The compatibility adapter maps old call names to one standard event. It never emits both old and new names for the same call. Main page call sites now use the new names directly.

## 3. New event implementation

| Event | Item identification and monetary data | Safeguards |
| --- | --- | --- |
| `view_item` | Actual public database package ID; public slug; lowest enabled saved room price, USD, quantity 1 when priced | No draft view tracking; no invented price when absent |
| `select_item` | Actual package ID from server-rendered card/link context; source list; real saved starting price only where provided | Does not derive IDs from URL text; does not send duplicate alias events |
| `retreat_whatsapp_click` | Actual page item context when available; source | Tracks outbound click interest only. No lead count, price, monetary value, phone, message text or WhatsApp query |
| `generate_lead` | Public package ID/slug resolved by server after successful enquiry save; generic enquiries can omit item | No submit-button event, failed save event or invented lead revenue |
| `begin_checkout` | Server-validated package, enabled selected room price, clamped guest count and USD total at checkout entry | Preserves existing checkout authentication and business logic; no payment-attempt conversion |
| `purchase` | Persisted package ID/slug, price per person, guests and total; paid ledger currency and amount must match at cent precision | Authorized confirmation only; CONFIRMED + PAID; positive valid amounts; staff views excluded; no unverified browser/query success flags |

`items[].item_id` is the actual database package ID. `item_name` uses its public slug consistently. No customer, user or booking reference is used as an item identifier. All current booking gateways and persisted totals use USD. Analytics does not guess exchange rates; unsupported monetary currencies are omitted, and unsupported purchase currencies suppress purchase reporting for review.

### Existing provider and consent

- Reuses `window.gtag` if it exists. Otherwise it can push to the default `dataLayer` of an already-running `GTM-…` container. An arbitrary dataLayer alone is not treated as a working GTM integration.
- Uses **one transport per event**, preferring gtag when both exist. No external script or second Google integration is installed.
- GTM events clear stale `ecommerce` before the new event, preventing a lead/WhatsApp event from inheriting previous purchase revenue. Existing GTM must have one GA4 custom-event tag consuming the canonical event name and ecommerce object; tag configuration and duplicate triggers require account access to verify.
- Every event requires explicit `window.iytAnalyticsConsent === true`. Unknown/denied consent emits nothing. This phase does not grant consent or override an existing CMP/Google Consent Mode default/update.
- The existing CMP should call the exported `setAnalyticsConsent(actualAnalyticsChoice)` after reading a stored choice and whenever that choice changes. For a CMS-managed callback, the equivalent bridge is:

```js
// Run from the EXISTING consent manager, using its actual analytics consent decision.
window.iytAnalyticsConsent = actualAnalyticsChoice === true;
window.dispatchEvent(new Event('iyt:analytics-consent'));
```

- The existing Google integration can dispatch `iyt:analytics-ready` after it loads. Mounted detail/checkout/confirmation tracking retries for up to 30 seconds and responds to readiness/consent events. Denied clicks and leads are not buffered for later replay.
- The bridge stays inactive without the real provider and consent state. The owner has deferred configuring it. A successful local mock/provider call is not proof of GA4 receipt. The entire tracking dispatch also catches provider/property-access failures, so optional analytics cannot block a booking CTA or change a successful saved enquiry into a visible failure.

### Purchase deduplication and privacy

- A stable `iyt_` SHA-256 transaction ID is derived server-side from the random booking ID plus a version prefix. It contains no customer details, booking reference or gateway credentials and cannot serve as a booking-access token.
- Browser memory plus localStorage suppress refresh/revisit duplicates across sessions on that browser. The stable `transaction_id` also allows GA4's transaction deduplication. Blocked storage retains memory dedupe and the GA4 ID; delivery across devices depends on GA4 receiver behavior.
- Only explicit allowlisted fields leave the adapter. Names, email, phone, message, travel notes, medical/passport data, customer IDs, booking references and arbitrary fields are discarded.
- `page_location` is origin + pathname only; queries and fragments are excluded. `page_referrer` is empty and page title is a static brand value, including on private confirmation URLs.
- Existing tags/CMPs must also be audited for automatic URL/form collection once access is available. This adapter cannot sanitize independent third-party tags.

## 4. Booking funnel and conversion improvements

- Preserved the existing package design, prices, date filtering, enabled room options, guest calculations, arrival handling, checkout fields and payment gateways.
- Added near-decision shortcuts to inclusions/exclusions, accommodation and cancellation information. Existing full sections remain intact.
- Floating WhatsApp now includes the actual package URL in its prefilled question on package pages. Analytics receives neither that message nor its query string. Delegated click tracking covers existing WhatsApp links without adding one handler per link.
- Enquiry success response now includes only public resolved item ID/slug for tracking. Saving and email semantics are unchanged; no personal enquiry record is returned.
- Checkout receives only the fields its client wizard uses, rather than serializing the full CMS record/gallery/content into the browser.
- No testimonials, dates, remaining inventory, instructor biographies, qualifications, property details or cancellation promises were invented. The existing instructor/operator request guidance remains because verified profiles were not available.

### Verified performance weakness

The audited target returned approximately **9.8 MB of uncompressed HTML**. Six saved base64 photos were repeated in HTML, React props and a **2,235,890-byte TouristTrip schema**. Inline data defeats lazy network loading.

The new published-image route serves those same saved raster bytes via content-versioned URLs. It validates raster signatures, limits decoding to 8 MB, checks PUBLISHED status, rejects arbitrary/stale paths, supports ETag/304, sets `nosniff`, and caches public photos for one day. It does not fetch arbitrary remote URLs, write files, mutate CMS content or require a new storage service. Unpublishing prevents fresh reads; previously public cached images can remain available until the one-day cache expires.

Published package gallery, metadata, schema and retreat catalog now use those URLs. Draft preview remains private and uses the existing saved data. Existing gallery dimensions, main-image priority, lazy thumbnails and keyboard lightbox are preserved.

An apples-to-apples static render using the same audited saved photo fixture changed from **5,227,393 bytes to 23,322 bytes (99.55% less markup)**, with zero embedded `data:image` entries in the new package markup. This is a controlled component-render comparison. It is **not** the production page size after deployment, a total transfer-size result, or a field Core Web Vitals score. Actual photo bytes still need downloading; browser caching/lazy fetching can now work.

## 5. Internal links and SEO verification

| Check | Observed result/action |
| --- | --- |
| Homepage | Existing hub/navigation preserved. Added one contextual target link in the planning paragraph, only when the target is in currently available published records. |
| Yoga retreat hub | Already featured the current target; retained its existing card, improved `select_item` context. No repetitive new target section. |
| Rishikesh guide | Live HTTP 200, one H1, correct canonical, existing target card/link retained. |
| Related blog | Rishikesh retreat guide already linked to the target; retained that placement. Relevant published yoga/meditation/pranayama posts keep the existing related retreat logic. |
| About | Live audit found no package link. Added one contextual target link in the operator-planning section when the current published catalog contains it. |
| Target indexability | Live HTTP 200, `index, follow`, no X-Robots-Tag restriction; robots.txt permits target. No authenticated Search Console indexing claim. |
| Target canonical | Exactly `https://www.indiayogatourism.com/packages/5-days-yoga-spiritual-retreat-rishikesh-4n-5d`, preserved. |
| Target metadata | Preserved `5 Day Yoga & Spiritual Retreat in Rishikesh | IYT` and the Phase 2 description. |
| Heading hierarchy | One target H1. CMS H1 normalizes to H2 at render time. Existing H2/H3 sections remain. |
| Sitemap | Target present in actual public `/sitemap.xml`; hub and Rishikesh guide also present. Sitemap configuration unchanged. |
| Breadcrumbs/schema | Existing BreadcrumbList retained. TouristTrip uses valid JSON and absolute real image URLs without fabricated Offer, stock, ratings or reviews. No promise of Google rich-result eligibility. |
| Related blog canonical defect | Live canonical contained `…rishikesh](https://…`. New validation falls back to that blog's existing indexed route for malformed input; valid CMS overrides remain. No URL rename, redirect or CMS write. |
| Mobile | Actual hydrated contact and static package component tested at 320/390/768/1440 px without horizontal overflow. Main booking bar and decision shortcuts inspected visually. |
| Mobile Core Web Vitals | Public mobile PageSpeed API returned HTTP 429 (quota exceeded). CrUX/field LCP, INP and CLS, Search Console CWV and authenticated PageSpeed results are unverified. Layout checks are not field CWV certification. |

## 6. Tests

| Check | Result |
| --- | --- |
| Existing availability tests | 7 pass |
| Existing Phase 2 regressions, updated for the new event contract | 14 pass in the repeat release run |
| Phase 3 tests | 16 pass in the repeat release run, including disabled/missing/throwing analytics |
| Total automated tests | **37 pass** |
| TypeScript final source | **PASS**, `npx tsc --noEmit --incremental false` exit 0, repeat release check passed before the build; checks run sequentially to avoid generated-file races |
| Production build final source | **PASS**, `npm run build` exit 0; new image route included; known absent DATABASE_URL messages are not a DB certification |
| Targeted lint | **20 changed application files: 0 errors, 5 existing native-image warnings**; latest analytics/purchase/canonical edits also pass. No whole-repository clean claim |
| Hydrated browser enquiry | Success-only `generate_lead`, one event after error/retry, server-resolved item, no PII; **both POSTs intercepted before the backend** |
| Hydrated WhatsApp/consent | Denied consent emits nothing; granted click emits only `retreat_whatsapp_click` |
| Image endpoint | Mocked database: published bytes, ETag/304, cache policy, denied unpublished/stale/invalid paths, safe DB failure |
| Purchase | Persisted status/currency/cent totals, staff/unauthorized suppression, stable IDs, refresh/module reload and blocked-storage dedupe tested with mocks |
| GA4 DebugView | Not available: no authenticated GA property access or observed receiver. No real purchase/payment attempted. |
| Schema/migrations/dependencies | No schema, migration or dependency changes; package lock unchanged |

Browser package screenshots use static actual-component markup with saved public photo fixtures; image GETs were intercepted with those bytes. This is not hydrated checkout, a live database test or a production image-route certification. Normal public live pages were audited read-only. Local service credentials remain absent, so actual DB/payment/email/GA receipt tests are not certified.

## 7. Outstanding risks and next steps before release

1. GA4 installation and consent configuration are explicitly deferred by the owner, and are not release blockers. No Google loader, ID, new consent setup, external analytics package or production analytics setting is added.
2. If the owner later reopens analytics configuration, verify existing tag triggers, ecommerce mappings, duplicate rules and DebugView before making collection claims. Current website functionality remains independent of that work.
3. After approved deployment, verify actual published image routes, photo loading, target metadata and authorized guest confirmation with the real configured services. Keep production-payment testing separate and explicitly controlled.
4. Client-side analytics can be blocked or abandoned, including before the confirmation screen; analytics is not the booking ledger. Compare confirmed paid records against GA purchases. This phase does not add a server-side Measurement Protocol sender or backfill historical bookings.
5. Existing verified payment status is trusted; gateway signatures/capture and booking/payment business logic were deliberately unchanged. No real booking or payment was created for this phase.
6. Owner still needs to verify current instructor profiles, exact property/room facilities and applicable retreat-specific terms. Published dates are not live remaining inventory.
7. Re-run public mobile PageSpeed/CrUX and review Search Console after deployment; no SEO ranking or CWV guarantee is made.
8. Cold image requests still read the saved gallery from the existing database. Browser caching limits repeat downloads; verify cold-request latency and hosting cache behavior with the real database before making CWV claims. No image-storage migration was performed.

## 8. Recommended marketing actions

- Analytics recommendations below are deferred, per the owner's release instruction. If resumed later, validate the receiver, consent and six-event funnel first. Keep WhatsApp clicks as interest, not confirmed leads; avoid duplicate conversion rules.
- Build a funnel from `view_item` to `begin_checkout` to `purchase`, with a separate `generate_lead` branch. Compare public package IDs, placement/source and mobile versus desktop behavior. Reconcile with the actual paid-booking ledger.
- Use consistent campaign UTMs for partner/email/social links, without names, email or other personal data. This phase intentionally redacts URL queries on its events; inspect the existing Google tag's consented acquisition behavior before relying on campaign attribution.
- Use the existing Rishikesh guide and related article to explain practical arrival, room and inclusion questions. Add owner-verified teacher/property information when supplied rather than additional generic landing pages.
- Review Search Console target-page queries, impressions, clicks and indexing. Adjust content from actual queries and enquiry questions. Monitor lead quality and confirmed bookings before expanding promotion.

Technical references: [GA4 ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce), [recommended event parameters](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), [transaction-ID deduplication](https://support.google.com/analytics/answer/12313109), [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent), [SPA page-view verification](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [PageSpeed API](https://developers.google.com/speed/docs/insights/v5/get-started), [Next.js 15 Script](https://nextjs.org/docs/15/app/api-reference/components/script), [Next.js 15 metadata/sitemap](https://nextjs.org/docs/15/app/api-reference/file-conventions/metadata/sitemap).

## Changed files

- `app/(public)/about/page.tsx`
- `app/(public)/blog/[slug]/page.tsx`
- `app/(public)/booking/checkout/page.tsx`
- `app/(public)/booking/confirmation/page.tsx`
- `app/(public)/contact/page.tsx`
- `app/(public)/packages/[slug]/page.tsx`
- `app/(public)/packages/page.tsx`
- `app/(public)/page.tsx`
- `app/api/enquiry/route.ts`
- `app/retreat-images/[packageId]/[image]/route.ts`
- `components/BookingCard.tsx`
- `components/ConversionTracking.tsx`
- `components/FloatingWhatsApp.tsx`
- `components/RetreatEnquiryForm.tsx`
- `components/retreats/RetreatCard.tsx`
- `docs/phase-3-plan.md`
- `docs/phase-3-report.md`
- `lib/analytics.ts`
- `lib/bookingAnalytics.ts`
- `lib/packageImages.ts`
- `lib/retreatCatalog.ts`
- `lib/siteUrl.ts`
- `package.json`
- `tests/package-availability.test.cjs`
- `tests/phase-2.test.cjs`
- `tests/phase-3.test.cjs`

26 Phase 3 files. The pre-existing local `.gitignore` change is unrelated and remains untouched/unstaged.
