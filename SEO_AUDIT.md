# SEO Audit — Dazzle E-Commerce

**Stack:** Next.js 16.2.1 App Router · Metadata API
**Audit date:** 2026-08-14
**Method:** static analysis of all `generateMetadata` / `export const metadata` declarations + live rendered `<head>` inspection + direct probing of the backend API to determine which SEO fields it actually supplies.

---

## What the API actually provides (this drives everything)

I probed the live backend to establish exactly which entities carry SEO metadata:

| Entity | Endpoint | SEO fields returned | Verdict |
|---|---|---|---|
| **Product** | `/product/{slug}` | `metaTags.title`, `.description`, `.keywords`, `.canonical`, `.tags`, `.badge` — **plus** `regularPrice`, `discountedPrice`, `brandName`, `isTba` (stock), `thumbnails[]`, `totalReview`, `soldCount`, `leftStock` | ✅ **Rich** |
| **Blog / Announcement / Career / Press** | `/blogs?...` | `post_title`, `post_caption`, `thumbnail`, `published_at`, `post_category` — **no** meta/SEO fields | ⚠️ Derive |
| **Category / Sub-category** | `/categories/child` | `category_name`, `category_slug`, `thumbnail_img` — **no** meta/SEO fields | ⚠️ Derive |

**Live sample — product `metaTags`:**
```json
{
  "title": "iPhone 17 Pro Price in Bangladesh",
  "description": "The iPhone 17 Pro price in Bangladesh is BDT 142990 . Buy genuine products with replacement guarantee , and exclusive EMI options at Dazzle. Buy Now!",
  "keywords": "iPhone 17 Pro Price in Bangladesh",
  "canonical": "https://dazzle.com.bd/product/iphone-17-pro-price-in-bangladesh",
  "totalReview": 0, "soldCount": 0, "leftStock": 0
}
```

**Consequence for the requirement "SEO data must come from the API":** this is **already correctly implemented for product pages** — the highest-value SEO surface. For categories and blogs the API supplies no meta fields, so those must be derived from the entity's real API values (`category_name`, `post_title`), which is the correct fallback. The gap is that categories currently derive from the **URL slug** rather than the API's `category_name`.

---

## 🔴 Critical

### C1. No `sitemap.xml` — verified 404

```
GET http://localhost:3000/sitemap.xml  →  404
```

There is no `src/app/sitemap.ts`. For an e-commerce catalog with **1,071 products in the Phones category alone**, this is the single largest discoverability gap. Google must find every product, category and sub-category by crawling internal links only — deep/paginated products may go undiscovered or be crawled infrequently.

| | |
|---|---|
| **Impact** | Directly limits how many product pages get indexed. Highest-value SEO fix available |
| **Root cause** | Never implemented |
| **Fix** | `src/app/sitemap.ts` generating entries from the API (products, categories, sub-categories, brands, blogs) with `lastModified`, `changeFrequency`, `priority`. For a catalog this size use a **sitemap index with chunked child sitemaps** (`generateSitemaps`), since a single sitemap is capped at 50,000 URLs / 50 MB |
| **Risk** | **Low** — additive; no existing behaviour changes |

### C2. No `robots.txt` — verified 404

```
GET http://localhost:3000/robots.txt  →  404
```

No `src/app/robots.ts`. Crawlers get no directives and no sitemap pointer. Worse, there is nothing preventing crawl budget being wasted on non-indexable routes: `/cart`, `/checkout`, `/profile/*`, `/auth/*`, `/order-tracking`, `/api/proxy/*`, and faceted `?sort=`/`?search=` permutations.

| | |
|---|---|
| **Impact** | Wasted crawl budget on thousands of filter permutations; no sitemap discovery |
| **Fix** | `src/app/robots.ts` — allow catalog, disallow account/cart/auth/api, reference the sitemap |
| **Risk** | **Low** — but the disallow list must be reviewed carefully so no revenue page is blocked |

### C3. Zero structured data (JSON-LD) anywhere — verified missing

```
Product page  → application/ld+json: ❌ MISSING
Category page → application/ld+json: ❌ MISSING
```

No `Product`, `Offer`, `BreadcrumbList`, `Organization`, `WebSite` or `ItemList` schema exists in the codebase (0 matches for `schema.org` / `ld+json`).

**This is the biggest missed opportunity for an e-commerce site.** Without `Product` + `Offer` schema, Google cannot render price, currency, availability or brand in the search result. Competitors showing "৳142,990 · In stock" in the SERP win the click.

The API already returns everything required: `productName`, `brandName`, `discountedPrice`, `regularPrice`, `isTba` (→ availability), `thumbnails[]`, `metaTags.canonical`.

| | |
|---|---|
| **Impact** | No rich results. Measurable CTR loss on every product impression — typically the single highest-ROI e-commerce SEO change |
| **Fix** | Emit JSON-LD from **API data only**: `Product`+`Offer` on PDP, `BreadcrumbList` on PDP/category, `Organization`+`WebSite`+`SearchAction` sitewide, `ItemList` on listings |
| **Caution** | `aggregateRating` must be emitted **only when `totalReview > 0`** — currently it is `0`. Fabricating ratings violates Google's structured-data policy and risks a manual action |
| **Risk** | **Low–Medium** — invalid schema can trigger Search Console warnings; must be validated with the Rich Results Test |

### C4. Brand name duplicated in `<title>` on ~57 declarations

**Verified live:**
```
/categories/phones → "Phones - Buy Online at Best Price in Bangladesh | Dazzle - Dazzle"
/blogs             → "Latest Blogs & Technology News - Dazzle - Dazzle"
```

[layout.tsx:40](src/app/layout.tsx:40) defines:
```ts
title: { default: title, template: `%s - ${siteName}` }
```
…and **57 title declarations already end in `- Dazzle` or `| Dazzle`**, so the template appends the brand a second time.

Affected: about-us, all 12 policy pages, blogs, announcement, career, press-coverage, brands, categories, sub-categories, offers, FAQ, feedback, corporate — essentially every page **except** product pages (which correctly pass the bare API `metaTags.title` and therefore render correctly).

| | |
|---|---|
| **Impact** | Google truncates titles near ~580px (~60 chars). A duplicated brand wastes ~9 characters of the most valuable SEO real estate on the site and looks unprofessional in the SERP |
| **Root cause** | The `template` was added to the root layout after individual pages had already hardcoded the brand suffix |
| **Fix** | Remove the hardcoded `- Dazzle` / `| Dazzle` suffix from child page titles and let the root template supply it. Use `title.absolute` where a page genuinely needs to bypass the template |
| **Risk** | **Low** — mechanical, but touches many files; needs a rendered-title check afterwards |

---

## 🟠 High

### H1. Categories derive metadata from the URL slug, not the API

**Files:** [categories/[categorySlug]/page.tsx:44-67](<src/app/(public)/categories/[categorySlug]/page.tsx:44>) · [[subCategorySlug]/page.tsx:44-67](<src/app/(public)/categories/[categorySlug]/[subCategorySlug]/page.tsx:44>)

```ts
function toTitleCase(slug: string) { /* "smart-watch" → "Smart Watch" */ }
const categoryName = toTitleCase(categorySlug);
```

Metadata is reconstructed by title-casing the URL slug. It happens to look right for simple slugs, but it is guesswork: it cannot reproduce correct casing or punctuation (`tv-home-appliance` → "Tv Home Appliance" instead of the API's actual `category_name`, e.g. "TV & Home Appliance"), and the description is a hardcoded template rather than category-specific copy.

This is the specific case your requirement targets — the page **already fetches** category data during render, so the real `category_name` is available at no extra cost.

| | |
|---|---|
| **Impact** | Inaccurate titles/H1 mismatch on every category and sub-category page — a core commercial landing surface |
| **Fix** | Read `category_name` from the API. Note `generateMetadata` and the page component each fetch separately, but `fetch` is request-deduplicated by Next.js, so there is no extra network cost |
| **Risk** | **Low** |

### H2. `og:type` is `website` on product pages

**File:** [product/[productSlug]/page.tsx:139](<src/app/(public)/product/[productSlug]/page.tsx:139>) — `type: 'website'`

Product pages should declare `og:type: "product"` with `og:price:amount` / `og:price:currency` / `product:availability`. This governs how the page renders when shared to Facebook/WhatsApp — a major traffic channel in Bangladesh.

| | |
|---|---|
| **Impact** | Degraded social share cards on the highest-converting pages |
| **Risk** | **Low** |

### H3. Blog / announcement / career / press pages have no canonical

**Verified:** `/blogs` → `canonical: ❌ MISSING`

Four near-identical listing sections (blogs, announcement, career, press-coverage) plus their detail pages omit `alternates.canonical`. Combined with paginated and filtered variants, this creates duplicate-content ambiguity.

These pages also use `article`-type content but declare no `og:type: "article"`, `publishedTime`, or `author` — and the API **does** supply `published_at` and `posted_by`.

| | |
|---|---|
| **Fix** | Add canonical + `openGraph.type: "article"` with `publishedTime` from the API |
| **Risk** | **Low** |

### H4. No `noindex` strategy for non-indexable routes

No page sets a `robots` directive. These should not compete in the index:

`/cart` · `/checkout` · `/profile/*` · `/auth/*` (login, registration, otp, forget-password) · `/order-tracking` · `/verify-email-token/*` · `/reset-password-token/*` · `/newsletter-unsubscribe` · `/product-compare`

The token routes are the most serious: `/verify-email-token/[token]` and `/reset-password-token/[token]` embed **secrets in the URL**. If indexed, those tokens become publicly searchable — a security issue, not just an SEO one.

| | |
|---|---|
| **Impact** | Crawl-budget waste; **potential credential exposure** via indexed token URLs |
| **Fix** | `robots: { index: false, follow: false }` in each route's metadata, backed by `robots.ts` disallow rules |
| **Risk** | **Low** — must double-check no commercial page is caught |

---

## 🟡 Medium

### M1. Faceted/paginated URLs have no canonical strategy

Category pages accept `?page=`, `?sort=`, `?search=`. The category page sets a canonical that includes `?page=N`, which is correct for pagination — but `?sort=` and `?search=` permutations generate unlimited near-duplicate URLs with no canonical consolidation.

**Fix:** canonical should point to the clean paginated URL, ignoring `sort`/`search`. Combine with `robots.ts` disallow for those parameters.
**Risk:** Medium — mis-canonicalising pagination can de-index legitimate pages; needs care.

### M2. No `Organization` / `WebSite` schema, no `SearchAction`

Sitewide entity schema is absent. `WebSite` + `SearchAction` enables a Google sitelinks search box; `Organization` (logo, social profiles, contact) feeds the Knowledge Panel. All of this data already exists in the API `site-settings` response (`siteLogo`, `facebookUrl`, `instagramUrl`, `youtubeUrl`, `linkedinUrl`, `contactPhone`, `contactEmail`) — already fetched in the root layout.

### M3. No `lastModified` data for the sitemap

The product API returns no `updatedAt`/`modifiedAt`. Without it, sitemap `lastModified` must be approximated (or omitted). Omitting is safer than fabricating — a wrong `lastModified` trains Google to distrust the signal.
**Recommendation:** request an `updatedAt` field from the backend team; omit until available.

### M4. Language/locale signals

`<html lang="en">` while the storefront serves Bangladesh and the footer content contains Bengali text. `og:locale` is `en_BD` (correct). If a Bengali version is ever introduced, `hreflang` will be required. **No change now** — flagged for awareness.

### M5. Four duplicated blog-listing implementations

`blogs`, `announcement`, `career`, `press-coverage` are near-identical copies with copy-pasted metadata blocks. Any SEO fix must be applied four times — raising the chance they drift apart.
**Fix:** extract a shared metadata helper.

---

## 🟢 Low

| # | Finding |
|---|---|
| **L1** | `metadataBase` correctly set to `https://dazzle.com.bd` ✅ — no action |
| **L2** | Root layout metadata correctly API-driven from `site-settings` ✅ — no action |
| **L3** | Product page returns `{}` when the API 404s, but still renders the component with `product=null`. It should call `notFound()` so Next.js returns a real **404 status**; currently a missing product returns HTTP 200 with an empty shell — a soft-404 that Google penalises |
| **L4** | `/faq` page has FAQ content but no `FAQPage` schema — a straightforward rich-result win |
| **L5** | No `og:image` dimensions (`width`/`height`) declared; some crawlers render cards better with them |
| **L6** | `twitter:site` hardcoded as `@dazzlebd` rather than read from `site-settings` |

---

## Summary

| # | Issue | Impact | Risk |
|---|---|---|---|
| **C1** | No `sitemap.xml` (404) | Indexation ceiling on the whole catalog | Low |
| **C2** | No `robots.txt` (404) | Crawl budget waste | Low |
| **C3** | Zero JSON-LD structured data | No rich results — biggest CTR loss | Low–Med |
| **C4** | Brand duplicated in ~57 titles | Wasted SERP characters sitewide | Low |
| **H1** | Categories use slug, not API `category_name` | Inaccurate commercial landing pages | Low |
| **H2** | `og:type: website` on products | Poor social cards | Low |
| **H3** | Blogs missing canonical + article OG | Duplicate-content risk | Low |
| **H4** | No `noindex` on token/account routes | **Token exposure risk** | Low |
| **M1** | No faceted-URL canonical strategy | Duplicate content | Medium |
| **M2** | No Organization/WebSite schema | No Knowledge Panel / search box | Low |
| **M3** | No `lastModified` source | Weaker sitemap signal | — |
| **L3** | Soft-404 on missing products | Indexed empty pages | Low |

### The good news

The part you specifically asked about — **API-driven metadata** — is **already correct on product pages**, the highest-value surface: title, description, keywords, canonical and `og:image` all come from `metaTags`. The root layout is likewise driven by `site-settings`.

The real gaps are **infrastructure that was never built** (sitemap, robots, structured data) and a **title-template collision**, not the metadata sourcing itself.

The single highest-ROI item is **C3 (JSON-LD `Product` + `Offer`)** — the API already returns price, brand, stock and images, so this is purely a rendering change with no backend work required.
