import Script from "next/script";
import { getSiteSettings } from "@/lib/getSiteSettings";

/**
 * Google Tag Manager — API-driven.
 *
 * Priority order:
 *   1. `googleGTMCode` from site-settings API (full GTM snippet from CMS)
 *   2. `NEXT_PUBLIC_GTM_ID` env variable (legacy / fallback)
 */
export default async function GoogleTagManager() {
  const settings = await getSiteSettings();

  const cmsCode = settings.googleGTMCode?.trim();
  const envGtmId = process.env.NEXT_PUBLIC_GTM_ID;

  if (cmsCode) {
    const scriptMatch = cmsCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsCode = scriptMatch ? scriptMatch[1].trim() : cmsCode;
    return (
      <Script id="gtm-base" strategy="afterInteractive">
        {jsCode}
      </Script>
    );
  }

  if (!envGtmId) return null;

  return (
    <Script id="gtm-base" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${envGtmId}');`}
    </Script>
  );
}

/**
 * GTM <noscript> fallback — must be first element inside <body>.
 * Also reads from CMS first, then env fallback.
 */
export async function GoogleTagManagerNoScript() {
  const settings = await getSiteSettings();
  const envGtmId = process.env.NEXT_PUBLIC_GTM_ID;

  // Extract GTM container ID from CMS code if possible, else use env
  let gtmId = envGtmId;
  const cmsCode = settings.googleGTMCode?.trim();
  if (cmsCode) {
    const idMatch = cmsCode.match(/GTM-[A-Z0-9]+/);
    if (idMatch) gtmId = idMatch[0];
  }

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
