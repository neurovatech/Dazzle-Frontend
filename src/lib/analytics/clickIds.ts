"use client";

/**
 * Ad click-id / UTM capture.
 *
 * Facebook's and Google's own scripts (fbevents.js, gtag.js) already manage
 * their own first-party cookies (`_fbp`, `_fbc`, `_ga`, `_gcl_aw`) once
 * those scripts are loaded — this file does NOT duplicate that.
 *
 * What it DOES cover is the piece nothing else does automatically: `fbclid`
 * and `gclid` only ever appear in the URL of the ad-click landing page, and
 * a visitor typically browses several pages (and may complete checkout much
 * later) before converting. Without capturing them into a longer-lived
 * first-party cookie here, they're gone as soon as the visitor navigates
 * away from that first URL — and the backend's Conversions API / Google Ads
 * Enhanced Conversions calls need them at the moment of purchase, not just
 * at the moment of landing.
 */

const COOKIE_NAME = "dazzle_click_ids";
const MAX_AGE_DAYS = 90;

export interface ClickIds {
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  first_seen?: string;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** Reads whatever click-id/UTM data is currently stored (or {} if none yet). */
export function getClickIds(): ClickIds {
  if (typeof document === "undefined") return {};
  try {
    const raw = readCookie(COOKIE_NAME);
    return raw ? (JSON.parse(raw) as ClickIds) : {};
  } catch {
    return {};
  }
}

/**
 * Call once per page load (client-side). If the current URL carries a new ad
 * click-id or UTM params, this overwrites the stored attribution (last
 * non-direct touch); a plain organic revisit with no such params leaves the
 * existing cookie untouched instead of erasing a prior ad click.
 */
export function captureClickIds(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const incoming: ClickIds = {};

  const fbclid = params.get("fbclid");
  const gclid = params.get("gclid");
  const ttclid = params.get("ttclid");
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmTerm = params.get("utm_term");
  const utmContent = params.get("utm_content");

  if (fbclid) incoming.fbclid = fbclid;
  if (gclid) incoming.gclid = gclid;
  if (ttclid) incoming.ttclid = ttclid;
  if (utmSource) incoming.utm_source = utmSource;
  if (utmMedium) incoming.utm_medium = utmMedium;
  if (utmCampaign) incoming.utm_campaign = utmCampaign;
  if (utmTerm) incoming.utm_term = utmTerm;
  if (utmContent) incoming.utm_content = utmContent;

  if (Object.keys(incoming).length === 0) return;

  const existing = getClickIds();
  const merged: ClickIds = {
    ...existing,
    ...incoming,
    landing_page: existing.landing_page || window.location.pathname,
    first_seen: existing.first_seen || new Date().toISOString(),
  };

  writeCookie(COOKIE_NAME, JSON.stringify(merged), MAX_AGE_DAYS);
}

/** Reads a cookie Facebook's/Google's own pixel scripts set — never written by us. */
export function readTrackingCookie(name: "_fbp" | "_fbc" | "_ga"): string | null {
  if (typeof document === "undefined") return null;
  return readCookie(name);
}
