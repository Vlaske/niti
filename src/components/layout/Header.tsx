"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  Globe,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { NavMegaMenu } from "@/components/layout/NavMegaMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { useNavCategories } from "@/context/CategoriesContext";
import { getGroupedNavCategories } from "@/config/store-categories";
import { formatPrice, cn } from "@/lib/utils";

type HeaderProps = {
  variant?: "transparent" | "solid";
};

export function Header({ variant = "solid" }: HeaderProps) {
  const { itemCount, subtotal } = useCart();
  const { t, locale, setLocale } = useLanguage();
  const navCategories = useNavCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(
    "spavaca-soba"
  );

  const groupedMobile = getGroupedNavCategories().map(({ group, categories }) => ({
    group,
    categories: categories.map(
      (c) => navCategories.find((e) => e.slug === c.slug) ?? c
    ),
  }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const openSearch = useCallback(() => {
    setMegaOpen(false);
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const isTransparent =
    variant === "transparent" && !scrolled && !menuOpen && !megaOpen && !searchOpen;

  return (
    <>
      <header
        className="site-header fixed inset-x-0 top-0 z-50"
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div
          className={cn(
            "site-header__safe transition-[background-color,box-shadow,color] duration-300 ease-out",
            isTransparent
              ? "bg-transparent text-white"
              : "bg-niti-cream text-niti-charcoal shadow-sm max-md:border-b max-md:border-niti-line/60 md:bg-niti-cream/95 md:backdrop-blur-md",
            megaOpen && "bg-niti-cream text-niti-charcoal shadow-md md:bg-niti-cream/98"
          )}
        >
        <div className="relative mx-auto max-w-[1440px]">
          <div className="site-header__bar flex items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 md:gap-8 md:px-8 lg:px-12">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
                onClick={() => setMenuOpen((o) => !o)}
                className="interactive shrink-0 p-1.5 lg:hidden"
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
                  className="interactive flex items-center gap-1.5 text-sm font-medium uppercase tracking-[0.14em] lg:text-[0.95rem]"
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
                  className="interactive text-sm font-medium uppercase tracking-[0.14em] lg:text-[0.95rem]"
                >
                  {t("nav.about")}
                </Link>
              </nav>
            </div>

            <Link
              href="/"
              className={cn(
                "interactive shrink-0 font-serif font-bold leading-none tracking-[0.14em] transition-transform hover:scale-[1.02] sm:tracking-[0.2em]",
                "text-[1.85rem] sm:text-[2.5rem] md:text-[2.65rem] lg:text-[2.85rem]",
                "px-0.5 sm:px-1 md:px-3",
                isTransparent && !megaOpen
                  ? "text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]"
                  : "text-niti-charcoal",
                "lg:absolute lg:left-1/2 lg:-translate-x-1/2"
              )}
            >
              NITI.
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-1.5 md:gap-3">
              <button
                type="button"
                onClick={() => setLocale(locale === "sr" ? "en" : "sr")}
                className="interactive hidden items-center gap-1 rounded-md border border-current/15 px-2.5 py-1 text-xs font-medium md:flex"
                aria-label={t("common.language")}
              >
                <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                {locale.toUpperCase()}
              </button>
              <button
                type="button"
                onClick={openSearch}
                className="interactive hidden p-2 md:block"
                aria-label={t("nav.search")}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </button>
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
              <button
                type="button"
                onClick={openSearch}
                className="interactive p-2 lg:hidden"
                aria-label={t("nav.search")}
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div onMouseEnter={() => setMegaOpen(true)}>
            <NavMegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
          </div>
        </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 overflow-y-auto bg-niti-cream lg:hidden"
          style={{ paddingTop: "var(--header-offset)" }}
        >
          <nav className="flex flex-col gap-1 px-5 pb-10">
            <p className="py-2 text-xs font-semibold uppercase tracking-widest text-niti-muted">
              {t("nav.shop")}
            </p>
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className="interactive border-b border-niti-line py-4 text-lg font-semibold"
            >
              {t("nav.allProducts")}
            </Link>
            <Link
              href="/#new-arrivals"
              onClick={() => setMenuOpen(false)}
              className="interactive flex items-center gap-2 border-b border-niti-line py-4 text-base font-medium"
            >
              <Sparkles className="h-4 w-4 text-niti-sage-dark" strokeWidth={1.5} />
              {t("home.newArrivals")}
              <span className="bg-niti-sage px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {t("nav.new")}
              </span>
            </Link>
            <p className="pt-6 text-xs font-semibold uppercase tracking-widest text-niti-muted">
              {t("nav.browseCategories")}
            </p>
            <div className="flex flex-col py-1">
              {groupedMobile.map(({ group, categories }) => {
                const expanded = openMobileGroup === group.id;
                return (
                  <div key={group.id} className="border-b border-niti-line">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileGroup(expanded ? null : group.id)
                      }
                      className="interactive flex w-full items-center justify-between py-3.5 text-left text-sm font-semibold"
                    >
                      {group.title}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-niti-muted transition-transform",
                          expanded && "rotate-180"
                        )}
                      />
                    </button>
                    {expanded && (
                      <div className="pb-3">
                        <Link
                          href={`/shop/${group.id}`}
                          onClick={() => setMenuOpen(false)}
                          className="interactive block py-2 text-sm font-semibold text-niti-charcoal"
                        >
                          {t("shop.allInRoom")}
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/shop/${cat.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="interactive block py-2 text-sm text-niti-muted"
                          >
                            {cat.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
