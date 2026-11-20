"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ColorSwatches } from "@/components/ui/ColorSwatches";
import { QuickBuyDrawer } from "@/components/shop/QuickBuyDrawer";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePromo } from "@/context/PromoContext";
import { getStoreCategoryBySlug } from "@/config/store-categories";
import {
  isColorOptionName,
  productRequiresOptionSelection,
} from "@/lib/shopify/variants";
import { productImageSrc } from "@/lib/product-image";
import { getDiscount } from "@/lib/pricing";
import { cn, formatPrice, formatPriceParts } from "@/lib/utils";
import type { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  variant?: "grid" | "compact";
  /** Prefer −% over dinar savings (e.g. /shop?snizeno=1). */
  preferPercentBadge?: boolean;
};

function optionSummary(product: Product, locale: "sr" | "en") {
  const parts: string[] = [];
  const category = getStoreCategoryBySlug(product.category)?.title;
  if (category) parts.push(category);

  const colorOption = product.options?.find((o) => o.type === "color");
  const sizeOption = product.options?.find((o) => o.type === "size");
  if (colorOption && colorOption.values.length > 1) {
    parts.push(
      locale === "sr"
        ? `${colorOption.values.length} boje`
        : `${colorOption.values.length} colors`
    );
  }
  if (sizeOption && sizeOption.values.length > 1) {
    parts.push(
      locale === "sr"
        ? `${sizeOption.values.length} dimenzije`
        : `${sizeOption.values.length} sizes`
    );
  }

  return parts.slice(0, 2).join(" · ");
}

function hasFromPrice(product: Product) {
  const prices = product.variants?.map((v) => v.price) ?? [];
  if (prices.length >= 2) {
    return Math.min(...prices) !== Math.max(...prices);
  }
  return productRequiresOptionSelection(product);
}

function imageForColor(product: Product, color?: string) {
  if (!color) return product.image;
  const mapped = product.colorImages?.[color];
  if (mapped) return mapped;

  const colorOptionName =
    product.options?.find((o) => o.type === "color")?.name ??
    product.options?.find((o) => isColorOptionName(o.name))?.name;

  if (colorOptionName && product.variants?.length) {
    const hit = product.variants.find(
      (v) =>
        v.image &&
        v.selectedOptions.some(
          (o) => o.name === colorOptionName && o.value === color
        )
    );
    if (hit?.image) return hit.image;
  }

  const fromColors = product.colors?.find((c) => c.name === color)?.image;
  return fromColors || product.image;
}

function collectColorImages(product: Product) {
  const urls = new Set<string>();
  if (product.image) urls.add(productImageSrc(product.image));
  if (product.colorImages) {
    for (const url of Object.values(product.colorImages)) {
      if (url) urls.add(productImageSrc(url));
    }
  }
  for (const color of product.colors ?? []) {
    if (color.image) urls.add(productImageSrc(color.image));
  }
  for (const variant of product.variants ?? []) {
    if (variant.image) urls.add(productImageSrc(variant.image));
  }
  return [...urls];
}

export function ProductCard({
  product,
  variant = "grid",
  preferPercentBadge = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const promoActive = usePromo();
  const [quickOpen, setQuickOpen] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);
  const addedTimer = useRef<number | null>(null);
  const offer = getDiscount(product.price, product.compareAtPrice);
  const showPercent = Boolean(
    offer &&
      offer.percent >= 1 &&
      (promoActive || preferPercentBadge)
  );

  const needsSelection = productRequiresOptionSelection(product);
  const showFrom = hasFromPrice(product);
  const priceParts = formatPriceParts(product.price, locale);
  const compareParts = offer
    ? formatPriceParts(offer.compareAt, locale)
    : null;
  const meta = useMemo(
    () => optionSummary(product, locale),
    [product, locale]
  );

  const colorOption = product.options?.find((o) => o.type === "color");

  const cardColors =
    colorOption?.values.map((v) => ({
      name: v.value,
      hex: v.hex ?? "#d4cfc8",
    })) ??
    product.colors ??
    [];

  const [activeColor, setActiveColor] = useState(cardColors[0]?.name);
  const displayImage = imageForColor(product, activeColor);

  const drawerSelections = useMemo(() => {
    if (!activeColor || !colorOption) return undefined;
    return { [colorOption.name]: activeColor };
  }, [activeColor, colorOption]);

  useEffect(() => {
    setActiveColor(
      product.options?.find((o) => o.type === "color")?.values[0]?.value ??
        product.colors?.[0]?.name
    );
  }, [product]);

  // Prefetch Next-optimized URLs so color swaps skip the loading delay.
  useEffect(() => {
    const urls = collectColorImages(product);
    for (const url of urls) {
      for (const width of [384, 640]) {
        const img = new window.Image();
        img.src = `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
      }
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (addedTimer.current) window.clearTimeout(addedTimer.current);
    };
  }, []);

  const flashAdded = () => {
    setAddedFlash(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAddedFlash(false), 1600);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (needsSelection) {
      setQuickOpen(true);
      return;
    }
    addItem(product, 1, {
      selectedColor: activeColor,
      selections: drawerSelections,
    });
    flashAdded();
  };

  const titleClass =
    variant === "compact"
      ? "line-clamp-2 min-h-[2.5rem] text-[14px] font-medium leading-snug text-niti-charcoal md:min-h-[2.6rem] md:text-[15px]"
      : "line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-niti-charcoal md:min-h-[2.6rem] md:text-[15px]";

  const ctaLabel = needsSelection
    ? t("product.quickBuy")
    : t("product.quickAdd");
  const ctaLabelShort = needsSelection
    ? t("product.quickBuyShort")
    : t("product.quickAddShort");

  return (
    <>
      <article className="product-card group flex h-full flex-col">
        <div className="product-card-frame shrink-0">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe8e2]">
            <Link
              href={`/product/${product.handle}`}
              className="interactive absolute inset-0 z-10 block"
              aria-label={product.title}
            >
              <Image
                src={productImageSrc(displayImage)}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="pointer-events-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                draggable={false}
              />
            </Link>

            {(product.isNew || offer) && (
              <div className="pointer-events-none absolute left-2.5 top-2.5 z-20 flex max-w-[calc(100%-1.25rem)] items-center gap-1.5">
                {product.isNew ? (
                  <span className="bg-white/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] leading-none text-niti-charcoal">
                    {t("nav.new")}
                  </span>
                ) : null}
                {offer ? (
                  <span className="bg-niti-sale px-2 py-1 text-[10px] font-semibold tabular-nums leading-none text-niti-cream">
                    −
                    {showPercent
                      ? `${offer.percent}%`
                      : formatPrice(offer.savings, locale)}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/product/${product.handle}`} className="interactive">
                <h3 className={titleClass}>{product.title}</h3>
              </Link>
              <p className="mt-0.5 line-clamp-1 min-h-[1rem] text-[11px] leading-snug text-niti-muted">
                {meta || "\u00A0"}
              </p>
            </div>

            <div className="shrink-0 pt-0.5 text-right leading-none">
              {showFrom && !offer ? (
                <span className="mr-1 text-[11px] text-niti-muted">
                  {t("product.from")}
                </span>
              ) : null}
              {offer ? (
                <div className="inline-flex flex-col items-end gap-0.5">
                  <p
                    className={cn(
                      "font-semibold tabular-nums tracking-tight text-niti-sale",
                      variant === "compact" ? "text-sm" : "text-[15px]"
                    )}
                  >
                    {showFrom ? (
                      <span className="mr-1 text-[11px] font-medium text-niti-muted">
                        {t("product.from")}
                      </span>
                    ) : null}
                    {priceParts.amount}
                    <span className="ml-1 text-[10px] font-medium text-niti-muted">
                      {priceParts.currency}
                    </span>
                  </p>
                  {compareParts ? (
                    <p className="flex items-center gap-1.5 text-[11px] tabular-nums text-niti-muted">
                      <span className="line-through">{compareParts.amount}</span>
                      {!showPercent ? (
                        <span className="font-medium text-niti-sale">
                          {t("product.save")}{" "}
                          {formatPriceParts(offer.savings, locale).amount}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p
                  className={cn(
                    "inline font-semibold tabular-nums tracking-tight text-niti-charcoal",
                    variant === "compact" ? "text-sm" : "text-[15px]"
                  )}
                >
                  {priceParts.amount}
                  <span className="ml-1 text-[10px] font-medium text-niti-muted">
                    {priceParts.currency}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* mt-auto keeps footers aligned across equal-height cards */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-niti-line pt-2.5">
            <div className="min-w-0 flex-1">
              {cardColors.length > 0 ? (
                <div className="flex min-w-0 items-center gap-1.5">
                  <ColorSwatches
                    colors={cardColors}
                    selected={activeColor}
                    onSelect={setActiveColor}
                    maxVisible={5}
                  />
                  {activeColor ? (
                    <span className="truncate text-[11px] text-niti-muted">
                      {activeColor}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="block h-6" aria-hidden />
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className={cn(
                "interactive relative shrink-0 inline-flex items-center gap-1 pb-1 text-[11px] font-semibold transition-colors duration-200",
                // width (not scale) avoids thick→thin antialias flicker on mobile
                "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:transition-[width,background-color] after:duration-300 after:ease-out",
                addedFlash
                  ? "text-niti-muted after:bg-niti-muted"
                  : "text-niti-charcoal after:bg-niti-sage-deep hover:text-niti-sage-deep hover:after:w-full hover:after:bg-niti-sage-deep"
              )}
              aria-label={ctaLabel}
            >
              {addedFlash ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                  <span>{t("product.added")}</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                  <span className="hidden min-[380px]:inline">{ctaLabel}</span>
                  <span className="min-[380px]:hidden">{ctaLabelShort}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </article>

      {needsSelection ? (
        <QuickBuyDrawer
          product={product}
          open={quickOpen}
          onClose={() => setQuickOpen(false)}
          initialSelections={drawerSelections}
        />
      ) : null}
    </>
  );
}
