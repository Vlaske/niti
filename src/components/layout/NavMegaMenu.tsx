"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { categories } from "@/lib/data/categories";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type NavMegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function NavMegaMenu({ open, onClose }: NavMegaMenuProps) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current || !open) return;
    const panel = panelRef.current;
    gsap.fromTo(
      panel,
      { opacity: 0, y: -6 },
      { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }
    );
    gsap.fromTo(
      panel.querySelectorAll("[data-mega-item]"),
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: 0.04,
        ease: "power2.out",
        delay: 0.05,
      }
    );
  }, [open]);

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-niti-line bg-niti-cream shadow-[0_24px_48px_rgba(42,40,38,0.12)] transition-[visibility,opacity] duration-200",
        open
          ? "pointer-events-auto visible opacity-100"
          : "pointer-events-none invisible opacity-0"
      )}
      aria-hidden={!open}
    >
      <div
        ref={panelRef}
        className="mx-auto w-full max-w-[1440px] px-4 py-5 md:px-8 md:py-7 lg:px-12"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-10">
          <aside className="flex shrink-0 flex-row flex-wrap gap-2 border-b border-niti-line pb-5 lg:w-[220px] lg:flex-col lg:gap-1 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
            <Link
              href="/shop"
              data-mega-item
              onClick={onClose}
              className="interactive group flex w-full min-w-[200px] flex-1 items-center justify-between rounded-xl bg-white px-4 py-3.5 text-[15px] font-semibold text-niti-charcoal shadow-sm ring-1 ring-niti-line/60 transition-shadow hover:shadow-md lg:flex-none"
            >
              {t("nav.allProducts")}
              <ArrowRight className="h-4 w-4 shrink-0 text-niti-muted transition-transform group-hover:translate-x-0.5 group-hover:text-niti-charcoal" />
            </Link>
            <Link
              href="/#new-arrivals"
              data-mega-item
              onClick={onClose}
              className="interactive flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-niti-charcoal transition-colors hover:bg-white lg:flex-none"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-niti-sage-dark" />
              <span className="truncate">{t("home.newArrivals")}</span>
              <span className="ml-auto shrink-0 rounded-full bg-niti-sage px-2 py-0.5 text-[10px] font-semibold text-white">
                {t("nav.new")}
              </span>
            </Link>
          </aside>

          <div className="min-w-0 flex-1">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-niti-muted">
              {t("nav.browseCategories")}
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  data-mega-item
                  onClick={onClose}
                  className="interactive group relative h-[120px] overflow-hidden rounded-xl sm:h-[140px] lg:h-[168px]"
                >
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-3 lg:p-4">
                    <span className="block font-serif text-lg font-semibold leading-tight text-white sm:text-xl">
                      {cat.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/75 sm:text-xs">
                      {cat.productCount} {t("common.products")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
