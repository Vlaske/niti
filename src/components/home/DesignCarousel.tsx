"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { formatPrice } from "@/lib/utils";
import { useScrollReveal } from "@/lib/animations";
import { designCarouselItems } from "@/lib/data/collections";
import { useLanguage } from "@/context/LanguageContext";

export function DesignCarousel() {
  const { t, locale } = useLanguage();
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const items = designCarouselItems;

  useScrollReveal(ref, { selector: "[data-reveal]" });

  const prev = () =>
    setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <section ref={ref} className="overflow-hidden bg-niti-cream py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div data-reveal className="flex-1">
            <SectionHeader title={t("home.designTitle")} />
          </div>
          <div data-reveal>
            <CarouselControls onPrev={prev} onNext={next} />
          </div>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:gap-6 lg:overflow-visible">
          {items.map((item) => (
            <article
              key={item.id}
              data-reveal
              className="w-[min(85vw,320px)] shrink-0 snap-center lg:w-[calc(25%-18px)]"
            >
              <Link href={item.href} className="interactive group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-niti-charcoal shadow-lg transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                  <p className="absolute bottom-0 left-0 right-0 p-4 text-sm leading-relaxed text-white">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-niti-line bg-white p-3 transition-shadow group-hover:shadow-md">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-niti-sand">
                    <Image
                      src={item.thumb}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-niti-charcoal">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex gap-2 text-sm">
                      {item.compareAtPrice && (
                        <span className="text-niti-muted line-through">
                          {formatPrice(item.compareAtPrice, locale)}
                        </span>
                      )}
                      <span
                        className={
                          item.compareAtPrice
                            ? "font-medium text-niti-sale"
                            : "text-niti-charcoal"
                        }
                      >
                        {formatPrice(item.price, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
