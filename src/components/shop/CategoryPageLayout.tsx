"use client";

import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryNavStrip } from "@/components/shop/CategoryNavStrip";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";
import { useLanguage } from "@/context/LanguageContext";
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
};

export function CategoryPageLayout({
  category,
  activeSlug,
  productList,
  initialFilter,
  navCategories,
  categoryFilters,
}: CategoryPageLayoutProps) {
  const { t } = useLanguage();
  const heroImage = category.image || CATEGORY_IMAGE_FALLBACK;

  return (
    <>
      <Header variant="transparent" />
      <main>
        <section className="relative min-h-[28vh] sm:min-h-[34vh] md:min-h-[48vh] lg:min-h-[52vh]">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-niti-cream" />
          <div className="relative mx-auto flex min-h-[28vh] max-w-[1440px] flex-col justify-end px-4 pb-12 pt-24 sm:min-h-[34vh] sm:pb-14 sm:pt-28 md:min-h-[48vh] md:px-8 md:pb-20 md:pt-32 lg:px-12 lg:pb-24">
            <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-white/75 sm:text-sm">
              <Link href="/" className="interactive hover:text-white">
                {t("product.home")}
              </Link>
              <span>/</span>
              <Link href="/shop" className="interactive hover:text-white">
                {t("product.shop")}
              </Link>
              <span>/</span>
              <span className="text-white">{category.title}</span>
            </nav>
            <h1 className="font-serif text-3xl font-semibold leading-[1.08] text-white sm:text-4xl md:text-6xl lg:text-7xl">
              {category.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 line-clamp-2 sm:line-clamp-none md:mt-4 md:text-base">
              {category.description}
            </p>
          </div>
        </section>

        <CategoryNavStrip
          activeSlug={activeSlug}
          categories={navCategories}
        />

        <div className="bg-niti-cream pb-16 pt-6 md:pb-20 md:pt-14">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <ShopPageClient
              initialFilter={initialFilter ?? activeSlug}
              productList={productList}
              categoryFilters={categoryFilters}
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
