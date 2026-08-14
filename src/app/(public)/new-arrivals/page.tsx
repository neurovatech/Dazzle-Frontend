import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import NewArrivalsClient from "@/components/NewArrivals/NewArrivalsClient";

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

// function Pagination({ page, totalPages, basePath }: PaginationProps) {
//   if (totalPages <= 1) return null;

//   const getPages = (): (number | "...")[] => {
//     const pages: (number | "...")[] = [];
//     const delta = 2;
//     const left = Math.max(1, page - delta);
//     const right = Math.min(totalPages, page + delta);

//     if (left > 1) {
//       pages.push(1);
//       if (left > 2) pages.push("...");
//     }
//     for (let i = left; i <= right; i++) pages.push(i);
//     if (right < totalPages) {
//       if (right < totalPages - 1) pages.push("...");
//       pages.push(totalPages);
//     }
//     return pages;
//   };

//   const hrefFor = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`);

//   return (
//     <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
//       {page > 1 ? (
//         <Link
//           href={hrefFor(page - 1)}
//           className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
//         >
//           <ChevronLeft size={16} />
//         </Link>
//       ) : (
//         <span className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 opacity-40">
//           <ChevronLeft size={16} />
//         </span>
//       )}

//       {getPages().map((p, i) =>
//         p === "..." ? (
//           <span key={`dot-${i}`} className="px-1 text-gray-400 text-sm">
//             …
//           </span>
//         ) : (
//           <Link
//             key={p}
//             href={hrefFor(p as number)}
//             className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
//               p === page
//                 ? "bg-[#6D3F0E] text-white"
//                 : "border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
//             }`}
//           >
//             {p}
//           </Link>
//         )
//       )}

//       {page < totalPages ? (
//         <Link
//           href={hrefFor(page + 1)}
//           className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
//         >
//           <ChevronRight size={16} />
//         </Link>
//       ) : (
//         <span className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 opacity-40">
//           <ChevronRight size={16} />
//         </span>
//       )}
//     </div>
//   );
// }

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

  // SSR — always fetch page 1 only
  let initialProducts: ShowcaseItem[] = [];
  let initialTotalPages = 1;
  let initialTotalCount = 0;

  try {
    const res = await api.get<ShowcaseItemsResponse>(
      `/products?latest=1&page=1&limit=500`,
      { next: { revalidate: 60 } }
    );
    initialProducts    = Array.isArray(res?.data) ? res.data : [];
    initialTotalPages  = res?.totalPages ?? 1;
    initialTotalCount  = res?.totalCount ?? initialProducts.length;
  } catch (error) {
    console.error("Error fetching new arrivals SSR:", error);
  }

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="mt-6 md:px-12.5 px-4">
        <h3 className="md:text-[32px] text-[20px] font-bold text-transparent bg-clip-text bg-[linear-gradient(90deg,#101518_0%,#E9CCAE_46.15%,#B57908_100%)] dark:text-white mb-4">
          New Arrivals
        </h3>
        {/* Client component handles infinite scroll */}
        <NewArrivalsClient
          initialProducts={initialProducts}
          initialTotalPages={initialTotalPages}
          initialTotalCount={initialTotalCount}
        />
      </div>
    </div>
  );
}