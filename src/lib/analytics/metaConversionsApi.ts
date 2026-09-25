import { createHash } from "crypto";

const GRAPH_API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface ConversionProduct {
  id: string;
  quantity?: number;
}

export interface SendPurchaseEventInput {
  eventId: string;
  orderId: string;
  value: number;
  products?: ConversionProduct[];
  currency?: string;
  eventSourceUrl?: string;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  email?: string | null;
  phone?: string | null;
}

/**
 * Fires a server-side "Purchase" event to Meta's Conversions API.
 *
 * This covers only the two cases this Next.js app can actually observe:
 *   - COD/pay-at-store orders, right after checkout confirms.
 *   - bKash/SSLCommerz orders, once the customer's browser returns to our
 *     own payment-result page and verify confirms success.
 *
 * It does NOT cover a customer who pays via bKash/SSLCommerz and never
 * returns to the site (closes the tab, abandons the gateway page) — only
 * the payment gateway's own webhook to the real backend
 * (apix.bigpoint.com.bd) can see that outcome. See
 * docs/tracking-backend-requirements.txt for that remaining piece, which
 * still belongs on the backend.
 *
 * Never throws — a tracking failure must never surface to the buyer or
 * break the checkout/order-result flow that calls this.
 */
export async function sendPurchaseEvent(input: SendPurchaseEventInput): Promise<void> {
  // Server-only secret — must come from the environment (.env.local locally,
  // the host's env config in production), NEVER hardcoded here. A previous
  // version of this file had the real token as a fallback literal, which got
  // committed to git — see the token-rotation note in .env.local.
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_CAPI_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!accessToken || !pixelId) {
    // Silent return made "server events aren't arriving in Meta" impossible to
    // diagnose — say so in the server log instead.
    console.warn(
      "[MetaCAPI] Purchase NOT sent: META_CAPI_ACCESS_TOKEN / META_CAPI_PIXEL_ID is not set on this server.",
    );
    return;
  }

  try {
    const userData: Record<string, unknown> = {};
    if (input.clientIpAddress) userData.client_ip_address = input.clientIpAddress;
    if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;
    if (input.fbp) userData.fbp = input.fbp;
    if (input.fbc) userData.fbc = input.fbc;
    if (input.email) userData.em = [sha256(input.email)];
    if (input.phone) userData.ph = [sha256(input.phone.replace(/\D/g, ""))];

    // Meta Events Manager → Conversions API → "Test Events" tab gives a
    // test_event_code so events can be verified live without counting
    // toward real ad-account data. Set META_CAPI_TEST_EVENT_CODE only while
    // testing and remove it once verified — see
    // docs/tracking-backend-requirements.txt.
    const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          event_source_url: input.eventSourceUrl,
          action_source: "website",
          user_data: userData,
          custom_data: {
            currency: input.currency || "BDT",
            value: input.value,
            content_type: "product",
            content_ids: input.products?.map((p) => p.id) ?? [],
            contents: input.products?.map((p) => ({ id: p.id, quantity: p.quantity ?? 1 })) ?? [],
            order_id: input.orderId,
          },
        },
      ],
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    };

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (!res.ok) {
      console.error("[MetaCAPI] Purchase event rejected:", res.status, await res.text());
    }
  } catch (error) {
    console.error("[MetaCAPI] Purchase event failed:", error);
  }
}
