# Image Performance — Implementation Plan

Companion to [IMAGE_PERFORMANCE_AUDIT.md](IMAGE_PERFORMANCE_AUDIT.md). **Nothing below has been implemented.** Awaiting approval.

**Guiding principle:** the dominant win comes from *deleting* `unoptimized` props, not from building infrastructure. Next.js's optimizer already generates the full responsive variant set on demand for these CDN hosts — verified working. No upload-pipeline changes, no thumbnail service, no custom loader, and no CDN transformation layer are required.

---

## Layout measurements used to calculate `sizes`

Derived from the actual Tailwind classes, not guessed:

| Surface | Grid classes | Container | Computed render width |
|---|---|---|---|
| Product grid (category, brand) | `grid-cols-2 md:grid-cols-4` | `max-w-355` (1420px) − `px-12.5` − `gap-4` | mobile ~167px · md ~219px · **lg ~270px** |
| Product grid (trending/hot-deal) | `grid-cols-2 md:grid-cols-5` | same | **lg ~251px** |
| Header trending-search thumb | `w-10 h-10` fixed | — | **40×40** (DOM confirms 38×38) |
| PDP main image | 2-col split | `max-w-355` | **~570–600px** desktop |
| Hero banner | `slidesPerView: 1.5` | full-bleed | ~771×440 (DOM confirmed) |

Resulting product-card value: `(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 264px`
(current tail is `180px`, which under-serves the ~270px render; `264px` selects the 384px variant at DPR 1–1.5 and 640px at DPR 2.)

---

# Priority 1 — High impact / low risk

Target: **≈3,500 KiB → ≈400 KiB** on the homepage. All changes are prop-level and individually revertible.

### P1.1 — Remove `unoptimized` (10 sites, 7 files) 🔴 *the headline fix*

| | |
|---|---|
| **Files** | `share/GlobalProductCard.tsx:246` · `search/RecentSearches.tsx:207` · `search/ProductSearches.tsx:112,329` · `HomePage/ClipToCart/ClipToCart.tsx:213,240,249` · `app/(public)/search/page.tsx:170` · `ProductDetails/BuyMore.tsx:100` · `ProductDetails/DazzleCare.tsx:109` |
| **Current** | Emits bare `<img src="<1200×1263 origin>">`, no `srcset`; existing `sizes` props are inert |
| **Proposed** | Delete the `unoptimized` prop only. Every other prop, class, `onError` handler and layout stays byte-identical |
| **Expected saving** | **≈3,100 KiB** (product grids) + **≈540 KiB** (header trending searches, every page). Measured: 63,170 B → 5,428 B at 256px (−91.4%) |
| **Risk** | **Low** — all 7 CDN hosts already whitelisted in `remotePatterns`; verified returning `image/webp` through `/_next/image` |
| **Rollback** | Re-add the single prop per file |
| **Verify** | DOM assertion: every product `<img>` has `srcset` and a `/_next/image` `currentSrc`; visual diff of grids |

### P1.2 — Restore `sizes` on the PDP LCP image

| | |
|---|---|
| **File** | `ProductDetails/ProductImageGallery.tsx:99` |
| **Current** | `// sizes="(max-width: 768px) 80vw, 40vw"` commented out → silently `100vw` → 1920px variant on desktop |
| **Proposed** | `sizes="(max-width: 768px) 90vw, (max-width: 1280px) 45vw, 600px"` · keep `priority` (correct — it *is* the LCP) |
| **Expected saving** | 60–75% of the PDP's largest image; direct LCP improvement on every product page |
| **Risk** | **Low** |
| **Rollback** | Re-comment the line |

### P1.3 — Add `sizes` to the 8 remaining `fill`-without-`sizes` images

| | |
|---|---|
| **Files** | `pre-order/page.tsx:188` · `Blogs/AnusmaneDetailsCom.tsx:64` · `Blogs/BlogCard.tsx:48` · `Blogs/BlogDetailsCom.tsx:64` · `career/AnnouncementCard.tsx:46` · `career/CareerCard.tsx:46` · `ClipToCart.tsx:249` · `BuyMore.tsx:100` |
| **Current** | No `sizes` with `fill` → defaults to `100vw` |
| **Proposed** | Per-component value from its real grid — cards `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px`; detail heroes `(max-width: 768px) 100vw, 800px`; small logos a fixed px value |
| **Expected saving** | 50–70% on blog, career, announcement, press, pre-order pages |
| **Risk** | **Low** — `sizes` affects only which variant is chosen, never layout |
| **Rollback** | Remove the added attribute |

### P1.4 — Tighten the product-card `sizes` tail

| | |
|---|---|
| **Files** | `share/GlobalProductCard.tsx:251` · `app/(public)/search/page.tsx:175` |
| **Current** | `…, 180px` — undershoots the measured ~270px render (soft on desktop once optimization is on) |
| **Proposed** | `(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 264px` |
| **Expected saving** | Neutral-to-slightly-positive bytes; **prevents a visual-quality regression** from P1.1 |
| **Risk** | **Low** |
| **Note** | Must ship *together with* P1.1 — this is what stops the newly-optimized cards looking soft |

### P1.5 — Fix `header-bg.png` (125.7 KiB on every page)

| | |
|---|---|
| **File** | `layout/Header.tsx:2,139` — `backgroundImage: url(${BgImages.src})` |
| **Current** | Raw 1440×226 PNG-with-alpha served from `/_next/static/media/`, bypassing the optimizer entirely |
| **Proposed** | **Step 1:** visually compare the existing `src/images/header-bg.svg` (6.0 KiB) against the PNG. If identical → swap the import (**−95%**). **Step 2 (fallback):** if the SVG differs, re-encode the PNG to alpha-preserving WebP (~15–25 KiB, −80%) and reference that |
| **Expected saving** | **~100–120 KiB on every page load**, above the fold |
| **Risk** | **Low** — requires a header visual diff in light **and** dark theme before/after |
| **Rollback** | Restore the original import (one line) |

### P1.6 — Remove `priority` from the below-fold ClipToCart image

| | |
|---|---|
| **File** | `HomePage/ClipToCart/ClipToCart.tsx:133` |
| **Current** | `priority` + `sizes="100vw"` on a section ~6 screens down; preloads a full-width image and competes with the hero LCP |
| **Proposed** | Drop `priority`; correct `sizes` to the real render width. Leave `Bannerslider.tsx:118` untouched — its first-slide-only `priority` is correct |
| **Expected saving** | Removes bandwidth contention with the true LCP → measurable homepage LCP improvement |
| **Risk** | **Low** |

### P1.7 — Placeholder hygiene

| | |
|---|---|
| **Files** | `search/page.tsx:171` · `BrandCategoryFilter.tsx:126` · `BrandProductList.tsx:136` · `BrandProductListClient.tsx:236` · `AllProducts.tsx:243` |
| **Current** | `NoImg.src` (string) discards build-time width/height + blur placeholder; asset is 1200×1263 / 46.2 KiB and duplicated in `src/images/` **and** `public/images/` |
| **Proposed** | Pass the `NoImg` static import object where the API allows; de-duplicate to one copy; once P1.1 lands the optimizer resizes it automatically |
| **Expected saving** | ~43 KiB per missing-image slot |
| **Risk** | **Low** — some call sites need a string (union-typed props); those stay as-is and still benefit from P1.1 |

**Priority 1 verification protocol**
1. `npx tsc --noEmit` + `npm run lint` (expect no new errors)
2. `npm run build` (catches invalid image config / missing `remotePatterns`)
3. DOM assertion script: 0 raw `digitaloceanspaces` product `<img>`; all have `srcset`
4. Visual check: homepage, category, PDP, search, cart — light **and** dark theme
5. Re-measure total image bytes; compare against the 3,520 KiB baseline
6. Lighthouse before/after on homepage + a PDP

---

# Priority 2 — High impact / medium risk

Only proceed if Priority 1 measurements show a remaining gap.

### P2.1 — Image config tuning (`next.config.ts`)

| | |
|---|---|
| **Current** | `remotePatterns` only; everything else default (`formats: ["image/webp"]`, `qualities: [75]`, `minimumCacheTTL: 14400`) |
| **Proposed** | `minimumCacheTTL: 2592000` (30 d) — safe because product URLs are path-versioned by upload ID (`/43465/`), so a replaced image gets a new URL. Add `qualities: [70, 75]` **only if** a quality sweep shows a worthwhile gain (verified: any quality not in this array currently returns an error) |
| **Risk** | **Low–Medium** — TTL is safe *given* versioned URLs; must **not** ship if any workflow overwrites an image at the same path |
| **Rollback** | Revert the config keys; the image cache self-expires |

### P2.2 — Evaluate AVIF (**measure before adopting**)

| | |
|---|---|
| **Current** | `formats: ["image/webp"]` (WebP already active and content-negotiated — verified JPEG fallback for non-supporting browsers) |
| **Proposed** | Benchmark `formats: ["image/avif", "image/webp"]` on ~20 representative product images: record byte delta **and** server encode time |
| **Adopt only if** | ≥20% additional saving over WebP **and** encode cost is acceptable — AVIF encoding is substantially slower and can hurt TTFB on cache-miss for a catalog this size |
| **Risk** | **Medium** — pure compute/latency trade-off, no compatibility risk (automatic fallback chain) |
| **Rollback** | Remove `"image/avif"`; cache repopulates as WebP |

### P2.3 — Migrate the 18 plain `<img>` tags

| | |
|---|---|
| **Files** | `CheckoutPageCom.tsx:834` · `ProductCompareDetails.tsx:146,162` · `CheckAvailability.tsx:427,521,568` · `AddOn.tsx:181` · `DeliveryInfo.tsx:47` · `ProductVariants.tsx:60` · `ProfileSideNav.tsx:112` · `ImageGallery.tsx:23,64` · `TradeIn/*` ×4 · `CampaignDetailClient.tsx:198` |
| **Proposed** | Convert to `next/image` **one file at a time**, each with explicit `width`/`height`/`sizes` and preserved `alt` |
| **Risk** | **Medium** — highest CLS risk in this plan; a blind replace would break layouts. Start with `ProductCompareDetails` and `CheckoutPageCom` (real product photos), defer the trade-in wizard |
| **Rollback** | Per-file revert |

### P2.4 — Re-encode oversized local assets

| | |
|---|---|
| **Targets** | `about_1.png` (1,525 KiB) · `deals.png` (1,494 KiB) · `banner_2.png` (1,399 KiB) · `about_2.png` (955 KiB) · `banner_1.png` (852 KiB) · `location.png` (812 KiB) |
| **Proposed** | First determine which are still referenced; delete dead ones. Re-encode survivors to WebP (keep alpha only where actually needed) |
| **Expected saving** | ~85–90% per asset where referenced via `.src`/CSS |
| **Risk** | **Low** (visual diff each) |

---

# Priority 3 — Optional

| Item | Detail | Risk |
|---|---|---|
| **P3.1** Origin cache headers | Standardise Spaces objects to `max-age=31536000, immutable` (currently mixed 1 h / 7 d). **Backend/infra task — outside this repo** | Low |
| **P3.2** Mock URL cleanup | `types.tsx:183-186`, `AddOn.tsx:22,30` embed `dazzle.com.bd/_next/image?...` → double optimization. Replace with raw CDN URLs | Low |
| **P3.3** Blur placeholders | Add `placeholder="blur"` to static imports for perceived performance | Low |
| **P3.4** De-duplicate assets | `product.png` and `no_images.png` exist in both `src/images/` and `public/images/` | Low |

---

## Explicitly **not** recommended

| Rejected | Why |
|---|---|
| Multi-variant thumbnail pipeline (64/128/256/512/768/1200) | Next.js already generates exactly this on demand from `imageSizes` `[32,48,64,96,128,256,384]` + `deviceSizes`. Building it would duplicate working infrastructure and add storage + invalidation complexity for no gain |
| CDN image-transformation layer | Same reason; also introduces vendor lock-in and cost |
| Custom `next/image` loader | Default loader is already producing 91.4% savings when not bypassed |
| Aggressive quality reduction (q≤60) | Audit brief explicitly warns against Lighthouse-chasing. q=75 is the measured sweet spot; the win is *dimensions*, not quality |
| Global lazy-loading changes | Next.js already lazy-loads by default; only two `priority` misuses exist and P1.6 fixes them |
| `dangerouslyAllowSVG: true` | Security risk (SVG can carry scripts). Remote SVGs already bypass the optimizer and load correctly |

---

## Approval requested

1. **Proceed with all of Priority 1?** (recommended — ~89% image-byte reduction, all low-risk, all revertible)
2. **P1.5 header background:** if `header-bg.svg` turns out *not* to match the PNG visually, should I (a) re-encode to WebP, or (b) leave it and report back?
3. **P2.2 AVIF:** benchmark now, or defer until after Priority 1 is measured in production?
