"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import { categories } from "@/lib/data/categories";

export function CollectionsGrid() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  useScrollReveal(ref, { selector: "[data-card]", stagger: 0.1 });

  return (
    <section ref={ref} className="bg-niti-cream py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <SectionHeader
          title={t("home.exploreCollections")}
          viewAllHref="/shop"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {categories.map((col) => (
            <Link
              key={col.slug}
              href={`/shop/${col.slug}`}
              data-card
              className="interactive group relative aspect-[4/5] overflow-hidden rounded-2xl md:aspect-[3/4]"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition-opacity group-hover:from-black/75" />
              <div className="absolute bottom-0 left-0 w-full p-5 text-white md:p-6">
                <h3 className="font-serif text-2xl font-semibold leading-tight md:text-3xl lg:text-4xl">
                  {col.title}
                </h3>
                <p className="mt-2 text-sm text-white/80 md:text-base">
                  {col.productCount} {t("common.products")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
