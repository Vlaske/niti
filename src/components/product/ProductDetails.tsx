"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/Button";
import { ColorSwatches } from "@/components/ui/ColorSwatches";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart();
  const { t, locale } = useLanguage();
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const addBtnRef = useRef<HTMLSpanElement>(null);

  const handleAdd = () => {
    addItem(product, 1, color);
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
        {product.compareAtPrice && (
          <span className="text-lg text-niti-muted line-through">
            {formatPrice(product.compareAtPrice, locale)}
          </span>
        )}
        <span
          className={
            product.compareAtPrice
              ? "text-xl font-medium text-niti-sale"
              : "text-xl text-niti-charcoal"
          }
        >
          {formatPrice(product.price, locale)}
        </span>
      </div>

      {product.tagline && (
        <p className="mt-6 text-sm leading-relaxed text-niti-muted md:text-base">
          {product.tagline}
        </p>
      )}

      {product.colors && product.colors.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium">{t("product.color")}</p>
          <ColorSwatches
            colors={product.colors}
            selected={color}
            onSelect={setColor}
            size="md"
          />
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          className="w-full sm:flex-1"
          onClick={handleAdd}
        >
          <span ref={addBtnRef}>{t("product.addToCart")}</span>
        </Button>
        <Button href="/cart" variant="outline" className="w-full sm:w-auto">
          {t("product.buyNow")}
        </Button>
      </div>
    </div>
  );
}
