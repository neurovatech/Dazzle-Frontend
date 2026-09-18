"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ThumbnailItem {
  mediaFileUrl?: string;
  mediafileUrl?: string;
  mediaFile?: string;
}
interface ProductLookupData {
  productUuid: string;
  productName: string;
  productSlug: string;
  thumbnails?: ThumbnailItem[];
  thumbnailImg?: string;
  regularPrice?: number;
  discountedPrice?: number;
}

function formatPrice(value: number): string {
  return `৳${value.toLocaleString("en-BD")}`;
}
interface ProductLookupResponse {
  statusCode: number;
  status: string;
  found: boolean;
  data: ProductLookupData;
}

// ── Grouped specification sheet (/product-specification/{productUuid}) ──
interface ProductSpecification {
  specUuid: string;
  specification: string;
  specificationValue: string;
}
interface SpecGroup {
  specGroupUuid: string;
  groupName: string;
  groupSlug: string;
  productSpecifications: ProductSpecification[];
}
interface SpecResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: SpecGroup[];
}

// ── Keyword search (/product/search) — same endpoint used by the header search ──
interface SearchDocument {
  id: string;
  productName: string;
  productSlug: string;
  thumbnailsUrl: string;
}
interface SearchHit {
  document: SearchDocument;
}
interface SearchApiResponse {
  found: number;
  hits: SearchHit[];
}

const STORAGE_KEY = "dazzle-product-compare-slugs";
const MAX_PRODUCTS = 6;

function loadStoredSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveStoredSlugs(slugs: string[]) {
  try {
    if (slugs.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

function getThumbnail(data?: ProductLookupData): string {
  if (!data) return "";
  if (data.thumbnailImg) return data.thumbnailImg;
  const first = data.thumbnails?.[0];
  return first?.mediaFileUrl || first?.mediafileUrl || first?.mediaFile || "";
}

interface PickedProduct {
  slug: string;
  name: string;
  image: string;
}

// ── Search-as-you-type input for the trailing "add product" slot ────────────
function ProductSearchInput({
  placeholder,
  onSelect,
  excludeSlugs,
}: {
  placeholder: string;
  onSelect: (product: PickedProduct) => void;
  excludeSlugs: string[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const searchQuery = useQuery<SearchApiResponse>({
    queryKey: ["product-compare-search", query],
    queryFn: () =>
      api.get<SearchApiResponse>(
        `/product/search?keyword=${encodeURIComponent(query)}&page=1&perPage=10`
      ),
    enabled: query.trim().length > 1,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = (searchQuery.data?.hits ?? []).filter(
    (h) => !excludeSlugs.includes(h.document.productSlug)
  );
  const showDropdown = open && query.trim().length > 1;

  return (
    <div ref={ref} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#25221F] placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D4A97A] focus:border-transparent transition"
      />
      {showDropdown && (
        <ul className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-[#25221F] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {searchQuery.isLoading && (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">Searching...</li>
          )}
          {!searchQuery.isLoading && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">No products found</li>
          )}
          {results.map((h) => (
            <li
              key={h.document.id}
              onMouseDown={() => {
                onSelect({
                  slug: h.document.productSlug,
                  name: h.document.productName,
                  image: h.document.thumbnailsUrl,
                });
                setQuery("");
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#D4A97A]/10 dark:hover:bg-[#D4A97A]/10 hover:text-[#b8864e] dark:hover:text-[#D4A97A] cursor-pointer transition-colors"
            >
              <img
                src={h.document.thumbnailsUrl || "/images/no_images.png"}
                alt=""
                className="w-8 h-8 object-contain rounded shrink-0 bg-white"
              />
              <span className="truncate">{h.document.productName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ResolvedSlot {
  slug: string;
  loading: boolean;
  notFound: boolean;
  product?: ProductLookupData;
}

// ── One filled header column: product card with a remove (×) button ─────────
// Closing this is the only thing that drops the product from the (persisted)
// comparison — a reload alone keeps it.
function FilledSlot({ slot, onRemove }: { slot: ResolvedSlot; onRemove: () => void }) {
  if (slot.loading) {
    return (
      <div className="p-3 sm:p-4 flex items-center gap-3">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (slot.notFound || !slot.product) {
    return (
      <div className="p-3 sm:p-4 flex items-center gap-3">
        <p className="flex-1 text-xs text-red-500 dark:text-red-400">Product not found.</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  const { regularPrice, discountedPrice } = slot.product;
  const hasSpecialPrice =
    typeof discountedPrice === "number" &&
    discountedPrice > 0 &&
    typeof regularPrice === "number" &&
    discountedPrice < regularPrice;

  return (
    <div className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
      <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#2D2A26] flex items-center justify-center overflow-hidden">
        <img
          src={getThumbnail(slot.product) || "/images/no_images.png"}
          alt={slot.product.productName}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
          {slot.product.productName}
        </p>
        {typeof regularPrice === "number" && regularPrice > 0 && (
          <p className="mt-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
            Regular Price{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {formatPrice(regularPrice)}
            </span>
          </p>
        )}
        {hasSpecialPrice && (
          <p className="text-[11px] sm:text-xs font-semibold text-[#B57908] dark:text-[#D4A97A]">
            Special Price <span>{formatPrice(discountedPrice)}</span>
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from comparison"
        className="shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ProductCompareDetailsProps {
  /** Adds/pre-fills a product — set when arriving from a product's Compare button (/product-compare/[slug]). */
  slug?: string;
}

export default function ProductCompareDetails({ slug }: ProductCompareDetailsProps) {
  const [slugs, setSlugs] = useState<string[]>(() => (slug ? [slug] : []));
  const [hydrated, setHydrated] = useState(false);

  // localStorage isn't reachable during the first client render, so whatever
  // the user had already added is merged in right after mount — this is what
  // makes the comparison survive a reload.
  useEffect(() => {
    const stored = loadStoredSlugs();
    setSlugs((prev) => {
      const merged = [...stored];
      if (slug && !merged.includes(slug)) merged.push(slug);
      return merged.length > 0 ? merged.slice(0, MAX_PRODUCTS) : prev;
    });
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Adds the route's product when navigating client-side between two
  // /product-compare/[slug] pages, which reuses this component instance
  // instead of remounting it.
  const [prevSlugProp, setPrevSlugProp] = useState(slug);
  if (hydrated && slug !== prevSlugProp) {
    setPrevSlugProp(slug);
    if (slug) {
      setSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug].slice(0, MAX_PRODUCTS)));
    }
  }

  // Persisted after every change — closing a slot (×) is the only action that
  // removes a product; a reload alone keeps the list exactly as it was.
  useEffect(() => {
    if (!hydrated) return;
    saveStoredSlugs(slugs);
  }, [slugs, hydrated]);

  const addSlug = (s: string) =>
    setSlugs((prev) => (prev.includes(s) ? prev : [...prev, s].slice(0, MAX_PRODUCTS)));
  const removeSlug = (s: string) => setSlugs((prev) => prev.filter((x) => x !== s));

  const lookupQueries = useQueries({
    queries: slugs.map((s) => ({
      queryKey: ["product-compare-lookup", s],
      queryFn: () => api.get<ProductLookupResponse>(`/product/${s}`),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const slots: ResolvedSlot[] = slugs.map((s, i) => {
    const q = lookupQueries[i];
    return {
      slug: s,
      loading: q.isLoading,
      notFound: q.isFetched && !q.data?.found,
      product: q.data?.found ? q.data.data : undefined,
    };
  });

  const specQueries = useQueries({
    queries: slots.map((slot) => ({
      queryKey: ["product-compare-specs", slot.product?.productUuid ?? null],
      queryFn: () => api.get<SpecResponse>(`/product-specification/${slot.product?.productUuid}`),
      enabled: !!slot.product?.productUuid,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const anyLoadingProducts = slots.some((s) => s.loading);
  const anyResolved = slots.some((s) => !!s.product);
  const specsLoading = anyResolved && specQueries.some((q) => !!q.isLoading);
  const specsUpdatedKey = specQueries.map((q) => q.dataUpdatedAt).join(",");

  // Groups/rows are the union across every resolved product, in the order
  // each group/spec label first appears — a product missing a group, or
  // using differently-worded spec labels, just shows "—" in its column
  // rather than the row disappearing for everyone else.
  const groups = useMemo(() => {
    type Row = { label: string; values: (string | null)[] };
    type Group = { groupSlug: string; groupName: string; rows: Row[] };
    const order: string[] = [];
    const map = new Map<string, Group>();

    specQueries.forEach((q, colIdx) => {
      (q.data?.data ?? []).forEach((g) => {
        let group = map.get(g.groupSlug);
        if (!group) {
          group = { groupSlug: g.groupSlug, groupName: g.groupName, rows: [] };
          map.set(g.groupSlug, group);
          order.push(g.groupSlug);
        }
        g.productSpecifications.forEach((s) => {
          let row = group!.rows.find((r) => r.label === s.specification);
          if (!row) {
            row = { label: s.specification, values: new Array(slugs.length).fill(null) };
            group!.rows.push(row);
          }
          row.values[colIdx] = s.specificationValue;
        });
      });
    });

    return order.map((key) => map.get(key)!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specsUpdatedKey, slugs.length]);

  const canAddMore = slugs.length < MAX_PRODUCTS;
  const dataCols = Math.max(slugs.length + (canAddMore ? 1 : 0), 1);
  // 1fr lets columns stretch to fill the card when there's room for all of
  // them; once their 180px minimums no longer fit, the wrapper's
  // overflow-x-auto kicks in instead of squeezing them.
  const gridTemplateColumns = `160px repeat(${dataCols}, minmax(180px, 1fr))`;

  let body: ReactNode;
  if (slugs.length === 0) {
    body = (
      <div
        style={{ gridColumn: "1 / -1" }}
        className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        Search and add products above to compare their specifications.
      </div>
    );
  } else if (anyLoadingProducts && !anyResolved) {
    body = (
      <div
        style={{ gridColumn: "1 / -1" }}
        className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        Loading products…
      </div>
    );
  } else if (specsLoading) {
    body = (
      <div
        style={{ gridColumn: "1 / -1" }}
        className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        Loading specifications…
      </div>
    );
  } else if (groups.length === 0) {
    body = (
      <div
        style={{ gridColumn: "1 / -1" }}
        className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500"
      >
        No specification data available for {slugs.length === 1 ? "this product" : "these products"}.
      </div>
    );
  } else {
    body = (
      <>
        {groups.map((group) => (
          <Fragment key={group.groupSlug}>
            <div
              style={{ gridColumn: "1 / -1" }}
              className="px-4 sm:px-6 py-2 text-xs font-bold uppercase tracking-wide text-[#b8864e] dark:text-[#D4A97A] bg-gray-50 dark:bg-[#25221F] whitespace-nowrap"
            >
              {group.groupName}
            </div>
            {group.rows.map((row) => (
              <div key={row.label} className="contents group">
                <div className="py-3 px-4 sm:px-6 border-r border-b border-gray-100 dark:border-gray-800 group-hover:bg-gray-50/60 dark:group-hover:bg-[#25221F]/40 transition-colors">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {row.label}
                  </span>
                </div>
                {Array.from({ length: dataCols }).map((_, i) => (
                  <div
                    key={i}
                    className={`py-3 px-4 border-b border-gray-100 dark:border-gray-800 group-hover:bg-gray-50/60 dark:group-hover:bg-[#25221F]/40 transition-colors ${
                      i < dataCols - 1 ? "border-r" : ""
                    }`}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {i < slugs.length ? (
                        row.values[i] ?? <span className="text-gray-300 dark:text-gray-700 select-none">—</span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </Fragment>
        ))}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-start justify-center px-3 sm:px-4 py-8 sm:py-12">
      {/* min-w-0 is required on both this flex item and the card below it:
          without it, a flex child defaults to min-width:auto (its content's
          natural width) instead of shrinking to fit the viewport, so the
          wide comparison grid pushed the WHOLE PAGE into horizontal scroll
          on mobile instead of scrolling only inside the card's own
          overflow-x-auto wrapper — confirmed live on a 414px viewport. */}
      <div className="flex-col flex-1 items-center max-w-336 mx-auto lg:px-2 sm:px-0 flex min-w-0 w-full">
        <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Product Compare</h1>
          {slugs.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {slugs.length}/{MAX_PRODUCTS} products
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-w-0 w-full">
          <div className="w-full overflow-x-auto">
            <div className="grid w-full" style={{ gridTemplateColumns }}>
              {/* Header row — empty label cell, then one card per product, then the add slot */}
              <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#25221F]/60" />
              {slots.map((slot, i) => (
                <div
                  key={slot.slug}
                  className={`border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#25221F]/60 ${
                    i < dataCols - 1 ? "border-r" : ""
                  }`}
                >
                  <FilledSlot slot={slot} onRemove={() => removeSlug(slot.slug)} />
                </div>
              ))}
              {canAddMore && (
                <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#25221F]/60 p-3 sm:p-4 flex items-center">
                  <ProductSearchInput
                    placeholder={slugs.length === 0 ? "Search first product…" : "Add product…"}
                    onSelect={(p) => addSlug(p.slug)}
                    excludeSlugs={slugs}
                  />
                </div>
              )}

              {body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
