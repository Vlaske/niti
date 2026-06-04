"use client";

import { cn } from "@/lib/utils";

type Filter = { id: string; label: string };

type FilterPillsProps = {
  filters: Filter[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function FilterPills({
  filters,
  active,
  onChange,
  className,
}: FilterPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 md:gap-3", className)}>
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            "interactive rounded-full border px-4 py-2 text-sm transition-all duration-300",
            active === f.id
              ? "border-niti-charcoal text-niti-charcoal"
              : "border-niti-line text-niti-muted hover:border-niti-charcoal/25"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
