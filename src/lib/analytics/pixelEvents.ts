"use client";

/**
 * Thin, safe wrappers around window.fbq (Facebook Pixel) and window.dataLayer
 * (Google Tag Manager / GA4), plus the ecommerce event helpers used at every
 * add-to-cart / checkout / purchase call site across the app.
 *
 * Every helper no-ops when the underlying script hasn't loaded (pixel not
 * configured, ad-blocker, or still mid-load) instead of throwing — tracking
 * must never be able to break a real user action like adding to cart.
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

export function fbTrack(
  eventName: string,
  params: Record<string, unknown> = {},
  eventId?: string,
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) {
    window.fbq("track", eventName, params, { eventID: eventId });
  } else {
    window.fbq("track", eventName);
  }
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

export function trackInitiateCheckout(products: TrackedProduct[], totalValue: number): string {
  const eventId = generateEventId();
  trackBoth(
    "InitiateCheckout",
    "begin_checkout",
    {
      content_ids: products.map((p) => p.id),
      contents: products.map((p) => ({ id: p.id, quantity: p.quantity ?? 1 })),
      num_items: products.reduce((n, p) => n + (p.quantity ?? 1), 0),
      value: totalValue,
      currency: "BDT",
    },
    {
      ecommerce: {
        currency: "BDT",
        value: totalValue,
        items: products.map((p) => ({ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 })),
      },
    },
    eventId,
  );
  return eventId;
}

/**
 * Fires the client-side Purchase pixel + GA4 `purchase` event for orders
 * that confirm immediately in this tab (cash-on-delivery, pay-at-store).
 *
 * Orders paid through an external gateway (bKash/SSLCommerz) redirect the
 * browser away before we know the payment actually succeeded, so THIS call
 * never fires for them — see `docs/tracking-backend-requirements.txt` for
 * why those must be tracked server-side, from the gateway's own webhook,
 * with this same event_id so Conversions API can still dedupe against
 * whatever residual client-side signal (if any) reaches Meta.
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
    {
      content_ids: products.map((p) => p.id),
      contents: products.map((p) => ({ id: p.id, quantity: p.quantity ?? 1 })),
      value: totalValue,
      currency: "BDT",
    },
    {
      ecommerce: {
        transaction_id: orderId,
        currency: "BDT",
        value: totalValue,
        items: products.map((p) => ({ item_id: p.id, item_name: p.name, price: p.price, quantity: p.quantity ?? 1 })),
      },
    },
    eventId,
  );
  return eventId;
}
