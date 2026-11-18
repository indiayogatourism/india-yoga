# Phase 3 audit and implementation plan

Audit: 18 November 2026 (India). Base: `92f93d2`. The owner subsequently approved push and production deployment after final review/repeat checks, and explicitly deferred GA4/GTM loader and configuration work.

## Findings before implementation

- Live homepage, retreat hub and target return HTTP 200. Target has one H1, the intended title, self-canonical, index/follow, TouristTrip and BreadcrumbList. Robots permits the target and the sitemap contains it.
- No GA4/GTM ID, loader or consent manager was found in repository code, local environment configuration, or the three public HTML responses. CMS `customHtmlTags` is the existing integration injection point. Owner says GA4/Search Console are connected; property access and the actual tag configuration are still unverified. Asked for the existing ID/integration location. Do not install another loader while this is unresolved.
- Phase 2 has seven custom event names and an explicit `iytAnalyticsConsent` gate. No code sets that gate. Existing confirmed tracking checks authorized booking + CONFIRMED + PAID but uses session-only deduplication and has no GA4 transaction ID/items.
- Enquiry success is already server-save based. WhatsApp clicks are distinct. Actual package database IDs are not yet attached consistently to analytics. Checkout amount must come from enabled room choice and guests, purchase amount from verified persisted payment.
- The live target HTML is 9,794,832 bytes. CMS base64 photographs are repeated in markup, React props and a 2,235,890-byte TouristTrip schema. This defeats lazy image fetching. Serve those same saved images by cacheable URLs without editing CMS records or adding storage credentials.
- Existing room prices, dates, mobile CTA, inclusions/exclusions, policy links and instructor enquiry guidance are present. Do not invent credentials or legal promises. Add short section shortcuts near the booking decision.
- Hub and Rishikesh guide already feature the target; relevant published blogs already link to it. Homepage and About lack a dependable contextual package link. Add one each and avoid duplicate sections.
- Public mobile PageSpeed API request returned HTTP 429 quota exceeded. Field Core Web Vitals and authenticated GA4 DebugView/Search Console reports are not accessible from the available tools. Browser measurements are lab observations only.

## File-level plan

| Files | Change |
| --- | --- |
| `lib/analytics.ts`, `components/ConversionTracking.tsx` | Map existing call sites to the six requested GA4 events; allowlisted data, real item IDs, validated monetary pairs, explicit consent/provider checks, durable purchase dedupe, no second page-view mechanism or tag loader. |
| `lib/bookingAnalytics.ts`, package/checkout/confirmation pages | Server-derived item context and verified purchase payload with an opaque stable transaction ID; no payment/booking business logic changes. |
| `components/RetreatEnquiryForm.tsx`, `app/api/enquiry/route.ts` | Return public resolved item context after successful save; generate_lead only from that response, no invented lead value. |
| `components/retreats/RetreatCard.tsx`, package listings, `components/BookingCard.tsx`, `components/FloatingWhatsApp.tsx` | Identify actual selected items; separate WhatsApp interest from submitted leads; context-aware WhatsApp message. |
| `lib/packageImages.ts`, `app/retreat-images/[packageId]/[image]/route.ts`, catalog/package/checkout | Replace saved embedded photo repetitions with public published-image URLs, validate content, cache safely, preserve real photographs and private drafts. |
| Homepage, About, package page | One useful contextual link where missing; compact booking decision shortcuts; preserve premium visual structure and indexed URLs. |
| `lib/siteUrl.ts`, existing blog detail page | Follow-up live audit found a Markdown string in the relevant Rishikesh blog's canonical. Use the current indexed route as fallback for malformed canonical input, while preserving valid CMS overrides. |
| `tests/phase-3.test.cjs`, existing regression tests, `package.json` | Consent/provider behavior, GA4 payloads, privacy, correct values, success-only lead, verified-only purchase/dedupe, image route access/cache and existing regressions. |
| `docs/phase-3-report.md` | Final event inventory, audit evidence, changed files, validation results, limitations and marketing next steps. |

## Validation

Run availability, Phase 2 and Phase 3 tests, TypeScript and production build. Inspect actual hydrated browser behavior with intercepted analytics/enquiry requests (no real submission/payment). Verify live SEO read-only and local rendered/schema/image behavior. Do not claim GA receipt, real payment certification, field CWV or rankings without evidence.

## Implementation status

The planned code changes and implementation report are complete. All 37 automated tests, standalone TypeScript, the production build and targeted application lint passed in the implementation phase. The owner requested a final review and repeat checks before the approved release. Optional tracking is fail-safe and stays inactive without explicit consent and an existing provider; no new loader/configuration is required or added. Production deployment and page/CTA verification will be reported in the final delivery message.
