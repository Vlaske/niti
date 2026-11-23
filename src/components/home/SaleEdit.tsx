"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";
import {
  getGroupById,
  getGroupForCategorySlug,
  getStoreCategoryBySlug,
} from "@/config/store-categories";
import { productImageSrc } from "@/lib/product-image";
import { getDiscount } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/translations";
import type { Product } from "@/types";

type SaleEditProps = {
  products: Product[];
  endsOn?: string | null;
};

function formatUntil(iso: string, locale: Locale) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(locale === "sr" ? "sr-Latn-RS" : "en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** End of `YYYY-MM-DD` in Europe/Belgrade, as a UTC millisecond timestamp. */
function belgradeEndMs(iso: string): number | null {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;

  let utc = Date.UTC(year, month - 1, day, 22, 59, 59);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Belgrade",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  for (let i = 0; i < 4; i++) {
    const parts = Object.fromEntries(
      fmt.formatToParts(new Date(utc)).map((part) => [part.type, part.value])
    );
    const asUtc = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const delta = Date.UTC(year, month - 1, day, 23, 59, 59) - asUtc;
    if (delta === 0) break;
    utc += delta;
  }

  return utc;
}

function SaleCountdown({ endsOn, until }: { endsOn: string; until: string }) {
  const { t } = useLanguage();
  const [left, setLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const end = belgradeEndMs(endsOn);
    if (end == null) return;

    const tick = () => {
      const total = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setLeft({
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
      });
      setReady(true);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsOn]);

  if (ready && left.days + left.hours + left.minutes + left.seconds === 0) {
    return null;
  }

  const units = [
    { value: left.days, label: t("home.saleDays") },
    { value: left.hours, label: t("home.saleHours") },
    { value: left.minutes, label: t("home.saleMin") },
    { value: left.seconds, label: t("home.saleSec") },
  ];

  return (
    <div>
      <p className="sr-only">{until}</p>
      <div className="flex gap-1.5" aria-hidden>
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex w-12 flex-col items-center rounded-lg border border-white/15 bg-white/[0.04] px-1 py-2 sm:w-14"
          >
            <span className="text-lg font-medium tabular-nums leading-none text-niti-cream">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-niti-cream/50">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function saleCaption(product: Product) {
  const groupId = getGroupForCategorySlug(product.category);
  const room = groupId ? getGroupById(groupId)?.title : undefined;
  const leaf = getStoreCategoryBySlug(product.category)?.title;
  if (room && leaf && leaf.toLowerCase() !== room.toLowerCase()) {
    return `${room} · ${leaf}`;
  }
  return room || leaf || "";
}

function SaleCard({ product, best }: { product: Product; best: boolean }) {
  const { t, locale } = useLanguage();
  const offer = getDiscount(product.price, product.compareAtPrice);
  const caption = saleCaption(product);

  return (
    <Link
      href={`/product/${product.handle}`}
      className="interactive group flex h-full flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-[#3a3633]">
        <Image
          src={productImageSrc(product.image)}
          alt=""
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 22vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          draggable={false}
        />
        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] items-center gap-1.5">
          {offer && offer.percent >= 1 ? (
            <span className="bg-niti-sale px-2 py-1.5 text-[12px] font-semibold tabular-nums leading-none tracking-tight text-white shadow-sm shadow-black/15 sm:text-[13px]">
              −{offer.percent}%
            </span>
          ) : null}
          {best ? (
            <span className="truncate bg-niti-cream px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] leading-none text-niti-charcoal">
              {t("home.saleBest")}
            </span>
          ) : null}
        </div>
      </div>

      {caption ? (
        <p className="mt-3 line-clamp-1 text-[10px] font-medium uppercase tracking-[0.14em] text-niti-cream/55">
          {caption}
        </p>
      ) : null}
      <h3 className="mt-1.5 line-clamp-2 min-h-[2lh] text-sm font-medium leading-snug text-niti-cream">
        {product.title}
      </h3>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {offer ? (
          <>
            <span className="text-[15px] font-semibold tabular-nums tracking-tight text-niti-cream">
              {formatPrice(product.price, locale)}
            </span>
            <span className="text-xs tabular-nums text-niti-cream/45 line-through">
              {formatPrice(offer.compareAt, locale)}
            </span>
            <span className="text-xs font-medium text-niti-sale">
              {t("product.save")} {formatPrice(offer.savings, locale)}
            </span>
          </>
        ) : (
          <span className="text-[15px] font-semibold tabular-nums tracking-tight text-niti-cream">
            {formatPrice(product.price, locale)}
          </span>
        )}
      </div>
    </Link>
  );
}

export function SaleEdit({ products, endsOn }: SaleEditProps) {
  const { t, locale } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const bestId = useMemo(() => {
    const top = products[0];
    const next = products[1];
    if (!top) return null;
    const topPercent = getDiscount(top.price, top.compareAtPrice)?.percent ?? 0;
    const nextPercent = next
      ? (getDiscount(next.price, next.compareAtPrice)?.percent ?? 0)
      : -1;
    if (topPercent < 5 || topPercent === nextPercent) return null;
    return top.id;
  }, [products]);

  useScrollReveal(sectionRef, {
    selector: "[data-section-reveal]",
    y: 16,
    stagger: 0.06,
  });

  if (products.length === 0) return null;

  const until = endsOn
    ? `${t("home.saleUntil")} ${formatUntil(endsOn, locale)}`
    : null;

  const cardStep = () => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector<HTMLElement>("[data-sale-card]");
    if (!scroller || !card) return null;
    const styles = window.getComputedStyle(scroller);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    return card.offsetWidth + gap;
  };

  const syncActive = () => {
    const scroller = scrollerRef.current;
    const step = cardStep();
    if (!scroller || !step) return;
    const index = Math.round(scroller.scrollLeft / step);
    setActive(Math.min(products.length - 1, Math.max(0, index)));
  };

  const scrollByCard = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    const step = cardStep();
    if (!scroller || !step) return;
    scroller.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const scrollTo = (index: number) => {
    const scroller = scrollerRef.current;
    const step = cardStep();
    if (!scroller || !step) return;
    scroller.scrollTo({ left: index * step, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="snizeno"
      className="scroll-mt-20 bg-niti-charcoal text-niti-cream md:scroll-mt-24"
    >
      <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-14 lg:px-12 lg:py-16">
        <div
          data-section-reveal
          className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-niti-cream/55" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-niti-cream/75">
                {t("home.saleEyebrow")}
              </p>
            </div>
            <h2 className="mt-4 font-serif text-[2rem] font-medium leading-[1.08] tracking-tight text-niti-cream sm:text-4xl lg:text-[2.75rem]">
              {t("home.saleTitle")}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-niti-cream/60">
              {t("home.saleLead")}
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            {endsOn && until ? <SaleCountdown endsOn={endsOn} until={until} /> : null}
            <Link
              href="/shop?snizeno=1"
              className="interactive inline-flex min-h-11 items-center gap-3 border border-niti-cream/35 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-niti-cream transition-colors hover:border-niti-cream/70 hover:bg-white/5"
            >
              {t("home.saleViewAll")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div data-section-reveal className="mt-8 md:mt-10">
          <div
            ref={scrollerRef}
            onScroll={syncActive}
            className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 scrollbar-hide md:mx-0 md:scroll-px-0 md:px-0 md:gap-5 lg:gap-6"
          >
            {products.map((product) => (
              <div
                key={product.id}
                data-sale-card
                className="w-full shrink-0 snap-start md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-4.5rem)/4)]"
              >
                <SaleCard product={product} best={product.id === bestId} />
              </div>
            ))}
          </div>

          {products.length > 1 ? (
            <div className="mt-2 flex justify-center md:hidden">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  aria-current={index === active ? "true" : undefined}
                  aria-label={`${t("hero.slide")} ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className="interactive flex h-8 w-8 items-center justify-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all ${
                      index === active
                        ? "w-5 bg-niti-cream"
                        : "w-1.5 bg-niti-cream/35"
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : null}

          {products.length > 4 ? (
            <div className="mt-5 hidden justify-end md:flex [&_button]:border-niti-cream/25 [&_button]:text-niti-cream [&_button:hover]:border-niti-cream/55 [&_button:hover]:bg-white/5">
              <CarouselControls
                size="sm"
                onPrev={() => scrollByCard(-1)}
                onNext={() => scrollByCard(1)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
