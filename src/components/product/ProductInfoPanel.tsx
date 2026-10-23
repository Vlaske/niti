"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ProductDescription } from "@/components/product/ProductDescription";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** Keeps the open description near the photo so the left column doesn’t sit empty. */
const DESCRIPTION_PREVIEW = 188;

type ProductInfoPanelProps = {
  product: Product;
};

type TabId = "opis" | "info";

function DescriptionPreview({
  html,
  plain,
}: {
  html?: string;
  plain?: string;
}) {
  const { t } = useLanguage();
  const innerRef = useRef<HTMLDivElement>(null);
  const [fullHeight, setFullHeight] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setFullHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, plain]);

  const overflows = fullHeight != null && fullHeight > DESCRIPTION_PREVIEW + 28;
  const maxHeight =
    fullHeight == null
      ? DESCRIPTION_PREVIEW
      : overflows
        ? open
          ? fullHeight
          : DESCRIPTION_PREVIEW
        : fullHeight;

  return (
    <div>
      <div
        className="relative overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ maxHeight }}
      >
        <div ref={innerRef}>
          <ProductDescription
            html={html}
            plain={plain}
            className="text-sm leading-relaxed text-niti-muted"
          />
        </div>
        {overflows && !open ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-niti-cream via-niti-cream/80 to-transparent" />
        ) : null}
      </div>
      {overflows ? (
        <button
          type="button"
          className="interactive group mt-4 flex items-center gap-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-niti-charcoal"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="h-px w-5 bg-niti-charcoal/25 transition-[width] duration-300 ease-out group-hover:w-8 motion-reduce:transition-none" />
          {open ? t("product.showLess") : t("product.showMore")}
        </button>
      ) : null}
    </div>
  );
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const { t } = useLanguage();
  const specs = product.metafields ?? [];
  const hasDescription = Boolean(
    product.descriptionHtml?.trim() || product.description?.trim()
  );
  const hasSpecs = specs.length > 0;
  const [tab, setTab] = useState<TabId>(hasDescription ? "opis" : "info");

  if (!hasDescription && !hasSpecs) return null;

  const tabs: { id: TabId; label: string }[] = [
    ...(hasDescription
      ? [{ id: "opis" as const, label: t("product.tabDescription") }]
      : []),
    ...(hasSpecs ? [{ id: "info" as const, label: t("product.tabInfo") }] : []),
  ];

  return (
    <div className="mt-8">
      <div className="flex gap-8 border-b border-niti-line" role="tablist">
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`product-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`product-panel-${item.id}`}
              className={cn(
                "interactive -mb-px border-b-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
                selected
                  ? "border-niti-charcoal text-niti-charcoal"
                  : "border-transparent text-niti-muted hover:text-niti-charcoal"
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {tab === "opis" && hasDescription ? (
          <div
            role="tabpanel"
            id="product-panel-opis"
            aria-labelledby="product-tab-opis"
          >
            <DescriptionPreview
              html={product.descriptionHtml}
              plain={product.description}
            />
          </div>
        ) : null}

        {tab === "info" && hasSpecs ? (
          <dl
            role="tabpanel"
            id="product-panel-info"
            aria-labelledby="product-tab-info"
            className="max-w-xl"
          >
            {specs.map((field) => (
              <div
                key={`${field.namespace}.${field.key}`}
                className="grid grid-cols-[minmax(6.5rem,40%)_1fr] items-baseline gap-x-6 py-3"
              >
                <dt className="text-sm text-niti-muted">
                  {t(`product.meta.${field.key}`)}
                </dt>
                <dd className="text-sm text-niti-charcoal">{field.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}
