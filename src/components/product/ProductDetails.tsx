"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const addBtnRef = useRef<HTMLSpanElement>(null);
  const needsOptions = productRequiresOptionSelection(product);

  const getDefaultSelections = useCallback((): Record<string, string> => {
    if (!product.options?.length || !product.variants?.length) return {};
    const variant =
      product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    return Object.fromEntries(
      variant.selectedOptions.map((o) => [o.name, o.value])
    );
  }, [product.options, product.variants]);

  const [selections, setSelections] =
    useState<Record<string, string>>(getDefaultSelections);
  const [optionErrors, setOptionErrors] = useState<Record<string, boolean>>(
    {}
  );
  const [showOptionHint, setShowOptionHint] = useState(false);

  useEffect(() => {
    setSelections(getDefaultSelections());
    setOptionErrors({});
    setShowOptionHint(false);
  }, [product.handle, getDefaultSelections]);

  const activeVariant = useMemo(
    () => findVariantBySelections(product, selections),
    [product, selections]
  );

  const displayPrice = activeVariant?.price ?? product.price;
  const displayCompare = activeVariant?.compareAtPrice ?? product.compareAtPrice;
  const canAdd =
    !needsOptions ||
    (product.options?.every((o) => Boolean(selections[o.name])) ?? false);

  const allOptionsSelected = product.options?.every((o) =>
    Boolean(selections[o.name])
  );

  const handleOptionChange = (name: string, value: string) => {
    setSelections((prev) => {
      const next = { ...prev, [name]: value };
      if (product.options?.every((o) => Boolean(next[o.name]))) {
        setOptionErrors({});
        setShowOptionHint(false);
      }
      return next;
    });
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

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <p className="text-xs uppercase tracking-[0.2em] text-niti-muted">
        {product.brand}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-niti-charcoal md:text-4xl">
        {product.title}
      </h1>

      <div className="mt-4 flex items-baseline gap-3">
        {displayCompare && displayCompare > displayPrice && (
          <span className="text-lg text-niti-muted line-through">
            {formatPrice(displayCompare, locale)}
          </span>
        )}
        <span
          className={
            displayCompare && displayCompare > displayPrice
              ? "text-xl font-medium text-niti-sale"
              : "text-xl text-niti-charcoal"
          }
        >
          {formatPrice(displayPrice, locale)}
        </span>
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
