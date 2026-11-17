# Phase 2 implementation plan

Audit date: 17 November 2026. The supplied Phase 2 brief requires approval for push and deployment. After reviewing the completed local implementation, the owner approved the GitHub push.

## Audit findings

- Next.js 15.5.20 App Router, Prisma/PostgreSQL, Clerk, Razorpay and PayPal already exist. `node_modules/next/dist/docs/` is absent; version 15 official route/configuration documentation is the fallback.
- Preserve `/packages`, `/packages/[slug]`, `/about`, `/contact`, `/faqs`, `/privacy-policy`, `/know-more`, CMS `/{slug}` and blog routes. `/yoga-retreats-india` and `/rishikesh` return 404 in the public audit. The sitemap contains no dedicated yoga-retreat hub or Rishikesh destination guide.
- The target is published publicly, with 5 days / 4 nights, Rishikesh, actual photos, a 24–28 November 2026 batch, shared USD 250 / private USD 350, CMS HTML itinerary and zero reviews. These are audit observations, not hardcoded availability or prices.
- The target's structured itinerary is empty but its CMS `contentHtml` contains the detailed itinerary. Preserve this content instead of inventing a second itinerary. Instructor identities, room/property specifics and package-specific operator identity require owner confirmation.
- About currently contains unsupported lineage, biography and clinical claims. Replace these with the business model explicitly supplied by the owner; do not invent a company history or team.
- Contact uses `/api/enquiry`; extend it without a schema migration. Store dates, guest count and destination in the existing enquiry message, and resolve the existing nullable packageId from published records.
- `/faqs` currently writes default FAQ/refund content on a public GET. Remove that write and provide safe read-only fallbacks. Existing `/refund-policy` and `/terms-and-conditions` are published CMS pages; preserve their content. Privacy is an existing static page; preserve its legal text.
- No dedicated analytics or consent implementation exists in repository source. Admin custom HTML can supply analytics. Add consent-gated hooks without installing a provider, inventing consent, or transmitting enquiry/account fields.
- Local database/payment credentials are unavailable. Use read-only public inspection, mocked integration tests and local browser checks; do not submit real bookings, payments or enquiries.

## File-level sequence

1. `lib/retreatContent.ts`, `lib/retreatCatalog.ts`, `lib/packageAvailability.ts`, `components/retreats/*`: reusable CMS queries, exact target URL, real enabled-room pricing, date options, breadcrumbs, package cards and enquiry links.
2. `app/(public)/packages/[slug]/page.tsx`, `components/BookingCard.tsx`: target metadata/H1, CMS-first overview/itinerary, real reviews, transparent dates/prices, operator/accommodation enquiry guidance, policy links, FAQs, related retreats, above-fold and mobile booking actions. Preserve checkout/payment APIs.
3. `app/(public)/yoga-retreats-india/page.tsx`: new discoverable retreat hub with target near the top, available published retreat cards, actual destinations, beginner guidance, duration comparison, selection guidance and FAQs.
4. `app/(public)/about/page.tsx`: honest mission/business model, direct/partner distinction, guest planning and retreat/contact CTAs.
5. `app/(public)/contact/page.tsx`, `contact/layout.tsx`, `components/RetreatEnquiryForm.tsx`, `app/api/enquiry/route.ts`, enquiry email templates: preselected retreat, dates/guests/location fields, validation, privacy notice and accessible success/error states using the existing endpoint.
6. `app/(public)/destinations/rishikesh/page.tsx`, `/faqs`, `/know-more`, relevant blog detail template, navigation/home service link and `lib/sitemap-helper.ts`: guide, read-only FAQs and restrained funnel links. Keep the homepage title, description, H1, sections and availability behavior.
7. `lib/analytics.ts`, `components/ConversionTracking.tsx`, checkout/confirmation pages: consent-gated event hooks and local deduplication. No personal fields in event parameters; confirmed events only for authorized paid/confirmed bookings.
8. `tests/phase-2.test.cjs`, existing availability tests, `docs/phase-2-report.md`: test data correctness, routes/metadata, enquiry success/error handling, tracking consent/deduplication, build/types/lint and responsive browser behavior. Record limits and owner verification items.

No production records, database schema, service credentials or unapproved legal terms will be changed. Final approval is for the completed, reviewable changes, not a prerequisite to implementation.

## Completion

All implementation steps are complete locally. The final file inventory, exact URLs, metadata, tracking bridge, owner verification items and validation results are in `docs/phase-2-report.md`.

Validation: seven existing availability tests plus fourteen Phase 2 tests passed; TypeScript and production build passed; changed application files have zero lint errors. Full-source lint still reports 196 unrelated errors and 36 warnings. Real local public routes and an intercepted enquiry flow were checked in the browser; package/hub responsive layouts were checked with static CMS fixtures because local database credentials are unavailable.

Additional audit fixes included stale target JSON-LD pricing, fixed-batch arrival propagation, departure based on saved nights, the client-only promo mismatch, sign-in before payment, transaction-page noindex and URL-query redaction in analytics events. Implementation is complete and the owner has authorized the GitHub push. Production deployment status requires separate verification.
