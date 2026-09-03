/* eslint-disable @typescript-eslint/no-explicit-any */
import CategoriesProduct from "@/components/CategoriesPages/CategoriesProduct/CategoriesProduct";

import Breadcrumb from "@/components/share/Breadcrumb";
import { api } from "@/lib/api";
import type { Metadata } from "next";
import { lookupCategoryNames, toTitleCase } from "@/lib/category-lookup";
import {
  SITE_NAME,
  OG_LOCALE,
  buildOgImage,
  absoluteUrl,
} from "@/lib/seo-config";
import JsonLd from "@/components/share/JsonLd";
import {
  buildJsonLd,
  breadcrumbSchema,
  itemListSchema,
} from "@/lib/structured-data";
import {
  getSubCategorySeoContent,
  hasRichText,
  seoText,
  SEO_RICH_TEXT_CLASS,
} from "@/lib/seo-content";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ categorySlug: string; subCategorySlug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; search?: string }>;
}

interface WebBannerItem {
  bannerUUID: string;
  imageURL: string;
  mediaInfo: string;
  openNewTab: boolean;
}

interface WebBannerResponse {
  statusCode: number;
  status: string;
  found: boolean;
  count: number;
  data: WebBannerItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LIMIT = 12;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { categorySlug, subCategorySlug } = await params;
  const { page } = await searchParams;
  // Real names from the API — fall back to slug-derived if unavailable.
  const {
    categoryName = toTitleCase(categorySlug),
    subCategoryName = toTitleCase(subCategorySlug),
    subCategoryImage,
    categoryImage,
  } = await lookupCategoryNames(categorySlug, subCategorySlug);
  const currentPage = Number(page ?? 1);
  const pageLabel = currentPage > 1 ? ` — Page ${currentPage}` : "";

  const seo = await getSubCategorySeoContent(subCategorySlug);

  /*
   * CMS copy wins where it exists; the generated strings are the floor.
   *
   * Page 2+ keeps the generated title: a CMS title is written for the
   * sub-category as a whole and would make every paginated page claim the
   * same one.
   */
  const cmsTitle = currentPage > 1 ? undefined : seoText(seo?.title);
  const cmsDescription = seoText(seo?.description);

  const ogTitle =
    cmsTitle || `${subCategoryName} - ${categoryName}${pageLabel} | Dazzle`;
  const ogDescription =
    cmsDescription ||
    `Browse ${subCategoryName} products at Dazzle — Bangladesh's premium tech store.`;
  // Prefer the sub-category's own artwork, then the parent category's.
  const ogImage = buildOgImage(
    subCategoryImage || categoryImage,
    subCategoryName,
  );

  // A CMS canonical is absolute and page-agnostic, so it is only right for
  // page 1; paginated views must point at themselves.
  const canonical =
    currentPage > 1
      ? `/categories/${categorySlug}/${subCategorySlug}?page=${currentPage}`
      : seoText(seo?.canonical) ||
        `/categories/${categorySlug}/${subCategorySlug}`;

  return {
    title:
      cmsTitle ||
      `${subCategoryName} - ${categoryName}${pageLabel} - Buy Online at Best Price in Bangladesh`,
    description:
      cmsDescription ||
      `Shop the best selection of ${subCategoryName} in our ${categoryName} category at Dazzle. Best prices, official warranty, and fast delivery across Bangladesh.${currentPage > 1 ? ` Viewing page ${currentPage}.` : ""}`,
    ...(seoText(seo?.keywords) ? { keywords: seoText(seo?.keywords) } : {}),
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical.startsWith("http") ? canonical : absoluteUrl(canonical),
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage.url],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubCategoriesPage({
  params,
  searchParams,
}: PageProps) {
  const { categorySlug, subCategorySlug } = await params;
  const { page, sort, search } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? 1));
  const {
    categoryName = toTitleCase(categorySlug),
    subCategoryName = toTitleCase(subCategorySlug),
  } = await lookupCategoryNames(categorySlug, subCategorySlug);

  // ── Fetch products: products?page=1&limit=12&categorySlug=phones&subCategorySlug=iphone ──
  const defaultProductData = {
    statusCode: 200,
    status: "success",
    found: false,
    count: 0,
    totalCount: 0,
    page: currentPage,
    limit: LIMIT,
    totalPages: 1,
    data: [],
  };

  async function fetchProducts(): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(LIMIT),
        categorySlug,
        subCategorySlug,
      });
      if (sort) queryParams.set("sort", sort);
      if (search) queryParams.set("search", search);

      console.log(`/products?${queryParams.toString()}`, "fetchProducts URL");

      const res = await api.get<any>(`/products?${queryParams.toString()}`, {
        next: { revalidate: 5 },
      });
      if (res && typeof res === "object" && "data" in res) {
        return res;
      }
      return defaultProductData;
    } catch (error) {
      console.error("Error fetching sub-category products:", error);
      return defaultProductData;
    }
  }

  async function fetchBanners(): Promise<WebBannerItem[]> {
    try {
      const res = await api.get<WebBannerResponse>(
        "/web-banner/product-categores-page",
        { next: { revalidate: 5 } },
      );
      if (res && typeof res === "object" && "data" in res) {
        return res.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching product category banners:", error);
      return [];
    }
  }

  // ── Fetch brands for this subcategory ───────────────────────────────────────
  async function fetchBrands(): Promise<any> {
    try {
      const brandsRes = await api.get<any>(
        `/subcategory/${subCategorySlug}/brands`,
        { next: { revalidate: 5 } },
      );
      let rawChild: any[] = [];
      if (brandsRes?.data) {
        if (
          Array.isArray(brandsRes.data.subCategory) &&
          brandsRes.data.subCategory.length > 0
        ) {
          rawChild = brandsRes.data.subCategory[0].child || [];
        } else if (
          Array.isArray(brandsRes.data.category) &&
          brandsRes.data.category.length > 0
        ) {
          rawChild = brandsRes.data.category[0].child || [];
        } else if (Array.isArray(brandsRes.data.child)) {
          rawChild = brandsRes.data.child;
        } else if (Array.isArray(brandsRes.data.brands)) {
          rawChild = brandsRes.data.brands;
        } else if (Array.isArray(brandsRes.data)) {
          rawChild = brandsRes.data;
        }
      }
      if (Array.isArray(rawChild)) {
        return rawChild
          .filter((b: any) => b && b.is_active)
          .map((b: any) => ({
            uuid: b.uuid,
            brand_name: b.brand_name || "",
            brand_slug: b.brand_slug || "",
            thumbnail_img: b.thumbnail_img || "",
            is_active: b.is_active ?? true,
          }));
      }
      return [];
    } catch (err) {
      console.error("Error fetching sub-category brands:", err);
      return [];
    }
  }

  // ── Fetch attributes for this subcategory ────────────────────────────────────
  async function fetchAttributes(): Promise<{
    attributes: any;
    priceData: any;
  }> {
    try {
      const attrRes = await api.get<{ data: any; priceData?: any }>(
        `/products/attributes?categorySlug=${categorySlug}&subCategorySlug=${subCategorySlug}`,
        { next: { revalidate: 5 } },
      );
      return {
        attributes: attrRes && Array.isArray(attrRes.data) ? attrRes.data : [],
        priceData: attrRes && attrRes.priceData ? attrRes.priceData : undefined,
      };
    } catch (err) {
      console.error("Error fetching sub-category attributes:", err);
      return { attributes: [], priceData: undefined };
    }
  }

  const [productData, banners, brands, { attributes, priceData }] =
    await Promise.all([
      fetchProducts(),
      fetchBanners(),
      fetchBrands(),
      fetchAttributes(),
    ]);

  // ── Breadcrumb ────────────────────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: categoryName, href: `/categories/${categorySlug}` },
    {
      label: subCategoryName,
      href: `/categories/${categorySlug}/${subCategorySlug}`,
    },
  ];

  const jsonLd = buildJsonLd(
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Categories", path: "/categories" },
      { name: categoryName, path: `/categories/${categorySlug}` },
      {
        name: subCategoryName,
        path: `/categories/${categorySlug}/${subCategorySlug}`,
      },
    ]),
    itemListSchema(productData.data, `${subCategoryName} Products`),
  );

  // Same cached call generateMetadata made — costs no extra request.
  const seo = await getSubCategorySeoContent(subCategorySlug);
  const seoBottomContent = hasRichText(seo?.bottomContent)
    ? seo!.bottomContent!
    : "";

  return (
    <div className=" bg-[#fffbf6] dark:bg-[#2e2b28]">
      <JsonLd id="ld-subcategory" data={jsonLd} />
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <div className="md:px-12.5 px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {/* <Banner banners={banners} /> */}
        <CategoriesProduct
          banners={banners}
          categorySlug={categorySlug}
          subCategorySlug={subCategorySlug}
          currentPage={currentPage}
          products={productData.data}
          totalPages={productData.totalPages}
          totalCount={productData.totalCount}
          currentSort={sort ?? ""}
          currentSearch={search ?? ""}
          brands={brands}
          attributes={attributes}
          priceData={priceData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start  relative">
        <div className="lg:col-span-3 md:block hidden"></div>
        <div className="lg:col-span-9">
          {seoBottomContent && (
            <section className="md:px-12.5 px-4 pb-14 pt-6">
              <div className="max-w-4xl">
                <article
                  className={SEO_RICH_TEXT_CLASS}
                  dangerouslySetInnerHTML={{ __html: seoBottomContent }}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
