import { NextRequest, NextResponse } from "next/server";
import { sendPurchaseEvent, type ConversionProduct } from "@/lib/analytics/metaConversionsApi";

// Fires a real Meta API call and must never be statically cached.
export const dynamic = "force-dynamic";

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
