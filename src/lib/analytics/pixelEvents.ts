"use client";

import { readTrackingCookie } from "./clickIds";

/**
 * Thin, safe wrappers around window.fbq (Facebook Pixel) and window.gtag
 * (GA4, loaded directly — no Google Tag Manager, see
 * docs/meta-tracking-frontend-audit.txt), plus the ecommerce event helpers
 * used at every add-to-cart / checkout / purchase call site across the app.
 *
 * Every helper is safe when the underlying script is missing (pixel not
 * configured, ad-blocker, non-production hostname — see ./environment.ts) —
 * it never throws, tracking must never break a real user action like adding
 * to cart. fbTrack additionally queues events raised while the Pixel is
 * still loading and flushes them once it's ready.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
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

/**
 * Fires a GA4 event via the DIRECT gtag.js loaded in GoogleAnalytics.tsx.
 *
 * Renamed/repurposed from the old `pushDataLayer(event, params)`, which
 * pushed a Google-Tag-Manager-shaped object (`{event: "add_to_cart", ...}`)
 * onto `window.dataLayer` — that format is GTM's own custom-event/trigger
 * convention and is NOT understood by gtag.js on its own. Now that GTM has
 * been removed, `window.gtag('event', name, params)` is what actually
 * reaches GA4; calling it directly instead of shaping a dataLayer object is
 * also what lets `params` be flat (currency/value/items at the top level,
 * as GA4's own ecommerce events expect) instead of wrapped in `{ecommerce}`.
 */
export function gaTrack(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", eventName, params);
}

interface PendingFbCall {
  eventName: string;
  params: Record<string, unknown>;
  eventId?: string;
  /** Meta standard events (Purchase, AddToCart, Lead, ...) use fbq("track", ...);
   *  events with no Meta standard equivalent (RemoveFromCart, CouponApplied, ...)
   *  must use fbq("trackCustom", ...) instead — Meta silently drops/mis-buckets
   *  an unrecognized name sent via "track". */
  method: "track" | "trackCustom";
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
    window.fbq?.(call.method, call.eventName, call.params, { eventID: call.eventId });
  } else {
    window.fbq?.(call.method, call.eventName);
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
  fbTrackWithMethod("track", eventName, params, eventId);
}

/**
 * Same as fbTrack(), for an event that has NO Meta standard-event name
 * (RemoveFromCart, CouponApplied, PaymentMethodSelected, PaymentFailed, ...).
 * Meta requires these to go through fbq("trackCustom", ...) — sending a
 * non-standard name via "track" gets silently mis-bucketed in Events Manager.
 */
export function fbTrackCustom(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string,
): void {
  fbTrackWithMethod("trackCustom", eventName, params, eventId);
}

function fbTrackWithMethod(
  method: "track" | "trackCustom",
  eventName: string,
  params: Record<string, unknown>,
  eventId?: string,
): void {
  if (typeof window === "undefined") return;
  const call: PendingFbCall = { eventName, params, eventId, method };

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
 * Fires the matching Facebook Pixel event AND the equivalent GA4 ecommerce
 * event (via gtag() directly — see gaTrack()) for one logical action,
 * sharing one event_id between the pixel call and whatever the caller
 * forwards to the backend for Conversions API dedup (see the individual
 * track* helpers below).
 */
function trackBoth(
  fbEventName: string,
  gaEventName: string,
  fbParams: Record<string, unknown>,
  gaParams: Record<string, unknown>,
  eventId: string,
): void {
  fbTrack(fbEventName, fbParams, eventId);
  gaTrack(gaEventName, { ...gaParams, event_id: eventId });
}

/** Same as trackBoth(), for a Meta event with no standard-event name — see
 *  fbTrackCustom(). */
function trackBothCustom(
  fbEventName: string,
  gaEventName: string,
  fbParams: Record<string, unknown>,
  gaParams: Record<string, unknown>,
  eventId: string,
): void {
  fbTrackCustom(fbEventName, fbParams, eventId);
  gaTrack(gaEventName, { ...gaParams, event_id: eventId });
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
      currency: "BDT",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, item_brand: product.brand, item_category: product.category }],
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
      currency: "BDT",
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, price: product.price }],
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
      currency: "BDT",
      value: product.price * quantity,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
    },
    eventId,
  );
  return eventId;
}

/**
 * Fired when a line item is removed from the cart (CartItem.tsx's remove
 * button). No Meta standard event exists for this — sent as a custom event
 * (fbTrackCustom) — but GA4 has a standard `remove_from_cart` ecommerce
 * event, so the GA4 side still uses the ordinary name.
 */
export function trackRemoveFromCart(product: TrackedProduct): string {
  const eventId = generateEventId();
  const quantity = product.quantity ?? 1;
  trackBothCustom(
    "RemoveFromCart",
    "remove_from_cart",
    {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price * quantity,
      currency: "BDT",
      contents: [{ id: product.id, quantity }],
    },
    {
      currency: "BDT",
      value: product.price * quantity,
      items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity }],
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

/**
 * Fired once when the cart page is viewed (src/components/Cart/CartPageCom.tsx
 * mount) — not on every cart mutation. No Meta standard event exists for this
 * ("CartView" is a custom name); GA4 has a standard `view_cart` event.
 */
export function trackCartView(products: TrackedProduct[]): void {
  const eventId = generateEventId();
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.quantity ?? 1), 0);
  trackBothCustom(
    "CartView",
    "view_cart",
    { ...checkoutFbParams(products, totalValue) },
    { currency: "BDT", value: totalValue, items: checkoutGaItems(products) },
    eventId,
  );
}

/**
 * Fired once the checkout page's delivery address/method has been
 * successfully saved (src/components/Cart/CheckoutPageCom.tsx, right after
 * saveNewAddressToBook() succeeds, for every payment path). No Meta standard
 * event exists for this; GA4's matching standard event is `add_shipping_info`.
 */
export function trackShippingInfoSubmitted(products: TrackedProduct[], totalValue: number): void {
  const eventId = generateEventId();
  trackBothCustom(
    "ShippingInfoSubmitted",
    "add_shipping_info",
    checkoutFbParams(products, totalValue),
    { currency: "BDT", value: totalValue, items: checkoutGaItems(products) },
    eventId,
  );
}

export function trackInitiateCheckout(products: TrackedProduct[], totalValue: number): string {
  const eventId = generateEventId();
  trackBoth(
    "InitiateCheckout",
    "begin_checkout",
    checkoutFbParams(products, totalValue),
    { currency: "BDT", value: totalValue, items: checkoutGaItems(products) },
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
      currency: "BDT",
      value: totalValue,
      payment_type: paymentType,
      items: checkoutGaItems(products),
    },
    eventId,
  );
  return eventId;
}

/**
 * Fired when the buyer picks/changes a payment method radio (bKash / SSLCommerz
 * / Cash on Delivery / Pay at Store) on the checkout page — BEFORE they confirm
 * the order (that moment is trackAddPaymentInfo, above). No Meta standard event
 * exists for this, so it goes through fbTrackCustom.
 */
export function trackPaymentMethodSelected(paymentType: string): void {
  const eventId = generateEventId();
  trackBothCustom(
    "PaymentMethodSelected",
    "payment_method_selected",
    { payment_type: paymentType },
    { payment_type: paymentType },
    eventId,
  );
}

/**
 * Fired when a payment attempt fails — either the gateway itself rejects it
 * (bkash-pay/sslcommerz-pay/execute-order returning an error) or the customer
 * is redirected back from bKash/SSLCommerz with a failure/cancel status. No
 * Meta standard event exists for this.
 */
export function trackPaymentFailed(paymentType: string, reason?: string): void {
  const eventId = generateEventId();
  trackBothCustom(
    "PaymentFailed",
    "payment_failed",
    { payment_type: paymentType, ...(reason ? { failure_reason: reason.slice(0, 200) } : {}) },
    { payment_type: paymentType, ...(reason ? { failure_reason: reason.slice(0, 200) } : {}) },
    eventId,
  );
}

/**
 * Coupon applied/removed on the checkout page. No Meta standard event exists
 * for either.
 */
export function trackCouponApplied(couponCode: string, discountValue: number): void {
  const eventId = generateEventId();
  trackBothCustom(
    "CouponApplied",
    "coupon_applied",
    { coupon: couponCode, value: discountValue, currency: "BDT" },
    { coupon: couponCode, value: discountValue, currency: "BDT" },
    eventId,
  );
}

export function trackCouponRemoved(couponCode: string): void {
  const eventId = generateEventId();
  trackBothCustom(
    "CouponRemoved",
    "coupon_removed",
    { coupon: couponCode },
    { coupon: couponCode },
    eventId,
  );
}

/**
 * Contact form successfully submitted (this site's /feedback page is its
 * general-purpose contact form). Meta standard event.
 */
export function trackContact(): void {
  const eventId = generateEventId();
  trackBoth("Contact", "contact", {}, {}, eventId);
}

/**
 * A lead successfully recorded (this site's trade-in request form). Meta
 * standard event; GA4's matching standard event is `generate_lead`.
 */
export function trackLead(leadType: string): void {
  const eventId = generateEventId();
  trackBoth(
    "Lead",
    "generate_lead",
    { content_name: leadType },
    { lead_source: leadType },
    eventId,
  );
}

/**
 * Account registration fully completed — fired once the customer verifies
 * their email (see src/app/(public)/verify-email-token/[emailVerifiedToken]/
 * page.tsx), not at the initial sign-up form submit: this site requires email
 * verification before the account is actually usable, and the verify-email
 * endpoint itself is naturally idempotent (a re-visited/reloaded verification
 * link returns "already verified" instead of "success" the second time), so
 * this never fires twice for the same account. Meta standard event; GA4's
 * matching standard event is `sign_up`.
 */
export function trackCompleteRegistration(): void {
  const eventId = generateEventId();
  trackBoth("CompleteRegistration", "sign_up", { status: true }, {}, eventId);
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

// ─── Purchase idempotency ───────────────────────────────────────────────────
// Requirement (Meta tracking migration handoff): "Do not create a Purchase
// every time the thank-you page renders" / "Refreshing confirmation page
// does not create a new Purchase." Reloading the bKash/SSLCommerz
// payment-result page used to do exactly that: the parked order (see
// savePendingPurchase/takePendingPurchase above) is consumed — and therefore
// gone — after the first read, so a reload fell through to
// `eventId = generateEventId()` and fired a SECOND Purchase with a brand-new
// event_id (both the browser pixel and the server CAPI relay), which Meta has
// no way to deduplicate against the first. Guarding per orderId (persisted,
// not consumed) makes a reload a no-op regardless of whether the pending
// record is still around.
const FIRED_PURCHASE_PREFIX = "dazzle-purchase-fired:";

function purchaseEventIdFor(orderId: string): string {
  // Deterministic, not random: even if this guard is ever bypassed (private
  // browsing with storage blocked, a second tab), the same order always maps
  // to the same event_id, so Meta can still dedupe the two attempts.
  return `purchase_${orderId}`;
}

function hasFiredPurchase(orderId: string): boolean {
  try {
    return window.localStorage.getItem(FIRED_PURCHASE_PREFIX + orderId) === "1";
  } catch {
    return false;
  }
}

function markPurchaseFired(orderId: string): void {
  try {
    window.localStorage.setItem(FIRED_PURCHASE_PREFIX + orderId, "1");
  } catch {}
}

/**
 * Fires the client-side Purchase pixel + GA4 `purchase` event — at most ONCE
 * per `orderId`, ever (see the idempotency note above). Call
 * `sendServerPurchaseEvent` alongside this with the SAME `eventId` so Meta
 * can dedupe the browser pixel against the server-side Conversions API copy.
 *
 * Returns the event_id that was (or would have been) used, or `null` if this
 * order's Purchase was already fired earlier — callers must skip
 * `sendServerPurchaseEvent` in that case too.
 */
export function trackPurchase(
  orderId: string,
  products: TrackedProduct[],
  totalValue: number,
  eventId: string = purchaseEventIdFor(orderId),
): string | null {
  if (hasFiredPurchase(orderId)) return null;
  markPurchaseFired(orderId);

  trackBoth(
    "Purchase",
    "purchase",
    { ...checkoutFbParams(products, totalValue), order_id: orderId },
    {
      transaction_id: orderId,
      currency: "BDT",
      value: totalValue,
      items: checkoutGaItems(products),
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
