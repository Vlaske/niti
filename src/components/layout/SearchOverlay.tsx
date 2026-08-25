"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";

type SearchProduct = {
  id: string;
  handle: string;
  title: string;
  price: number;
  image: string;
  categoryTitle: string;
};

type SearchHit = {
  slug?: string;
  id?: string;
  title: string;
  href: string;
};

type SearchResults = {
  products: SearchProduct[];
  categories: SearchHit[];
  rooms: SearchHit[];
};

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { t, locale } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
    rooms: [],
  });
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const tmr = window.setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(tmr);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ products: [], categories: [], rooms: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 1) {
      setResults({ products: [], categories: [], rooms: [] });
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    const tmr = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as SearchResults;
        setResults(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults({ products: [], categories: [], rooms: [] });
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      ctrl.abort();
      window.clearTimeout(tmr);
    };
  }, [query, open]);

  const hasQuery = query.trim().length > 0;
  const empty =
    hasQuery &&
    !loading &&
    results.products.length === 0 &&
    results.categories.length === 0 &&
    results.rooms.length === 0;

  const handleClose = useCallback(() => onClose(), [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal aria-labelledby={titleId}>
      <button
        type="button"
        className="absolute inset-0 bg-niti-charcoal/45 backdrop-blur-[2px]"
        aria-label={t("search.close")}
        onClick={handleClose}
      />
      <div className="relative mx-auto mt-[max(1rem,var(--safe-top))] max-h-[min(92vh,720px)] w-full max-w-2xl overflow-hidden border border-niti-line bg-niti-cream shadow-2xl md:mt-20">
        <div className="flex items-center gap-3 border-b border-niti-line px-4 py-3 md:px-5">
          <Search className="h-5 w-5 shrink-0 text-niti-muted" strokeWidth={1.5} />
          <h2 id={titleId} className="sr-only">
            {t("search.title")}
          </h2>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-niti-charcoal outline-none placeholder:text-niti-muted"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={handleClose}
            className="interactive p-1.5 text-niti-muted hover:text-niti-charcoal"
            aria-label={t("search.close")}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-h-[min(70vh,560px)] overflow-y-auto px-4 py-4 md:px-5">
          {!hasQuery && (
            <p className="text-sm text-niti-muted">{t("search.hint")}</p>
          )}
          {loading && hasQuery && (
            <p className="text-sm text-niti-muted">{t("search.loading")}</p>
          )}
          {empty && <p className="text-sm text-niti-muted">{t("search.empty")}</p>}

          {results.rooms.length > 0 && (
            <section className="mb-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-niti-muted">
                {t("shop.rooms")}
              </p>
              <ul className="space-y-1">
                {results.rooms.map((r) => (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      onClick={handleClose}
                      className="interactive block py-2 text-sm font-medium text-niti-charcoal hover:opacity-70"
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.categories.length > 0 && (
            <section className="mb-6">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-niti-muted">
                {t("nav.browseCategories")}
              </p>
              <ul className="space-y-1">
                {results.categories.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      onClick={handleClose}
                      className="interactive block py-2 text-sm font-medium text-niti-charcoal hover:opacity-70"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.products.length > 0 && (
            <section>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-niti-muted">
                {t("search.products")}
              </p>
              <ul className="divide-y divide-niti-line">
                {results.products.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.handle}`}
                      onClick={handleClose}
                      className="interactive flex items-center gap-3 py-3 hover:bg-niti-sand/40"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-niti-sand">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-niti-charcoal">
                          {p.title}
                        </p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-niti-muted">
                          {p.categoryTitle}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm text-niti-charcoal">
                        {formatPrice(p.price, locale)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
