"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useNavCategories } from "@/context/CategoriesContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useLanguage } from "@/context/LanguageContext";
import { getStoreCategoryBySlug } from "@/config/store-categories";
import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";
import type { Product } from "@/types";

type ProductPageViewProps = {
  product: Product;
  related: Product[];
};

export function ProductPageView({
  product,
  related,
}: ProductPageViewProps) {
  const { t } = useLanguage();
  const navCategories = useNavCategories();
  const { addViewed, products: recent } = useRecentlyViewed();
  const mainRef = useRef<HTMLDivElement>(null);

  const images = product.images ?? [product.image];
  const recentExcluding = recent
    .filter((p) => p.handle !== product.handle)
    .slice(0, 4);

  const storeCat = getStoreCategoryBySlug(product.category);
  const showCategoryCrumb =
    product.category !== "all" && Boolean(storeCat);

  useEffect(() => {
    addViewed(product.handle);
  }, [product.handle, addViewed]);

  useEffect(() => {
    if (!mainRef.current) return;
    const els = mainRef.current.querySelectorAll("[data-pdp-reveal]");
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }
    );
    return () => {
      gsap.killTweensOf(els);
      gsap.set(els, { clearProps: "all" });
    };
  }, [product.handle]);

  return (
    <div ref={mainRef}>
      <nav
        data-pdp-reveal
        className="mb-8 flex flex-wrap gap-1 text-sm text-niti-muted"
      >
        <Link href="/" className="interactive hover:text-niti-charcoal">
          {t("product.home")}
        </Link>
        <span className="mx-1">/</span>
        <Link href="/shop" className="interactive hover:text-niti-charcoal">
          {t("product.shop")}
        </Link>
        {showCategoryCrumb && storeCat && (
          <>
            <span className="mx-1">/</span>
            <Link
              href={`/shop/${storeCat.slug}`}
              className="interactive hover:text-niti-charcoal"
            >
              {storeCat.title}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div data-pdp-reveal>
          <ProductGallery images={images} title={product.title} />
        </div>
        <div data-pdp-reveal>
          <ProductDetails product={product} />
        </div>
      </div>

      <section
        data-pdp-reveal
        className="mt-12 grid gap-4 rounded-xl border border-niti-line bg-niti-sand/40 p-6 sm:grid-cols-2"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            {t("product.details")}
          </h3>
          <ProductDescription
            html={product.descriptionHtml}
            plain={product.description}
          />
        </div>
        <ul className="space-y-2 text-sm text-niti-muted">
          <li>✓ {t("product.shipping")}</li>
          <li>✓ {t("product.returns")}</li>
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-20 border-t border-niti-line pt-16">
          <SectionHeader title={t("product.alsoLike")} className="mb-10" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentExcluding.length > 0 && (
        <section className="mt-20 border-t border-niti-line pt-16">
          <SectionHeader
            title={t("product.recentlyViewed")}
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {recentExcluding.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {navCategories.length > 0 && (
        <section className="mt-20 border-t border-niti-line pt-16">
          <SectionHeader
            title={t("product.categories")}
            viewAllHref="/shop"
            viewAllLabel={t("home.viewAll")}
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {navCategories.map((col) => (
              <Link
                key={col.slug}
                href={`/shop/${col.slug}`}
                className="interactive group relative aspect-[4/3] overflow-hidden rounded-xl"
              >
                <Image
                  src={col.image || CATEGORY_IMAGE_FALLBACK}
                  alt={col.title}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
                <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                  {col.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
