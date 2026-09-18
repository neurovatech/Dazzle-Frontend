import Script from "next/script";
import { getSiteSettings } from "@/lib/getSiteSettings";

const DEFAULT_PIXEL_ID = "1665562014226088";

function buildPixelScript(pixelId: string): string {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

/**
 * The admin panel's "Facebook Base Code" field currently stores a bare
 * numeric pixel ID (e.g. "1665562014226088"), not the full <script> snippet
 * the field name implies. Running that bare ID as if it were JavaScript
 * (the old behavior) throws "ReferenceError" and the Pixel never loads —
 * confirmed live via the CMS API response. Detect that shape and build the
 * base code ourselves instead of trusting the field to already be a script.
 */
function resolvePixel(
  cmsCode: string | undefined,
  fallbackId: string
): { pixelId: string; rawScript: string | null } {
  if (cmsCode) {
    const scriptMatch = cmsCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      const jsCode = scriptMatch[1].trim();
      const idMatch = jsCode.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/);
      return { pixelId: idMatch?.[1] ?? fallbackId, rawScript: jsCode };
    }
    if (/^\d+$/.test(cmsCode)) {
      return { pixelId: cmsCode, rawScript: null };
    }
  }
  return { pixelId: fallbackId, rawScript: null };
}

/**
 * Facebook Pixel — API-driven.
 *
 * Priority order:
 *   1. `facebookBaseCode` from site-settings API (bare pixel ID today, or a
 *      full <script> base-code snippet if the CMS field is ever upgraded)
 *   2. `NEXT_PUBLIC_FB_PIXEL_ID` env variable, else a hardcoded fallback ID
 *
 * Subsequent client-side route-change PageViews are fired by RouteChangeTracker.
 */
export default async function FacebookPixel() {
  const settings = await getSiteSettings();
  const cmsCode = settings.facebookBaseCode?.trim();
  const fallbackId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || DEFAULT_PIXEL_ID;

  const { pixelId, rawScript } = resolvePixel(cmsCode, fallbackId);
  const jsCode = rawScript ?? buildPixelScript(pixelId);

  return (
    // lazyOnload: confirmed live via PageSpeed Insights that fbevents.js
    // alone costs ~117ms of main-thread time competing with the LCP paint
    // under afterInteractive. Deferring to browser idle time doesn't change
    // what fires or when a real user's session sees it (idle happens well
    // before any purchase completes) — only removes it from the critical
    // rendering path.
    <Script id="fb-pixel-base" strategy="lazyOnload">
      {jsCode}
    </Script>
  );
}

/**
 * Meta Pixel <noscript> fallback for users with JS disabled.
 * Resolves the pixel ID the same way as the main component above.
 */
export async function FacebookPixelNoScript() {
  const settings = await getSiteSettings();
  const cmsCode = settings.facebookBaseCode?.trim();
  const fallbackId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || DEFAULT_PIXEL_ID;

  const { pixelId } = resolvePixel(cmsCode, fallbackId);

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
