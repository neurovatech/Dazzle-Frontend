# Dazzle — Performance ও Core Web Vitals অডিট (বাংলা)

> তৈরি: ২৫ সেপ্টেম্বর ২০২৬ · সাইট: `dazzle.com.bd` (মোবাইল)
> ভিত্তি: তোমার দেওয়া PageSpeed Insights screenshot + লাইভ সাইট ও local production build-এ আমার নিজের মাপ।

---

## ১. এখনকার অবস্থা (screenshot থেকে)

### Field data (গত ২৮ দিনের আসল ব্যবহারকারী — CrUX)

| Metric | এখন | "Good" হতে লাগবে | অবস্থা |
|---|---|---|---|
| LCP | **2.6 s** | ≤ 2.5 s | ❌ সামান্য বাইরে |
| INP | **477 ms** | ≤ 200 ms | ❌ অনেক দূরে |
| CLS | **0.23** | ≤ 0.1 | ❌ |
| FCP | 1.7 s | ≤ 1.8 s | ✅ |
| TTFB | 0.8 s | ≤ 0.8 s | ⚠️ সীমানায় |

### Lab data (Lighthouse, Moto G Power, ধীর 4G)

| Metric | মান |
|---|---|
| Performance score | **42** |
| FCP | 3.0 s |
| LCP | **6.6 s** |
| Total Blocking Time | **1,260 ms** |
| CLS | 0.002 ✅ |
| Speed Index | 6.1 s |

**গুরুত্বপূর্ণ:** "Core Web Vitals Assessment: **Passed**" দেখতে হলে **LCP, INP, CLS — তিনটাই একসাথে** Good হতে হবে (৭৫তম percentile-এ)। একটা fail করলেই পুরোটা Failed।

**বাস্তব কথা:**
- Lab CLS ইতিমধ্যে 0.002, কিন্তু field CLS এখনো 0.23। কারণ field data **২৮ দিনের rolling window** — পুরনো খারাপ দিনগুলো তাতে মিশে আছে। উন্নতি ধীরে ধীরে দেখা যাবে।
- আমি কোনো ফল **গ্যারান্টি** দিতে পারি না। নিচে যা ঠিক করেছি সেগুলো মাপা প্রমাণের ওপর দাঁড়িয়ে, কিন্তু পুরো Pass আসবে কিনা তা deploy ও ২-৪ সপ্তাহের আসল data দেখে বোঝা যাবে।

---

## ২. সমস্যা → কারণ → সমাধান (একটা একটা করে)

চিহ্ন: ✅ = code-এ ঠিক করা হয়েছে · 🔧 = তোমাকে (Cloudflare/GTM/CMS-এ) করতে হবে · ⚠️ = সীমাবদ্ধতা/সিদ্ধান্ত দরকার

### ২.১ LCP ৬.৬ s — "Element render delay 2,590 ms" (সবচেয়ে বড় আবিষ্কার)

- **কী দেখা গেছে:** LCP breakdown-এ hero ছবি ২৫০ ms-এ নেমে গেছে, কিন্তু পর্দায় আসতে লেগেছে ২.৬ **সেকেন্ড**।
- **কেন:** [`Bannerslider.tsx`](../src/components/HomePage/banner/Bannerslider.tsx)-এ hero ছবিতে `opacity-0` দেওয়া ছিল, React hydrate হয়ে `loaded=true` না করা পর্যন্ত। Lighthouse **অদৃশ্য element-কে LCP ধরে না**, তাই LCP হচ্ছিল hydration শেষ হওয়ার পর।
- **সমাধান ✅:** ছবি সবসময় opaque। ছবি নামার আগে এমনিই কিছু আঁকা হয় না, আর নিচের ধূসর placeholder আগের মতোই থাকে। **দেখতে কোনো পার্থক্য নেই।**
- **আশা:** মোবাইলে LCP-র বড় অংশ (কয়েক সেকেন্ড) কমার কথা। এটা এই অডিটের সবচেয়ে বড় ঠিক।

### ২.২ CLS (0.23)

- **কারণগুলো (মাপা):**
  1. পেজ প্রতি request-এ dynamic render হতো, আর Suspense skeleton আগে আঁকা হয়ে পরে আসল content দিয়ে swap হতো। Swap-এ নিচের সব সরে যেত।
  2. hydration-এ hero-র নিচে হঠাৎ +৩০px জায়গা যোগ হতো।
  3. Trending Now-এর skeleton ~৬৭৬px, আসল content ~৪০২px।
- **সমাধান ✅:** Homepage এখন static (ISR, ১ মিনিট), Suspense wrapper সরানো (HTML-এ `$RC` swap স্ক্রিপ্ট ১৩ → ০), hero-তে ৩০px আগেই রাখা, Trending skeleton আসল মাপে।
- **যাচাই:** local production build-এ layout shift = 0; তোমার lab CLS-ও 0.002।
- ⚠️ Field CLS নামতে সময় লাগবে (২৮ দিন)।

### ২.৩ TTFB / "Document request latency"

- **কারণ:** server-side API call-এ `cookies()` পড়া হতো ([`api.ts`](../src/lib/api.ts)), ফলে Next.js পুরো পেজ **প্রতি request-এ নতুন করে** বানাত। কোনো `token` cookie কোথাও সেট হয় না, অর্থাৎ কাজটা অকারণে।
- **সমাধান ✅:** cached (`revalidate`) request-এ `cookies()` বাদ। Build-এ `/` এখন `○ Static, revalidate 1m`।
- **Product page ✅:** [`product/[productSlug]/page.tsx`](../src/app/(public)/product/[productSlug]/page.tsx)-এ `generateStaticParams` + `revalidate=60` → প্রথমবার ~০.৯ s, তারপর ~২৫ ms (মাপা)।
- 🔧 **Cloudflare:** লাইভ HTML-এ `Cache-Control: max-age=7200` (২ ঘণ্টা browser cache) আসছে, অথচ Next পাঠায় `s-maxage=60`। কোথাও (Cloudflare Cache Rule / Browser Cache TTL / nginx) override হচ্ছে। এতে দাম/stock ২ ঘণ্টা পুরনো দেখাতে পারে এবং deploy-এর পর পুরনো HTML + নতুন JS মিলে hydration error হয়। **HTML-এর জন্য "Respect Existing Headers" দাও।**

### ২.৪ INP (477 ms) ও TBT (1,260 ms)

মূল কারণ: মোবাইলের main thread-এ অতিরিক্ত JavaScript। মাপা ভাগ:

| উৎস | CPU সময় | অবস্থা |
|---|---|---|
| React/Next হাইড্রেশন (`00nvzi6qb…js`) | ১,৭৪০ ms | ⚠️ ফ্রেমওয়ার্কের নিজস্ব; কমানো কঠিন |
| Cloudflare **Rocket Loader** | ৩১৪ ms + বিলম্ব | 🔧 বন্ধ করো |
| Facebook (`fbevents.js` **দুইবার** লোড) | ৭৮২ ms | 🔧 GTM-এর Meta tag pause |
| Google Tag Manager + gtag | ৪০৩ ms | ✅ ১.৫ s পর লোড |
| TikTok | ২১৩ ms | ✅ ৪ s/interaction পর |

**যা ঠিক করেছি ✅:**
- **Product card-এর `<Link>` prefetch বন্ধ** — আগে ১৭২টা RSC request একসাথে ছুটত।
- **Tracking script দেরিতে লোড** ([`DeferredScript.tsx`](../src/components/analytics/DeferredScript.tsx)): Meta/GTM ১.৫ s, বাকিগুলো ৪ s। (Meta/GTM কম রাখা হয়েছে যাতে ad-click থেকে আসা দ্রুত-বেরিয়ে-যাওয়া visitor গণনা থেকে বাদ না পড়ে।)
- **Slider-এর autoplay স্ক্রিনের বাইরে থামানো** ([`PauseOffscreenSwipers.tsx`](../src/components/HomePage/PauseOffscreenSwipers.tsx)): আগে ৮টা slider সবসময় চলত।
- **Quick View modal lazy-load ✅ (নতুন):** প্রতিটা product card-এ ৯০০ লাইনের modal-এর পুরো code homepage bundle-এ ঢুকত। Lighthouse-এ ১৬০ KB chunk "১০০% unused"। এখন শুধু চোখের বোতাম আগে আসে, modal হোভার/ট্যাপে ডাউনলোড শুরু হয়। ([`ProductQuickViewTrigger.tsx`](../src/components/ProductDetails/ProductQuickViewTrigger.tsx))
  - **যাচাই:** homepage-এর JS চেইনে modal code নেই; ক্লিকে modal ~০.৭ s-এ product-সহ খুলছে।
- Hero ছবি ও ছবির preload কমানো (নিচে ২.৭)।

### ২.৫ Render-blocking CSS (530 ms সম্ভাব্য সাশ্রয়)

- **কী:** ৪টা CSS ফাইল (৩৭.৬ KiB) প্রথম আঁকার আগে লোড হয়।
- **আমি `inlineCss` চেষ্টা করেছি এবং বাতিল করেছি** — মেপে দেখলাম compressed HTML ১৩০ KB → ২৩২ KB হয়ে যায় (CSS বারবার ঢোকে)। ধীর 4G-তে এটা লাভের চেয়ে ক্ষতি বেশি। ([`next.config.ts`](../next.config.ts)-এ কারণসহ মন্তব্য আছে।)
- ⚠️ বাকি পথ: Tailwind-এ অব্যবহৃত CSS কমানো (বড় পরিবর্তন, আলাদা কাজ)।

### ২.৬ ছবি ("Improve image delivery" 182 KiB)

| ছবি | সমস্যা | সমাধান |
|---|---|---|
| `header-bg.png` **125.7 KiB** | PNG, প্রতি পেজে | ✅ WebP (**২৫ KB**), দেখতে অভিন্ন |
| Offer banner (১০৮০px ফাইল, ১৮৬px জায়গায়) | `sizes` না থাকায় Next ১০০vw ধরছিল | ✅ `sizes="50vw"` ইত্যাদি (৪টা component) |
| Offer banner-এর `alt` = কাঁচা UUID | accessibility/SEO খারাপ | ✅ `alt="Offer banner"` |
| Hero slide ৬৭২px, দেখা যায় ৪২৫px | সামান্য বড় | ⚠️ সামান্য (১৩-১৫ KiB), ছুঁইনি |

### ২.৭ ছবির preload

- **কারণ:** ৪১টা ছবি "high priority preload" ছিল, hero (LCP)-র সাথে bandwidth নিয়ে লড়ত।
- **সমাধান ✅:** `priority` → `loading="eager"`। এখন `fetchpriority=high` শুধু hero-তে।
- ✅ অব্যবহৃত `dzl.sgp1` preconnect সরানো।

### ২.৮ Cache lifetime (374 KiB)

- `/_next/image` লাইভে **7 দিন** দেখাচ্ছে, অথচ [`next.config.ts`](../next.config.ts)-এ `minimumCacheTTL` ৩০ দিন → নতুন config এখনো deploy হয়নি বা Cloudflare override করছে। 🔧 deploy করে আবার দেখো।
- `fbevents.js` (২০ মিনিট), `capiParamBuilder` (কিছু না): **Meta-র নিজস্ব**, আমরা বদলাতে পারি না।
- `rocket-loader.min.js` (১ দিন): Rocket Loader বন্ধ করলে এটাও যাবে।

### ২.৯ Legacy JavaScript (80 KiB) ও Unused JavaScript (459 KiB)

- Legacy JS-এর বেশিরভাগ **তৃতীয় পক্ষের** (Meta, AWS, Cloudflare, TikTok)। নিজস্ব অংশ ~১৩.৫ KiB (`Array.at`, `flat`, `fromEntries`, `hasOwn`, `trimStart` polyfill)। ⚠️ এগুলো বাদ দিতে `browserslist` বাড়াতে হয়, তাতে পুরনো Android (Chrome < ৯৩) ভাঙার ঝুঁকি। বাংলাদেশে এই ডিভাইস বেশি, তাই **ছুঁইনি**।
- Unused JS-এর সবচেয়ে বড় অংশ: **Facebook ৩৬০ KiB — `fbevents.js` দুইবার লোড হচ্ছে** (একবার আমাদের snippet, একবার GTM-এর Meta tag)।
  - 🔧 **GTM-এ (`GTM-NM9TVHT3`) Meta Pixel tag pause করো।** আমাদের code নিজেই সব event পাঠায়। এতে ~১০৮ KiB + ৪০০+ ms বাঁচবে, আর duplicate event-ও বন্ধ হবে।
  - 🔧 GTM-এ যদি GA4 tag থাকে, তাহলে [`GoogleAnalytics.tsx`](../src/components/analytics/GoogleAnalytics.tsx) আর দরকার নেই (একই GA দুইভাবে লোড হচ্ছে কিনা দেখো)।
- ✅ নিজস্ব ১০০%-unused chunk = ওপরের Quick View modal (ঠিক করা হয়েছে)।

### ২.১০ Forced reflow (২০১ ms)

- বেশিরভাগ react-dom hydration + Swiper-এর মাপজোখ। ⚠️ সরাসরি কোনো এক লাইনের সমাধান নেই; hydration কমলে (২.৪) এটাও কমবে।

### ২.১১ Accessibility (84)

| সমস্যা | সংখ্যা | সমাধান |
|---|---|---|
| **"Buttons do not have an accessible name"** | ৩৯টা | ✅ Quick View বোতামে `aria-label="Quick view"` (প্রতিটা product card-এ ছিল) |
| Links without discernible name | ৪টা | ✅ Footer-এর Facebook/Instagram/LinkedIn/YouTube link-এ `aria-label` |
| Image alt = UUID | ~৬টা | ✅ `alt="Offer banner"` |
| Heading order (`h1 → h3`) | ১টা | ✅ "Shop by Brand" `h1 → h2` (দেখতে একই) |
| Touch target ছোট | marquee link (১৬px উচ্চতা), slider bullet (৮px), ছোট badge বোতাম | ⚠️ ডিজাইন বদলাতে হয়, ছুঁইনি |
| Contrast | কিছু ধূসর লেখা | ⚠️ ডিজাইন সিদ্ধান্ত, ছুঁইনি |
| একাধিক `h1` | ৪টা | ⚠️ CMS-এর SEO block ([`LatestBlog`](../src/components/layout/LatestBlog.tsx)) নিজের `<h1>` ধরে আছে; SEO দলের সাথে ঠিক করো |

### ২.১২ Cloudflare ও console error

- 🔧 **Rocket Loader বন্ধ করো** (লাইভ HTML-এ ৮৮টা script এর দ্বারা বদলানো)। এটা TBT বাড়ায়, `Minified React error #418` (hydration) এর সম্ভাব্য কারণ।
- ✅ Proxy থেকে backend-এর `Set-Cookie` ছেঁটে দেওয়া ([`route.ts`](../src/app/api/proxy/[...path]/route.ts)) → "`__cf_bm` rejected for invalid domain"।
- ✅ Swiper loop warning ও `stop-color` warning ঠিক করা।

### ২.১৩ CLS-এর আসল কারণ — মাপা প্রমাণ (staging report: "Flash Sale 0.271")

**পদ্ধতি:** production build-এ একই পেজ দুইভাবে মেপেছি — (ক) JS ছাড়া (server-এর HTML), (খ) hydrate হওয়ার পর। প্রতিটা section-এর উচ্চতা তুলনা করেছি (412px মোবাইল)।

| Section | JS ছাড়া | hydrate-এর পর | কারণ |
|---|---|---|---|
| **Categories** | 486 px | 346 px (**−140**) | Swiper চালু হওয়ার আগে প্রতিটা tile পুরো-প্রস্থের বর্গ। Hydrate-এ সংকুচিত হয়ে **Flash Sale-কে উপরে টেনে আনত** → এটাই তোমার ০.২৭১ |
| **Flash Sale** | 518 px | 586 px (**+68**) | `GlobalCountdown` mount-এর আগে `null` ছিল, পরে পুরো সারি আসত |
| Clip To Cart | 1164 px | 686 px (−478) | client-side data আসার আগের skeleton ৩ সারি লম্বা |
| Shop by Brand | 1250 px | 602 px (−648) | ঐ একই কারণ + logo সারি |
| Offer banner ×৩ | 122 px | 150 px | ছবির ঘোষিত অনুপাত 500×200 (২.৫:১), লোডের পর আসল ফাইলের ১০৮০×৫৯০ (১.৮৩:১) → +২৮px |

**ঠিক করেছি ✅** (সবগুলোতে design একই থাকে, শুধু জায়গা আগেই ধরে রাখা হয়):
- Categories: hydrate-এর আগে CSS Grid দিয়ে Swiper Grid-এর হুবহু বিন্যাস ([`globals.css`](../src/app/globals.css), `--cat-cols`)।
- Countdown: সারি সবসময় আঁকা, শুধু সংখ্যা mount পর্যন্ত অদৃশ্য ([`GlobalCountdown.tsx`](../src/components/share/GlobalCountdown.tsx))। (উপরি লাভ: "Flash Sale" লেখাটা এখন server HTML-এই আছে।)
- Clip To Cart / Shop by Brand: skeleton আসল carousel-এর মাপে, আর logo সারির জন্য pre-JS slide প্রস্থ।
- Offer banner: আসল অনুপাত ১০৮০×৫৯০ ঘোষণা।

**ফলাফল (মাপা):** JS ছাড়া বনাম hydrate-এর পর ১৫টা section-এর মধ্যে ১৪টা **হুবহু এক** উচ্চতা; বাকিটায় ৮px। পুরো পেজ ৯৮৭০ → ৯৮৭৮ px। প্রথম স্ক্রিনে (viewport) কোনো section সরে না।

### ২.১৪ Network dependency tree (staging: ৩,০০১ ms) ও Render-blocking CSS (২,০৩০ ms)

- **কারণ ১ ✅ ছবির ভিড়:** প্রথম লোডে ~৩০টা product ছবি একসাথে নামত (React সবগুলোর জন্য `<head>`-এ preload বসায়) এবং ধীর 4G-তে CSS-কে আটকে রাখত। এখন এগুলোতে `fetchpriority="low"`; preload ৩০ → ১০ (মাপা)। ছবিগুলো `eager`-ই থাকল, কারণ Swiper-এর ভেতরে `lazy` ছবি সত্যিই আর লোড হয় না (আমি যাচাই করেছি: দৃশ্যমান ৬টা ছবি অপেক্ষার পরও খালি ছিল)।
- **কারণ ২ 🔧 Cloudflare Web Analytics:** চেইনে `static.cloudflareinsights.com/beacon.min.js` (১,৩২৪ ms) → `/cdn-cgi/rum` (৩,০০১ ms) আছে। এটা Cloudflare নিজে HTML-এ ঢোকায়, আমাদের code-এ নেই। **Cloudflare → Analytics & Logs → Web Analytics → বন্ধ করো** (আমরা GA4 ব্যবহার করছি)। এতে ৩,০০১ ms-এর ক্রিটিক্যাল পথ থেকে এটা সরে যাবে।
- ⚠️ ফন্ট (`woff2`) CSS-এর পরে চেইন হয় (২,৬৮১ ms); CSS দ্রুত হলে এটাও দ্রুত হবে।

### ২.১৫ Forced reflow (১৬১ ms)

- উৎস: React-DOM hydration (`00nvzi…`) ও `10t3b7…` (Swiper-এর মাপজোখ)। এটা প্রতিটা Swiper চালু হওয়ার সময় `offsetWidth` পড়া। ⚠️ ১২টা Swiper থাকা পর্যন্ত পুরো এড়ানো যায় না; স্ক্রিনের নিচের Swiper গুলো দেরিতে চালু করা (lazy hydrate) আলাদা, বড় কাজ।

### ২.১৬ 90+ স্কোর নিয়ে সৎ কথা

- এই স্ট্যাকে (React + ১২টা Swiper + ~১.৯MB HTML + Meta/GTM/GA4/TikTok/Tawk) **Moto G Power + ধীর 4G-তে 90+ বাস্তবসম্মত না।** আমার মাপা উন্নতিগুলো (LCP, CLS, TTFB, তৃতীয়-পক্ষ) মিলিয়ে স্কোর উল্লেখযোগ্য বাড়ার কথা, কিন্তু আসল সংখ্যা আমি Lighthouse চালিয়ে দেখিনি।
- 90-এর দিকে যেতে দুটো বড় সিদ্ধান্ত লাগবে: (১) tracking script শুধু প্রথম স্ক্রল/ট্যাপে লোড (Meta PageView-এর কিছু bounce হারাবে), (২) স্ক্রিনের নিচের section-এর client JS দেরিতে hydrate করা (বড় refactor)।
- `Performance 35 ↔ 42` এর ওঠানামা অনেকটা Lighthouse-এর নিজের variance (±১০); ৩টা করে চালিয়ে মাঝেরটা নাও।

---

## ৩. তোমার করণীয় তালিকা (গুরুত্ব অনুযায়ী)

1. **সব পরিবর্তন deploy করো** (staging → live)। এটা ছাড়া কিছুই বদলাবে না।
2. **Cloudflare → Speed → Rocket Loader: OFF।**
3. **Cloudflare HTML cache:** "Respect Existing Headers"; ২ ঘণ্টার browser cache সরাও।
4. **GTM `GTM-NM9TVHT3` → Meta Pixel tag (id 19) Pause**, তারপর Publish।
5. Server-এ **নতুন** `META_CAPI_ACCESS_TOKEN` ও `META_CAPI_PIXEL_ID` বসাও (পুরনোটা git-এ চলে গিয়েছিল)।
6. Deploy-এর পর [PageSpeed Insights](https://pagespeed.web.dev)-এর **নিচের "Diagnose" (lab)** অংশ দেখো, সেটা সাথে সাথে আপডেট হয়।
7. ২-৪ সপ্তাহ পর Search Console → Core Web Vitals দেখো (field data)।

---

## ৪. সাবধানতা (নতুন আচরণ যা জানা দরকার)

- **Homepage ও product page এখন cached।** Backend কয়েক সেকেন্ড না চললে পুরনো পেজই দেখানো হবে। এজন্য একটা রক্ষাকবচ যোগ করেছি ([`rethrowIfTransient`](../src/lib/api.ts)): backend সাময়িক fail করলে খালি পেজ cache না করে আগের ভালো পেজ রেখে দেয়। (আমার এক build-এ backend পাওয়া যায়নি বলে homepage-এ ০টা product এসেছিল, সেখান থেকেই বুঝেছি।)
  - **তাই `next build` এখন backend বন্ধ থাকলে fail করবে।** Jenkins-এ build চালানোর আগে backend চালু আছে কিনা নিশ্চিত করো। এটা ইচ্ছাকৃত: খালি homepage deploy হওয়ার চেয়ে build fail ভালো।
  - Dev মোডে (`npm run dev`) এই কড়াকড়ি নেই।
- **Product page:** backend-এ সমস্যা হলে error-অবস্থা সর্বোচ্চ ৬০ সেকেন্ড cache হতে পারে। Deploy-এর পর Search Console-এ soft-404 লক্ষ রাখো (না-থাকা slug আমার test-এ `200` দিয়েছিল; আগে কেমন ছিল সেটা মিলিয়ে দেখিনি)।
- Tracking script এখন সামান্য দেরিতে লোড হয়। ১.৫ s-এর আগে বেরিয়ে যাওয়া visitor Meta-য় গণনা নাও হতে পারে (আগে ৪ s ছিল, এখন কম)।

---

## ৫. যেসব ফাইল বদলেছে (এই অডিট ও আগের ধাপ মিলিয়ে)

`src/lib/api.ts` · `src/app/(public)/page.tsx` · `src/app/(public)/product/[productSlug]/page.tsx` · `src/app/api/proxy/[...path]/route.ts` · `src/app/layout.tsx` · `src/components/HomePage/banner/Bannerslider.tsx` · `…/PauseOffscreenSwipers.tsx` (নতুন) · `…/TrendingNow/TrendingNowSectionCom.tsx` · `…/MostPopular/MostPopular.tsx` · `…/OfferBanner/*` · `…/FeatureProducts/FeatureProducts.tsx` · `…/ShopBrand/ShopBrandSectionCom.tsx` · `…/Categories/CategoriesCard.tsx` · `src/components/share/ProductCardImage.tsx` · `src/components/share/GlobalProductCard.tsx` · `src/components/share/ProductCardBuy.tsx` · `src/components/ProductDetails/ProductQuickViewTrigger.tsx` (নতুন) · `…/ProductQuicView.tsx` · `src/components/layout/{Header,Footer,MainNav,MobileHeader}.tsx` · `src/components/analytics/*` · `src/images/header-bg.webp` (নতুন) · এবং সব server fetcher-এ `rethrowIfTransient`।

---

## ৬. যা আমি যাচাই করিনি (সৎভাবে)

- **নতুন করে আসল Lighthouse চালাইনি** (তুমি `npx lighthouse` চালাতে দাওনি)। তাই "Performance ৪২ → ?" এর সংখ্যা আমি জানি না; উপরের সব উন্নতি মাপা কারণের ওপর ভিত্তি করা, চূড়ান্ত স্কোর deploy-এর পর PSI-তে দেখো।
- Meta-র সার্ভারে event আসলে পৌঁছাচ্ছে কিনা আমার sandbox থেকে দেখা যায় না।
- INP-র সরাসরি সংখ্যা lab-এ মাপা যায় না (TBT proxy); আসল INP শুধু field data-তে।
