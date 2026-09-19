"use client";

import { readTrackingCookie } from "./clickIds";

/**
 * Thin, safe wrappers around window.fbq (Facebook Pixel) and window.dataLayer
 * (Google Tag Manager / GA4), plus the ecommerce event helpers used at every
 * add-to-cart / checkout / purchase call site across the app.
 *
 * Every helper is safe when the underlying script is missing (pixel not
 * configured, ad-blocker) — it never throws, tracking must never break a real
 * user action like adding to cart. fbTrack additionally queues events raised
 * while the Pixel is still loading and flushes them once it's ready.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

/** Per-event id, shared between the browser pixel call and the matching
 *  server-side Conversions API call the backend fires for the same action —
 *  this is what lets Facebook deduplicate the two into a single event
 *  instead of double-counting it. */
export function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function pushDataLayer(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

interface PendingFbCall {
  eventName: string;
  params: Record<string, unknown>;
  eventId?: string;
}

// The Pixel base script is injected by next/script AFTER hydration (and, since
// the performance pass, at browser idle time), while page-level effects such
// as ViewContent fire DURING hydration — so on a real page load fbq usually
// doesn't exist yet at the moment the first events are raised. Dropping them
// (the old behaviour) silently lost ViewContent/AddToCart-on-load events.
// They're held here and flushed the moment fbq appears.
const pendingFbCalls: PendingFbCall[] = [];
const FB_QUEUE_MAX = 50;
const FB_WAIT_MS = 20_000;
let fbFlushTimer: ReturnType<typeof setInterval> | null = null;

function sendFbCall(call: PendingFbCall): void {
  if (call.eventId) {
    window.fbq?.("track", call.eventName, call.params, { eventID: call.eventId });
  } else {
    window.fbq?.("track", call.eventName);
  }
}

function startFbFlush(): void {
  if (fbFlushTimer) return;
  const startedAt = Date.now();
  fbFlushTimer = setInterval(() => {
    const ready = typeof window.fbq === "function";
    if (ready) pendingFbCalls.splice(0).forEach(sendFbCall);
    // Stop once delivered, or give up if the Pixel never shows up (not
    // configured / blocked by an ad-blocker) so the timer can't run forever.
    if (ready || Date.now() - startedAt > FB_WAIT_MS) {
      if (!ready) pendingFbCalls.length = 0;
      if (fbFlushTimer) clearInterval(fbFlushTimer);
      fbFlushTimer = null;
    }
  }, 250);
}

export function fbTrack(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string,
): void {
  if (typeof window === "undefined") return;
  const call: PendingFbCall = { eventName, params, eventId };

  if (typeof window.fbq === "function") {
    // Anything queued earlier goes out first so events keep their order.
    if (pendingFbCalls.length > 0) pendingFbCalls.splice(0).forEach(sendFbCall);
    sendFbCall(call);
    return;
  }

  if (pendingFbCalls.length < FB_QUEUE_MAX) pendingFbCalls.push(call);
  startFbFlush();
}

// ─── Ecommerce event shapes ─────────────────────────────────────────────────

export interface TrackedProduct {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  brand?: string;
  category?: string;
}

/**
 * Fires the matching Facebook Pixel event AND pushes the equivalent GA4/GTM
 * ecommerce event for one logical action, sharing one event_id between the
 * pixel call and whatever the caller forwards to the backend for
 * Conversions API dedup (see the individual track* helpers below).
 */
function trackBoth(
  fbEventName: string,
  gtmEventName: string,
  fbParams: Record<string, unknown>,
  gtmParams: Record<string, unknown>,
  eventId: string,
): void {
  fbTrack(fbEventName, fbParams, eventId);
  pushDataLayer(gtmEventName, { ...gtmParams, event_id: eventId });
}

export function trackViewContent(product: TrackedProduct): string {
  const eventId = generateEventId();
  trackBoth(
    "ViewContent",
    "view_item",
    {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "BDT",
    },
    {
      ecommerce: {
        currency: "BDT",
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, item_brand: product.brand, item_category: product.category }],
      },
    },
    eventId,
  );
  return eventId;
}

export function trackSearch(searchTerm: string): string {
  const eventId = generateEventId();
  trackBoth(
    "Search",
    "search",
    { search_string: searchTerm },
    { search_term: searchTerm },
    eventId,
  );
  return eventId;
}

export function trackAddToWishlist(product: TrackedProduct): string {
  const eventId = generateEventId();
  trackBoth(
    "AddToWishlist",
    "add_to_wishlist",
    {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "BDT",
    },
    {
      ecommerce: {
        currency: "BDT",
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, price: product.price }],
      },
    },
    eventId,
  );
  return eventId;
}

export function trackAddToCart(product: TrackedProduct): string {
  const eventId = generateEventId();
  const quantity = product.quantity ?? 1;
  trackBoth(
    "AddToCart",
    "add_to_cart",
    {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price * quantity,
      currency: "BDT",
      contents: [{ id: product.id, quantity }],
    },
    {
      ecommerce: {
        currency: "BDT",
        value: product.price * quantity,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
      },
    },
    eventId,
  );
  return eventId;
}

/**
 * Full product detail for the multi-product checkout-funnel events
 * (InitiateCheckout / AddPaymentInfo / Purchase), so every one of them carries
 * the same complete picture of the order: ids, per-line quantity AND price,
 * names, brand, item count and total value.
 */
function checkoutFbParams(products: TrackedProduct[], totalValue: number): Record<string, unknown> {
  const names = products.map((p) => p.name).filter(Boolean).join(", ");
  return {
    content_ids: products.map((p) => p.id),
    contents: products.map((p) => ({ id: p.id, quantity: p.quantity ?? 1, item_price: p.price })),
    content_type: "product",
    ...(names ? { content_name: names.slice(0, 250) } : {}),
    num_items: products.reduce((n, p) => n + (p.quantity ?? 1), 0),
    value: totalValue,
    currency: "BDT",
  };
}

function checkoutGaItems(products: TrackedProduct[]): Record<string, unknown>[] {
  return products.map((p) => ({
    item_id: p.id,
    item_name: p.name,
    price: p.price,
    quantity: p.quantity ?? 1,
    ...(p.brand ? { item_brand: p.brand } : {}),
    ...(p.category ? { item_category: p.category } : {}),
  }));
}

export function trackInitiateCheckout(products: TrackedProduct[], totalValue: number): string {
  const eventId = generateEventId();
  trackBoth(
    "InitiateCheckout",
    "begin_checkout",
    checkoutFbParams(products, totalValue),
    { ecommerce: { currency: "BDT", value: totalValue, items: checkoutGaItems(products) } },
    eventId,
  );
  return eventId;
}

/**
 * Fired when the buyer commits to a payment method (the moment they confirm
 * the order), not on every radio toggle. `paymentType` is a readable name such
 * as "bkash", "sslcommerz", "cash_on_delivery" or "pay_at_store".
 */
export function trackAddPaymentInfo(
  products: TrackedProduct[],
  totalValue: number,
  paymentType: string,
): string {
  const eventId = generateEventId();
  trackBoth(
    "AddPaymentInfo",
    "add_payment_info",
    { ...checkoutFbParams(products, totalValue), payment_type: paymentType },
    {
      ecommerce: {
        currency: "BDT",
        value: totalValue,
        payment_type: paymentType,
        items: checkoutGaItems(products),
      },
    },
    eventId,
  );
  return eventId;
}

// ─── Order handed to an external payment gateway ───────────────────────────
// bKash/SSLCommerz take the browser to another site and back, so by the time
// the payment-result page loads, the cart is already cleared and the page has
// no idea what was bought. The order is parked here just before the redirect
// and read back on return, so the gateway Purchase event carries the same
// full product detail — and the same event_id sent to the backend — as a COD
// Purchase does.

const PENDING_PURCHASE_KEY = "dazzle-pending-purchase";
const PENDING_PURCHASE_TTL_MS = 6 * 60 * 60 * 1000;

export interface PendingPurchase {
  eventId: string;
  orderNo?: string;
  value: number;
  products: TrackedProduct[];
}

export function savePendingPurchase(purchase: PendingPurchase): void {
  try {
    window.localStorage.setItem(
      PENDING_PURCHASE_KEY,
      JSON.stringify({ ...purchase, savedAt: Date.now() }),
    );
  } catch {}
}

/** Returns the parked order (if recent) and clears it so it can only fire once. */
export function takePendingPurchase(): PendingPurchase | null {
  try {
    const raw = window.localStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(PENDING_PURCHASE_KEY);
    const parsed = JSON.parse(raw) as PendingPurchase & { savedAt?: number };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > PENDING_PURCHASE_TTL_MS) return null;
    if (!Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Fires the client-side Purchase pixel + GA4 `purchase` event. Call
 * `sendServerPurchaseEvent` alongside this with the SAME `eventId` so Meta
 * can dedupe the browser pixel against the server-side Conversions API copy.
 */
export function trackPurchase(
  orderId: string,
  products: TrackedProduct[],
  totalValue: number,
  eventId: string = generateEventId(),
): string {
  trackBoth(
    "Purchase",
    "purchase",
    { ...checkoutFbParams(products, totalValue), order_id: orderId },
    {
      ecommerce: {
        transaction_id: orderId,
        currency: "BDT",
        value: totalValue,
        items: checkoutGaItems(products),
      },
    },
    eventId,
  );
  return eventId;
}

export interface ServerPurchaseInput {
  eventId: string;
  orderId: string;
  value: number;
  products?: { id: string; quantity?: number }[];
  currency?: string;
}

/**
 * Reports a confirmed Purchase to our OWN backend (/api/analytics/purchase),
 * which relays it to Meta's Conversions API server-side — the access token
 * never reaches the browser. Covers the two cases this frontend can observe:
 * COD/pay-at-store confirmation, and a gateway (bKash/SSLCommerz) customer
 * who returns to our payment-result page after a successful verify.
 *
 * It does NOT cover a gateway customer who never returns to the site —
 * only the payment gateway's own webhook to the real backend can see that;
 * see docs/tracking-backend-requirements.txt for that remaining piece.
 *
 * Fire-and-forget: a tracking failure must never affect checkout/order UI.
 */
export function sendServerPurchaseEvent(input: ServerPurchaseInput): void {
  if (typeof window === "undefined") return;
  fetch("/api/analytics/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      eventSourceUrl: window.location.href,
      fbp: readTrackingCookie("_fbp") || undefined,
      fbc: readTrackingCookie("_fbc") || undefined,
    }),
    keepalive: true,
  }).catch(() => {});
}
