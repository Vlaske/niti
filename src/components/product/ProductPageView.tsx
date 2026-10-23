"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfoPanel } from "@/components/product/ProductInfoPanel";
import {
  ProductDetails,
  getDefaultProductSelections,
  getPreferredImageForSelections,
} from "@/components/product/ProductDetails";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useRecentlyViewed } from "@/context/RecentlyViewedContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getGroupById,
  getGroupForCategorySlug,
  getGroupHref,
  getStoreCategoryBySlug,
} from "@/config/store-categories";
import type { Product } from "@/types";
import { prefersReducedMotion } from "@/lib/animations";
import { productImageSrc } from "@/lib/product-image";
import { normalizeImageUrl } from "@/lib/shopify/color-images";

type ProductPageViewProps = {
  product: Product;
  related: Product[];
};

/** Gallery follows the scroll, and stops with the right-hand column. */
function BoundedGallery({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    let lastY = window.scrollY;
    let top = 0;

    const headerGap = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--header-offset")
        .trim();
      const parsed = Number.parseFloat(raw);
      return (Number.isFinite(parsed) ? parsed : 64) + 16;
    };

    const place = (delta: number) => {
      if (!desktop.matches) {
        el.style.top = "";
        return;
      }
      const header = headerGap();
      const minTop = Math.min(header, window.innerHeight - el.offsetHeight - 16);
      top = Math.min(header, Math.max(minTop, top - delta));
      el.style.top = `${top}px`;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      place(delta);
    };

    const onResize = () => {
      lastY = window.scrollY;
      place(0);
    };

    top = headerGap();
    place(0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(el);
    if (el.parentElement) observer.observe(el.parentElement);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="lg:sticky lg:self-start">
      {children}
    </div>
  );
}

export function ProductPageView({
  product,
  related,
}: ProductPageViewProps) {
  const { t } = useLanguage();
  const { addViewed, products: recent } = useRecentlyViewed();
  const mainRef = useRef<HTMLDivElement>(null);
  const [selections, setSelections] = useState(() =>
    getDefaultProductSelections(product)
  );

  useEffect(() => {
    setSelections(getDefaultProductSelections(product));
  }, [product.handle]);

  const images = useMemo(() => {
    const list = (product.images ?? [product.image]).filter((src) =>
      Boolean(src?.trim())
    );
    const preferred = getPreferredImageForSelections(product, selections);
    const preferredKey = preferred ? normalizeImageUrl(preferred) : "";
    if (
      preferred &&
      !list.some((src) => normalizeImageUrl(src) === preferredKey)
    ) {
      return [preferred, ...list];
    }
    return list.length ? list : [productImageSrc(product.image)];
  }, [product, selections]);

  const preferredSrc = getPreferredImageForSelections(product, selections);

  const recentExcluding = recent
    .filter((p) => p.handle !== product.handle)
    .slice(0, 4);

  const storeCat = getStoreCategoryBySlug(product.category);
  const groupId = getGroupForCategorySlug(product.category);
  const parentGroup = groupId ? getGroupById(groupId) : undefined;

  useEffect(() => {
    addViewed(product.handle);
  }, [product.handle, addViewed]);

  useEffect(() => {
    if (!mainRef.current || prefersReducedMotion()) return;
    const els = mainRef.current.querySelectorAll("[data-pdp-reveal]");
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" }
    );
    return () => {
      gsap.killTweensOf(els);
      gsap.set(els, { clearProps: "all" });
    };
  }, [product.handle]);

  return (
    <div ref={mainRef}>
      <nav
        data-pdp-reveal
        className="mb-5 mt-8 flex flex-wrap gap-1 text-xs text-niti-muted sm:text-sm md:mb-8 md:mt-12"
      >
        <Link href="/" className="interactive hover:text-niti-charcoal">
          {t("product.home")}
        </Link>
        <span className="mx-1">/</span>
        <Link href="/shop" className="interactive hover:text-niti-charcoal">
          {t("product.shop")}
        </Link>
        {parentGroup && (
          <>
            <span className="mx-1">/</span>
            <Link
              href={getGroupHref(parentGroup.id)}
              className="interactive hover:text-niti-charcoal"
            >
              {parentGroup.title}
            </Link>
          </>
        )}
        {storeCat && (
          <>
            <span className="mx-1">/</span>
            <Link
              href={`/shop/${storeCat.slug}`}
              className="interactive hover:text-niti-charcoal"
            >
              {storeCat.title}
            </Link>
          </>
        )}
      </nav>

      <div className="grid items-start gap-8 md:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-12 xl:gap-16">
        <div className="min-w-0 self-stretch">
          <BoundedGallery>
            <div data-pdp-reveal>
              <ProductGallery
                images={images}
                title={product.title}
                preferredSrc={preferredSrc}
              />
            </div>
          </BoundedGallery>
        </div>
        <div data-pdp-reveal className="min-w-0">
          <ProductDetails
            product={product}
            selections={selections}
            onSelectionsChange={setSelections}
          />
          <ProductInfoPanel product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10 border-t border-niti-line pt-10 md:mt-12 md:pt-16">
          <SectionHeader title={t("product.alsoLike")} className="mb-6 md:mb-10" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 md:gap-x-8 md:gap-y-12">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recentExcluding.length > 0 && (
        <section className="mt-12 border-t border-niti-line pt-10 md:mt-20 md:pt-16">
          <SectionHeader
            title={t("product.recentlyViewed")}
            className="mb-6 md:mb-10"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-4 md:gap-x-8 md:gap-y-12">
            {recentExcluding.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <p
        data-pdp-reveal
        className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-niti-line pt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-niti-muted md:mt-16 md:pt-8"
      >
        <span>{t("product.continue")}</span>
        {storeCat && (
          <Link
            href={`/shop/${storeCat.slug}`}
            className="interactive text-niti-charcoal hover:opacity-70"
          >
            {storeCat.title}
          </Link>
        )}
        {parentGroup && (
          <Link
            href={getGroupHref(parentGroup.id)}
            className="interactive text-niti-charcoal hover:opacity-70"
          >
            {parentGroup.title}
          </Link>
        )}
        <Link
          href="/shop"
          className="interactive text-niti-charcoal hover:opacity-70"
        >
          {t("nav.allProducts")}
        </Link>
      </p>
    </div>
  );
}
