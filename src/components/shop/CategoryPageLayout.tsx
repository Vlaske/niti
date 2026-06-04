"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryNavStrip } from "@/components/shop/CategoryNavStrip";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { useLanguage } from "@/context/LanguageContext";
import type { Category } from "@/types";
import type { Product } from "@/types";

type CategoryPageLayoutProps = {
  category: Category;
  activeSlug: string;
  productList: Product[];
  initialFilter?: string;
};

export function CategoryPageLayout({
  category,
  activeSlug,
  productList,
  initialFilter,
}: CategoryPageLayoutProps) {
  const { t } = useLanguage();

  return (
    <>
      <Header variant="transparent" />
      <main>
        <section className="relative min-h-[42vh] md:min-h-[48vh] lg:min-h-[52vh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${category.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-niti-cream" />
          <div className="relative mx-auto flex min-h-[42vh] max-w-[1440px] flex-col justify-end px-4 pb-16 pt-28 md:min-h-[48vh] md:px-8 md:pb-20 md:pt-32 lg:px-12 lg:pb-24">
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/75">
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
            <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {category.title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
              {category.description}
            </p>
          </div>
        </section>

        <CategoryNavStrip activeSlug={activeSlug} />

        <div className="bg-niti-cream pb-20 pt-10 md:pt-14">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
            <ShopPageClient
              initialFilter={initialFilter ?? activeSlug}
              productList={productList}
              hideHeader
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
