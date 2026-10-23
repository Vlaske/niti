"use client";

import { useMemo, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilterPills } from "@/components/ui/FilterPills";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { ProductCard } from "@/components/shop/ProductCard";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import {
  CATEGORY_GROUPS,
  productMatchesCategory,
} from "@/config/store-categories";
import { products as mockProducts } from "@/lib/data/products";
import type { Product } from "@/types";

const MOBILE_VISIBLE = 6;

type NewArrivalsProps = {
  products?: Product[];
};

export function NewArrivals({ products: productList }: NewArrivalsProps) {
  const source = productList ?? mockProducts;
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const filters = useMemo(() => {
    const base = [{ id: "all", label: t("shop.filters.all") }];
    const rooms = CATEGORY_GROUPS.map((g) => ({
      id: g.id,
      label: g.title,
    })).filter((g) => source.some((p) => productMatchesCategory(p, g.id)));
    return [...base, ...rooms];
  }, [source, t]);

  const filtered = useMemo(() => {
    if (filter === "all") return source;
    return source.filter((p) => productMatchesCategory(p, filter));
  }, [filter, source]);

  const mobileSlice = filtered.slice(0, MOBILE_VISIBLE);
  const visibleDesktop = 4;
  const maxOffset = Math.max(0, filtered.length - visibleDesktop);

  const setRoomFilter = (id: string) => {
    setFilter(id);
    setOffset(0);
  };

  useScrollReveal(sectionRef, {
    selector: "[data-section-reveal]",
    y: 12,
    stagger: 0.03,
  });

  return (
    <section
      ref={sectionRef}
      className="bg-niti-cream py-10 md:py-24"
      id="new-arrivals"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div data-section-reveal>
          <SectionHeader
            title={t("home.newArrivals")}
            viewAllHref="/shop"
            viewAllLabel={t("home.viewAll")}
          />
        </div>

        {filters.length > 1 && (
          <div data-section-reveal className="mt-5 md:mt-8">
            {/* Mobile: one compact room select instead of 3 lines of pills */}
            <label className="flex items-center gap-3 md:hidden">
              <span className="shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-niti-muted">
                {t("shop.room")}
              </span>
              <select
                value={filter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="interactive min-h-10 min-w-0 flex-1 rounded-md border border-niti-line bg-white px-3 py-2 text-sm text-niti-charcoal"
              >
                {filters.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="hidden md:block">
              <FilterPills
                filters={filters}
                active={filter}
                onChange={setRoomFilter}
                className="gap-x-6 gap-y-2 md:gap-x-8"
              />
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-niti-muted">
            {t("shop.empty")}
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:hidden">
              {mobileSlice.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="relative mt-10 hidden overflow-hidden md:block">
              <div
                className="flex gap-8 transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${offset * (100 / visibleDesktop)}%)`,
                }}
              >
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="w-[calc(25%-24px)] shrink-0"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              {filtered.length > visibleDesktop && (
                <div className="mt-10 flex justify-center">
                  <CarouselControls
                    onPrev={() => setOffset((o) => Math.max(0, o - 1))}
                    onNext={() =>
                      setOffset((o) => Math.min(maxOffset, o + 1))
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
