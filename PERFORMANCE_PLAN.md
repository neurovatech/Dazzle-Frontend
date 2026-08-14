# Dazzle Frontend — Performance Remediation Plan

Companion to [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md). Ordered by ROI (impact vs. risk), per the audit's High-Impact/Low-Risk → High-Impact/Medium-Risk → Everything-else framing. Nothing in this plan has been implemented yet — this is the proposed sequence, pending approval.

Each phase is independently shippable; later phases don't block on earlier ones being "perfect," but doing them in order minimizes rework (e.g. fixing caching strategy before touching individual fetch call sites avoids touching the same lines twice).

---

## Phase 1 — High impact / low risk (do first)

Pure cleanups and refactors with no behavioral ambiguity. Target: same day.

1. **Remove the proxy route's debug logging** ([C1](PERFORMANCE_AUDIT.md#c1-proxy-route-does-a-blocking-synchronous-file-write--full-body-double-read-on-every-request)) — delete the `response.clone()`/`fs.appendFileSync` block in `src/app/api/proxy/[...path]/route.ts` entirely. If request/response logging is wanted for debugging, reintroduce it later behind `if (process.env.NODE_ENV === "development")` using `fs.appendFile` (async) or `console.log`, never sync file I/O in a request handler.
2. **Fix the blank sub-category page bug** ([C2](PERFORMANCE_AUDIT.md#c2-sub-category-page-renders-blank-if-the-banner-endpoint-returns-no-data)) — scope the `if (!banners.length) return null` guard to the banner JSX block only, not the whole page component.
3. **Parallelize independent sequential fetches** ([H3](PERFORMANCE_AUDIT.md#h3-header-rendered-on-every-page-makes-2-independent-api-calls-sequentially-instead-of-in-parallel)) — wrap the independent `await api.get()` pairs/groups in `Promise.all` (each still individually try/caught, e.g. via `Promise.allSettled` or per-call try/catch inside the parallel calls) in `Header.tsx`, `categories/[categorySlug]/page.tsx`, and `categories/[categorySlug]/[subCategorySlug]/page.tsx`.
4. **Remove stray `console.log`s in hot paths** ([M5](PERFORMANCE_AUDIT.md#m5-console-logging-left-in-hot-render-paths-and-one-on-the-server-every-request)) — delete the ~11 cited call sites (keep legitimate `console.error` in catch blocks).
5. **Fix `key={index}`/`key={i}` on real product lists** ([M2](PERFORMANCE_AUDIT.md#m2-keyindex--keyi-used-on-real-reorderable-data-lists-not-just-static-skeletons)) — swap to the product's `uuid`/`slug` at the ~11 cited call sites. Leave skeleton-loader `key={i}` usages alone (static arrays, no reorder risk).
6. **Deduplicate the site-settings fetch** ([H2](PERFORMANCE_AUDIT.md#h2-site-settings-is-fetched-twice-per-page-load--once-on-the-server-discarded-once-on-the-client)) — prefetch the `["siteSettings"]` query server-side in `layout.tsx` and hydrate via `HydrationBoundary`/`dehydrate`, matching the pattern already documented in this repo's own README for other endpoints. `Footer`/`MainNav`'s `useSiteSettings()` then hydrates instantly with zero extra client round trip.

**Expected impact of Phase 1:**
- Response time: proxy route removal cuts a fixed per-request tax (currently on every client-side API call) — biggest single latency win in this phase.
- Throughput: proxy route no longer serializes concurrent requests behind synchronous disk I/O.
- Memory: proxy route no longer double-buffers every response body.
- DB/backend load: unaffected by this phase (that's Phase 2).
- Infra cost: negligible directly, but removes an unbounded log file and a landmine that fails silently in production.
- Business: C2 fix directly restores a currently-broken, indexable product page.

---

## Phase 2 — High impact / low-to-medium risk: caching strategy

This is the biggest lever in the app ([H1](PERFORMANCE_AUDIT.md#h1-cache-no-store-is-used-everywhere-defeating-nextjss-data-cacheisr-entirely)) but needs per-endpoint judgment, so it's sequenced as its own reviewable phase rather than a blanket find/replace.

1. Classify every current `cache: "no-store"` call site (67 across 50 files) into:
   - **Time-cacheable** (nav categories/brands, home banners, blog/announcement/career/press listings, policy content, site settings) → `next: { revalidate: N }`, N chosen per content type (suggest 300s for nav/settings, 60-120s for banners/listings — adjustable based on how often editors actually publish changes).
   - **Must stay uncached** (cart, checkout, auth, order status, live price/availability, anything user-specific).
   - **Borderline** (product listing/search pages) → short revalidate window (30-60s), revisit after measuring.
2. Remove the now-redundant `export const dynamic = "force-dynamic"` from the 3 routes that set it, once their underlying fetches use `revalidate` instead of `no-store` (keeping both is inconsistent — `force-dynamic` should only remain on genuinely always-dynamic routes, e.g. ones reading cookies/headers for per-user content).
3. Re-verify each changed page still reflects backend updates within an acceptable window (manual check: publish a change in the admin/backend, confirm it appears within the chosen revalidate window on the frontend).

**Expected impact of Phase 2:**
- Response time: cached routes serve from Next.js's Data Cache after the first hit — near-instant TTFB for repeat traffic instead of a full origin round-trip every time.
- Throughput: origin backend request volume drops sharply (proportional to traffic × cache hit rate) for the ~40+ safely-cacheable call sites.
- DB/backend load: this is the direct lever — every cache hit is a request the backend never sees.
- Infra cost: fewer backend requests → lower backend compute/hosting cost; frontend hosting cost roughly flat (Next.js Data Cache uses existing infra).
- Risk: staleness — mitigated by conservative revalidate windows and keeping genuinely dynamic data (`no-store`) untouched.

---

## Phase 3 — High impact / medium risk: data-fetching architecture

1. **Migrate manual `useEffect` pagination to `useInfiniteQuery`** ([H4](PERFORMANCE_AUDIT.md#h4-manual-useeffect--usestate-load-more-pagination-instead-of-useinfinitequery)) — one component at a time: `AllProducts.tsx`, `BrandProductListClient.tsx`, `NewArrivalsClient.tsx`, `CampaignDetailClient.tsx`, then the manual attribute-refetch pattern in `BrandProduct.tsx`, `CategoriesProduct.tsx`, `CategoriesProductWithTopSale.tsx`. Each migration should preserve existing filter/sort/URL-param behavior exactly — test each screen's filter interactions before/after.
2. **Fix checkout's N+1 product fetch** ([H5](PERFORMANCE_AUDIT.md#h5-checkout-n1-per-item-product-fetch-for-minbookingprice)) — check whether the backend exposes a batch product-lookup endpoint (`/products?ids=...` or similar); if yes, replace the per-item loop with one batched call. If no such endpoint exists, that's a backend ask — in the meantime, at minimum switch `forEach(async ...)` to `Promise.all(...).then(...)` with a single batched Redux dispatch to cut re-renders from N to 1.

**Expected impact of Phase 3:**
- Response time: infinite-query migration adds request caching across navigations (revisiting a filtered list is instant if still fresh) and proper cancellation of in-flight requests on rapid filter changes (eliminates a class of "wrong data flashes in" bugs).
- Throughput/backend load: fewer duplicate requests when users adjust filters quickly.
- Checkout: fewer round trips and re-renders on the highest-value screen in the app.
- Risk: medium — this touches core listing and checkout logic; needs test coverage on filter/sort/pagination behavior per screen before merging.

---

## Phase 4 — Everything else

Lower urgency; batch into follow-up work, roughly in this order:

1. **`React.memo` on list-item components** ([M1](PERFORMANCE_AUDIT.md#m1-no-reactmemo-usage-anywhere-in-the-codebase)) — `ProductCard`, `CartItem`, `BrandCard`, and similar pure presentational components rendered in loops. Pair with `useCallback` for any function props passed down, otherwise memo is a no-op.
2. **`useMemo` the un-memoized derived computations** ([M3](PERFORMANCE_AUDIT.md#m3-un-memoized-derived-computations-in-render-bodies)) — `ProductCompareDetails`, `FrequentlyBoughtTogether`, `TransparentProfitMeterArea`.
3. **Consolidate `getAuthCredentials`** ([M4](PERFORMANCE_AUDIT.md#m4-getauthcredentials-does-synchronous-localstorage-reads--up-to-3-nested-jsonparse-calls-on-every-api-request)) — pick one source of truth for token/apiKey storage instead of the current 3-way fallback (flat keys → redux-persist blob).
4. **Narrow redux-persist whitelist for site settings** ([M6](PERFORMANCE_AUDIT.md#m6-redux-persist-writes-the-full-site-settings-html-blobs-to-localstorage)) — exclude `aboutUs`/`termsAndCondition` from the persisted slice.
5. **Replace remaining `<img>` with `next/image`** ([L1](PERFORMANCE_AUDIT.md#l1-direct-img-instead-of-nextimage-18-files)) — incrementally, per file, with explicit `width`/`height`/`sizes` to avoid introducing layout shift.
6. **Extract duplicated listing-page fetchers** ([L2](PERFORMANCE_AUDIT.md#l2-duplicated-fetcher-logic-across-4-near-identical-listing-pages)) — shared helper in `src/lib` for the 4 near-identical `/blog-categories` fetchers.
7. **Add `@next/bundle-analyzer`** ([L3](PERFORMANCE_AUDIT.md#l3-no-bundle-size-visibility)) — one-time setup, run once to get a baseline, decide if further action is warranted from the actual data (no speculative bundle work without measurement first).

---

## Execution notes

- **Testing:** No test suite currently exists in this repo (no `__tests__`/`*.test.*` files found, no test script beyond lint in `package.json`). Phase 1 and most of Phase 4 are low-risk enough to verify via manual smoke-testing in the browser (per this project's own convention — see the "run the dev server and test in browser" requirement). Phase 3 (pagination/checkout migration) is where I'd recommend adding minimal regression coverage (or at least a documented manual test checklist per screen) given it touches conversion-critical flows, since there's currently no safety net.
- **Rollout:** Each phase is a separate, reviewable change (ideally separate PRs/commits) so caching-window regressions (Phase 2) can be isolated from render-logic changes (Phase 1/4) if something needs to be reverted.
- **Re-measurement:** After Phase 1 + 2 ship, re-check: (a) Lighthouse/PageSpeed TTFB and LCP on homepage + a product listing page, (b) backend request volume/logs before vs. after (if accessible) to confirm the cache-hit-rate improvement, (c) manually verify no stale-content complaints within the first few days of Phase 2's revalidate windows.

---

## Waiting for approval

No code has been changed. Please confirm:
1. Scope — proceed with all 4 phases, or a subset (e.g. just Phase 1, or Phase 1+2)?
2. Phase 2's proposed revalidate windows (300s nav/settings, 60-120s banners/listings) — adjust based on how often content actually changes on the backend?
3. Phase 3's checkout batch-endpoint question — should I check with backend/API docs first, or proceed with the `Promise.all` interim fix regardless?
