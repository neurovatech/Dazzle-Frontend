import Script from "next/script";
import { getSiteSettings } from "@/lib/getSiteSettings";

/**
 * Google Analytics (GA4) — API-driven.
 *
 * Uses `googleAnalyticsCode` from site-settings API.
 * Falls back to `NEXT_PUBLIC_GA_ID` env variable.
 *
 * NOTE: If GTM is already configured and GA4 is set up inside GTM,
 * you do NOT need this component separately. Only use one or the other.
 */
export default async function GoogleAnalytics() {
  const settings = await getSiteSettings();

  const cmsCode = settings.googleAnalyticsCode?.trim();
  const envGaId = process.env.NEXT_PUBLIC_GA_ID;

  // ── CMS full code ─────────────────────────────────────────────────────────
  if (cmsCode) {
    const scriptMatch = cmsCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsCode = scriptMatch ? scriptMatch[1].trim() : cmsCode;

    // Also check if the code has an external src (e.g. gtag.js)
    const srcMatch = cmsCode.match(/src=["']([^"']+)["']/i);

    return (
      <>
        {srcMatch && (
          <Script
            id="ga4-script"
            src={srcMatch[1]}
            strategy="afterInteractive"
          />
        )}
        {jsCode && (
          <Script id="ga4-base" strategy="afterInteractive">
            {jsCode}
          </Script>
        )}
      </>
    );
  }

  // ── Env variable GA4 ID (e.g. G-XXXXXXXXXX) ──────────────────────────────
  if (!envGaId) return null;

  return (
    <>
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${envGaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-base" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${envGaId}');`}
      </Script>
    </>
  );
}
