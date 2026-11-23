"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { formatPrice, cn } from "@/lib/utils";
import { getDiscount } from "@/lib/pricing";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import { usePromo } from "@/context/PromoContext";
import type { DesignShowcaseItem } from "@/lib/catalog/design-showcase";

function ShowcasePrice({ item }: { item: DesignShowcaseItem }) {
  const { locale } = useLanguage();
  const promoActive = usePromo();
  const offer = getDiscount(item.price, item.compareAtPrice);
  const showPercent = Boolean(promoActive && offer && offer.percent >= 1);

  return (
    <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
      {offer ? (
        <span className="text-niti-muted line-through">
          {formatPrice(offer.compareAt, locale)}
        </span>
      ) : null}
      <span className={offer ? "font-medium text-niti-sale" : "text-niti-charcoal"}>
        {formatPrice(item.price, locale)}
      </span>
      {showPercent && offer ? (
        <span className="text-xs font-medium tabular-nums text-niti-sale">
          −{offer.percent}%
        </span>
      ) : null}
    </div>
  );
}

function ShowcaseMedia({ item }: { item: DesignShowcaseItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [preferStill, setPreferStill] = useState(false);
  const poster = item.poster || item.mediaSrc;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPreferStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || item.mediaType !== "video") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin: "120px", threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [item.mediaType]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || item.mediaType !== "video" || preferStill) return;

    if (!inView) {
      video.pause();
      return;
    }

    const onFrame = () => {
      setVideoReady(true);
      video.play().catch(() => {});
    };
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onFrame();
    } else {
      video.addEventListener("loadeddata", onFrame, { once: true });
    }

    return () => video.removeEventListener("loadeddata", onFrame);
  }, [inView, item.mediaSrc, item.mediaType, preferStill]);

  if (item.mediaType === "video") {
    return (
      <div ref={frameRef} className="absolute inset-0">
        <Image
          src={poster}
          alt=""
          fill
          sizes="320px"
          className={cn(
            "object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-105",
            videoReady && !preferStill ? "opacity-0" : "opacity-100"
          )}
        />
        {!preferStill ? (
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-105",
              videoReady ? "opacity-100" : "opacity-0"
            )}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden={!videoReady}
          >
            {inView ? <source src={item.mediaSrc} type="video/mp4" /> : null}
          </video>
        ) : null}
      </div>
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
  const { t } = useLanguage();
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
    <section ref={ref} className="overflow-hidden bg-niti-cream py-10 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
          <div data-reveal className="flex-1">
            <SectionHeader title={t("home.designTitle")} />
          </div>
          {showArrows && (
            <div data-reveal className="hidden sm:block">
              <CarouselControls
                onPrev={() => scrollByCard(-1)}
                onNext={() => scrollByCard(1)}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:hidden">
          {items.slice(0, 4).map((item) => (
            <article key={item.id} data-reveal>
              <Link href={item.href} className="interactive group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-niti-sand">
                  <ShowcaseMedia item={item} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                </div>
                <div className="mt-2">
                  <p className="line-clamp-2 text-sm font-semibold text-niti-charcoal">
                    {item.title}
                  </p>
                  <ShowcasePrice item={item} />
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="mt-10 hidden gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-4 scrollbar-hide md:flex md:gap-6 lg:gap-6"
        >
          {items.map((item) => (
            <article
              key={item.id}
              data-reveal
              className="w-[min(85vw,320px)] shrink-0 snap-center lg:w-[calc(25%-18px)]"
            >
              <Link href={item.href} className="interactive group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-niti-sand">
                  <ShowcaseMedia item={item} />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <p className="pointer-events-none absolute bottom-0 left-0 right-0 p-4 text-sm leading-relaxed text-white">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="truncate text-sm font-semibold text-niti-charcoal">
                    {item.title}
                  </p>
                  <ShowcasePrice item={item} />
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
