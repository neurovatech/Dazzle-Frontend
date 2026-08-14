/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * JSON-LD (schema.org) builders.
 *
 * HARD RULE: every value emitted here must come from real API data.
 * Never invent ratings, review counts, prices or availability — fabricated
 * structured data violates Google's guidelines and risks a manual action.
 * When a field is unavailable, omit it; an absent property is always safer
 * than a wrong one.
 */
import { SITE_URL, absoluteUrl } from "./seo-config";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

/** Recursively strips undefined/null/empty values so we never emit empty schema keys. */
function clean<T>(obj: T): T {
  if (Array.isArray(obj)) {
    const arr = obj.map(clean).filter((v) => v !== undefined && v !== null);
    return (arr.length ? arr : undefined) as unknown as T;
  }
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const c = clean(v);
      if (c !== undefined && c !== null && c !== "") out[k] = c;
    }
    return (Object.keys(out).length ? out : undefined) as unknown as T;
  }
  return obj;
}

/** Currency used by the storefront. */
const CURRENCY = "BDT";

// ─── Organization ─────────────────────────────────────────────────────────────
export function organizationSchema(settings?: {
  siteTitle?: string;
  siteLogo?: string;
  contactPhone?: string;
  contactEmail?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
}) {
  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.linkedinUrl,
    settings?.youtubeUrl,
    settings?.twitterUrl,
  ].filter((u): u is string => Boolean(u && u !== "#"));

  return clean({
    "@type": "Organization",
    "@id": ORG_ID,
    name: settings?.siteTitle || "Dazzle",
    url: SITE_URL,
    logo: settings?.siteLogo,
    image: settings?.siteLogo,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: settings?.contactPhone
      ? {
          "@type": "ContactPoint",
          telephone: settings.contactPhone,
          email: settings.contactEmail,
          contactType: "customer service",
          areaServed: "BD",
          availableLanguage: ["en", "bn"],
        }
      : undefined,
  });
}

// ─── WebSite (+ sitelinks search box) ─────────────────────────────────────────
export function webSiteSchema(settings?: { siteTitle?: string }) {
  return clean({
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: settings?.siteTitle || "Dazzle",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  if (!items.length) return undefined;
  return clean({
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  });
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface ProductSchemaInput {
  productName?: string;
  productSlug?: string;
  productCode?: string;
  brandName?: string;
  description?: string;
  shortDesc?: string;
  regularPrice?: number;
  discountedPrice?: number;
  isTba?: boolean;
  thumbnails?: { mediaFileUrl?: string; mediafileUrl?: string }[];
  thumbnailImg?: string;
  metaTags?: {
    canonical?: string;
    description?: string;
    totalReview?: number;
    soldCount?: number;
  };
}

/** Plain-text helper — schema.org values must not contain HTML. */
function toPlainText(html?: string, max = 5000): string | undefined {
  if (!html) return undefined;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return undefined;
  return text.length > max ? text.slice(0, max) : text;
}

export function productSchema(p: ProductSchemaInput) {
  if (!p?.productName) return undefined;

  const url = p.metaTags?.canonical || (p.productSlug ? absoluteUrl(`/product/${p.productSlug}`) : undefined);

  const images = [
    ...(p.thumbnails ?? [])
      .map((t) => t?.mediaFileUrl || t?.mediafileUrl)
      .filter((u): u is string => Boolean(u)),
    ...(p.thumbnailImg ? [p.thumbnailImg] : []),
  ];

  // Price: prefer the actual selling price. Only emit an Offer when we have one.
  const price = p.discountedPrice && p.discountedPrice > 0 ? p.discountedPrice : p.regularPrice;

  const offers =
    price && price > 0
      ? clean({
          "@type": "Offer",
          url,
          price: String(price),
          priceCurrency: CURRENCY,
          // isTba (to-be-announced) is the API's out-of-stock signal.
          availability: p.isTba
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": ORG_ID },
        })
      : undefined;

  // aggregateRating is emitted ONLY when the API reports real reviews.
  // totalReview is currently 0 across the catalog, so this stays absent —
  // emitting a fake rating would be a policy violation.
  const reviewCount = Number(p.metaTags?.totalReview) || 0;

  return clean({
    "@type": "Product",
    name: p.productName,
    description: toPlainText(p.metaTags?.description) || toPlainText(p.shortDesc) || toPlainText(p.description),
    sku: p.productCode || undefined,
    image: images.length ? Array.from(new Set(images)) : undefined,
    url,
    brand: p.brandName ? { "@type": "Brand", name: p.brandName } : undefined,
    offers,
    aggregateRating:
      reviewCount > 0
        ? { "@type": "AggregateRating", reviewCount, ratingValue: undefined }
        : undefined,
  });
}

// ─── ItemList (category / listing pages) ──────────────────────────────────────
export function itemListSchema(
  products: { productName?: string; productSlug?: string }[],
  listName?: string,
) {
  const items = (products ?? [])
    .filter((p) => p?.productSlug && p?.productName)
    .slice(0, 30); // keep the payload reasonable
  if (!items.length) return undefined;

  return clean({
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.productName,
      url: absoluteUrl(`/product/${p.productSlug}`),
    })),
  });
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export function faqSchema(faqs: { question: string; answer: string }[]) {
  const items = (faqs ?? []).filter((f) => f?.question && f?.answer);
  if (!items.length) return undefined;

  return clean({
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: toPlainText(f.question),
      acceptedAnswer: { "@type": "Answer", text: toPlainText(f.answer) },
    })),
  });
}

// ─── Article (blog / announcement / career / press) ───────────────────────────
export function articleSchema(post: {
  post_title?: string;
  post_caption?: string;
  post_slug?: string;
  published_at?: string;
  posted_by?: string;
  thumbnail?: any;
  basePath?: string;
}) {
  if (!post?.post_title) return undefined;
  const image =
    typeof post.thumbnail === "string"
      ? post.thumbnail
      : post.thumbnail?.media_file || post.thumbnail?.[0]?.media_file;

  return clean({
    "@type": "Article",
    headline: post.post_title,
    description: toPlainText(post.post_caption, 300),
    image: image || undefined,
    datePublished: post.published_at || undefined,
    author: post.posted_by ? { "@type": "Person", name: post.posted_by } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage:
      post.post_slug && post.basePath
        ? absoluteUrl(`${post.basePath}/${post.post_slug}`)
        : undefined,
  });
}

/**
 * Wraps one or more schema nodes into a single @graph document.
 * Using @graph (rather than several separate <script> tags) lets nodes
 * cross-reference each other via @id — e.g. every Offer points at one Organization.
 */
export function buildJsonLd(...nodes: (object | undefined)[]) {
  const graph = nodes.filter(Boolean);
  if (!graph.length) return undefined;
  return { "@context": "https://schema.org", "@graph": graph };
}
