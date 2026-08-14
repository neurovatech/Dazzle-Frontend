# Dazzle Frontend — Performance Audit

**Scope note:** This repository is a **Next.js 16 (App Router) + React 19 frontend only** — there is no database, ORM, queue, or backend service in this codebase (confirmed via `package.json`: Next.js, React, Redux Toolkit, TanStack Query, Tailwind, Yup/RHF, Swiper — no `pg`/`mongoose`/`prisma`/`bullmq`/etc.). All data comes from a remote API (`https://apix.bigpoint.com.bd`) that this repo does not own.

Consequently this audit **does not cover** SQL query plans, indexes, ORM N+1s, queue throughput, or connection pooling — those live in the backend repo. It focuses on what actually exists here: Next.js rendering/caching strategy, the API proxy layer, client-side data fetching (React Query/Redux), component render performance, and asset/bundle loading. Findings are grouped by area, most severe first, with file:line citations, root cause, impact, and risk of the fix.

Audit date: 2026-08-14. ~346 source files, 163 (~47%) are Client Components.

---

## 🔴 Critical

### C1. Proxy route does a blocking, synchronous file write + full-body double-read on *every* request
**File:** [src/app/api/proxy/[...path]/route.ts:60-69](src/app/api/proxy/%5B...path%5D/route.ts)

```ts
const cloneResponse = response.clone();
const text = await cloneResponse.text();          // reads the ENTIRE body just to log 200 chars
fs.appendFileSync("d:\\dulal-work\\dazzle\\proxy-log.txt", logMsg);  // sync, blocks the event loop
```

Every client-side API call (all `"use client"` components — the majority of the app) is routed through this handler. For each one it:
- Clones the response and buffers the **entire body** into memory/string, only to log the first 200 characters.
- Calls `fs.appendFileSync` — a **synchronous** disk write that blocks Node's single event-loop thread for the request's duration, serializing all concurrent proxy traffic behind disk I/O.
- Writes to a **hardcoded absolute Windows dev path** (`d:\dulal-work\dazzle\...`, note: doesn't even match this repo's actual path `dazzle-frontend`) that will throw `ENOENT`/`EACCES` on any Linux/container production host — silently swallowed by the `catch`, but still attempted on every request.
- Grows an unbounded log file forever (already 15.9 KB from dev alone; per `ls` output).

**Root cause:** Leftover debug instrumentation never gated behind an environment check or removed.
**Impact:** Adds latency to every proxied request (all client-side reads/writes — cart, search, filters, checkout), and under concurrent load the synchronous write serializes requests that should be independent. In production this either no-ops after a slow failed write attempt each time, or — if the path happens to be writable — grows an unbounded file on the server disk.
**Fix risk:** Very low — pure removal of dead debug code, no functional dependency on it.

### C2. Sub-category page renders **blank** if the banner endpoint returns no data
**File:** [src/app/(public)/categories/[categorySlug]/[subCategorySlug]/page.tsx:131](<src/app/(public)/categories/[categorySlug]/[subCategorySlug]/page.tsx>)

```ts
if (!banners.length) return null;   // <-- inside the page component itself
```

This line sits inside `SubCategoriesPage`, *after* products, brands, and attributes have already been fetched. If `/web-banner/product-categores-page` returns an empty array (which is a perfectly normal, non-error API response — e.g. no banner configured for that page), the entire route renders **nothing**: no products, no filters, no breadcrumb — a blank page on a real, indexed, SEO-sensitive product-listing URL.
**Root cause:** Guard clause almost certainly intended to skip *rendering the banner block*, mistakenly placed at page-component scope.
**Impact:** Direct revenue/SEO impact — any sub-category without a configured promo banner is completely inaccessible. Not strictly a "performance" bug, but severe enough (and trivial to fix) to lead this list.
**Fix risk:** Very low — move the check to scope the banner JSX only.

---

## 🟠 High — Caching & Data Fetching Architecture

### H1. `cache: "no-store"` is used everywhere, defeating Next.js's Data Cache/ISR entirely
**67 occurrences across 50 files** (`grep -c 'cache: "no-store"'`), including every homepage section, every category/sub-category page, product details, blogs, brands, banners, site settings, and the global `Header`/`Footer`.

This is not a per-endpoint decision — it is the default the codebase reaches for everywhere, including for content that changes rarely (navigation categories, brand lists, policy-page content, site settings, banners). Three routes additionally set `export const dynamic = "force-dynamic"` ([categories/[categorySlug]/page.tsx:107](<src/app/(public)/categories/[categorySlug]/page.tsx:107>), [categories/[categorySlug]/[subCategorySlug]/page.tsx:71](<src/app/(public)/categories/[categorySlug]/[subCategorySlug]/page.tsx:71>), [brands/page.tsx:11](<src/app/(public)/brands/page.tsx:11>)), stacking a second layer of "never cache, always fully re-render server-side."

**Root cause:** `no-store` was likely chosen once (probably for cart/auth-sensitive data) and then copy-pasted as the default for all `api.get()` calls, including on the marketing/catalog surface that gets the most traffic.
**Impact:** Every page view — including the homepage, which fan-outs into ~10 independent section fetches (Categories, FlashSale, Trending, ClipToCart, ShopBrand, NewArrivals, MostPopular, HotDeal, FeatureProducts, LatestBlog, plus the global Header's 2 calls and layout's site-settings call) — re-hits the origin backend with zero caching, zero CDN benefit, and full TTFB cost on every request from every visitor. This is the single largest lever in this codebase: it affects backend load, hosting cost, and every page's Time-to-First-Byte simultaneously.
**Fix risk:** Low–Medium. Needs per-endpoint judgment, not a blanket find/replace:
- **Safe to time-cache** (`next: { revalidate: N }`): categories/brands nav data, home page banners, blog/announcement/career/press listings, policy-like content, site settings — none of these need per-request freshness; a 60–600s revalidate window is invisible to users and cuts backend load by orders of magnitude.
- **Must stay `no-store`**: cart, checkout, auth, order status, live price/availability checks, anything user-specific or inventory-sensitive.
- Product listing/search pages sit in between — likely fine with a short revalidate (30–60s) plus client-side refetch-on-focus if freshness matters more.

### H2. `site-settings` is fetched twice per page load — once on the server (discarded), once on the client
**Files:** [src/app/layout.tsx:25](src/app/layout.tsx:25) (`getSiteSettings()`, server, `cache: "no-store"`, used only for `<head>` metadata) and [src/hooks/useSiteSettings.ts:13-26](src/hooks/useSiteSettings.ts) (client `useQuery`, called from [Footer.tsx:105](src/components/layout/Footer.tsx:105) and `MainNav.tsx`).

The server already has the full settings object during SSR (used to build `<title>`/`<meta>` tags) but never passes it to the client — the client then independently re-fetches the same endpoint on mount to render the footer logo/text/social links, causing a visible layout shift once that fetch resolves.
**Root cause:** No React Query hydration boundary wired up for this query; server and client fetch paths were built independently.
**Impact:** One extra full round-trip on every page load, plus a footer/logo flash-in once the client fetch resolves (worse on slow connections/mobile).
**Fix risk:** Low — prefetch `["siteSettings"]` server-side in the root layout and hydrate via `HydrationBoundary`, or pass the already-fetched settings down via a server-rendered context/provider.

### H3. `Header` (rendered on every single page) makes 2 independent API calls sequentially instead of in parallel
**File:** [src/components/layout/Header.tsx:58, 89](src/components/layout/Header.tsx)

```ts
const response = await api.get<ApiResponse>("/categories/child", { cache: "no-store" });
// ...
const response = await api.get<ApiResponse>("/categories/brands", { cache: "no-store" });
```

Two unrelated `try/await` blocks run back-to-back. Since `Header` renders on every route, this doubles its contribution to server-render latency site-wide.
Same pattern repeats in the category pages: [categories/[categorySlug]/page.tsx:140,154,170](<src/app/(public)/categories/[categorySlug]/page.tsx>) (3 sequential calls) and [categories/[categorySlug]/[subCategorySlug]/page.tsx:108,120,138,181](<src/app/(public)/categories/[categorySlug]/[subCategorySlug]/page.tsx>) (4 sequential calls — the worst offender). By contrast, `blogs/page.tsx`, `announcement/page.tsx`, `career/page.tsx`, and `press-coverage/page.tsx` already correctly use `Promise.all` for their two fetchers — a good pattern that should simply be applied consistently.
**Root cause:** Calls were added incrementally (try/catch per call) without revisiting for parallelism.
**Impact:** Adds the sum, rather than the max, of each call's latency to server render time, on the highest-traffic shared component and the heaviest category pages.
**Fix risk:** Very low — the calls are independent; wrapping in `Promise.all` (each still individually try/caught, or one `Promise.allSettled`) changes nothing behaviorally.

### H4. Manual `useEffect` + `useState` "load more" pagination instead of `useInfiniteQuery`
**Files:** [CategoriesPages/CategoriesProduct/AllProducts.tsx:102-183](src/components/CategoriesPages/CategoriesProduct/AllProducts.tsx), [Brands/BrandProductListClient.tsx:91-165](src/components/Brands/BrandProductListClient.tsx), [NewArrivals/NewArrivalsClient.tsx:59-79](src/components/NewArrivals/NewArrivalsClient.tsx), [Offer/CampaignDetailClient.tsx:101-160](src/components/Offer/CampaignDetailClient.tsx)

Each of these hand-rolls pagination with raw `api.get` inside `useEffect`, bypassing React Query entirely even though the app already depends on `@tanstack/react-query` and uses it correctly elsewhere (`Footer`, `CheckoutPageCom`'s store list, etc.). Also related: [Brands/BrandProduct.tsx:168-196](src/components/Brands/BrandProduct.tsx), [CategoriesProduct.tsx:166-209](src/components/CategoriesPages/CategoriesProduct/CategoriesProduct.tsx), and [CategoriesProductWithTopSale.tsx:169-212](src/components/CategoriesPages/CategoriesProduct/CategoriesProductWithTopSale.tsx) all re-fetch `/products/attributes` manually on every filter-state change.
**Root cause:** Pre-dates or bypassed the React Query adoption; each list screen re-implements the same pattern independently.
**Impact:** No request caching across navigations (revisiting a filtered list re-fetches from scratch every time), no automatic request cancellation on rapid filter changes (possible race conditions where a slow earlier response overwrites a newer one), no de-duplication if two components request the same page simultaneously.
**Fix risk:** Medium — this is core listing/pagination behavior; needs a careful, tested migration to `useInfiniteQuery` per screen (4-5 components), not a one-line change.

### H5. Checkout: N+1 per-item product fetch for `minBookingPrice`
**File:** [src/components/Cart/CheckoutPageCom.tsx:217-237](src/components/Cart/CheckoutPageCom.tsx)

```ts
missing.forEach(async (item) => {
  const res = await api.get(`/product/${item.productUuid}`);
  ...
  dispatch(patchMinBookingPrice({ id: item.id, minBookingPrice: mbp }));
});
```

For every cart item missing `minBookingPrice`, a separate `/product/{uuid}` request fires (not serialized, since `forEach` doesn't await, but still N independent round trips + N separate Redux dispatches/re-renders), on the **checkout page** — the most latency-sensitive, highest-stakes screen in the app for conversion.
**Root cause:** No batch product-lookup endpoint used (or available).
**Impact:** For a cart with, say, 5 items, this is 5 concurrent requests plus 5 re-renders instead of 1, adding avoidable latency and jank right before payment.
**Fix risk:** Medium — ideally use a batch endpoint (`/products?ids=...`) if the backend exposes one; otherwise at minimum switch to `Promise.all` + a single batched `dispatch` to cut re-renders from N to 1. Requires backend coordination for the ideal fix.

---

## 🟡 Medium — Render & Component Performance

### M1. No `React.memo` usage anywhere in the codebase
Confirmed zero matches for `React.memo`/`memo(` across all 346 files. List-item components re-rendered frequently from Redux-connected parents (cart, wishlist, product compare) — e.g. `ProductCard`, `CartItem`, `BrandCard` — have no render-skip guard, so any parent re-render (e.g. a single quantity change in the cart) re-renders every sibling row.
**Impact:** Increasingly noticeable as list length grows (cart with many items, compare page, product grids). Not yet catastrophic since lists are typically small-to-medium (tens of items), but is a cheap, broadly-applicable win.
**Fix risk:** Low–Medium — wrapping pure presentational components in `memo` is safe as long as callback props are stabilized with `useCallback` where needed (otherwise memo is a no-op).

### M2. `key={index}` / `key={i}` used on real (reorderable) data lists, not just static skeletons
**Files:** [TrendingNowCom/TrendingNowProduct.tsx:119](src/components/TrendingNowCom/TrendingNowProduct.tsx:119), [CategoriesProduct/Newest.tsx:109](src/components/CategoriesPages/CategoriesProduct/Newest.tsx:109), [trending-now/page.tsx:109](<src/app/(public)/trending-now/page.tsx:109>), [most-popular/page.tsx:106](<src/app/(public)/most-popular/page.tsx:106>), [hot-deal/page.tsx:106](<src/app/(public)/hot-deal/page.tsx:106>), [feature-product/page.tsx:106](<src/app/(public)/feature-product/page.tsx:106>), [offer/limited-time-offer/page.tsx:132](<src/app/(public)/offer/limited-time-offer/page.tsx:132>), [TopSelling/TopSelling.tsx:164](src/components/TopSelling/TopSelling.tsx:164), [FlashSale/Olds.tsx:164](src/components/HomePage/FlashSale/Olds.tsx:164), [FlashSale/Newest.tsx:165](src/components/HomePage/FlashSale/Newest.tsx:165), [ProductDetail.tsx:479,650](src/components/ProductDetails/ProductDetail.tsx)

(Note: many other `key={i}` matches are on `Array.from({length:N}).map(...)` static skeleton loaders — those are fine and not counted here.)
**Impact:** When these lists re-sort/re-filter (sort dropdown, live price updates, tab switches), React matches by position rather than identity, causing unnecessary DOM node teardown/rebuild and potential state bleed between rows (e.g. hover/expanded state landing on the wrong product).
**Fix risk:** Very low — swap to the product's stable `uuid`/`slug`, already present in the data.

### M3. Un-memoized derived computations in render bodies
- [ProductCompare/ProductCompareDetails.tsx:67-71](src/components/ProductCompare/ProductCompareDetails.tsx) — `.filter()` over the product list re-runs on every keystroke in the compare search box, not wrapped in `useMemo`.
- [ProductDetails/FrequentlyBoughtTogether.tsx:63-69](src/components/ProductDetails/FrequentlyBoughtTogether.tsx) — `.reduce()` (×2) and `.filter()` re-run every render.
- [ProductDetails/TransparentProfitMeterArea.tsx:117-120](src/components/ProductDetails/TransparentProfitMeterArea.tsx) — `JSON.parse(liveData.priceInfo)` executed via IIFE directly in the render body on every render.

(By contrast, `CheckoutPageCom.tsx` and `share/FilterSidebar.tsx` correctly use `useMemo` for similar work — a good existing pattern to extend.)
**Impact:** Minor per-render CPU cost that compounds on components re-rendered frequently (typing, live price polling).
**Fix risk:** Low — wrap in `useMemo` with the correct dependency array; behavior-preserving by construction.

### M4. `getAuthCredentials()` does synchronous `localStorage` reads + up to 3 nested `JSON.parse` calls on **every** API request
**File:** [src/lib/api.ts:13-31](src/lib/api.ts:13)

Called from both `apiFetch` (`api.ts:153`) and the refresh-token path (`api.ts:56`), so it runs once per HTTP call the client makes — including the fallback path that parses `localStorage.getItem("persist:dazzle_auth")` (a redux-persist JSON blob) when the flat `token`/`apiKey` keys are missing.
**Impact:** Small per-call cost (µs-level), but it's on the hot path of literally every client request; also indicates `token`/`apiKey` can drift out of sync between the flat localStorage keys and the redux-persist blob, needing a 3-way fallback in the first place.
**Fix risk:** Low — mostly a cleanup/consolidation (pick one source of truth for token storage) rather than a risky change.

### M5. Console logging left in hot render paths (and one on the server, every request)
**Client (re-run every render):** [Cart/CartPageCom.tsx:117](src/components/Cart/CartPageCom.tsx:117), [ProductDetails/ProductDetail.tsx:59,104,429](src/components/ProductDetails/ProductDetail.tsx), [ProductDetails/ProductInfo.tsx:196](src/components/ProductDetails/ProductInfo.tsx:196), [ProductDetails/PriceAvailability.tsx:17](src/components/ProductDetails/PriceAvailability.tsx:17), [ProductDetails/DazzleCare.tsx:47](src/components/ProductDetails/DazzleCare.tsx:47), [HomePage/TrendingNow/TrendingNowSectionCom.tsx:97](src/components/HomePage/TrendingNow/TrendingNowSectionCom.tsx:97), [HomePage/MostPopular/MostPopular.tsx:91](src/components/HomePage/MostPopular/MostPopular.tsx:91), [Brands/BrandProduct.tsx:400](src/components/Brands/BrandProduct.tsx:400), [OnlineExclusiveCom/OnlineExclusive.tsx:180](src/components/OnlineExclusiveCom/OnlineExclusive.tsx:180), [share/FilterSidebar.tsx:165](src/components/share/FilterSidebar.tsx:165).
**Server (every request, visible in production logs):** [categories/[categorySlug]/[subCategorySlug]/page.tsx:117](<src/app/(public)/categories/[categorySlug]/[subCategorySlug]/page.tsx:117>).
**Impact:** Minor CPU/serialization cost per render, plus noisy/leaky production server logs (the server one logs full product-listing payloads on every request).
**Fix risk:** Very low — straight removal.

### M6. Redux-persist writes the full site-settings HTML blobs to `localStorage`
**File:** [src/store/rootReducer.ts:45-50](src/store/rootReducer.ts:45), `siteSettingsSlice`

`aboutUs` and `termsAndCondition` are raw, page-length HTML strings stored in a `persistReducer`-wrapped slice, meaning they're serialized to `localStorage` on every state change and rehydrated on every load — duplicating content that's already rendered server-side and rarely, if ever, read from this slice on the client.
**Impact:** Minor — adds bytes to every `localStorage` write/read and to the JS heap, for data the client mostly doesn't need.
**Fix risk:** Low — narrow the `whitelist` to exclude the large HTML fields, or drop persistence for this slice entirely (re-fetch is already cheap with the 30 min `staleTime` in `useSiteSettings`).

---

## 🟢 Lower priority

### L1. Direct `<img>` instead of `next/image` (18 files)
`TradeIn/StepSelectModel.tsx:100`, `StepSelectCategory.tsx:48`, `StepSelectBrand.tsx:53`, `StepDeviceDetails.tsx:81`, `Offer/CampaignDetailClient.tsx:198`, `Profile/ProfileSideNav.tsx:112`, `Cart/CheckoutPageCom.tsx:834`, `shop/ImageGallery.tsx:23,64`, `ProductDetails/ProductVariants.tsx:60`, `ProductDetails/AddOn.tsx:181`, `ProductDetails/DeliveryInfo.tsx:47`, `ProductDetails/CheckAvailability.tsx:427,521,568`, `ProductCompare/ProductCompareDetails.tsx:146,162`.
**Impact:** These images skip Next.js's automatic resizing/format-negotiation (AVIF/WebP)/lazy-loading — larger payloads and worse LCP on the pages that use them (trade-in flow, checkout item thumbnails, product compare).
**Fix risk:** Low, but needs per-image `width`/`height`/`sizes` to avoid layout shift — do incrementally, not as a blind find/replace.

### L2. Duplicated fetcher logic across 4 near-identical listing pages
`announcement/page.tsx:72`, `blogs/page.tsx:74`, `career/page.tsx:72`, `press-coverage/page.tsx:72` each hand-roll an identical `/blog-categories` fetcher.
**Impact:** Maintainability more than raw performance, but it also means any future caching-strategy fix (H1) has to be applied in 4 places instead of 1.
**Fix risk:** Low — extract to a shared `src/lib` helper.

### L3. No bundle-size visibility
No `@next/bundle-analyzer` or equivalent configured. Swiper, lucide-react, and isomorphic-dompurify are the heavier third-party dependencies; the homepage already code-splits below-the-fold sections via `next/dynamic` (good existing pattern — see [`(public)/page.tsx:27-70`](<src/app/(public)/page.tsx:27>)), but there's no data on actual shipped JS size to confirm nothing large is leaking into the initial bundle.
**Impact:** Unknown until measured — this is a measurement gap, not a confirmed bottleneck.
**Fix risk:** None to add the analyzer; risk is only in whatever it uncovers.

---

## Summary table

| # | Finding | Area | Impact | Fix risk |
|---|---|---|---|---|
| C1 | Sync file logging in proxy route | Infra | High (latency + prod crash risk) | Very low |
| C2 | Blank sub-category page on empty banners | Correctness | Critical (page unusable) | Very low |
| H1 | `no-store` everywhere, no ISR/Data Cache | Caching | Very high (site-wide TTFB + backend load) | Low–Medium |
| H2 | Duplicate site-settings fetch (server+client) | Caching | Medium (extra RTT + layout shift) | Low |
| H3 | Sequential awaits in Header/category pages | Data fetching | Medium–High (server render latency, site-wide) | Very low |
| H4 | Manual pagination instead of `useInfiniteQuery` | Data fetching | Medium (no caching, race conditions) | Medium |
| H5 | Checkout N+1 product fetch | Data fetching | Medium (checkout latency) | Medium |
| M1 | No `React.memo` anywhere | Render | Low–Medium (scales with list size) | Low–Medium |
| M2 | `key={index}` on real lists | Render | Low–Medium | Very low |
| M3 | Un-memoized derived computations | Render | Low | Low |
| M4 | `getAuthCredentials` sync work per request | Render | Low | Low |
| M5 | Stray `console.log` in hot paths | Render/Ops | Low | Very low |
| M6 | Large HTML blobs in redux-persist | Storage | Low | Low |
| L1 | `<img>` instead of `next/image` | Assets | Low–Medium (per-page LCP) | Low |
| L2 | Duplicated fetcher logic | Maintainability | Low | Low |
| L3 | No bundle analyzer | Measurement | Unknown | None |
