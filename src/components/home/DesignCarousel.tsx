"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { formatPrice } from "@/lib/utils";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import type { DesignShowcaseItem } from "@/lib/catalog/design-showcase";

function ShowcaseMedia({ item }: { item: DesignShowcaseItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || item.mediaType !== "video") return;
    video.play().catch(() => {});
  }, [item.mediaSrc, item.mediaType]);

  if (item.mediaType === "video") {
    return (
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        autoPlay
        muted
        loop
        playsInline
        poster={item.poster}
      >
        <source src={item.mediaSrc} type="video/mp4" />
      </video>
    );
  }

  return (
    <Image
      src={item.mediaSrc}
      alt={item.title}
      fill
      sizes="320px"
      className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

type DesignCarouselProps = {
  items: DesignShowcaseItem[];
};

export function DesignCarousel({ items }: DesignCarouselProps) {
  const { t, locale } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useScrollReveal(ref, { selector: "[data-reveal]" });

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("article");
    const gap = 16;
    const step = (card?.offsetWidth ?? 300) + gap;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  if (items.length === 0) return null;

  const showArrows = items.length > 1;

  return (
    <section ref={ref} className="overflow-hidden bg-niti-cream py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div data-reveal className="flex-1">
            <SectionHeader title={t("home.designTitle")} />
          </div>
          {showArrows && (
            <div data-reveal>
              <CarouselControls
                onPrev={() => scrollByCard(-1)}
                onNext={() => scrollByCard(1)}
              />
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-4 scrollbar-hide md:gap-6 lg:gap-6"
        >
          {items.map((item) => (
            <article
              key={item.id}
              data-reveal
              className="w-[min(85vw,320px)] shrink-0 snap-center lg:w-[calc(25%-18px)]"
            >
              <Link href={item.href} className="interactive group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-niti-sand">
                  <ShowcaseMedia item={item} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <p className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 text-sm leading-relaxed text-white">
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
