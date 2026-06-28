import Banner from '@/components/CategoriesPages/CategoriesBanner/Banner'
import CategoriesProduct from '@/components/CategoriesPages/CategoriesProduct/CategoriesProduct'
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ categorySlug: string; subCategorySlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug, subCategorySlug } = await params;
  const decodedCategory = decodeURIComponent(categorySlug);
  const decodedSubCategory = decodeURIComponent(subCategorySlug);
  
  const categoryTitle = decodedCategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const subCategoryTitle = decodedSubCategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    title: `${subCategoryTitle} - ${categoryTitle} - Dazzle`,
    description: `Shop the best selection of ${subCategoryTitle} in our ${categoryTitle} category online at Dazzle Bangladesh. Best prices, official warranty, and fast delivery.`,
  };
}

export default async function SubCategoriesPage({ params }: PageProps) {
  return (
    <div>
      <div className="flex flex-col flex-1 max-w-355 mx-auto">
        <Banner />
        <CategoriesProduct />
      </div>
    </div>
  )
}
