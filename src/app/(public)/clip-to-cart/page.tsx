import ClipToCartForPage from "@/components/HomePage/ClipToCart/ClipToCartForPage";
import {
  clipEndpoint,
  mapClipProduct,
  type ClipApiResponse,
  type ClipProduct,
} from "@/components/HomePage/ClipToCart/clipToCart.shared";
import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";

/**
 * First page, fetched on the server rather than through useQuery in the client.
 *
 * The cards are the whole point of this page, so rendering them server-side
 * means they arrive with the first response: no loading skeleton, no waterfall
 * after the JS bundle lands. Pages 2+ are pulled in by the grid as the reader
 * scrolls. The 60s revalidate matches every other listing page in the app.
 *
 * The showcase endpoint answers 404 ("Showcase not found") when a slug has no
 * items configured, so a failure here is an ordinary empty state, not an error
 * worth failing the page over.
 */
async function getInitialClips(): Promise<{
  products: ClipProduct[];
  totalPages: number;
}> {
  try {
    const res = await api.get<ClipApiResponse>(clipEndpoint(1), {
      next: { revalidate: 60 },
    } as RequestInit);

    return {
      products: (res?.data ?? []).map(mapClipProduct),
      totalPages: res?.totalPages ?? 1,
    };
  } catch {
    return { products: [], totalPages: 1 };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

async function ClipToCartPage() {
  const { products, totalPages } = await getInitialClips();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Clip To Cart ", href: "/clip-to-cart" },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
        <ClipToCartForPage
          initialProducts={products}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

export default ClipToCartPage;
