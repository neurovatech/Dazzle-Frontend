/**
 * sortInStockFirst
 *
 * Stable sort: in-stock products first, out-of-stock last.
 * isTba = true  → out of stock (goes to the end)
 * isTba = false → in stock    (stays at front)
 *
 * Works on any array that has an `isTba` boolean field.
 * Does NOT mutate the original array (returns a new array).
 * SSR-safe — pure function, no browser APIs.
 */
export function sortInStockFirst<T extends { isTba: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.isTba === b.isTba) return 0; // preserve original order within same group
    return a.isTba ? 1 : -1;          // in-stock (isTba=false) comes first
  });
}

/**
 * sortInStockFirstByField
 *
 * Same as sortInStockFirst but for arrays where the stock field
 * is `inStock: boolean` (true = in stock) instead of `isTba`.
 */
export function sortInStockFirstByField<T extends { inStock: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.inStock === b.inStock) return 0;
    return a.inStock ? -1 : 1; // inStock=true comes first
  });
}
