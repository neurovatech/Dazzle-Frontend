import { getSiteSettings } from "@/lib/getSiteSettings";
import DeferredScript from "./DeferredScript";

/**
 * The admin panel's "Google GTM Code" field currently stores a bare
 * container ID (e.g. "GTM-NM9TVHT3"), not the full snippet the field name
 * implies. Running that bare ID as if it were JavaScript (the old behavior)
 * evaluates it as `GTM - NM9TVHT3`, throwing "ReferenceError: GTM is not
 * defined" — confirmed live via the CMS API response and browser console.
 * Detect that shape and build the snippet ourselves instead.
 */
function resolveGtmId(cmsCode: string | undefined, fallbackId: string | undefined) {
  if (cmsCode) {
    if (/^GTM-[A-Z0-9]+$/i.test(cmsCode)) return cmsCode;
    const idMatch = cmsCode.match(/GTM-[A-Z0-9]+/i);
    if (idMatch) return idMatch[0];
  }
  return fallbackId;
}

/**
 * Google Tag Manager — API-driven.
 *
 * Priority order:
 *   1. `googleGTMCode` from site-settings API (bare container ID today, or a
 *      full GTM snippet if the CMS field is ever upgraded)
 *   2. `NEXT_PUBLIC_GTM_ID` env variable (legacy / fallback)
 */
export default async function GoogleTagManager() {
  const settings = await getSiteSettings();

  const cmsCode = settings.googleGTMCode?.trim();
  const envGtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gtmId = resolveGtmId(cmsCode, envGtmId);

  if (!gtmId) return null;

  return (
    // DeferredScript: confirmed live via Lighthouse (staging) that gtm.js
    // alone costs ~295 KiB / 434ms of main-thread time — GTM was the single
    // heaviest third party, and under lazyOnload still landed inside the
    // window a real visitor's first tap/scroll happens (competing with INP).
    // dataLayer.push() calls made before GTM finishes loading are already
    // queued (that's the whole point of the dataLayer array), so gating on
    // interaction (see DeferredScript) doesn't drop any events — it only
    // moves the cost later.
    // Same trigger as every other tracker (first touch/scroll, or 2 s): GTM
    // carries the Meta and GA4 tags too, so deferring only the standalone
    // Pixel would leave the same cost here.
    <DeferredScript id="gtm-base">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
    </DeferredScript>
  );
}

/**
 * GTM <noscript> fallback — must be first element inside <body>.
 * Resolves the container ID the same way as the main component above.
 */
export async function GoogleTagManagerNoScript() {
  const settings = await getSiteSettings();
  const cmsCode = settings.googleGTMCode?.trim();
  const envGtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gtmId = resolveGtmId(cmsCode, envGtmId);

  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="gtm"
      />
    </noscript>
  );
}
