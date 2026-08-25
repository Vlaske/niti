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
    <div className={cn("flex flex-wrap gap-x-6 gap-y-3 md:gap-x-8", className)}>
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            "interactive border-b pb-1 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors md:text-xs",
            active === f.id
              ? "border-niti-charcoal text-niti-charcoal"
              : "border-transparent text-niti-muted hover:text-niti-charcoal"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
