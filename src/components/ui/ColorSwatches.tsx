"use client";

import { cn } from "@/lib/utils";
import { guessColorSwatchStyle } from "@/lib/shopify/variants";
import type { ProductColor } from "@/types";

type ColorSwatchesProps = {
  colors: ProductColor[];
  selected?: string;
  onSelect?: (name: string) => void;
  size?: "sm" | "md";
  /** Cap how many dots show (rest as +N) — avoids overlap on dense cards */
  maxVisible?: number;
};

export function ColorSwatches({
  colors,
  selected,
  onSelect,
  size = "sm",
  maxVisible = 6,
}: ColorSwatchesProps) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const visible = colors.slice(0, maxVisible);
  const extra = Math.max(0, colors.length - visible.length);

  return (
    <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
      {visible.map((c, i) => (
        <button
          key={`${c.name}-${c.variantId ?? i}`}
          type="button"
          title={c.name}
          onClick={() => onSelect?.(c.name)}
          className={cn(
            dim,
            "interactive shrink-0 rounded-full border border-niti-charcoal/15 transition-transform hover:scale-110",
            selected === c.name
              ? "ring-1 ring-niti-charcoal ring-offset-1"
              : "ring-0"
          )}
          style={guessColorSwatchStyle(c.name)}
          aria-label={`Color ${c.name}`}
        />
      ))}
      {extra > 0 && (
        <span className="shrink-0 text-[10px] font-medium tabular-nums text-niti-muted">
          +{extra}
        </span>
      )}
    </div>
  );
}
