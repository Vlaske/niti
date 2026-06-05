"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilterPills } from "@/components/ui/FilterPills";
import { ProductCard } from "@/components/shop/ProductCard";
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import { products as mockProducts } from "@/lib/data/products";
import type { Product } from "@/types";

const PER_PAGE = 8;

type SortKey = "newest" | "price-asc" | "price-desc";

type ShopPageClientProps = {
  initialFilter?: string;
  title?: string;
  description?: string;
  productList?: Product[];
  categoryFilters?: { id: string; label: string }[];
  hideHeader?: boolean;
  /** Sakrij FilterPills (npr. na kategoriji gde već ima CategoryNavStrip) */
  hideFilters?: boolean;
};

export function ShopPageClient({
  initialFilter = "all",
  title,
  description,
  productList,
  categoryFilters: categoryFiltersProp,
  hideHeader = false,
  hideFilters = false,
}: ShopPageClientProps) {
  const { t } = useLanguage();
  const navCategories = useNavCategories();
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const source = productList ?? mockProducts;

  const categoryFilters = useMemo(
    () =>
      categoryFiltersProp ??
      navCategories.map((c) => ({ id: c.slug, label: c.title })),
    [categoryFiltersProp, navCategories]
  );

  const filters = useMemo(() => {
    return [{ id: "all", label: t("shop.filters.all") }, ...categoryFilters];
  }, [categoryFilters, t]);

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? [...source]
        : source.filter((p) => p.category === filter);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return list;
  }, [filter, sort, source]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = page < totalPages;

  useEffect(() => {
    setPage(1);
  }, [filter, sort]);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".product-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
      }
    );
  }, [filter, sort, page]);

  return (
    <div>
      {!hideHeader && (
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl font-semibold text-niti-charcoal md:text-5xl">
            {title ?? t("shop.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-niti-muted md:text-base">
            {description ?? t("shop.description")}
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title={`${filtered.length} ${t("shop.products")}`}
          className="flex-1"
        />
        <label className="flex items-center gap-2 text-sm">
          <span className="text-niti-muted">{t("shop.sort")}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="interactive rounded-md border border-niti-line bg-white px-3 py-2 text-sm"
          >
            <option value="newest">{t("shop.sortNewest")}</option>
            <option value="price-asc">{t("shop.sortPriceAsc")}</option>
            <option value="price-desc">{t("shop.sortPriceDesc")}</option>
          </select>
        </label>
      </div>

      {!hideFilters && (
        <FilterPills
          filters={filters}
          active={filter}
          onChange={setFilter}
          className="mb-8 md:mb-10"
        />
      )}

      <p className="mb-6 text-sm text-niti-muted">
        {t("shop.showing")} {paginated.length} {t("shop.of")} {filtered.length}
      </p>

      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
      >
        {paginated.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-niti-muted">{t("shop.empty")}</p>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="interactive rounded-md border border-niti-charcoal/20 px-8 py-3 text-sm font-medium transition-colors hover:border-niti-charcoal/40 hover:bg-niti-sand/50"
          >
            {t("shop.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
