"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShopHero } from "@/components/shop/ShopHero";
import { CategoryNavStrip } from "@/components/shop/CategoryNavStrip";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";
import { useLanguage } from "@/context/LanguageContext";
import { useNavCategories } from "@/context/CategoriesContext";
import {
  getGroupById,
  getGroupForCategorySlug,
  getGroupHref,
} from "@/config/store-categories";
import type { Category } from "@/types";
import type { Product } from "@/types";

type CategoryFilter = { id: string; label: string };

type CategoryPageLayoutProps = {
  category: Category;
  activeSlug: string;
  productList: Product[];
  initialFilter?: string;
  navCategories?: Category[];
  categoryFilters?: CategoryFilter[];
  /** Slugovi iz iste grupe — prikaz u CategoryNavStrip umesto svih */
  groupCategorySlugs?: string[];
};

export function CategoryPageLayout({
  category,
  activeSlug,
  productList,
  initialFilter,
  navCategories,
  categoryFilters,
  groupCategorySlugs,
}: CategoryPageLayoutProps) {
  const { t } = useLanguage();
  const allNav = useNavCategories();
  const heroImage = category.image || CATEGORY_IMAGE_FALLBACK;
  const parentGroupId = getGroupForCategorySlug(category.slug);
  const parentGroup = parentGroupId ? getGroupById(parentGroupId) : undefined;

  const stripCategories = groupCategorySlugs?.length
    ? allNav.filter((c) => groupCategorySlugs.includes(c.slug))
    : navCategories;

  const crumbs = [
    { label: t("product.home"), href: "/" },
    { label: t("product.shop"), href: "/shop" },
    ...(parentGroup
      ? [{ label: parentGroup.title, href: getGroupHref(parentGroup.id) }]
      : []),
    { label: category.title },
  ];

  return (
    <>
      <Header variant="transparent" />
      <main>
        <ShopHero
          image={heroImage}
          title={category.title}
          description={category.description}
          crumbs={crumbs}
        />

        <CategoryNavStrip
          activeSlug={activeSlug}
          categories={stripCategories}
          allHref={parentGroup ? getGroupHref(parentGroup.id) : "/shop"}
          allLabel={t("shop.filters.all")}
        />

        <div className="bg-niti-cream pb-16 pt-8 md:pb-20 md:pt-10">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <ShopPageClient
              initialFilter={initialFilter ?? activeSlug}
              productList={productList}
              categoryFilters={categoryFilters}
              hideHeader
              hideFilters
              refineCategorySlug={activeSlug}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
