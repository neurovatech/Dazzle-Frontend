import { NextRequest, NextResponse } from "next/server";
import { sendPurchaseEvent, type ConversionProduct } from "@/lib/analytics/metaConversionsApi";
import { isProductionHostname } from "@/lib/analytics/environment";

// Fires a real Meta API call and must never be statically cached.
export const dynamic = "force-dynamic";

// Best-effort, single-process idempotency guard: refuses a second Purchase
// relay for an event_id already sent from THIS server instance recently. This
// is NOT a substitute for real idempotency (a server restart, or a request
// landing on a different instance behind the load balancer, both forget it) —
// true idempotency needs a persistent store keyed by order/event id, which
// belongs on the backend that owns order state (see
// docs/meta-tracking-frontend-audit.txt). This only narrows the window for
// the same browser tab re-sending the same eventId quickly (a double-click, a
// retried fetch) before its own client-side guard in pixelEvents.ts persists.
const recentlySentEventIds = new Map<string, number>();
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

function alreadySentRecently(eventId: string): boolean {
  const now = Date.now();
  for (const [id, sentAt] of recentlySentEventIds) {
    if (now - sentAt > DEDUPE_WINDOW_MS) recentlySentEventIds.delete(id);
  }
  return recentlySentEventIds.has(eventId);
}

interface PurchaseTrackPayload {
  eventId?: string;
  orderId?: string;
  value?: number;
  products?: ConversionProduct[];
  currency?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Client-facing endpoint for reporting a confirmed Purchase so the server
 * can relay it to Meta's Conversions API — the access token stays here,
 * server-side, and is never sent to the browser. See metaConversionsApi.ts
 * for what this does and does not cover.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as PurchaseTrackPayload | null;

  if (!body?.eventId || !body?.orderId || typeof body.value !== "number") {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }

  // Production-only guard (Meta tracking migration handoff): "Tracking must
  // fire only on the production/live domain." Unlike the browser-side
  // trackers (see src/lib/analytics/environment.ts), a Route Handler is
  // already dynamic/per-request, so the REAL incoming Host header can be
  // checked directly here — reliable regardless of which build/domain called
  // this endpoint. Never surfaced as an error: the caller (checkout/
  // payment-result page) must not break because tracking was skipped.
  const requestHost = request.headers.get("host")?.split(":")[0] ?? null;
  if (!isProductionHostname(requestHost)) {
    console.warn(`[MetaCAPI] Purchase skipped: non-production host "${requestHost}".`);
    return NextResponse.json({ ok: true, skipped: "non-production-host" });
  }

  if (alreadySentRecently(body.eventId)) {
    console.warn(`[MetaCAPI] Purchase skipped: event_id "${body.eventId}" already relayed recently.`);
    return NextResponse.json({ ok: true, skipped: "duplicate-event-id" });
  }
  recentlySentEventIds.set(body.eventId, Date.now());

  const clientIpAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  // Fire-and-forget from the caller's perspective, but awaited here so any
  // rejection is logged server-side instead of becoming an unhandled
  // rejection once this request finishes.
  await sendPurchaseEvent({
    eventId: body.eventId,
    orderId: body.orderId,
    value: body.value,
    products: body.products,
    currency: body.currency,
    eventSourceUrl: body.eventSourceUrl,
    clientIpAddress,
    clientUserAgent: request.headers.get("user-agent"),
    fbp: body.fbp,
    fbc: body.fbc,
  });

  // Always 200 — a tracking outcome must never surface as a checkout error.
  return NextResponse.json({ ok: true });
}
