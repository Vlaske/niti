"use client";

import Image from "next/image";
import Link from "next/link";
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_IMAGE_FALLBACK } from "@/lib/catalog/categories";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type CategoryNavStripProps = {
  activeSlug: string;
  categories?: Category[];
  showProductCount?: boolean;
};

export function CategoryNavStrip({
  activeSlug,
  categories: categoriesProp,
  showProductCount = true,
}: CategoryNavStripProps) {
  const fromContext = useNavCategories();
  const categories = categoriesProp ?? fromContext;
  const { t } = useLanguage();

  return (
    <div className="relative z-20 -mt-6 px-4 md:-mt-12 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative">
          <div className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-4 rounded-2xl bg-white p-2 shadow-lg md:gap-3 md:p-3">
            <Link
              href="/shop"
              className={cn(
                "interactive flex min-w-[7.5rem] shrink-0 snap-start items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors sm:min-w-[9rem] sm:gap-3 sm:px-3 sm:py-2.5 md:min-w-[160px] md:px-4 md:py-3",
                activeSlug === "all"
                  ? "bg-niti-sand/80 ring-1 ring-niti-charcoal/10"
                  : "hover:bg-niti-cream"
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-niti-sand text-[10px] font-bold text-niti-charcoal sm:h-10 sm:w-10 sm:text-xs md:h-12 md:w-12">
                {t("shop.filters.all").slice(0, 1)}
              </span>
              <span className="block text-xs font-semibold sm:text-sm md:text-base">
                {t("shop.filters.all")}
              </span>
            </Link>
            {categories.map((cat) => {
              const active = activeSlug === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  className={cn(
                    "interactive flex min-w-[8.5rem] shrink-0 snap-start items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors sm:min-w-[10rem] sm:gap-3 sm:px-3 sm:py-2.5 md:min-w-[180px] md:px-4 md:py-3",
                    active
                      ? "bg-niti-sand/80 ring-1 ring-niti-charcoal/10"
                      : "hover:bg-niti-cream"
                  )}
                >
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-niti-sand sm:h-10 sm:w-10 md:h-12 md:w-12">
                    <Image
                      src={cat.image || CATEGORY_IMAGE_FALLBACK}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <span>
                    <span className="block text-xs font-semibold sm:text-sm md:text-base">
                      {cat.title}
                    </span>
                    {showProductCount && cat.productCount > 0 && (
                      <span className="block text-[10px] text-niti-muted sm:text-xs">
                        {cat.productCount} {t("common.products")}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
