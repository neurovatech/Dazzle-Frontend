import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/share/Breadcrumb";
import SortDropdown from "@/components/share/SortDropdown";
import ProductCard from "@/components/share/GlobalProductCard";
import { api } from "@/lib/api";

interface ShowcaseThumbnail {
  fileUuid: string;
  mediaFileUrl: string;
}

export interface SlideItem {
  id: string | number;
  imageUrl?: string;
  title?: string;
  content?: React.ReactNode;
}

interface ShowcaseItem {
  productUuid: string;
  productCode: string;
  productName: string;
  productSlug: string;
  productBadge: string;
  isTba: boolean;
  regularPrice: number;
  discountedPrice: number;
  disRate: number;
  thumbnails: ShowcaseThumbnail;
}

interface ShowcaseItemsResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  data: ShowcaseItem[];
}

export interface ProductCardItem {
  uuid: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  badge: string;
  isBestDeal: boolean;
  inStock: boolean;
  image: string;
}

// ─── Pagination (server-safe, Link-based) ─────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const hrefFor = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 opacity-40">
          <ChevronLeft size={16} />
        </span>
      )}

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p as number)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
              p === page
                ? "bg-[#6D3F0E] text-white"
                : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 opacity-40">
          <ChevronRight size={16} />
        </span>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default async function FeatureProductsPages({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "New Arrivals", href: "#" },
  ];

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedParams?.page) || 1);
  const limit = 30; // adjust to match your API's default/desired page size

  let products: ProductCardItem[] = [];
  let totalPages = 1;
  let totalCount = 0;

  try {
    const res = await api.get<ShowcaseItemsResponse>(
      `/products?latest=1&page=${currentPage}&limit=${limit}`,
      { cache: "no-store" }
    );

    const list = Array.isArray(res?.data) ? res.data : [];
    totalPages = res?.totalPages ?? 1;
    totalCount = res?.totalCount ?? list.length;

    products = list.map((item) => ({
      uuid: item.productUuid,
      title: item.productName,
      slug: item.productSlug,
      price: item.discountedPrice,
      originalPrice: item.regularPrice,
      discount: Math.round(item.disRate),
      badge: item.productBadge,
      isBestDeal: item.disRate > 15, // adjust threshold as needed, API has no direct flag
      inStock: !item.isTba,
      image: item.thumbnails?.mediaFileUrl ?? "/images/product.png",
    }));
  } catch (error) {
    console.error("Error fetching feature products SSR:", error);
  }

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-4 gap-2 mt-6 items-stretch cursor-pointer md:px-12.5 px-4">
        <div className="lg:col-span-8">
          {" "}
          <h3>New Arrivals</h3>{" "}
        </div>
        {/* <div className="lg:col-span-4 ">
          {" "}
          <SortDropdown />{" "}
        </div> */}
        <div className="lg:col-span-12 h-full">
          <div className="grid md:grid-cols-5 grid-cols-2 lg:gap-4 gap-2">
            {products.map((product, i) => (
              <div key={i}>
                <ProductCard key={i} {...product} />
              </div>
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath="/new-arrivals"
          />

          {totalCount > 0 && (
            <p className="text-center text-xs text-gray-400 mt-3 mb-8">
              Page {currentPage} of {totalPages} — showing {products.length}{" "}
              of {totalCount.toLocaleString()} products
            </p>
          )}
        </div>
      </div>
    </div>
  );
}