"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { AlertCircle, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export function CartToast() {
  const { toast, dismissToast } = useCart();
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast?.visible || !ref.current) return;
    const el = ref.current;
    gsap.fromTo(
      el,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.4)" }
    );
    return () => {
      gsap.killTweensOf(el);
    };
  }, [toast]);

  if (!toast?.visible) return null;

  const isError = toast.variant === "error";

  return (
    <div
      ref={ref}
      role="status"
      className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-md md:left-auto md:right-8"
    >
      <div
        className={`flex items-center gap-4 rounded-xl border p-4 shadow-xl ${
          isError
            ? "border-niti-sale/40 bg-white"
            : "border-niti-line bg-white"
        }`}
      >
        {isError ? (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-niti-sale/10 text-niti-sale">
            <AlertCircle className="h-6 w-6" />
          </div>
        ) : (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-niti-sand">
            {toast.product?.image && (
              <Image
                src={toast.product.image}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            )}
            <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-niti-sage text-white">
              <Check className="h-3 w-3" />
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-niti-charcoal">
            {isError ? t("cart.errorTitle") : t("cart.added")}
          </p>
          <p className="text-xs text-niti-muted">
            {isError
              ? toast.message
              : toast.product?.title}
          </p>
        </div>
        {!isError && (
          <Link
            href="/cart"
            onClick={dismissToast}
            className="interactive shrink-0 rounded-md bg-niti-sage px-3 py-2 text-xs font-medium text-white"
          >
            {t("cart.viewCart")}
          </Link>
        )}
        {isError && (
          <button
            type="button"
            onClick={dismissToast}
            className="interactive shrink-0 text-xs text-niti-muted underline"
          >
            {t("cart.dismiss")}
          </button>
        )}
      </div>
    </div>
  );
}
