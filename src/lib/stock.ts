/**
 * Live stock status for product cards.
 *
 * The product list endpoint (`GET /products?...`) only computes a real
 * `stockStatus` ("In Stock" / "Out of Stock") when the request carries
 * `stockAssort=1`. WITHOUT that param the backend still returns the field, but
 * it is a placeholder: measured live, every product comes back as
 * "Out of Stock". So the two halves must always travel together — every
 * /products call goes through withStockAssort(), and a card only trusts
 * `stockStatus` it was explicitly handed from such a call.
 */
const PARAM = "stockAssort";

/**
 * Makes sure a /products URL carries `stockAssort=1` EXACTLY ONCE.
 *
 * "Exactly once" matters: verified live, a URL with the param twice
 * (`...&stockAssort=1&...&stockAssort=1`) makes the backend return an EMPTY,
 * non-JSON body — the page then shows no products at all. Any existing copy
 * (typed by hand in a URL string, or added through URLSearchParams) is removed
 * first, so combining this with other code that also adds it can never
 * duplicate it. Other params and their order are left untouched.
 */
export function withStockAssort(url: string): string {
  const cleaned = url
    .replace(new RegExp(`([?&])${PARAM}=[^&#]*`, "g"), "$1")
    .replace(/\?&+/, "?")
    .replace(/&{2,}/g, "&")
    .replace(/[?&]+$/, "");
  return `${cleaned}${cleaned.includes("?") ? "&" : "?"}${PARAM}=1`;
}

export type StockState = "in" | "out";

/**
 * Maps the backend's `stockStatus` text to a state. Returns undefined for a
 * missing/unrecognised value so the card falls back to its previous
 * behaviour instead of guessing.
 */
export function stockStateOf(status?: string | null): StockState | undefined {
  if (!status) return undefined;
  const s = status.trim().toLowerCase();
  if (s === "in stock") return "in";
  if (s === "out of stock") return "out";
  return undefined;
}
