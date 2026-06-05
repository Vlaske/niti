import { notFound } from "next/navigation";
import { CategoryPageLayout } from "@/components/shop/CategoryPageLayout";
import {
  getCategorySlugs,
  getStoreCategoryBySlug,
  isNavCategorySlug,
} from "@/config/store-categories";
import { getProductsByCategory } from "@/lib/catalog";
import { fetchCollectionMeta } from "@/lib/shopify/collections";
import type { Category } from "@/types";

type Props = {
  params: Promise<{ category: string }>;
};

export const revalidate = 60;

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85";

export async function generateStaticParams() {
  return getCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const cat = getStoreCategoryBySlug(category);
  return { title: cat?.title ?? "Kategorija" };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!isNavCategorySlug(category)) notFound();

  const catConfig = getStoreCategoryBySlug(category);
  if (!catConfig) notFound();

  const [productList, shopifyMeta] = await Promise.all([
    getProductsByCategory(category),
    fetchCollectionMeta(catConfig.collectionHandle).catch(() => null),
  ]);

  const cat: Category = {
    slug: catConfig.slug,
    title: shopifyMeta?.title ?? catConfig.title,
    description: shopifyMeta?.description?.trim() || catConfig.description,
    image: shopifyMeta?.imageUrl || catConfig.image || HERO_FALLBACK,
    productCount: shopifyMeta?.productCount ?? productList.length,
  };

  return (
    <CategoryPageLayout
      category={cat}
      activeSlug={category}
      productList={productList}
      initialFilter={category}
    />
  );
}
