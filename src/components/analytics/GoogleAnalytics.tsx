import { getSiteSettings } from "@/lib/getSiteSettings";
import DeferredScript from "./DeferredScript";
import { guardProductionOnly } from "@/lib/analytics/environment";

/**
 * The admin panel's "Google Analytics Code" field currently stores a bare
 * measurement ID (e.g. "G-XEGWL1PBPK"), not the full gtag.js snippet the
 * field name implies. Running that bare ID as if it were JavaScript (the old
 * behavior) evaluates it as `G - XEGWL1PBPK`, throwing "ReferenceError: G is
 * not defined" — confirmed live via the CMS API response and browser
 * console. Detect that shape and build the snippet ourselves instead.
 */
function resolveGaId(cmsCode: string | undefined, fallbackId: string | undefined) {
  if (cmsCode) {
    if (/^(G-[A-Z0-9]+|UA-\d+-\d+)$/i.test(cmsCode)) return cmsCode;
    const idMatch = cmsCode.match(/\b(G-[A-Z0-9]+|UA-\d+-\d+)\b/i);
    if (idMatch) return idMatch[0];
  }
  return fallbackId;
}

/**
 * Google Analytics (GA4) — API-driven, loaded DIRECTLY (no Google Tag
 * Manager). GTM was removed from this app per the Meta tracking migration
 * handoff ("Google Tag Manager must not be required") — see
 * docs/meta-tracking-frontend-audit.txt. This is now the ONLY place GA4 is
 * initialized.
 *
 * Priority order:
 *   1. `googleAnalyticsCode` from site-settings API (bare measurement ID
 *      today, or a full gtag.js snippet if the CMS field is ever upgraded)
 *   2. `NEXT_PUBLIC_GA_ID` env variable (legacy / fallback)
 *
 * `window.gtag` defined here is what src/lib/analytics/pixelEvents.ts's
 * `gaTrack()` calls for every ecommerce event (view_item, add_to_cart,
 * purchase, ...) — without GTM there is no `dataLayer.push({event:...})`
 * consumer any more, so those events MUST go through gtag() directly.
 */
export default async function GoogleAnalytics() {
  const settings = await getSiteSettings();

  const cmsCode = settings.googleAnalyticsCode?.trim();
  const envGaId = process.env.NEXT_PUBLIC_GA_ID;
  const gaId = resolveGaId(cmsCode, envGaId);

  if (!gaId) return null;

  return (
    // DeferredScript: confirmed live via Lighthouse (staging) that gtag/js
    // alone costs ~184ms of main-thread time, and together with Meta +
    // TikTok under lazyOnload still landed inside the window a real
    // visitor's first tap/scroll happens (competing with INP, not just LCP).
    // Gating on interaction (see DeferredScript) doesn't change what fires
    // or when a real session sees it — only moves the cost later.
    //
    // Production-only (guardProductionOnly): staging/localhost must not send
    // real GA4 hits — see src/lib/analytics/environment.ts. The external
    // gtag/js library load below is NOT worth gating (it sends no data by
    // itself); only the `gtag('config', ...)` call that actually starts
    // reporting is wrapped.
    <>
      <DeferredScript
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <DeferredScript id="ga4-base">
        {guardProductionOnly(`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${gaId}');`)}
      </DeferredScript>
    </>
  );
}
