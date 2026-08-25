"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { CategoryNavStrip } from "@/components/shop/CategoryNavStrip";
import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";
import { useLanguage } from "@/context/LanguageContext";
import { useNavCategories } from "@/context/CategoriesContext";
import {
  getGroupHref,
  type CategoryGroup,
} from "@/config/store-categories";
import type { Product } from "@/types";

type GroupPageLayoutProps = {
  group: CategoryGroup;
  productList: Product[];
  subcategorySlugs: string[];
};

export function GroupPageLayout({
  group,
  productList,
  subcategorySlugs,
}: GroupPageLayoutProps) {
  const { t } = useLanguage();
  const allNav = useNavCategories();
  const subcategories = allNav.filter((c) =>
    subcategorySlugs.includes(c.slug)
  );
  const heroImage = group.image || CATEGORY_IMAGE_FALLBACK;

  const crumbs = [
    { label: t("product.home"), href: "/" },
    { label: t("product.shop"), href: "/shop" },
    { label: group.title },
  ];

  return (
    <>
      <Header variant="transparent" />
      <main>
        <ShopHero
          image={heroImage}
          title={group.title}
          description={group.description}
          crumbs={crumbs}
        />

        {subcategories.length > 1 && (
          <CategoryNavStrip
            activeSlug="all"
            categories={subcategories}
            allHref={getGroupHref(group.id)}
            allLabel={t("shop.filters.all")}
          />
        )}

        <div className="bg-niti-cream pb-16 pt-8 md:pb-20 md:pt-10">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <ShopPageClient
              initialFilter="all"
              productList={productList}
              hideHeader
              hideFilters
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
