"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import { useNavCategories } from "@/context/CategoriesContext";
import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";

export function CollectionsGrid() {
  const { t } = useLanguage();
  const categories = useNavCategories();
  const ref = useRef<HTMLElement>(null);

  useScrollReveal(ref, { selector: "[data-card]", stagger: 0.1 });

  return (
    <section ref={ref} className="bg-niti-cream py-12 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          title={t("home.exploreCollections")}
          viewAllHref="/shop"
          viewAllLabel={t("home.viewAll")}
        />

        {/* Mobile: horizontal snap scroll — compact cards */}
        <div className="relative mt-8 md:hidden">
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1">
            {categories.map((col) => (
              <Link
                key={col.slug}
                href={`/shop/${col.slug}`}
                data-card
                className="interactive group relative aspect-[4/5] w-[68vw] max-w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl"
              >
                <Image
                  src={col.image || CATEGORY_IMAGE_FALLBACK}
                  alt={col.title}
                  fill
                  sizes="70vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                  <h3 className="font-serif text-xl font-semibold leading-tight">
                    {col.title}
                  </h3>
                  {col.productCount > 0 && (
                    <p className="mt-1 text-xs text-white/80">
                      {col.productCount} {t("common.products")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="mt-10 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {categories.map((col) => (
            <Link
              key={col.slug}
              href={`/shop/${col.slug}`}
              data-card
              className="interactive group relative aspect-[3/4] overflow-hidden rounded-2xl"
            >
              <Image
                src={col.image || CATEGORY_IMAGE_FALLBACK}
                alt={col.title}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity group-hover:from-black/75" />
              <div className="absolute bottom-0 left-0 w-full p-5 text-white md:p-6">
                <h3 className="font-serif text-2xl font-semibold leading-tight md:text-3xl lg:text-4xl">
                  {col.title}
                </h3>
                {col.productCount > 0 && (
                  <p className="mt-2 text-sm text-white/80 md:text-base">
                    {col.productCount} {t("common.products")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
