"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { gsap } from "gsap";
import { useRef } from "react";
import { ColorSwatches } from "@/components/ui/ColorSwatches";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  variant?: "grid" | "compact";
};

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const savings =
    product.compareAtPrice &&
    product.compareAtPrice > product.price
      ? product.compareAtPrice - product.price
      : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.colors?.[0]?.name);
    if (frameRef.current) {
      gsap.fromTo(
        frameRef.current,
        { scale: 1 },
        { scale: 1.02, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    }
  };

  return (
    <article
      ref={cardRef}
      className="product-card group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={frameRef}
        className="product-card-frame mb-4 bg-white p-2 shadow-[0_2px_20px_rgba(42,40,38,0.06)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_16px_40px_rgba(42,40,38,0.1)] sm:p-2.5 md:p-3"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe8e2]">
          <Link
            href={`/product/${product.handle}`}
            className="interactive absolute inset-0 z-10 block"
            aria-label={product.title}
          >
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </Link>

          {product.isNew && (
            <span className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-niti-sage px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
              {t("nav.new")}
            </span>
          )}

          {savings && (
            <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-full border border-niti-sale/30 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-niti-sale">
              −{formatPrice(savings, locale)}
            </span>
          )}

          <div
            className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-black/15 transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link
              href={`/product/${product.handle}`}
              className={`interactive pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-niti-charcoal shadow-md transition-all duration-300 md:h-11 md:w-11 ${
                hovered
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
              aria-label={t("product.quickView")}
            >
              <Eye className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={handleAdd}
              className={`interactive pointer-events-auto rounded-md bg-white px-3 py-2 text-[11px] font-semibold text-niti-charcoal shadow-md transition-all duration-300 md:px-4 md:py-2.5 md:text-xs ${
                hovered
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" />
                {t("product.addToCart")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {product.colors && product.colors.length > 0 && (
        <div className="mb-2.5 px-0.5">
          <ColorSwatches colors={product.colors} />
        </div>
      )}

      <p className="mb-1 px-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-niti-muted md:text-xs">
        {product.brand} · Premium
      </p>
      <Link
        href={`/product/${product.handle}`}
        className="interactive px-0.5"
      >
        <h3
          className={
            variant === "compact"
              ? "font-semibold text-niti-charcoal md:text-base"
              : "text-sm font-semibold leading-snug text-niti-charcoal md:text-base"
          }
        >
          {product.title}
        </h3>
      </Link>

      <div className="mt-1.5 flex items-baseline gap-2 px-0.5">
        {product.compareAtPrice ? (
          <>
            <span className="text-sm text-niti-muted line-through">
              {formatPrice(product.compareAtPrice, locale)}
            </span>
            <span className="text-sm font-semibold text-niti-sale">
              {formatPrice(product.price, locale)}
            </span>
          </>
        ) : (
          <span className="text-sm font-medium text-niti-charcoal">
            {product.price >= 10000
              ? `${t("product.from")} ${formatPrice(product.price, locale)}`
              : formatPrice(product.price, locale)}
          </span>
        )}
      </div>
    </article>
  );
}
