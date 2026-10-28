"use client";

import Link from "next/link";
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { ScrollableNav } from "@/components/shop/ScrollableNav";
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

  const linkClass = (active: boolean) =>
    cn(
      "interactive shrink-0 border-b py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 sm:tracking-[0.16em] md:py-1 md:text-xs",
      active
        ? "border-niti-charcoal text-niti-charcoal"
        : "border-transparent text-niti-muted hover:border-niti-charcoal/30 hover:text-niti-charcoal"
    );

  return (
    <nav className="border-b border-niti-line bg-niti-cream">
      <div className="mx-auto max-w-[1440px]">
        <ScrollableNav>
          <Link href={allHref} className={linkClass(activeSlug === "all")}>
            {firstLabel}
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className={linkClass(activeSlug === cat.slug)}
            >
              {cat.title}
            </Link>
          ))}
        </ScrollableNav>
      </div>
    </nav>
  );
}
