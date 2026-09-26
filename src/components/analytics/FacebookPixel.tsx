import { getSiteSettings } from "@/lib/getSiteSettings";
import DeferredScript from "./DeferredScript";

const DEFAULT_PIXEL_ID = "1665562014226088";

const SITE_OWNED_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Search",
];

const OWNED_MAP = `{${SITE_OWNED_EVENTS.map((e) => `${e}:1`).join(",")}}`;

const FILTERED_STUB = `function(){var a=arguments;if(a[0]==='trackSingle'&&(${OWNED_MAP})[a[2]])return;n.callMethod?n.callMethod.apply(n,a):n.queue.push(a)}`;

const STANDARD_STUB =
  /function\(\)\{n\.callMethod\?\s*n\.callMethod\.apply\(n,arguments\):n\.queue\.push\(arguments\)\}/;

function withDuplicateFilter(rawScript: string): string {
  return STANDARD_STUB.test(rawScript) ? rawScript.replace(STANDARD_STUB, FILTERED_STUB) : rawScript;
}

function buildPixelScript(pixelId: string): string {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=${FILTERED_STUB};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

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

export default async function FacebookPixel() {
  const settings = await getSiteSettings();
  const cmsCode = settings.facebookBaseCode?.trim();
  const fallbackId = process.env.NEXT_PUBLIC_FB_PIXEL_ID || DEFAULT_PIXEL_ID;

  const { pixelId, rawScript } = resolvePixel(cmsCode, fallbackId);
  const jsCode = rawScript ? withDuplicateFilter(rawScript) : buildPixelScript(pixelId);

  return (
    <DeferredScript id="fb-pixel-base">
      {jsCode}
    </DeferredScript>
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
