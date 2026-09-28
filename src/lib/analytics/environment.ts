/**
 * Production-only guard for third-party tracking (Meta Pixel, Meta CAPI,
 * GA4, TikTok).
 *
 * Requirement (SEO/Meta tracking handoff doc): "Tracking must fire only on
 * the production/live domain. Localhost, development and staging must not
 * send production events to Meta."
 *
 * Why this is a HOSTNAME check, not an env-var/build check:
 * Reading the real request host (via `headers()`/`cookies()`) in a Server
 * Component would opt the page out of Next's static rendering — the exact
 * regression this app's whole performance pass this session fought to avoid
 * (see PERFORMANCE-AUDIT-BN.md). A build-time `NEXT_PUBLIC_*` flag would work
 * for static rendering, but it is an operational trap: if it is ever left
 * unset on the production deploy, ALL tracking silently goes dark with no
 * error — a worse failure than the one being guarded against.
 *
 * Instead, `guardProductionOnly()` wraps a tracker's inline init script so
 * the check runs in the VISITOR'S BROWSER, against `location.hostname`, at
 * the moment the script executes. This is correct for every deployment
 * topology (one build serving several domains, a separate build/env per
 * domain, PR previews, a developer's localhost) with no new environment
 * variable and no static-rendering cost.
 */

export const PRODUCTION_HOSTNAMES = ["dazzle.com.bd", "www.dazzle.com.bd"];

/** For code that already has a hostname in hand (e.g. an incoming request's
 *  Host header in a Route Handler, which is safe to read there because that
 *  route is already dynamic). */
export function isProductionHostname(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  return PRODUCTION_HOSTNAMES.includes(hostname.toLowerCase());
}

/**
 * Wraps a tracker's inline init/track JS so its body only runs when the page
 * is being viewed on the real production domain. Use for every Meta/GA4/
 * TikTok inline script — including the part of the snippet that injects the
 * EXTERNAL script tag (fbevents.js / tiktok events.js), so non-production
 * hosts don't even fetch those files, let alone send them any data.
 */
export function guardProductionOnly(js: string): string {
  return `if(${JSON.stringify(PRODUCTION_HOSTNAMES)}.indexOf(location.hostname)>-1){${js}}`;
}
