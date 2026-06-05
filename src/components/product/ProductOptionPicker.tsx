"use client";

import { cn } from "@/lib/utils";
import type { ProductOption } from "@/types";

type ProductOptionPickerProps = {
  options: ProductOption[];
  selections: Record<string, string>;
  onChange: (optionName: string, value: string) => void;
  errors?: Record<string, boolean>;
};

export function ProductOptionPicker({
  options,
  selections,
  onChange,
  errors = {},
}: ProductOptionPickerProps) {
  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.name}>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-niti-charcoal">
              {option.label}
            </p>
            {selections[option.name] && (
              <span className="text-xs text-niti-muted">
                {selections[option.name]}
              </span>
            )}
          </div>

          {option.type === "color" ? (
            <div className="flex flex-wrap gap-2.5">
              {option.values.map((val) => {
                const selected = selections[option.name] === val.value;
                const disabled = !val.available;
                return (
                  <button
                    key={`${option.name}-${val.value}`}
                    type="button"
                    title={val.value}
                    disabled={disabled}
                    onClick={() => onChange(option.name, val.value)}
                    className={cn(
                      "interactive group relative flex flex-col items-center gap-1.5",
                      disabled && "cursor-not-allowed opacity-40"
                    )}
                  >
                    <span
                      className={cn(
                        "block h-9 w-9 rounded-full border-2 transition-all md:h-10 md:w-10",
                        selected
                          ? "border-niti-charcoal ring-2 ring-niti-charcoal/20 ring-offset-2"
                          : "border-niti-line group-hover:scale-105",
                        errors[option.name] && !selected && "border-niti-sale"
                      )}
                      style={{ backgroundColor: val.hex ?? "#d4cfc8" }}
                    />
                    <span
                      className={cn(
                        "max-w-[4.5rem] truncate text-[10px] text-niti-muted",
                        selected && "font-medium text-niti-charcoal"
                      )}
                    >
                      {val.value}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {option.values.map((val) => {
                const selected = selections[option.name] === val.value;
                const disabled = !val.available;
                return (
                  <button
                    key={`${option.name}-${val.value}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(option.name, val.value)}
                    className={cn(
                      "interactive min-w-[3rem] rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                      selected
                        ? "border-niti-charcoal bg-niti-charcoal text-white"
                        : "border-niti-line bg-white text-niti-charcoal hover:border-niti-charcoal/30",
                      disabled && "cursor-not-allowed opacity-40",
                      errors[option.name] && !selected && "border-niti-sale"
                    )}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
