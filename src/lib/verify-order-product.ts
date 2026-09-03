import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

/**
 * Pre-checkout validation for cart lines.
 *
 * A cart lives in localStorage indefinitely, so by the time someone checks out
 * a variant may have been retired, re-keyed, or never stored properly in the
 * first place. POST verify-order-product is the backend's own check; when it
 * rejects a line, get-default-variant returns the variant that should be used
 * instead, and the caller writes that back into the cart before redirecting.
 *
 * A line that STILL fails after that recovery attempt is a real problem — the
 * product itself, not just its variant, is gone or invalid — so it must block
 * the redirect rather than let the user reach a checkout page that will only
 * fail again at order creation.
 */

/** Verify endpoint lives under a different prefix from the rest of the API. */
const VERIFY_PATH = "/api/tokenized/v1/verify-order-product";

export interface VerifiableItem {
  /** Cart line id — used to address the line when patching it back. */
  id: string;
  productUuid?: string;
  variantUuid?: string;
  accessoriesUuid?: string;
  name?: string;
}

export interface VerifiedItem {
  id: string;
  /** Verified as-is, or replaced via get-default-variant. */
  variantUuid: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  isTba?: boolean;
  /** True when the original variant was rejected and a replacement was found. */
  replaced: boolean;
}

export interface UnresolvedItem extends VerifiableItem {
  /**
   * What the backend actually said, e.g. "variantUuid is invalid." from
   * verify-order-product's `errors` array, or its top-level `message` when
   * there is no field-level detail. Falls back to a generic line only when
   * neither is available (e.g. the request never reached the server).
   */
  reason: string;
}

export interface VerifyResult {
  /** Lines whose variant changed — feed these to patchResolvedVariant. */
  patches: VerifiedItem[];
  /**
   * Lines that failed verification AND could not be recovered via
   * get-default-variant. Callers must NOT redirect to checkout while this is
   * non-empty — show `reason` to the user instead.
   */
  unresolved: UnresolvedItem[];
}

interface DefaultVariantResponse {
  statusCode: number;
  status: string;
  data?: {
    productUUID: string;
    variantUUID: string;
    regularPrice: number;
    offerPrice: number;
    thumbnailURL: string;
    isTba: boolean;
  };
}

/** Pulls the human-readable reason out of a failed verify-order-product call. */
function reasonFromError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors.length > 0) return err.errors.join(" ");
    if (err.payload.message) return err.payload.message;
  }
  return "Could not be verified.";
}

/**
 * Ask the backend whether one line is orderable.
 *
 * Returns the parsed reason on rejection instead of a bare boolean, so a line
 * that recovery cannot fix still reports the API's own words rather than a
 * made-up one.
 */
async function checkOrderable(
  item: VerifiableItem,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!item.productUuid || !item.variantUuid) {
    return { ok: false, reason: "Missing product information." };
  }
  try {
    const res = await api.post<{ statusCode: number; status: string }>(
      VERIFY_PATH,
      {
        productUuid: item.productUuid,
        variantUuid: item.variantUuid,
        // Only sent when present — the field is optional and the endpoint
        // validates it when it is there.
        ...(item.accessoriesUuid
          ? { accessoriesUuid: item.accessoriesUuid }
          : {}),
      },
    );
    if (res?.statusCode === 200 || res?.status === "success") return { ok: true };
    return { ok: false, reason: "Could not be verified." };
  } catch (err) {
    return { ok: false, reason: reasonFromError(err) };
  }
}

/** Fetch the variant the catalogue currently considers default for a product. */
async function fetchDefaultVariant(productUuid: string) {
  try {
    const res = await api.get<DefaultVariantResponse>(
      `/get-default-variant/${productUuid.trim()}?priceSort=0&userDefine=1`,
    );
    return res?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Verify every line, recovering the ones the backend rejects.
 *
 * Lines are checked in parallel: a cart of ten would otherwise mean ten
 * sequential round-trips before the user sees the checkout page.
 */
export async function verifyOrderProducts(
  items: VerifiableItem[],
): Promise<VerifyResult> {
  const patches: VerifiedItem[] = [];
  const unresolved: UnresolvedItem[] = [];

  await Promise.all(
    items.map(async (item) => {
      const result = await checkOrderable(item);
      if (result.ok) return;

      // Rejected — ask for the replacement variant before giving up on the line.
      const fresh = item.productUuid
        ? await fetchDefaultVariant(item.productUuid)
        : null;

      if (!fresh?.variantUUID) {
        unresolved.push({ ...item, reason: result.reason });
        return;
      }

      patches.push({
        id: item.id,
        variantUuid: fresh.variantUUID,
        price: fresh.offerPrice,
        originalPrice: fresh.regularPrice,
        image: fresh.thumbnailURL || undefined,
        isTba: fresh.isTba,
        replaced: fresh.variantUUID !== item.variantUuid,
      });
    }),
  );

  return { patches, unresolved };
}

/** Single-line convenience for the BUY NOW buttons. */
export async function verifyOrderProduct(
  item: VerifiableItem,
): Promise<VerifyResult> {
  return verifyOrderProducts([item]);
}
