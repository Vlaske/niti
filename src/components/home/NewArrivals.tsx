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
    const rooms = CATEGORY_GROUPS.map((g) => ({ id: g.id, label: g.title })).filter(
      (g) => source.some((p) => productMatchesCategory(p, g.id))
    );
    return [...base, ...rooms];
  }, [source, t]);

  const filtered = useMemo(() => {
    if (filter === "all") return source;
    return source.filter((p) => productMatchesCategory(p, filter));
  }, [filter, source]);

  const mobileSlice = filtered.slice(0, MOBILE_VISIBLE);
  const visibleDesktop = 4;
  const maxOffset = Math.max(0, filtered.length - visibleDesktop);

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

        <div data-section-reveal className="mt-5 md:mt-8">
          <FilterPills
            filters={filters}
            active={filter}
            onChange={(id) => {
              setFilter(id);
              setOffset(0);
            }}
            className="gap-x-4 gap-y-2 md:gap-x-8"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-niti-muted">
            {t("shop.empty")}
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
              {mobileSlice.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="relative mt-10 hidden overflow-hidden md:block">
              <div
                className="flex gap-6 transition-transform duration-700 ease-out"
                style={{
                  transform: `translateX(-${offset * (100 / visibleDesktop)}%)`,
                }}
              >
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="w-[calc(25%-18px)] shrink-0"
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
