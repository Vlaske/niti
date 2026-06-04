"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Globe,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { NavMegaMenu } from "@/components/layout/NavMegaMenu";
import { formatPrice, cn } from "@/lib/utils";

type HeaderProps = {
  variant?: "transparent" | "solid";
};

export function Header({ variant = "solid" }: HeaderProps) {
  const { itemCount, subtotal } = useCart();
  const { t, locale, setLocale } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isTransparent =
    variant === "transparent" && !scrolled && !menuOpen && !megaOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          isTransparent
            ? "bg-transparent text-white"
            : "bg-niti-cream/95 text-niti-charcoal shadow-sm backdrop-blur-md",
          megaOpen && "bg-niti-cream/98 text-niti-charcoal shadow-md"
        )}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="relative mx-auto max-w-[1440px]">
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8 lg:gap-8 lg:px-12 lg:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
                onClick={() => setMenuOpen((o) => !o)}
                className="interactive p-1.5 lg:hidden"
              >
                {menuOpen ? (
                  <X className="h-6 w-6" strokeWidth={1.5} />
                ) : (
                  <Menu className="h-6 w-6" strokeWidth={1.5} />
                )}
              </button>

              <nav className="hidden items-center gap-10 lg:flex">
                <button
                  type="button"
                  className="interactive flex items-center gap-1.5 text-base font-medium tracking-wide lg:text-lg"
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  onMouseEnter={() => setMegaOpen(true)}
                  onClick={() => setMegaOpen((o) => !o)}
                >
                  {t("nav.shop")}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      megaOpen && "rotate-180"
                    )}
                    strokeWidth={2}
                  />
                </button>
                <Link
                  href="/#faq"
                  className="interactive text-base font-medium tracking-wide lg:text-lg"
                >
                  {t("nav.about")}
                </Link>
              </nav>
            </div>

            <Link
              href="/"
              className={cn(
                "interactive shrink-0 font-serif font-semibold leading-none tracking-[0.18em] transition-transform hover:scale-[1.02]",
                "text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[2.85rem]",
                "px-1 md:px-3",
                isTransparent && !megaOpen ? "text-white" : "text-niti-charcoal",
                "lg:absolute lg:left-1/2 lg:-translate-x-1/2"
              )}
            >
              NITI.
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 md:gap-3">
              <button
                type="button"
                onClick={() => setLocale(locale === "sr" ? "en" : "sr")}
                className="interactive hidden items-center gap-1 rounded-md border border-current/15 px-2.5 py-1 text-xs font-medium md:flex"
                aria-label={t("common.language")}
              >
                <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                {locale.toUpperCase()}
              </button>
              <Link
                href="/search"
                className="interactive hidden p-2 md:block"
                aria-label={t("nav.search")}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/account"
                className="interactive hidden p-2 md:block"
                aria-label={t("nav.account")}
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
              <Link
                href="/cart"
                className="interactive flex items-center gap-2 p-2"
                aria-label={t("nav.cart")}
              >
                <span className="relative">
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                  {itemCount > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-niti-sage px-0.5 text-[9px] font-bold text-white cart-badge-pop">
                      {itemCount}
                    </span>
                  )}
                </span>
                <span className="hidden text-xs font-medium xl:inline">
                  {t("nav.subtotal")} {formatPrice(subtotal, locale)}
                </span>
              </Link>
              <Link
                href="/search"
                className="interactive p-2 lg:hidden"
                aria-label={t("nav.search")}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <div onMouseEnter={() => setMegaOpen(true)}>
            <NavMegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-niti-cream pt-[4.5rem] lg:hidden">
          <nav className="flex flex-col gap-1 px-5 pb-10">
            <p className="py-2 text-xs font-semibold uppercase tracking-widest text-niti-muted">
              {t("nav.shop")}
            </p>
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="interactive rounded-xl bg-white px-4 py-4 text-lg font-semibold shadow-sm"
            >
              {t("nav.allProducts")}
            </Link>
            <Link
              href="/#new-arrivals"
              onClick={() => setMenuOpen(false)}
              className="interactive border-b border-niti-line py-4 text-base font-medium"
            >
              {t("home.newArrivals")}
              <span className="ml-2 rounded-full bg-niti-sage px-2 py-0.5 text-xs text-white">
                {t("nav.new")}
              </span>
            </Link>
            <p className="pt-4 text-xs font-semibold uppercase tracking-widest text-niti-muted">
              {t("nav.browseCategories")}
            </p>
            <div className="grid grid-cols-2 gap-2 py-2">
              {["bedsheets", "towels", "throws", "accessories"].map((slug) => (
                <Link
                  key={slug}
                  href={`/shop/${slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="interactive rounded-xl border border-niti-line bg-white px-3 py-4 text-center text-sm font-semibold"
                >
                  {t(`shop.filters.${slug}` as "shop.filters.all")}
                </Link>
              ))}
            </div>
            <Link
              href="/#faq"
              onClick={() => setMenuOpen(false)}
              className="interactive border-t border-niti-line py-4 text-base font-medium"
            >
              {t("nav.about")}
            </Link>
            <button
              type="button"
              onClick={() => setLocale(locale === "sr" ? "en" : "sr")}
              className="interactive flex items-center gap-2 py-3 text-base"
            >
              <Globe className="h-5 w-5" />
              {locale === "sr" ? "English" : "Srpski"}
            </button>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="interactive py-3 text-base font-medium"
            >
              {t("nav.cart")} ({itemCount})
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
