import CategoriesProduct from "@/components/CategoriesPages/CategoriesProduct/CategoriesProduct";
import Breadcrumb from "@/components/share/Breadcrumb";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const decodedSlug = decodeURIComponent(categorySlug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} - Buy Online at Best Price in Bangladesh - Dazzle`,
    description: `Shop the latest ${title} collection online at Dazzle. Discover premium products, brand warranties, and fast home delivery in Bangladesh.`,
  };
}

export default async function CategoriesPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const decodedSlug = decodeURIComponent(categorySlug);
  const title = decodedSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: title, href: `/categories/${categorySlug}` },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-355 mx-auto">
      <div className="md:px-12.5 px-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <CategoriesProduct />
    </div>
  );
}
