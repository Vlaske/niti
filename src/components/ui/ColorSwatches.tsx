"use client";

import { cn } from "@/lib/utils";
import type { ProductColor } from "@/types";

type ColorSwatchesProps = {
  colors: ProductColor[];
  selected?: string;
  onSelect?: (name: string) => void;
  size?: "sm" | "md";
};

export function ColorSwatches({
  colors,
  selected,
  onSelect,
  size = "sm",
}: ColorSwatchesProps) {
  const dim = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex gap-2">
      {colors.map((c) => (
        <button
          key={c.variantId ?? c.name}
          type="button"
          title={c.name}
          onClick={() => onSelect?.(c.name)}
          className={cn(
            dim,
            "interactive rounded-full border-2 transition-transform hover:scale-110",
            selected === c.name
              ? "border-niti-charcoal"
              : "border-transparent ring-1 ring-niti-line"
          )}
          style={{ backgroundColor: c.hex }}
          aria-label={`Color ${c.name}`}
        />
      ))}
    </div>
  );
}
