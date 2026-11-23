"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { gsap } from "gsap";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilterPills } from "@/components/ui/FilterPills";
import { ProductCard } from "@/components/shop/ProductCard";
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  FILTER_TAG_LABELS,
  LEAF_REFINE_TAGS,
  productMatchesCategory,
} from "@/config/store-categories";
import { products as mockProducts } from "@/lib/data/products";
import { sortByFeatured } from "@/lib/catalog/ranking";
import { compareDiscounts, getDiscount } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

type SortKey =
  | "featured"
  | "discount"
  | "newest"
  | "price-asc"
  | "price-desc";
type GridDensity = "large" | "medium" | "small";

type ShopPageClientProps = {
  initialFilter?: string;
  title?: string;
  description?: string;
  productList?: Product[];
  categoryFilters?: { id: string; label: string }[];
  hideHeader?: boolean;
  /** Sakrij FilterPills — koristi RoomNavStrip / CategoryNavStrip umesto toga */
  hideFilters?: boolean;
  /**
   * Leaf slug za uske refine tagove (npr. carsavi → lastiš / nepromočivi).
   * Ako nije setovan, refine se ne prikazuje.
   */
  refineCategorySlug?: string;
  /** Only products with a real compare-at price. */
  saleOnly?: boolean;
};

const GRID_CLASS: Record<GridDensity, string> = {
  large:
    "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3",
  medium:
    "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12 lg:grid-cols-4",
  small:
    "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 md:gap-y-9 lg:grid-cols-5 xl:grid-cols-6",
};

function GridDensityIcon({
  density,
  active,
}: {
  density: GridDensity;
  active: boolean;
}) {
  const color = active ? "currentColor" : "currentColor";
  if (density === "large") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill={color}>
        <rect x="1" y="1" width="6.5" height="6.5" rx="0.5" />
        <rect x="8.5" y="1" width="6.5" height="6.5" rx="0.5" />
        <rect x="1" y="8.5" width="6.5" height="6.5" rx="0.5" />
        <rect x="8.5" y="8.5" width="6.5" height="6.5" rx="0.5" />
      </svg>
    );
  }
  if (density === "medium") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill={color}>
        <rect x="1" y="1" width="4" height="4" rx="0.4" />
        <rect x="6" y="1" width="4" height="4" rx="0.4" />
        <rect x="11" y="1" width="4" height="4" rx="0.4" />
        <rect x="1" y="6" width="4" height="4" rx="0.4" />
        <rect x="6" y="6" width="4" height="4" rx="0.4" />
        <rect x="11" y="6" width="4" height="4" rx="0.4" />
        <rect x="1" y="11" width="4" height="4" rx="0.4" />
        <rect x="6" y="11" width="4" height="4" rx="0.4" />
        <rect x="11" y="11" width="4" height="4" rx="0.4" />
      </svg>
    );
  }
  return (
    <LayoutGrid
      className="h-4 w-4"
      strokeWidth={active ? 2.25 : 1.75}
      aria-hidden
    />
  );
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) out.push("…");
    out.push(n);
  }
  return out;
}

export function ShopPageClient({
  initialFilter = "all",
  title,
  description,
  productList,
  categoryFilters: categoryFiltersProp,
  hideHeader = false,
  hideFilters = false,
  refineCategorySlug,
  saleOnly = false,
}: ShopPageClientProps) {
  const { t } = useLanguage();
  const navCategories = useNavCategories();
  const [filter, setFilter] = useState(initialFilter);
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>(
    saleOnly ? "discount" : "featured"
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [density, setDensity] = useState<GridDensity>("medium");
  const [pageInput, setPageInput] = useState("");
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

  /** Refine samo unutar leaf kategorije — nikad globalni spam tagova */
  const tagFilters = useMemo(() => {
    if (!refineCategorySlug) return [];
    const allowed = LEAF_REFINE_TAGS[refineCategorySlug];
    if (!allowed?.length) return [];

    const counts = new Map<string, number>();
    for (const p of source) {
      for (const tag of p.tags ?? []) {
        if (!allowed.includes(tag)) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return allowed
      .filter((id) => (counts.get(id) ?? 0) > 0)
      .map((id) => ({
        id,
        label: FILTER_TAG_LABELS[id] ?? id.replace("filter:", ""),
      }));
  }, [source, refineCategorySlug]);

  const filtered = useMemo(() => {
    let list =
      filter === "all"
        ? [...source]
        : source.filter((p) => productMatchesCategory(p, filter));

    if (saleOnly) {
      list = list.filter((p) => getDiscount(p.price, p.compareAtPrice));
    }

    if (tagFilter !== "all") {
      list = list.filter((p) => p.tags?.includes(tagFilter));
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "discount":
        list.sort((a, b) => {
          const left = getDiscount(a.price, a.compareAtPrice);
          const right = getDiscount(b.price, b.compareAtPrice);
          if (!left || !right) return 0;
          return compareDiscounts(left, right);
        });
        break;
      default:
        if (saleOnly) {
          list.sort((a, b) => {
            const left = getDiscount(a.price, a.compareAtPrice);
            const right = getDiscount(b.price, b.compareAtPrice);
            if (!left || !right) return 0;
            return compareDiscounts(left, right);
          });
        } else {
          list = sortByFeatured(list);
        }
    }
    return list;
  }, [filter, tagFilter, sort, source, saleOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + pageSize, filtered.length);

  useEffect(() => {
    setPage(1);
    setPageInput("1");
  }, [filter, tagFilter, sort, pageSize, initialFilter, saleOnly]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPageInput(String(safePage));
  }, [safePage]);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".product-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.03,
        ease: "power2.out",
      }
    );
  }, [filter, tagFilter, sort, safePage, density, pageSize]);

  const goToPage = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    setPage(clamped);
    setPageInput(String(clamped));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitPageJump = () => {
    const n = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(n)) {
      setPageInput(String(safePage));
      return;
    }
    goToPage(n);
  };

  const progressPct =
    filtered.length === 0 ? 0 : Math.min(100, (showingTo / filtered.length) * 100);

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

      <div className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <SectionHeader
          title={`${filtered.length} ${t("shop.products")}`}
          className="flex-1"
        />
        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end md:gap-3">
          <div
            className="flex items-center gap-0.5 rounded-md border border-niti-line bg-white p-1"
            role="group"
            aria-label={t("shop.gridDensity")}
          >
            {(["large", "medium", "small"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setDensity(size)}
                title={
                  size === "large"
                    ? t("shop.gridLarge")
                    : size === "medium"
                      ? t("shop.gridMedium")
                      : t("shop.gridSmall")
                }
                className={cn(
                  "interactive flex h-9 w-9 items-center justify-center rounded transition-colors sm:h-8 sm:w-8",
                  density === size
                    ? "bg-niti-charcoal text-white"
                    : "text-niti-muted hover:text-niti-charcoal"
                )}
                aria-pressed={density === size}
                aria-label={
                  size === "large"
                    ? t("shop.gridLarge")
                    : size === "medium"
                      ? t("shop.gridMedium")
                      : t("shop.gridSmall")
                }
              >
                <GridDensityIcon density={size} active={density === size} />
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-niti-muted">{t("shop.pageSize")}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="interactive min-h-9 rounded-md border border-niti-line bg-white px-2.5 py-2 text-sm sm:px-3"
              aria-label={t("shop.pageSize")}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:flex-none">
            <span className="shrink-0 text-niti-muted">{t("shop.sort")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="interactive min-h-9 min-w-0 flex-1 rounded-md border border-niti-line bg-white px-2.5 py-2 text-sm sm:flex-none sm:px-3"
            >
              {saleOnly ? (
                <option value="discount">{t("shop.sortDiscount")}</option>
              ) : (
                <option value="featured">{t("shop.sortFeatured")}</option>
              )}
              <option value="newest">{t("shop.sortNewest")}</option>
              <option value="price-asc">{t("shop.sortPriceAsc")}</option>
              <option value="price-desc">{t("shop.sortPriceDesc")}</option>
            </select>
          </label>
        </div>
      </div>

      {!hideFilters && (
        <FilterPills
          filters={filters}
          active={filter}
          onChange={setFilter}
          className="mb-5"
        />
      )}

      {tagFilters.length > 0 && (
        <FilterPills
          filters={[
            { id: "all", label: t("shop.filters.all") },
            ...tagFilters,
          ]}
          active={tagFilter}
          onChange={setTagFilter}
          className="mb-5"
        />
      )}

      <p className="mb-6 text-sm text-niti-muted">
        {t("shop.showing")} {showingFrom}–{showingTo} {t("shop.of")}{" "}
        {filtered.length}
      </p>

      <div ref={gridRef} className={GRID_CLASS[density]}>
        {paginated.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={density === "small" ? "compact" : "grid"}
            preferPercentBadge={saleOnly}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-niti-muted">
          {saleOnly ? t("shop.emptySale") : t("shop.empty")}
        </p>
      )}

      {filtered.length > 0 && (
        <nav
          className="mt-12 border-y border-niti-line py-5"
          aria-label={t("shop.pagination")}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            {/* Range + progress */}
            <div className="min-w-0 lg:w-[200px] lg:shrink-0">
              <p className="text-sm tabular-nums tracking-tight">
                <span className="font-semibold text-niti-charcoal">
                  {showingFrom}–{showingTo}
                </span>
                <span className="text-niti-muted">
                  {" "}
                  / {filtered.length} {t("shop.products")}
                </span>
              </p>
              <div
                className="mt-2.5 h-px w-full bg-niti-line"
                role="presentation"
              >
                <div
                  className="h-px bg-niti-charcoal transition-[width] duration-300 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Page numbers */}
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="interactive flex h-9 w-9 items-center justify-center text-niti-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={t("shop.prevPage")}
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>

                {pageWindow(safePage, totalPages).map((item, idx) =>
                  item === "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-sm text-niti-muted"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      aria-current={item === safePage ? "page" : undefined}
                      className={cn(
                        "interactive flex h-9 min-w-9 items-center justify-center px-2 text-sm tabular-nums transition-colors",
                        item === safePage
                          ? "bg-niti-charcoal font-medium text-white"
                          : "text-niti-muted hover:text-niti-charcoal"
                      )}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="interactive flex h-9 w-9 items-center justify-center text-niti-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={t("shop.nextPage")}
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <div className="hidden lg:block" />
            )}

            {/* Jump to page */}
            {totalPages > 1 ? (
              <form
                className="flex items-center justify-center gap-2 lg:w-[200px] lg:shrink-0 lg:justify-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitPageJump();
                }}
              >
                <label
                  htmlFor="shop-goto-page"
                  className="text-sm text-niti-muted"
                >
                  {t("shop.pageOf")}
                </label>
                <input
                  id="shop-goto-page"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pageInput}
                  onChange={(e) =>
                    setPageInput(e.target.value.replace(/[^\d]/g, ""))
                  }
                  onBlur={submitPageJump}
                  onFocus={(e) => e.target.select()}
                  aria-label={t("shop.goToPage")}
                  className="w-10 border-0 border-b border-niti-charcoal bg-transparent pb-0.5 text-center text-sm font-medium tabular-nums text-niti-charcoal outline-none focus:border-niti-charcoal"
                />
                <span className="text-sm tabular-nums text-niti-muted">
                  / {totalPages}
                </span>
              </form>
            ) : null}
          </div>
        </nav>
      )}
    </div>
  );
}
