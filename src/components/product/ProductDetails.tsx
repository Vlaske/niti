"use client";

import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  findVariantBySelections,
  productRequiresOptionSelection,
  selectionsAfterOptionChange,
} from "@/lib/shopify/variants";
import { prefersReducedMotion } from "@/lib/animations";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductOptionPicker } from "./ProductOptionPicker";

type ProductDetailsProps = {
  product: Product;
  selections: Record<string, string>;
  onSelectionsChange: (next: Record<string, string>) => void;
};

export function ProductDetails({
  product,
  selections,
  onSelectionsChange,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const addBtnRef = useRef<HTMLSpanElement>(null);
  const needsOptions = productRequiresOptionSelection(product);
  const [optionErrors, setOptionErrors] = useState<Record<string, boolean>>(
    {}
  );
  const [showOptionHint, setShowOptionHint] = useState(false);

  const activeVariant = useMemo(
    () => findVariantBySelections(product, selections),
    [product, selections]
  );

  const displayPrice = activeVariant?.price ?? product.price;
  const displayCompare =
    activeVariant?.compareAtPrice ?? product.compareAtPrice;
  const canAdd =
    !needsOptions ||
    (product.options?.every((o) => Boolean(selections[o.name])) ?? false);

  const allOptionsSelected = product.options?.every((o) =>
    Boolean(selections[o.name])
  );

  const handleOptionChange = (name: string, value: string) => {
    const next = product.variants?.length
      ? selectionsAfterOptionChange(product.variants, selections, name, value)
      : { ...selections, [name]: value };
    onSelectionsChange(next);
    if (product.options?.every((o) => Boolean(next[o.name]))) {
      setOptionErrors({});
      setShowOptionHint(false);
    }
  };

  const handleAdd = () => {
    if (needsOptions && product.options) {
      const missing: Record<string, boolean> = {};
      for (const opt of product.options) {
        if (!selections[opt.name]) missing[opt.name] = true;
      }
      if (Object.keys(missing).length > 0) {
        setOptionErrors(missing);
        setShowOptionHint(true);
        return;
      }
    }

    setShowOptionHint(false);

    const variantId = activeVariant?.id ?? product.variantId;
    const colorSelection = product.options?.find((o) => o.type === "color");
    const selectedColor = colorSelection
      ? selections[colorSelection.name]
      : undefined;

    addItem(product, 1, { variantId, selectedColor, selections });

    if (addBtnRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        addBtnRef.current,
        { scale: 1 },
        { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 }
      );
    }
  };

  const savings =
    displayCompare && displayCompare > displayPrice
      ? displayCompare - displayPrice
      : null;

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-niti-muted">
        {product.brand}
      </p>
      <h1 className="mt-2 font-display text-[1.65rem] font-medium leading-[1.2] tracking-[0.04em] text-niti-charcoal sm:text-[1.85rem] md:text-[2.15rem]">
        {product.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1 md:mt-5">
        <span
          className={
            savings
              ? "text-2xl font-medium tracking-tight text-niti-sale sm:text-[1.75rem]"
              : "text-2xl font-medium tracking-tight text-niti-sage-deep sm:text-[1.75rem]"
          }
        >
          {formatPrice(displayPrice, locale)}
        </span>
        {savings && (
          <>
            <span className="pb-0.5 text-sm text-niti-muted line-through md:text-base">
              {formatPrice(displayCompare!, locale)}
            </span>
            <span className="pb-1 text-xs font-medium uppercase tracking-wider text-niti-sale">
              −{formatPrice(savings, locale)}
            </span>
          </>
        )}
      </div>

      {(activeVariant?.sku || activeVariant?.barcode) && (
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-normal text-niti-muted/80">
          {activeVariant.sku ? (
            <div className="flex items-baseline gap-1.5">
              <dt>{t("product.sku")}</dt>
              <dd>{activeVariant.sku}</dd>
            </div>
          ) : null}
          {activeVariant.barcode ? (
            <div className="flex items-baseline gap-1.5">
              <dt>{t("product.barcode")}</dt>
              <dd>{activeVariant.barcode}</dd>
            </div>
          ) : null}
        </dl>
      )}

      {allOptionsSelected && activeVariant && !activeVariant.availableForSale && (
        <p className="mt-3 text-sm text-niti-sale">{t("product.outOfStock")}</p>
      )}

      {product.options && product.options.length > 0 ? (
        <div className="mt-8">
          <ProductOptionPicker
            options={product.options}
            selections={selections}
            onChange={handleOptionChange}
            errors={optionErrors}
            variants={product.variants}
          />
          {showOptionHint && (
            <p className="mt-3 text-sm text-niti-sale">
              {t("product.selectAllOptions")}
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
        <Button
          variant="secondary"
          className="w-full min-h-12 min-[420px]:flex-1"
          onClick={handleAdd}
          disabled={
            !canAdd ||
            Boolean(
              allOptionsSelected &&
                activeVariant &&
                !activeVariant.availableForSale
            )
          }
        >
          <span ref={addBtnRef}>{t("product.addToCart")}</span>
        </Button>
        <Button href="/cart" variant="outline" className="w-full min-h-12 min-[420px]:w-auto">
          {t("product.viewCart")}
        </Button>
      </div>
    </div>
  );
}

export function getDefaultProductSelections(
  product: Product
): Record<string, string> {
  if (!product.options?.length || !product.variants?.length) return {};
  const variant =
    product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  return Object.fromEntries(
    variant.selectedOptions.map((o) => [o.name, o.value])
  );
}

/** Gallery image for the current options. Variant photo wins, including the featured shot. */
export function getPreferredImageForSelections(
  product: Product,
  selections: Record<string, string>
): string | undefined {
  const variant = findVariantBySelections(product, selections);
  if (variant?.image) return variant.image;

  const colorOpt = product.options?.find((o) => o.type === "color");
  if (!colorOpt) return undefined;
  const colorValue = selections[colorOpt.name];
  if (!colorValue) return undefined;

  if (product.colorImages?.[colorValue]) {
    return product.colorImages[colorValue];
  }

  return colorOpt.values.find((v) => v.value === colorValue)?.image;
}
