"use client";

import { useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FilterPills } from "@/components/ui/FilterPills";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { ProductCard } from "@/components/shop/ProductCard";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import { products as mockProducts } from "@/lib/data/products";
import type { Product } from "@/types";

type NewArrivalsProps = {
  products?: Product[];
};

export function NewArrivals({ products: productList }: NewArrivalsProps) {
  const source = productList ?? mockProducts;
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [offset, setOffset] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const filters = [
    { id: "all", label: t("shop.filters.all") },
    { id: "bedsheets", label: t("shop.filters.bedsheets") },
    { id: "towels", label: t("shop.filters.towels") },
    { id: "throws", label: t("shop.filters.throws") },
    { id: "accessories", label: t("shop.filters.accessories") },
  ];

  const filtered =
    filter === "all"
      ? source
      : source.filter((p) => p.category === filter);

  const visible = 5;
  const maxOffset = Math.max(0, filtered.length - visible);

  useScrollReveal(sectionRef, { selector: "[data-section-reveal]" });

  return (
    <section
      ref={sectionRef}
      className="bg-niti-cream py-16 md:py-24"
      id="new-arrivals"
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div data-section-reveal>
          <SectionHeader title={t("home.newArrivals")} viewAllHref="/shop" />
        </div>

        <div data-section-reveal className="mt-8">
          <FilterPills
            filters={filters}
            active={filter}
            onChange={(id) => {
              setFilter(id);
              setOffset(0);
            }}
          />
        </div>

        <div className="relative mt-10 overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-700 ease-out md:gap-6"
            style={{
              transform: `translateX(-${offset * (100 / visible)}%)`,
            }}
          >
            {filtered.map((product) => (
              <div
                key={product.id}
                data-section-reveal
                className="w-[calc(50%-8px)] shrink-0 sm:w-[calc(33.333%-16px)] md:w-[calc(25%-18px)] lg:w-[calc(20%-19.2px)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <CarouselControls
            onPrev={() => setOffset((o) => Math.max(0, o - 1))}
            onNext={() => setOffset((o) => Math.min(maxOffset, o + 1))}
          />
        </div>
      </div>
    </section>
  );
}
