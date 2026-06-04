"use client";

import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type CategoryNavStripProps = {
  activeSlug: string;
};

export function CategoryNavStrip({ activeSlug }: CategoryNavStripProps) {
  const { t } = useLanguage();

  return (
    <div className="relative z-20 -mt-8 px-4 md:-mt-12 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-lg md:gap-3 md:p-3">
          <Link
            href="/shop"
            className={cn(
              "interactive flex min-w-[140px] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors md:min-w-[160px] md:px-4 md:py-3",
              activeSlug === "all"
                ? "bg-niti-sand/80 ring-1 ring-niti-charcoal/10"
                : "hover:bg-niti-cream"
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-niti-sand text-xs font-bold text-niti-charcoal md:h-12 md:w-12">
              {t("shop.filters.all").slice(0, 1)}
            </span>
            <span>
              <span className="block text-sm font-semibold md:text-base">
                {t("shop.filters.all")}
              </span>
            </span>
          </Link>
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className={cn(
                  "interactive flex min-w-[150px] shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors md:min-w-[180px] md:px-4 md:py-3",
                  active
                    ? "bg-niti-sand/80 ring-1 ring-niti-charcoal/10"
                    : "hover:bg-niti-cream"
                )}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg md:h-12 md:w-12">
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <span>
                  <span className="block text-sm font-semibold md:text-base">
                    {cat.title}
                  </span>
                  <span className="block text-xs text-niti-muted">
                    {cat.productCount} {t("common.products")}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
