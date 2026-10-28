"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import { productImageSrc } from "@/lib/product-image";

function CartLinks({ prominent = false }: { prominent?: boolean }) {
  const { t } = useLanguage();
  const { handles } = useRecentlyViewed();
  const last = handles[0];

  if (prominent) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href="/shop" variant="secondary" className="min-h-12">
          {t("cart.continue")}
        </Button>
        {last ? (
          <Button href={`/product/${last}`} variant="outline" className="min-h-12">
            {t("cart.lastViewed")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
      <Link
        href="/shop"
        className="interactive text-niti-charcoal underline underline-offset-4"
      >
        {t("cart.continue")}
      </Link>
      {last ? (
        <Link
          href={`/product/${last}`}
          className="interactive text-niti-muted underline underline-offset-4"
        >
          {t("cart.lastViewed")}
        </Link>
      ) : null}
    </div>
  );
}

const checkoutClass =
  "interactive flex min-h-12 w-full items-center justify-center rounded-md bg-niti-charcoal px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-niti-charcoal/90 hover:shadow-md";

export function CartContent() {
  const {
    items,
    subtotal,
    stepQuantity,
    removeItem,
    clearCart,
    checkoutUrl,
    isShopifyCart,
    cartLoading,
    cartError,
    prepareCheckout,
  } = useCart();
  const { t, locale } = useLanguage();
  const [checkingOut, setCheckingOut] = useState(false);

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
        <CartLinks prominent />
      </div>
    );
  }

  const checkoutButton = () =>
    isShopifyCart && checkoutUrl ? (
      <button
        type="button"
        className={checkoutClass}
        disabled={checkingOut}
        onClick={() => {
          setCheckingOut(true);
          void prepareCheckout().then((url) => {
            if (url) {
              window.location.assign(url);
              return;
            }
            setCheckingOut(false);
          });
        }}
      >
        {t("cart.checkout")}
      </button>
    ) : (
      <Button variant="outline" className="w-full" disabled>
        {t("cart.checkout")}
      </Button>
    );

  return (
    <>
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
      <div className="min-w-0">
      {cartError && (
        <p className="mb-4 rounded-lg border border-niti-sale/30 bg-niti-sale/5 px-4 py-3 text-sm text-niti-sale">
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
                src={productImageSrc(item.product.image)}
                alt={item.product.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/product/${item.product.handle}`}
                className="interactive font-semibold leading-snug text-niti-charcoal hover:underline"
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
                    onClick={() => stepQuantity(lineKey(item), -1)}
                    className="interactive flex h-11 w-11 items-center justify-center"
                    aria-label="Smanji količinu"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2ch] text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => stepQuantity(lineKey(item), 1)}
                    className="interactive flex h-11 w-11 items-center justify-center"
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
      <CartLinks />
      </div>

      <aside className="h-fit border border-niti-line bg-white p-6 lg:sticky lg:top-28">
        <h2 className="text-lg font-semibold">{t("cart.summary")}</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-niti-muted">{t("nav.subtotal")}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </div>
          {/* Dostava se računa pri plaćanju — vrati kad trošak bude potvrđen
          <div className="flex justify-between">
            <span className="text-niti-muted">{t("cart.shipping")}</span>
            <span className="text-niti-sage-dark">{t("cart.shippingCalc")}</span>
          </div>
          */}
        </div>
        <div className="mt-6 flex justify-between border-t border-niti-line pt-6 text-base font-semibold">
          <span>{t("cart.total")}</span>
          <span>{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="mt-8 hidden lg:block">{checkoutButton()}</div>
        <p className="mt-4 text-center text-xs text-niti-muted">
          {t("cart.secure")}
        </p>
        <button
          type="button"
          onClick={clearCart}
          className="interactive mt-4 w-full text-center text-xs text-niti-muted underline"
        >
          {t("cart.clear")}
        </button>
      </aside>
    </div>

    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-niti-line bg-niti-cream/95 px-4 py-3 backdrop-blur-md lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="mx-auto flex max-w-[1440px] items-center gap-3">
        <div className="min-w-0 shrink-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-niti-muted">
            {t("cart.total")}
          </p>
          <p className="text-base font-semibold tabular-nums text-niti-charcoal">
            {formatPrice(subtotal, locale)}
          </p>
        </div>
        <div className="min-w-0 flex-1">{checkoutButton()}</div>
      </div>
    </div>
    <div className="h-24 lg:hidden" aria-hidden />
    </>
  );
}
