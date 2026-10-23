"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useState, useRef } from "react";
import { gsap } from "gsap";
import { ColorSwatches } from "@/components/ui/ColorSwatches";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { productRequiresOptionSelection } from "@/lib/shopify/variants";
import { productImageSrc } from "@/lib/product-image";
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

  const needsSelection = productRequiresOptionSelection(product);

  const cardColors =
    product.options?.find((o) => o.type === "color")?.values.map((v) => ({
      name: v.value,
      hex: v.hex ?? "#d4cfc8",
    })) ??
    product.colors ??
    [];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (needsSelection) return;
    addItem(product, 1);
    if (frameRef.current) {
      gsap.fromTo(
        frameRef.current,
        { scale: 1 },
        { scale: 1.015, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    }
  };

  return (
    <article
      ref={cardRef}
      className="product-card group flex h-full flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={frameRef} className="product-card-frame shrink-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe8e2]">
          <Link
            href={`/product/${product.handle}`}
            className="interactive absolute inset-0 z-10 block"
            aria-label={product.title}
          >
            <Image
              src={productImageSrc(product.image)}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              draggable={false}
            />
          </Link>

          {product.isNew && (
            <span className="pointer-events-none absolute left-2.5 top-2.5 z-20 bg-white/95 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-niti-charcoal">
              {t("nav.new")}
            </span>
          )}

          {savings && (
            <span className="pointer-events-none absolute right-3 top-3 z-20 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-niti-sale">
              −{formatPrice(savings, locale)}
            </span>
          )}

          <div
            className={`absolute inset-x-0 bottom-0 z-20 hidden md:block ${
              hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            } transition-all duration-300`}
          >
            {needsSelection ? (
              <Link
                href={`/product/${product.handle}`}
                className="interactive flex w-full items-center justify-center bg-white/95 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-niti-charcoal"
              >
                {t("product.chooseOptions")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="interactive flex w-full items-center justify-center gap-1.5 bg-white/95 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-niti-charcoal"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {t("product.addToCart")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-1.5">
        <Link href={`/product/${product.handle}`} className="interactive">
          <h3
            className={
              variant === "compact"
                ? "line-clamp-2 text-[15px] font-medium leading-snug text-niti-charcoal"
                : "line-clamp-2 text-sm font-medium leading-snug text-niti-charcoal md:text-[15px]"
            }
          >
            {product.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-baseline gap-x-2">
          {product.compareAtPrice && product.compareAtPrice > product.price ? (
            <>
              <span className="text-base font-semibold tabular-nums tracking-tight text-niti-sale">
                {formatPrice(product.price, locale)}
              </span>
              <span className="text-xs tabular-nums text-niti-muted line-through">
                {formatPrice(product.compareAtPrice, locale)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold tabular-nums tracking-tight text-niti-charcoal">
              {product.price >= 10000
                ? `${t("product.from")} ${formatPrice(product.price, locale)}`
                : formatPrice(product.price, locale)}
            </span>
          )}
        </div>

        {cardColors.length > 0 ? (
          <ColorSwatches colors={cardColors} maxVisible={6} />
        ) : null}
      </div>

      <div className="mt-3 shrink-0 md:hidden">
        {needsSelection ? (
          <Link
            href={`/product/${product.handle}`}
            className="interactive flex w-full items-center justify-center rounded-md border border-niti-line bg-white py-2 text-[11px] font-semibold text-niti-charcoal"
          >
            {t("product.chooseOptions")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="interactive flex w-full items-center justify-center gap-1.5 rounded-md bg-niti-sage-dark py-2 text-[11px] font-semibold text-white active:bg-niti-sage-deep"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("product.addToCart")}
          </button>
        )}
      </div>

    </article>
  );
}
