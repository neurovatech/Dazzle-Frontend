import Script from "next/script";
import { getSiteSettings } from "@/lib/getSiteSettings";

/**
 * Facebook Pixel — API-driven.
 *
 * Priority order:
 *   1. `facebookBaseCode` from site-settings API (full script HTML from CMS)
 *   2. `NEXT_PUBLIC_FB_PIXEL_ID` env variable (legacy / fallback)
 *
 * When the CMS provides the full base code, it is injected as-is so the
 * marketing team can update the Pixel ID without a deployment.
 *
 * Subsequent client-side route-change PageViews are fired by RouteChangeTracker.
 */
export default async function FacebookPixel() {
  const settings = await getSiteSettings();

  const cmsCode = settings.facebookBaseCode?.trim();
  const envPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  // ── Option 1: CMS provides the full base code HTML ────────────────────────
  if (cmsCode) {
    // Extract raw JS from <script>…</script> tags if present, otherwise use as-is
    const scriptMatch = cmsCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsCode = scriptMatch ? scriptMatch[1].trim() : cmsCode;

    return (
      <Script id="fb-pixel-base" strategy="afterInteractive">
        {jsCode}
      </Script>
    );
  }

  // ── Option 2: env variable pixel ID (legacy fallback) ────────────────────
  if (!envPixelId) return null;

  return (
    <Script id="fb-pixel-base" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${envPixelId}');
fbq('track', 'PageView');`}
    </Script>
  );
}
