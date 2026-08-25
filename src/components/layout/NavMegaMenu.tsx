"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { getGroupedNavCategories } from "@/config/store-categories";
import { useNavCategories } from "@/context/CategoriesContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type NavMegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function NavMegaMenu({ open, onClose }: NavMegaMenuProps) {
  const { t } = useLanguage();
  const enriched = useNavCategories();
  const panelRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const bySlug = new Map(enriched.map((c) => [c.slug, c]));
    return getGroupedNavCategories().map(({ group, categories }) => ({
      group,
      categories: categories.map((c) => bySlug.get(c.slug) ?? c),
    }));
  }, [enriched]);

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
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.02,
        ease: "power2.out",
        delay: 0.04,
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
        className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8 lg:px-12"
      >
        <div className="mb-6 flex flex-wrap items-center gap-6 border-b border-niti-line pb-4">
          <Link
            href="/shop"
            data-mega-item
            onClick={onClose}
            className="interactive group flex items-center gap-2 text-sm font-semibold text-niti-charcoal"
          >
            {t("nav.allProducts")}
            <ArrowRight className="h-4 w-4 text-niti-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/#new-arrivals"
            data-mega-item
            onClick={onClose}
            className="interactive flex items-center gap-2 text-sm font-medium text-niti-muted transition-colors hover:text-niti-charcoal"
          >
            <Sparkles className="h-4 w-4 text-niti-sage-dark" strokeWidth={1.5} />
            {t("home.newArrivals")}
            <span className="bg-niti-sage px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {t("nav.new")}
            </span>
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {grouped.map(({ group, categories }) => (
            <div key={group.id} data-mega-item className="min-w-0">
              <Link
                href={`/shop/${group.id}`}
                onClick={onClose}
                className="interactive mb-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-niti-muted hover:text-niti-charcoal"
              >
                {group.title}
              </Link>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/shop/${cat.slug}`}
                      onClick={onClose}
                      className="interactive block py-0.5 text-sm text-niti-charcoal hover:opacity-70"
                    >
                      {cat.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
