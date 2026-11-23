"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { usePromo } from "@/context/PromoContext";
import {
  findVariantBySelections,
  guessColorSwatchStyle,
  isColorOptionName,
  isOptionValueInStock,
  isPatternOptionName,
  selectionsAfterOptionChange,
} from "@/lib/shopify/variants";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { productImageSrc } from "@/lib/product-image";
import { getDiscount } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/utils";
import type { Product, ProductOption, ProductVariantSnapshot } from "@/types";

type QuickBuyDrawerProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
  /** Prefill from card swatches when the drawer opens. */
  initialSelections?: Record<string, string>;
};

function priceForValue(
  product: Product,
  selections: Record<string, string>,
  optionName: string,
  value: string
) {
  const probe = { ...selections, [optionName]: value };
  const exact = findVariantBySelections(product, probe);
  if (exact) return exact.price;
  const match = product.variants?.find((variant) =>
    variant.selectedOptions.some(
      (option) => option.name === optionName && option.value === value
    )
  );
  return match?.price ?? product.price;
}

function resolvePreviewImage(
  product: Product,
  selections: Record<string, string>,
  activeVariant?: ProductVariantSnapshot
) {
  if (activeVariant?.image) return activeVariant.image;

  const colorOption = product.options?.find(
    (o) => o.type === "color" || isColorOptionName(o.name)
  );
  const color = colorOption ? selections[colorOption.name] : undefined;
  if (color && product.colorImages?.[color]) return product.colorImages[color];

  if (color && colorOption && product.variants?.length) {
    const hit = product.variants.find(
      (v) =>
        v.image &&
        v.selectedOptions.some(
          (o) => o.name === colorOption.name && o.value === color
        )
    );
    if (hit?.image) return hit.image;
  }

  return product.image;
}

function ColorChoiceRow({
  option,
  selected,
  hasError,
  onChange,
  variants,
}: {
  option: ProductOption;
  selected?: string;
  hasError: boolean;
  onChange: (name: string, value: string) => void;
  variants: Product["variants"];
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        option.values.length === 1 ? "grid-cols-1" : "grid-cols-2"
      )}
    >
      {option.values.map((val) => {
        const available = variants?.length
          ? isOptionValueInStock(variants, option.name, val.value)
          : val.available;
        const isSelected = selected === val.value;
        return (
          <button
            key={val.value}
            type="button"
            disabled={!available}
            onClick={() => onChange(option.name, val.value)}
            className={cn(
              "interactive flex min-h-[3.25rem] items-center gap-2.5 rounded-md border bg-white px-3 py-2.5 text-left transition-colors",
              isSelected
                ? "border-niti-charcoal"
                : "border-niti-line hover:border-niti-charcoal/35",
              !available && "cursor-not-allowed opacity-40",
              hasError && !isSelected && "border-niti-sale"
            )}
          >
            <span
              className="h-5 w-5 shrink-0 rounded-full border border-niti-charcoal/15"
              style={guessColorSwatchStyle(val.value)}
              aria-hidden
            />
            <span className="min-w-0 truncate text-[13px] font-medium leading-snug text-niti-charcoal">
              {val.value}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SizeChoiceRows({
  product,
  option,
  selections,
  selected,
  hasError,
  onChange,
}: {
  product: Product;
  option: ProductOption;
  selections: Record<string, string>;
  selected?: string;
  hasError: boolean;
  onChange: (name: string, value: string) => void;
}) {
  const { locale } = useLanguage();

  return (
    <div className="flex flex-col gap-1.5">
      {option.values.map((val) => {
        const available = product.variants?.length
          ? isOptionValueInStock(product.variants, option.name, val.value)
          : val.available;
        const isSelected = selected === val.value;
        const price = priceForValue(product, selections, option.name, val.value);
        return (
          <button
            key={val.value}
            type="button"
            disabled={!available}
            onClick={() => onChange(option.name, val.value)}
            className={cn(
              "interactive flex min-h-[3.25rem] items-center justify-between gap-3 rounded-md border px-3.5 py-3 text-left transition-colors",
              isSelected
                ? "border-niti-charcoal bg-niti-charcoal text-white"
                : "border-niti-line bg-white text-niti-charcoal hover:border-niti-charcoal/35",
              !available && "cursor-not-allowed opacity-40",
              hasError && !isSelected && "border-niti-sale"
            )}
          >
            <span className="text-[13px] font-medium">{val.value}</span>
            <span
              className={cn(
                "text-[13px] tabular-nums",
                isSelected ? "text-white/85" : "text-niti-muted"
              )}
            >
              {formatPrice(price, locale)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function QuickBuyDrawer({
  product,
  open,
  onClose,
  initialSelections,
}: QuickBuyDrawerProps) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const promoActive = usePromo();
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [hint, setHint] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const initialRef = useRef(initialSelections);
  initialRef.current = initialSelections;
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useFocusTrap(dialogRef, open && mounted);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    setSelections(initialRef.current ?? {});
    setErrors({});
    setHint(false);
    setJustAdded(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => setEntered(true));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, product.id]);

  const activeVariant = useMemo(
    () => findVariantBySelections(product, selections),
    [product, selections]
  );

  const displayPrice = activeVariant?.price ?? product.price;
  const displayCompare =
    activeVariant?.compareAtPrice ?? product.compareAtPrice;
  const offer = getDiscount(displayPrice, displayCompare);
  const showPercent = Boolean(promoActive && offer && offer.percent >= 1);

  const previewImage = resolvePreviewImage(product, selections, activeVariant);

  const colorOption = product.options?.find(
    (o) => o.type === "color" && !isPatternOptionName(o.name)
  );
  const selectedColor = colorOption
    ? selections[colorOption.name]
    : undefined;

  const allSelected =
    product.options?.every((o) => Boolean(selections[o.name])) ?? true;
  const inStock = activeVariant
    ? activeVariant.availableForSale
    : product.availableForSale !== false;

  const handleChange = (name: string, value: string) => {
    const next = product.variants?.length
      ? selectionsAfterOptionChange(product.variants, selections, name, value)
      : { ...selections, [name]: value };
    setSelections(next);
    if (product.options?.every((o) => Boolean(next[o.name]))) {
      setErrors({});
      setHint(false);
    }
  };

  const handleAdd = () => {
    if (product.options?.length) {
      const missing: Record<string, boolean> = {};
      for (const opt of product.options) {
        if (!selections[opt.name]) missing[opt.name] = true;
      }
      if (Object.keys(missing).length > 0) {
        setErrors(missing);
        setHint(true);
        return;
      }
    }
    if (!inStock) return;

    addItem(product, 1, {
      variantId: activeVariant?.id ?? product.variantId,
      selectedColor,
      selections,
    });
    setJustAdded(true);
    window.setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label={t("product.quickBuy")}
    >
      <button
        type="button"
        aria-label={t("product.closeQuickBuy")}
        className={cn(
          "absolute inset-0 bg-niti-charcoal/45 transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-2xl bg-niti-cream shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(100%,400px)] md:rounded-none md:border-l md:border-niti-line",
          entered
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
        )}
      >
        <div className="flex justify-center pt-2.5 md:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-niti-line" />
        </div>

        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-2 md:px-6 md:pb-4 md:pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-niti-muted">
              {t("product.quickBuy")}
            </p>
            <h2 className="mt-1 font-serif text-[1.35rem] font-medium leading-tight tracking-tight text-niti-charcoal md:text-[1.65rem]">
              {t("product.chooseVariant")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="interactive -mr-1 flex h-10 w-10 items-center justify-center text-niti-muted hover:text-niti-charcoal"
            aria-label={t("product.closeQuickBuy")}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 md:px-6">
          <div className="flex gap-3.5 border-y border-niti-line py-4">
            <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden bg-niti-sand">
              <Image
                src={productImageSrc(previewImage)}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 self-center">
              {(selectedColor ||
                (activeVariant?.selectedOptions?.length ?? 0) > 0) && (
                <p className="mb-1 line-clamp-1 text-[11px] text-niti-muted">
                  {[
                    selectedColor,
                    activeVariant?.selectedOptions?.find(
                      (o) => !isColorOptionName(o.name)
                    )?.value,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              <p className="line-clamp-2 font-serif text-[15px] font-medium leading-snug text-niti-charcoal">
                {product.title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className={cn(
                    "text-[15px] font-semibold tabular-nums tracking-tight",
                    offer ? "text-niti-sale" : "text-niti-charcoal"
                  )}
                >
                  {formatPrice(displayPrice, locale)}
                </span>
                {offer ? (
                  <span className="text-xs tabular-nums text-niti-muted line-through">
                    {formatPrice(offer.compareAt, locale)}
                  </span>
                ) : null}
                {showPercent && offer ? (
                  <span className="bg-niti-sale px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                    −{offer.percent}%
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4 py-4">
            {product.options?.map((option) => {
              const selected = selections[option.name];
              const hasError = Boolean(errors[option.name]);
              const isColor =
                option.type === "color" && !isPatternOptionName(option.name);
              const isSize = option.type === "size";

              return (
                <div key={option.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.16em]",
                        hasError ? "text-niti-sale" : "text-niti-charcoal"
                      )}
                    >
                      {option.label}
                    </p>
                    {isSize && selected && inStock ? (
                      <span className="text-xs font-medium text-niti-sage-deep">
                        {t("product.inStock")}
                      </span>
                    ) : selected ? (
                      <span className="text-sm text-niti-muted">{selected}</span>
                    ) : null}
                  </div>

                  {isColor ? (
                    <ColorChoiceRow
                      option={option}
                      selected={selected}
                      hasError={hasError}
                      onChange={handleChange}
                      variants={product.variants}
                    />
                  ) : isSize ? (
                    <SizeChoiceRows
                      product={product}
                      option={option}
                      selections={selections}
                      selected={selected}
                      hasError={hasError}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((val) => {
                        const available = product.variants?.length
                          ? isOptionValueInStock(
                              product.variants,
                              option.name,
                              val.value
                            )
                          : val.available;
                        const isSelected = selected === val.value;
                        return (
                          <button
                            key={val.value}
                            type="button"
                            disabled={!available}
                            onClick={() => handleChange(option.name, val.value)}
                            className={cn(
                              "interactive rounded-md border px-3.5 py-2.5 text-sm font-medium",
                              isSelected
                                ? "border-niti-charcoal bg-niti-charcoal text-white"
                                : "border-niti-line bg-white text-niti-charcoal",
                              !available && "opacity-40",
                              hasError && !isSelected && "border-niti-sale"
                            )}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {hint ? (
            <p className="pb-2 text-sm text-niti-sale">
              {t("product.selectAllOptions")}
            </p>
          ) : null}
          {allSelected && activeVariant && !activeVariant.availableForSale ? (
            <p className="pb-2 text-sm text-niti-sale">
              {t("product.outOfStock")}
            </p>
          ) : null}
        </div>

        <div className="border-t border-niti-line bg-niti-cream px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3.5 md:px-6 md:pb-5">
          <button
            type="button"
            onClick={handleAdd}
            disabled={justAdded || (allSelected && !inStock)}
            className="interactive flex h-12 w-full items-center justify-center gap-2 bg-niti-sage-deep text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-niti-sage-dark disabled:opacity-50"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2} />
                {t("product.added")}
              </>
            ) : (
              <>
                {t("product.addToCart")}
                <span aria-hidden>—</span>
                <span className="tabular-nums">
                  {formatPrice(displayPrice, locale)}
                </span>
              </>
            )}
          </button>
          <Link
            href={`/product/${product.handle}`}
            onClick={onClose}
            className="interactive mt-3 block text-center text-xs text-niti-muted underline-offset-4 hover:text-niti-charcoal hover:underline"
          >
            {t("product.viewFullProduct")}
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
