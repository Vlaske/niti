"use client";

import Link from "next/link";
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

type CategoryNavStripProps = {
  activeSlug: string;
  categories?: Category[];
  allHref?: string;
  allLabel?: string;
};

/** Single underline strip — siblings in the current room (breadcrumb shows the room). */
export function CategoryNavStrip({
  activeSlug,
  categories: categoriesProp,
  allHref = "/shop",
  allLabel,
}: CategoryNavStripProps) {
  const fromContext = useNavCategories();
  const categories = categoriesProp ?? fromContext;
  const { t } = useLanguage();
  const firstLabel = allLabel ?? t("shop.filters.all");

  return (
    <nav className="border-b border-niti-line bg-niti-cream">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="scrollbar-hide flex gap-6 overflow-x-auto py-4 md:gap-8 md:py-5">
          <Link
            href={allHref}
              className={cn(
                "interactive shrink-0 border-b pb-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 md:text-xs",
                activeSlug === "all"
                  ? "border-niti-charcoal text-niti-charcoal"
                  : "border-transparent text-niti-muted hover:border-niti-charcoal/30 hover:text-niti-charcoal"
              )}
          >
            {firstLabel}
          </Link>
          {categories.map((cat) => {
            const active = activeSlug === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                  className={cn(
                    "interactive shrink-0 border-b pb-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 md:text-xs",
                    active
                      ? "border-niti-charcoal text-niti-charcoal"
                      : "border-transparent text-niti-muted hover:border-niti-charcoal/30 hover:text-niti-charcoal"
                  )}
              >
                {cat.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
