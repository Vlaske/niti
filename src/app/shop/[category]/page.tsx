import { notFound } from "next/navigation";
import { CategoryPageLayout } from "@/components/shop/CategoryPageLayout";
import { GroupPageLayout } from "@/components/shop/GroupPageLayout";
import {
  getCategoriesByGroup,
  getGroupById,
  getGroupForCategorySlug,
  getShopRouteSlugs,
  getStoreCategoryBySlug,
  isCategoryGroupId,
  isNavCategorySlug,
} from "@/config/store-categories";
import { getProductsByCategory, getProductsByGroup } from "@/lib/catalog";
import { toListingProduct } from "@/lib/catalog/listing";
import { fetchCollectionMeta } from "@/lib/shopify/collections";
import { preferSiteImage } from "@/lib/site-images";
import type { Category } from "@/types";

type Props = {
  params: Promise<{ category: string }>;
};

export const revalidate = 60;

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85";

export async function generateStaticParams() {
  return getShopRouteSlugs().map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  if (isCategoryGroupId(category)) {
    const group = getGroupById(category);
    return { title: group?.title ?? "Prostor" };
  }
  const cat = getStoreCategoryBySlug(category);
  return { title: cat?.title ?? "Kategorija" };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (isCategoryGroupId(category)) {
    const group = getGroupById(category);
    if (!group) notFound();
    const productList = await getProductsByGroup(category);
    const subcategorySlugs = getCategoriesByGroup(category).map((c) => c.slug);
    return (
      <GroupPageLayout
        group={{
          ...group,
          image: preferSiteImage(`rooms/${group.id}`, group.image || HERO_FALLBACK),
        }}
        productList={productList.map(toListingProduct)}
        subcategorySlugs={subcategorySlugs}
      />
    );
  }

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
    image: preferSiteImage(
      `categories/${catConfig.slug}`,
      shopifyMeta?.imageUrl || catConfig.image || HERO_FALLBACK
    ),
    productCount: productList.length,
  };

  const groupId = getGroupForCategorySlug(category);
  const groupCategories = groupId
    ? getCategoriesByGroup(groupId).map((c) => c.slug)
    : [];

  return (
    <CategoryPageLayout
      category={cat}
      activeSlug={category}
      productList={productList.map(toListingProduct)}
      initialFilter={category}
      groupCategorySlugs={groupCategories}
    />
  );
}
