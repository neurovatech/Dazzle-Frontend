import Script from "next/script";
import { getSiteSettings } from "@/lib/getSiteSettings";

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
 * Google Analytics (GA4) — API-driven.
 *
 * Priority order:
 *   1. `googleAnalyticsCode` from site-settings API (bare measurement ID
 *      today, or a full gtag.js snippet if the CMS field is ever upgraded)
 *   2. `NEXT_PUBLIC_GA_ID` env variable (legacy / fallback)
 *
 * NOTE: If GTM is already configured and GA4 is set up inside GTM,
 * you do NOT need this component separately. Only use one or the other.
 */
export default async function GoogleAnalytics() {
  const settings = await getSiteSettings();

  const cmsCode = settings.googleAnalyticsCode?.trim();
  const envGaId = process.env.NEXT_PUBLIC_GA_ID;
  const gaId = resolveGaId(cmsCode, envGaId);

  if (!gaId) return null;

  return (
    <>
      <Script
        id="ga4-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-base" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
