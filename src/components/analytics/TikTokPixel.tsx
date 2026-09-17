import Script from "next/script";
import { getSiteSettings } from "@/lib/getSiteSettings";

/**
 * The admin panel's "TikTok Base Code" field currently stores a bare pixel
 * ID (e.g. "DA868JBC77U9ESU0DBP0"), not the full snippet the field name
 * implies. Running that bare ID as if it were JavaScript (the old behavior)
 * throws "ReferenceError: DA868JBC77U9ESU0DBP0 is not defined" — confirmed
 * live via the CMS API response and browser console. Detect that shape and
 * build the snippet ourselves instead.
 */
function resolveTikTokId(cmsCode: string | undefined, fallbackId: string | undefined) {
  if (cmsCode && /^[A-Z0-9]+$/i.test(cmsCode)) return cmsCode;
  return fallbackId;
}

/**
 * TikTok Pixel — API-driven.
 *
 * Priority order:
 *   1. `tikTokBaseCode` from site-settings API (bare pixel ID today, or a
 *      full <script> base-code snippet if the CMS field is ever upgraded)
 *   2. `NEXT_PUBLIC_TIKTOK_PIXEL_ID` env variable (legacy / fallback)
 */
export default async function TikTokPixel() {
  const settings = await getSiteSettings();

  const cmsCode = settings.tikTokBaseCode?.trim();
  const envPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const pixelId = resolveTikTokId(cmsCode, envPixelId);

  // A raw <script> snippet in the CMS field (not a bare ID) is used as-is.
  if (cmsCode && !pixelId) {
    const scriptMatch = cmsCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsCode = scriptMatch ? scriptMatch[1].trim() : cmsCode;
    return (
      <Script id="tiktok-pixel-base" strategy="afterInteractive">
        {jsCode}
      </Script>
    );
  }

  if (!pixelId) return null;

  return (
    <Script id="tiktok-pixel-base" strategy="afterInteractive">
      {`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');`}
    </Script>
  );
}
