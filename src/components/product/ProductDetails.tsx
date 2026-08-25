"use client";

import { useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  findVariantBySelections,
  productRequiresOptionSelection,
} from "@/lib/shopify/variants";
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
    const next = { ...selections, [name]: value };
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

    if (addBtnRef.current) {
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
    <div className="lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs uppercase tracking-[0.2em] text-niti-muted">
        {product.brand}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-niti-charcoal md:text-4xl">
        {product.title}
      </h1>

      <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span
          className={
            savings
              ? "text-2xl font-semibold tracking-tight text-niti-sale md:text-3xl"
              : "text-2xl font-semibold tracking-tight text-niti-charcoal md:text-3xl"
          }
        >
          {formatPrice(displayPrice, locale)}
        </span>
        {savings && (
          <>
            <span className="pb-0.5 text-base text-niti-muted line-through md:text-lg">
              {formatPrice(displayCompare!, locale)}
            </span>
            <span className="pb-1 text-xs font-medium uppercase tracking-wider text-niti-sale">
              −{formatPrice(savings, locale)}
            </span>
          </>
        )}
      </div>

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
          />
          {showOptionHint && (
            <p className="mt-3 text-sm text-niti-sale">
              {t("product.selectAllOptions")}
            </p>
          )}
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          className="w-full sm:flex-1"
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
        <Button href="/cart" variant="outline" className="w-full sm:w-auto">
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

/** Resolve gallery image for current color via precomputed colorImages map. */
export function getPreferredImageForSelections(
  product: Product,
  selections: Record<string, string>
): string | undefined {
  const colorOpt = product.options?.find((o) => o.type === "color");
  if (!colorOpt) return undefined;
  const colorValue = selections[colorOpt.name];
  if (!colorValue) return undefined;

  if (product.colorImages?.[colorValue]) {
    return product.colorImages[colorValue];
  }

  return colorOpt.values.find((v) => v.value === colorValue)?.image;
}
