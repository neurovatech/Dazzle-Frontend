# Image Performance Audit — Dazzle Frontend

**Stack:** Next.js 16.2.1 (App Router) · React 19.2.4 · `next/image` built-in optimizer (no custom loader)
**Audit date:** 2026-08-14
**Method:** static analysis of all 346 source files + live DOM inspection at `localhost:3000` + direct byte-level measurement of the CDN origin and the `/_next/image` optimizer endpoint.

---

## Executive summary

The single dominant cause of the image weight in the Lighthouse report is **not** missing `sizes`, missing WebP, or bad compression. It is that **the highest-traffic image components explicitly opt out of Next.js image optimization** via the `unoptimized` prop.

Next.js's optimizer is already correctly configured for these hosts and already works — it is simply being bypassed on the components that render the most images.

**Measured proof** (real product image, via the running dev server):

| Delivery path | Bytes | vs. original |
|---|---|---|
| Origin JPEG `1200×1263` (what ships today) | **63,170 B** (61.7 KiB) | — |
| `/_next/image` w=384 WebP | 9,132 B | −85.5% |
| `/_next/image` w=256 WebP | **5,428 B** | **−91.4%** |
| `/_next/image` w=128 WebP | 1,998 B | −96.8% |
| `/_next/image` w=64 WebP | 816 B | −98.7% |

Live homepage DOM measurement:

- **112** `<img>` elements total
- **92** of them load raw `digitaloceanspaces.com` originals with **no optimization and no `srcset`**
- **64** unique CDN URLs → **≈ 3,520 KiB** of raw image bytes
- only **32** go through `/_next/image`

This is consistent with (and larger than) the Lighthouse figure of 1,760.5 KiB, because Lighthouse measures a single viewport/lazy-load state.

**The headline fix is deleting 10 lines of code.** Everything else in this audit is secondary.

---

## 🔴 Critical

### C1. `unoptimized` on the primary product card — disables optimization site-wide

**File:** [src/components/share/GlobalProductCard.tsx:246-253](src/components/share/GlobalProductCard.tsx:246)

```tsx
<Image
  src={imgSrc}
  alt={title || "Product image"}
  fill
  className="object-contain p-1 transition-transform duration-300"
  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
  unoptimized            // ← makes the line above completely inert
  onError={() => setImgError(true)}
/>
```

`unoptimized` causes Next.js to emit a bare `<img src="<origin URL>">` with **no `srcset`**. The carefully-written `sizes` attribute one line above is therefore **dead code** — the browser has only one candidate to choose from: the full 1200×1263 original.

`ProductCard` is the shared card used by the homepage (Flash Sale, Trending, New Arrivals, Most Popular, Hot Deal, Feature Products, Clip-to-Cart), every category and sub-category listing, brand pages, search results, offer/campaign pages and related-products carousels. **This one prop accounts for the large majority of the reported 1,760.5 KiB.**

**Evidence (live DOM):** every product image reports `optimized: false, hasSrcset: false` with a raw `dazzle.sgp1.cdn.digitaloceanspaces.com` `src`.

| | |
|---|---|
| **Impact** | ~55–63 KiB per card × 20–40 cards per page. Homepage ≈ 3,520 KiB → ≈ 390 KiB. **Est. saving ≈ 3,100 KiB/page (≈89%)** |
| **Affected** | Homepage, all category/sub-category pages, brands, search, offers, PDP related products |
| **LCP/FCP** | Severe on mobile. Dozens of 55 KiB downloads saturate the connection and delay LCP; on 4G this is multiple seconds |
| **Root cause** | `unoptimized` was almost certainly added to work around a transient remote-image failure (an unconfigured host or a broken URL producing a 400 from the optimizer) and never removed. The `sizes` prop directly above proves optimization was the original intent |
| **Fix** | Delete the `unoptimized` prop. Keep the existing `onError` fallback, which already handles broken images |
| **Risk** | **Low** — all CDN hosts are already whitelisted in `remotePatterns`; measured working above |

### C2. Same `unoptimized` bug in 6 more components (10 sites total)

| File | Line | Surface | Rendered size |
|---|---|---|---|
| [search/RecentSearches.tsx](src/components/search/RecentSearches.tsx:207) | 207 | **Header "Trending Searches" — loads on every page** | ~38×38 |
| [search/ProductSearches.tsx](src/components/search/ProductSearches.tsx:112) | 112, 329 | Search dropdown + results | ~64×64 |
| [HomePage/ClipToCart/ClipToCart.tsx](src/components/HomePage/ClipToCart/ClipToCart.tsx:213) | 213, 240, 249 | Homepage section | 64×64 / brand logo |
| [share/GlobalProductCard.tsx](src/components/share/GlobalProductCard.tsx:246) | 246 | All product grids | ~264×278 |
| [app/(public)/search/page.tsx](<src/app/(public)/search/page.tsx:170>) | 170 | Search results page | ~264×278 |
| [ProductDetails/BuyMore.tsx](src/components/ProductDetails/BuyMore.tsx:100) | 100 | PDP cross-sell | small |
| [ProductDetails/DazzleCare.tsx](src/components/ProductDetails/DazzleCare.tsx:109) | 109 | PDP care options | small |

`RecentSearches.tsx` is the worst ratio in the codebase: it renders **10 trending-search thumbnails at 38×38** in the header search panel — on **every page** — each downloading a full **1200×1263 / ~55 KiB** original. That is ~550 KiB to paint 10 thumbnails, a **~99.9% waste** (a 64px WebP is 816 B).

| | |
|---|---|
| **Impact** | RecentSearches alone ≈ 550 KiB → ≈ 8 KiB. **Est. saving ≈ 540 KiB on every page** |
| **Risk** | **Low** — identical to C1 |

---

## 🟠 High

### H1. `sizes` commented out on the product-detail LCP image

**File:** [src/components/ProductDetails/ProductImageGallery.tsx:94-100](src/components/ProductDetails/ProductImageGallery.tsx:94)

```tsx
<Image
  ...
  fill
  // sizes="(max-width: 768px) 80vw, 40vw"   ← disabled
  priority
```

With `fill` and **no** `sizes`, Next.js falls back to `sizes="100vw"`. The browser then selects a candidate for the **full viewport width** — on a 1920px desktop it downloads the **1920px** variant for an image displayed at roughly 40% of the container. This is the **LCP element of every product page**, and it is marked `priority`, so the oversized download is also render-blocking-critical.

| | |
|---|---|
| **Impact** | ~4–6× more bytes than needed on the single most important image of the PDP. Est. saving ~60–75% of that image |
| **Root cause** | Commented out during debugging, never restored |
| **Fix** | Restore `sizes`, corrected to the real layout |
| **Risk** | **Low** |

### H2. Nine `fill` images with no `sizes` → silent `100vw`

Found by AST-style scan of every `<Image>` block:

```
src/app/(public)/pre-order/page.tsx:188
src/components/Blogs/AnusmaneDetailsCom.tsx:64
src/components/Blogs/BlogCard.tsx:48
src/components/Blogs/BlogDetailsCom.tsx:64
src/components/career/AnnouncementCard.tsx:46
src/components/career/CareerCard.tsx:46
src/components/HomePage/ClipToCart/ClipToCart.tsx:249
src/components/ProductDetails/BuyMore.tsx:100
src/components/ProductDetails/ProductImageGallery.tsx:94   (= H1)
```

Blog/career/announcement cards render in multi-column grids at roughly 300–400 px but request a full-viewport-width candidate.

| | |
|---|---|
| **Impact** | ~2–4× oversized per card on blog, career, announcement, press and pre-order pages. Est. saving 50–70% on those pages |
| **Risk** | **Low** |

### H3. `header-bg.png` — 125.7 KiB PNG loaded as a CSS background on every page

**Asset:** `src/images/header-bg.png` — **1440×226, PNG-with-alpha, 128,671 B (125.7 KiB)** — exactly the Lighthouse entry `/_next/static/media/header-bg.0cxxa8-ing1sk.png` (125.7 KiB, 72.7 KiB potential saving).

**File:** [src/components/layout/Header.tsx:139](src/components/layout/Header.tsx:139)

```tsx
import BgImages from "@/images/header-bg.png";
...
style={{ backgroundImage: `url(${BgImages.src})` }}
```

Using `.src` in a CSS `background-image` **completely bypasses `next/image`** — the raw PNG is served from `/_next/static/media/`. No WebP, no resizing, no responsive variants. It is above the fold on every route, so it competes with the LCP image for bandwidth.

**A 6.0 KiB `header-bg.svg` already exists in the same folder** (`src/images/header-bg.svg`), which suggests a vector source is available.

| | |
|---|---|
| **Impact** | 125.7 KiB on **every page load**. SVG → ~6 KiB (**−95%**); optimized WebP → ~15–25 KiB (−80%) |
| **Root cause** | CSS background usage is invisible to the image optimizer; PNG chosen for the alpha channel |
| **Fix** | Verify `header-bg.svg` is visually identical and swap; otherwise convert to WebP with an alpha channel. Both preserve the design exactly |
| **Risk** | **Low** (needs a visual diff of the header) |

### H4. `no_images.png` placeholder — a 1200×1263 image used for 38×38 slots

**Asset:** `src/images/no_images.png` **and** `public/images/no_images.png` — both **1200×1263, 46.2 KiB** (duplicated).

Referenced in **11 components** as the missing-image fallback. Lighthouse flags it at 1200×1207 displayed at 264×278.

Two distinct problems:

1. **Passed as `NoImg.src` (a string) rather than `NoImg` (the static import object)** in `search/page.tsx:171`, `BrandCategoryFilter.tsx:126`, `BrandProductList.tsx:136`, `BrandProductListClient.tsx:236`, `AllProducts.tsx:243`. Using `.src` discards the build-time width/height metadata and the automatic blur placeholder.
2. On components that are also `unoptimized` (C1/C2), the full 46.2 KiB placeholder is downloaded for a thumbnail slot.

`product.png` (**1200×1263, 145.6 KiB**) has the identical problem and is likewise duplicated across `src/images/` and `public/images/`, and is hardcoded as the fallback in five listing pages (`?? "/images/product.png"`).

| | |
|---|---|
| **Impact** | Appears once per missing-image product; on a catalog page with several gaps this repeats. Fixing C1/C2 largely resolves it automatically (optimizer resizes it) |
| **Fix** | Pass the static import object, not `.src`; de-duplicate the two copies; ship a genuinely small placeholder |
| **Risk** | **Low** |

---

## 🟡 Medium

### M1. `next.config.ts` leaves every image option at default

**File:** [next.config.ts](next.config.ts)

```ts
images: { remotePatterns: [ /* 7 hosts */ ] }
```

Verified defaults for **this exact installed version (16.2.1)**:

| Option | Current (default) | Assessment |
|---|---|---|
| `formats` | `["image/webp"]` | WebP **is already on**. AVIF is opt-in and not enabled |
| `qualities` | `[75]` | **Only q=75 is permitted.** Verified: `&q=50` and `&q=60` return an error (44-byte body, no content-type) |
| `minimumCacheTTL` | `14400` (4 h) | Low for immutable product images |
| `deviceSizes` | `[640,750,828,1080,1200,1920,2048,3840]` | Fine |
| `imageSizes` | `[32,48,64,96,128,256,384]` | Good — covers the 38/64/264 px slots well |
| `dangerouslyAllowSVG` | `false` | Correct; keep. Remote SVGs bypass the optimizer and are served as-is (verified: they load fine, `naturalWidth > 0`) |

**Format compatibility is safe:** the optimizer content-negotiates. Verified — with `Accept: image/webp` it returns `image/webp` (5,428 B); without it, `image/jpeg` (7,065 B). Browsers without WebP automatically receive JPEG. **No compatibility risk.**

| | |
|---|---|
| **Fix** | Raise `minimumCacheTTL`; add `qualities` **only if** a quality other than 75 is wanted; evaluate AVIF against real encode cost |
| **Risk** | **Low** for TTL/qualities · **Medium** for AVIF (significantly slower encode; must be measured, not assumed) |

### M2. `priority` on a below-the-fold homepage section

**File:** [src/components/HomePage/ClipToCart/ClipToCart.tsx:133](src/components/HomePage/ClipToCart/ClipToCart.tsx:133)

```tsx
<Image ... fill sizes="100vw" className="object-cover" priority />
```

"Clip to Cart" sits roughly six sections down the homepage — far below the fold. `priority` preloads it, competing for bandwidth with the genuine LCP (the hero banner) and **delaying** it. Combined with `sizes="100vw"` it preloads a full-viewport-width image.

The hero banner ([Bannerslider.tsx:118](src/components/HomePage/banner/Bannerslider.tsx:118)) correctly applies `priority` only to the first slide — that is the right pattern and should stay.

| | |
|---|---|
| **Impact** | Directly harms homepage LCP by contending with the hero |
| **Fix** | Remove `priority`; let it lazy-load |
| **Risk** | **Low** |

### M3. Eighteen plain `<img>` tags — zero optimization

`CheckoutPageCom.tsx:834` · `Footer.tsx:244` (commented) · `CampaignDetailClient.tsx:198` · `ProductCompareDetails.tsx:146,162` · `AddOn.tsx:181` · `CheckAvailability.tsx:427,521,568` · `DeliveryInfo.tsx:47` · `ProductVariants.tsx:60` · `ProfileSideNav.tsx:112` · `ImageGallery.tsx:23,64` · `TradeIn/*` ×4

These skip resizing, format negotiation and lazy-loading entirely. Lower priority than C1/C2 because they sit on lower-traffic flows (trade-in wizard, checkout thumbnails, compare), but `CheckoutPageCom` and `ProductCompareDetails` do render product photos.

| | |
|---|---|
| **Impact** | Full-size originals on trade-in, checkout, compare and shop-location pages |
| **Fix** | Migrate to `next/image` **incrementally, per file**, with explicit `width`/`height`/`sizes` to avoid introducing layout shift |
| **Risk** | **Medium** — each needs a visual check; a blind find-and-replace would cause CLS regressions |

### M4. Very large unused/oversized local assets in the bundle

| Asset | Size | Dimensions |
|---|---|---|
| `src/images/about_1.png` | 1,525 KiB | 1328×621 |
| `src/images/deals.png` | 1,494 KiB | 1024×1536 |
| `public/images/banner_2.png` | 1,399 KiB | 1536×735 |
| `src/images/about_2.png` | 955 KiB | 655×874 |
| `public/images/banner_1.png` | 852 KiB | 1536×735 |
| `src/images/location.png` | 812 KiB | 980×980 |

**≈ 10 MB of local image assets in total.** Those imported through `next/image` are optimized on demand (so they do not all ship), but any referenced via `.src` in CSS — as `header-bg.png` and `review_bg.png` are — ship raw. `about_1.png` at 1,525 KiB for a 1328×621 PNG is an extremely inefficient encode; as WebP it would be ~80–120 KiB.

| | |
|---|---|
| **Fix** | Re-encode the PNGs that do not need alpha to WebP/JPEG; audit which are still referenced at all |
| **Risk** | **Low** |

---

## 🟢 Low

### L1. Inconsistent CDN cache headers on the origin

Measured on two real product images:

```
.../43465/Zeblaze-Thor-SQ-Smartwatch...jpg   cache-control: max-age=3600     (1 hour)
.../43242/Infinix-Smart-10-Plus...jpg        cache-control: max-age=604800    (7 days)
```

Product image URLs are **path-versioned by an numeric upload ID** (`/43465/`, `/43242/`), so a replaced image gets a **new URL**. They are therefore effectively immutable and safe to cache long-term. The 1-hour header on some objects is needlessly short.

Once C1/C2 are fixed this matters much less, because `/_next/image` applies its own `minimumCacheTTL` and serves from the Next.js image cache — but it still governs revalidation at the origin.

| | |
|---|---|
| **Fix** | Standardise DigitalOcean Spaces objects to `max-age=31536000, immutable` (backend/infra task, outside this repo) |
| **Risk** | **Low** — safe *only* because the upload ID versions the path. Must **not** be applied if any workflow overwrites an image at the same URL |

### L2. Hardcoded pre-optimized production URLs in mock data

`src/components/layout/types.tsx:183-186` and `src/components/ProductDetails/AddOn.tsx:22,30` embed:

```
https://dazzle.com.bd/_next/image?url=...&w=256&q=75
```

This routes an **already-optimized production image back through the local optimizer** (double optimization, extra hop, cross-environment coupling). These appear to be placeholder/mock records.

| | |
|---|---|
| **Fix** | Replace with the raw CDN URL and let the local optimizer handle it |
| **Risk** | **Low** |

### L3. Accessibility — alt text is broadly correct

Spot-checked: product cards use `alt={title || "Product image"}`, banners use `alt={slide.title || …}`. No systematic `alt` problems found. **No changes recommended.** Any migration in M3 must preserve existing `alt` values.

---

## Summary table

| # | Issue | Est. saving | Affected | Risk |
|---|---|---|---|---|
| **C1** | `unoptimized` on `GlobalProductCard` | **≈3,100 KiB/page** | Almost every page | Low |
| **C2** | `unoptimized` in 6 more components | **≈540 KiB/page** (RecentSearches alone) | Every page (header) | Low |
| **H1** | `sizes` commented out on PDP LCP | 60–75% of LCP image | All product pages | Low |
| **H2** | 9 × `fill` without `sizes` | 50–70% on those pages | Blog, career, pre-order | Low |
| **H3** | `header-bg.png` CSS background | **≈100–120 KiB/page** | Every page | Low |
| **H4** | Oversized placeholder + `.src` misuse | ~46 KiB per gap | Catalog pages | Low |
| **M1** | Default image config | Cache efficiency; AVIF TBD | Global | Low / Med |
| **M2** | `priority` below the fold | LCP contention | Homepage | Low |
| **M3** | 18 plain `<img>` | Varies | Trade-in, checkout, compare | Medium |
| **M4** | Oversized local assets | Up to ~1.4 MB each | Pages using them | Low |
| **L1** | Inconsistent CDN cache TTL | Revalidation overhead | All CDN images | Low |
| **L2** | Double-optimized mock URLs | Minor | Mock data | Low |

**Projected total:** the homepage should drop from **≈3,520 KiB** of image bytes to **≈400 KiB** — an **~89% reduction** — with Priority 1 alone, achieved almost entirely by *removing* code rather than adding infrastructure.

**Notably not required:** no image upload pipeline changes, no thumbnail-variant generation service, no CDN transformation layer, and no custom loader. Next.js's optimizer already produces the full responsive variant set on demand; it is simply being bypassed today.
