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
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const visible = colors.slice(0, maxVisible);
  const extra = Math.max(0, colors.length - visible.length);

  return (
    // pl/py give the selected ring room so it never clips on card edges
    <div className="flex flex-nowrap items-center gap-2 overflow-visible py-1 pl-1">
      {visible.map((c, i) => (
        <button
          key={`${c.name}-${c.variantId ?? i}`}
          type="button"
          title={c.name}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect?.(c.name);
          }}
          className={cn(
            dim,
            "interactive relative shrink-0 rounded-full border transition-transform hover:scale-105",
            selected === c.name
              ? "border-niti-charcoal shadow-[0_0_0_1.5px_var(--niti-cream),0_0_0_2.5px_var(--niti-charcoal)]"
              : "border-niti-charcoal/20"
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
