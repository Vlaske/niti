"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ProductDescription } from "@/components/product/ProductDescription";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type ProductInfoPanelProps = {
  product: Product;
};

function Accordion({
  title,
  open,
  onToggle,
  children,
  panelId,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  panelId: string;
}) {
  return (
    <div className="border-b border-niti-line">
      <button
        type="button"
        className="interactive flex min-h-12 w-full items-center justify-between gap-4 py-3.5 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-niti-charcoal">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-niti-muted transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={1.75}
        />
      </button>
      {open ? (
        <div id={panelId} className="pb-5">
          {children}
        </div>
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
  const [opisOpen, setOpisOpen] = useState(hasDescription);
  const [infoOpen, setInfoOpen] = useState(!hasDescription && hasSpecs);

  if (!hasDescription && !hasSpecs) return null;

  return (
    <div className="mt-6 border-t border-niti-line">
      {hasDescription ? (
        <Accordion
          title={t("product.tabDescription")}
          open={opisOpen}
          onToggle={() => setOpisOpen((v) => !v)}
          panelId="product-opis"
        >
          <ProductDescription
            html={product.descriptionHtml}
            plain={product.description}
            className="text-sm leading-7 text-niti-muted"
          />
        </Accordion>
      ) : null}

      {hasSpecs ? (
        <Accordion
          title={t("product.tabInfo")}
          open={infoOpen}
          onToggle={() => setInfoOpen((v) => !v)}
          panelId="product-info"
        >
          <dl>
            {specs.map((field) => (
              <div
                key={`${field.namespace}.${field.key}`}
                className="grid grid-cols-1 gap-1 border-b border-niti-line/80 py-3 last:border-b-0 sm:grid-cols-[minmax(7.5rem,38%)_1fr] sm:gap-4"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-niti-muted">
                  {t(`product.meta.${field.key}`)}
                </dt>
                <dd className="text-sm leading-relaxed text-niti-charcoal">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </Accordion>
      ) : null}
    </div>
  );
}
