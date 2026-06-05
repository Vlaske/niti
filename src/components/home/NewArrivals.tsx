"use client";

import { useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilterPills } from "@/components/ui/FilterPills";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { ProductCard } from "@/components/shop/ProductCard";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import { useNavCategories } from "@/context/CategoriesContext";
import { products as mockProducts } from "@/lib/data/products";
import type { Product } from "@/types";

type NewArrivalsProps = {
  products?: Product[];
};

export function NewArrivals({ products: productList }: NewArrivalsProps) {
  const source = productList ?? mockProducts;
  const { t } = useLanguage();
  const navCategories = useNavCategories();
  const [filter, setFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const filters = [
    { id: "all", label: t("shop.filters.all") },
    ...navCategories.map((c) => ({ id: c.slug, label: c.title })),
  ];

  const filtered =
    filter === "all"
      ? source
      : source.filter((p) => p.category === filter);

  const visibleDesktop = 4;
  const maxOffset = Math.max(0, filtered.length - visibleDesktop);

  useScrollReveal(sectionRef, { selector: "[data-section-reveal]" });

  return (
    <section
      ref={sectionRef}
      className="bg-niti-cream py-12 md:py-24"
      id="new-arrivals"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div data-section-reveal>
          <SectionHeader title={t("home.newArrivals")} viewAllHref="/shop" />
        </div>

        <div data-section-reveal className="mt-6 md:mt-8">
          <div className="relative -mx-4 md:mx-0">
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 md:hidden">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`interactive shrink-0 snap-start rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    filter === f.id
                      ? "bg-niti-charcoal text-white"
                      : "border border-niti-line bg-white text-niti-charcoal"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="mt-3 hidden md:block">
              <FilterPills
                filters={filters}
                active={filter}
                onChange={(id) => {
                  setFilter(id);
                  setOffset(0);
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile: native horizontal scroll */}
        <div className="relative mt-6 md:hidden">
          <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1">
            {filtered.map((product) => (
              <div
                key={product.id}
                data-section-reveal
                className="w-[46vw] max-w-[200px] shrink-0 snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: carousel */}
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
                data-section-reveal
                className="w-[calc(25%-18px)] shrink-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <CarouselControls
              onPrev={() => setOffset((o) => Math.max(0, o - 1))}
              onNext={() => setOffset((o) => Math.min(maxOffset, o + 1))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
