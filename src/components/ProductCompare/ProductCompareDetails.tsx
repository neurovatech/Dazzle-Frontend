"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// ── Product lookup (/product/{slug}) — resolves a slug into uuid + display info ──
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

function getThumbnail(data?: ProductLookupData): string {
  if (!data) return "";
  if (data.thumbnailImg) return data.thumbnailImg;
  const first = data.thumbnails?.[0];
  return first?.mediaFileUrl || first?.mediafileUrl || first?.mediaFile || "";
}

function useProductLookup(slug: string | null) {
  return useQuery<ProductLookupResponse>({
    queryKey: ["product-compare-lookup", slug],
    queryFn: () => api.get<ProductLookupResponse>(`/product/${slug}`),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

function useProductSpecs(productUuid: string | null) {
  return useQuery<SpecResponse>({
    queryKey: ["product-compare-specs", productUuid],
    queryFn: () => api.get<SpecResponse>(`/product-specification/${productUuid}`),
    enabled: !!productUuid,
    staleTime: 5 * 60 * 1000,
  });
}

interface PickedProduct {
  slug: string;
  name: string;
  image: string;
}

// ── Search-as-you-type input, shared by both slots ──────────────────────────
function ProductSearchInput({
  placeholder,
  onSelect,
  excludeSlug,
}: {
  placeholder: string;
  onSelect: (product: PickedProduct) => void;
  excludeSlug?: string | null;
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
    (h) => h.document.productSlug !== excludeSlug
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

// ── One header slot: either a resolved product card, or a search box ────────
function CompareSlot({
  product,
  loading,
  notFound,
  searchPlaceholder,
  onSelect,
  onClear,
  excludeSlug,
}: {
  product?: ProductLookupData;
  loading: boolean;
  notFound: boolean;
  searchPlaceholder: string;
  onSelect: (p: PickedProduct) => void;
  onClear: () => void;
  excludeSlug?: string | null;
}) {
  if (loading) {
    return (
      <div className="p-4 sm:p-5 flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
        <div className="flex-1 h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (product) {
    return (
      <div className="p-4 sm:p-5 flex items-center gap-3">
        <div className="w-16 h-16 shrink-0 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#2D2A26] flex items-center justify-center overflow-hidden">
          <img
            src={getThumbnail(product) || "/images/no_images.png"}
            alt={product.productName}
            className="w-full h-full object-contain"
          />
        </div>
        <p className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
          {product.productName}
        </p>
        <button
          type="button"
          onClick={onClear}
          aria-label="Change product"
          className="shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      {notFound && <p className="text-xs text-red-500 dark:text-red-400 mb-1.5">Product not found.</p>}
      <ProductSearchInput
        placeholder={searchPlaceholder}
        onSelect={onSelect}
        excludeSlug={excludeSlug}
      />
    </div>
  );
}

interface ProductCompareDetailsProps {
  /** Pre-fills the first slot — set when arriving from a product's Compare button (/product-compare/[slug]). */
  slug?: string;
}

export default function ProductCompareDetails({ slug }: ProductCompareDetailsProps) {
  const [primarySlug, setPrimarySlug] = useState<string | null>(slug ?? null);
  const [compareSlug, setCompareSlug] = useState<string | null>(null);
  // Resets the slots when navigating client-side between two /product-compare/[slug]
  // routes, which reuses this component instance rather than remounting it.
  const [prevSlugProp, setPrevSlugProp] = useState(slug);
  if (slug !== prevSlugProp) {
    setPrevSlugProp(slug);
    setPrimarySlug(slug ?? null);
    setCompareSlug(null);
  }

  const primaryLookup = useProductLookup(primarySlug);
  const compareLookup = useProductLookup(compareSlug);

  const primaryProduct = primaryLookup.data?.found ? primaryLookup.data.data : undefined;
  const compareProduct = compareLookup.data?.found ? compareLookup.data.data : undefined;

  const primarySpecs = useProductSpecs(primaryProduct?.productUuid ?? null);
  const compareSpecs = useProductSpecs(compareProduct?.productUuid ?? null);

  // Primary's groups/order drive the table; any group only the compare
  // product has is appended so its specs still show up somewhere.
  const groups = useMemo(() => {
    const primaryGroups = primarySpecs.data?.data ?? [];
    const compareGroups = compareSpecs.data?.data ?? [];
    const compareByGroup = new Map(compareGroups.map((g) => [g.groupSlug, g]));

    const merged = primaryGroups.map((pg) => {
      const cg = compareByGroup.get(pg.groupSlug);
      compareByGroup.delete(pg.groupSlug);
      const compareValueByLabel = new Map(
        (cg?.productSpecifications ?? []).map((s) => [s.specification, s.specificationValue])
      );
      return {
        groupName: pg.groupName,
        rows: pg.productSpecifications.map((s) => ({
          label: s.specification,
          primaryValue: s.specificationValue as string | null,
          compareValue: compareValueByLabel.get(s.specification) ?? null,
        })),
      };
    });

    compareByGroup.forEach((cg) => {
      merged.push({
        groupName: cg.groupName,
        rows: cg.productSpecifications.map((s) => ({
          label: s.specification,
          primaryValue: null as string | null,
          compareValue: s.specificationValue as string | null,
        })),
      });
    });

    return merged;
  }, [primarySpecs.data, compareSpecs.data]);

  const specsLoading =
    (!!primaryProduct && primarySpecs.isLoading) || (!!compareProduct && compareSpecs.isLoading);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-start justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5">Product Compare</h1>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#25221F]/60">
            <CompareSlot
              product={primaryProduct}
              loading={!!primarySlug && primaryLookup.isLoading}
              notFound={!!primarySlug && primaryLookup.isFetched && !primaryLookup.data?.found}
              searchPlaceholder="Search first product…"
              onSelect={(p) => setPrimarySlug(p.slug)}
              onClear={() => setPrimarySlug(null)}
              excludeSlug={compareSlug}
            />
            <CompareSlot
              product={compareProduct}
              loading={!!compareSlug && compareLookup.isLoading}
              notFound={!!compareSlug && compareLookup.isFetched && !compareLookup.data?.found}
              searchPlaceholder="Search product to compare…"
              onSelect={(p) => setCompareSlug(p.slug)}
              onClear={() => setCompareSlug(null)}
              excludeSlug={primarySlug}
            />
          </div>

          {!primaryProduct && !compareProduct ? (
            <div className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500">
              Search and select two products above to compare their specifications.
            </div>
          ) : specsLoading ? (
            <div className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500">
              Loading specifications…
            </div>
          ) : groups.length === 0 ? (
            <div className="py-16 px-6 text-center text-sm text-gray-400 dark:text-gray-500">
              No specification data available for this product.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <tbody>
                  {groups.map((group) => (
                    <Fragment key={group.groupName}>
                      <tr className="bg-gray-50 dark:bg-[#25221F]">
                        <td
                          colSpan={3}
                          className="px-6 py-2 text-xs font-bold uppercase tracking-wide text-[#b8864e] dark:text-[#D4A97A]"
                        >
                          {group.groupName}
                        </td>
                      </tr>
                      {group.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50/60 dark:hover:bg-[#25221F]/40 transition-colors"
                        >
                          <td className="py-3 px-6 border-r border-gray-100 dark:border-gray-800 w-40 sm:w-56 align-top">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.label}</span>
                          </td>
                          <td className="py-3 px-4 border-r border-gray-100 dark:border-gray-800 w-1/2 align-top">
                            <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {row.primaryValue ?? <span className="text-gray-300 dark:text-gray-700 select-none">—</span>}
                            </span>
                          </td>
                          <td className="py-3 px-4 w-1/2 align-top">
                            <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {row.compareValue ?? <span className="text-gray-300 dark:text-gray-700 select-none">—</span>}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
