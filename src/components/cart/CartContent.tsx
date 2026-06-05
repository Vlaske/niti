"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";

export function CartContent() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    checkoutUrl,
    isShopifyCart,
    cartLoading,
    cartError,
  } = useCart();
  const { t, locale } = useLanguage();

  const lineKey = (item: (typeof items)[0]) =>
    item.lineId ?? item.product.id;

  if (cartLoading && items.length === 0) {
    return (
      <div className="py-20 text-center text-niti-muted">
        {t("cart.loading")}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-niti-muted">{t("cart.empty")}</p>
        <Button href="/shop" variant="secondary" className="mt-8">
          {t("cart.continue")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      {cartError && (
        <p className="col-span-full rounded-lg border border-niti-sale/30 bg-niti-sale/5 px-4 py-3 text-sm text-niti-sale">
          {cartError}
        </p>
      )}
      <ul className="divide-y divide-niti-line">
        {items.map((item) => (
          <li
            key={lineKey(item)}
            className="flex gap-4 py-6 md:gap-6"
          >
            <Link
              href={`/product/${item.product.handle}`}
              className="interactive relative h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-niti-sand md:h-32 md:w-28"
            >
              <Image
                src={item.product.image}
                alt={item.product.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            </Link>
            <div className="flex flex-1 flex-col">
              <Link
                href={`/product/${item.product.handle}`}
                className="interactive font-semibold text-niti-charcoal hover:underline"
              >
                {item.product.title}
              </Link>
              {item.selectedColor && (
                <p className="mt-1 text-sm text-niti-muted">
                  {t("product.color")}: {item.selectedColor}
                </p>
              )}
              <p className="mt-2 text-sm font-medium">
                {formatPrice(item.product.price, locale)}
              </p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 rounded-md border border-niti-line">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(lineKey(item), item.quantity - 1)
                    }
                    className="interactive p-2"
                    aria-label="Smanji količinu"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2ch] text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(lineKey(item), item.quantity + 1)
                    }
                    className="interactive p-2"
                    aria-label="Povećaj količinu"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(lineKey(item))}
                  className="interactive p-2 text-niti-muted hover:text-niti-charcoal"
                  aria-label="Ukloni"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-xl border border-niti-line bg-white p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold">{t("cart.summary")}</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-niti-muted">{t("nav.subtotal")}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-niti-muted">{t("cart.shipping")}</span>
            <span className="text-niti-sage-dark">{t("cart.shippingCalc")}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-between border-t border-niti-line pt-6 text-base font-semibold">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        {isShopifyCart && checkoutUrl ? (
          <a
            href={checkoutUrl}
            className="interactive mt-8 flex w-full items-center justify-center rounded-md bg-niti-charcoal px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-niti-charcoal/90 hover:shadow-md"
          >
            {t("cart.checkout")}
          </a>
        ) : (
          <Button variant="outline" className="mt-8 w-full" disabled>
            {t("cart.checkout")}
          </Button>
        )}
        <p className="mt-4 text-center text-xs text-niti-muted">
          {t("cart.secure")}
        </p>
        {isShopifyCart && checkoutUrl && (
          <p className="mt-2 text-center text-[11px] leading-relaxed text-niti-muted">
            {t("cart.checkoutHint")}
          </p>
        )}
        <button
          type="button"
          onClick={clearCart}
          className="interactive mt-4 w-full text-center text-xs text-niti-muted underline"
        >
          {t("cart.clear")}
        </button>
      </aside>
    </div>
  );
}
