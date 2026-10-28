"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
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
  const [roomOpen, setRoomOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);

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
    setRoomOpen(false);
  };

  useEffect(() => {
    if (!roomOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!roomRef.current?.contains(event.target as Node)) setRoomOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRoomOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [roomOpen]);

  const activeRoom = filters.find((item) => item.id === filter) ?? filters[0];

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
          <div
            data-section-reveal
            className={cn("mt-5 md:mt-8", roomOpen && "relative z-30")}
          >
            <div ref={roomRef} className="relative md:hidden">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={roomOpen}
                onClick={() => setRoomOpen((open) => !open)}
                className="interactive flex h-11 w-full items-center gap-3 rounded-md border border-niti-line bg-white px-3.5 text-left"
              >
                <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-niti-muted">
                  {t("shop.room")}
                </span>
                <span className="min-w-0 flex-1 truncate text-right text-[11px] font-medium uppercase tracking-[0.16em] text-niti-charcoal">
                  {activeRoom?.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-niti-charcoal transition-transform duration-200",
                    roomOpen && "rotate-180"
                  )}
                />
              </button>
              {roomOpen ? (
                <ul
                  role="listbox"
                  aria-label={t("shop.room")}
                  className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-niti-line bg-niti-cream py-1.5 shadow-sm"
                >
                  {filters.map((item) => {
                    const selected = item.id === filter;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => setRoomFilter(item.id)}
                          className={cn(
                            "interactive flex w-full px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.16em]",
                            selected
                              ? "text-niti-charcoal"
                              : "text-niti-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "border-b pb-0.5",
                              selected
                                ? "border-niti-charcoal"
                                : "border-transparent"
                            )}
                          >
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

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
