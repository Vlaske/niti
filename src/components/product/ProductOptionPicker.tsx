"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  guessColorSwatchStyle,
  isOptionValueInStock,
  isPatternOptionName,
} from "@/lib/shopify/variants";
import type {
  ProductOption,
  ProductOptionValue,
  ProductVariantSnapshot,
} from "@/types";

type ProductOptionPickerProps = {
  options: ProductOption[];
  selections: Record<string, string>;
  onChange: (optionName: string, value: string) => void;
  errors?: Record<string, boolean>;
  /** In-stock variants. A value stays clickable if any of them use it. */
  variants?: ProductVariantSnapshot[];
};

function OptionHeading({
  label,
  selected,
  hasError,
}: {
  label: string;
  selected?: string;
  hasError?: boolean;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.16em]",
          hasError ? "text-niti-sale" : "text-niti-charcoal"
        )}
      >
        {label}
      </p>
      {selected ? (
        <>
          <span className="text-niti-line" aria-hidden>
            ·
          </span>
          <span className="text-sm text-niti-muted">{selected}</span>
        </>
      ) : null}
    </div>
  );
}

function ChipButton({
  value,
  selected,
  disabled,
  hasError,
  onClick,
}: {
  value: string;
  selected: boolean;
  disabled: boolean;
  hasError: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "interactive min-w-0 rounded-md border px-3.5 py-2.5 text-left text-sm font-medium leading-snug break-words transition-colors",
        selected
          ? "border-niti-charcoal bg-niti-charcoal text-white"
          : "border-niti-line bg-white text-niti-charcoal hover:border-niti-charcoal/35",
        disabled && "cursor-not-allowed opacity-40",
        hasError && !selected && "border-niti-sale"
      )}
    >
      {value}
    </button>
  );
}

function ColorSwatchRow({
  optionName,
  values,
  selectedValue,
  hasError,
  onChange,
}: {
  optionName: string;
  values: ProductOptionValue[];
  selectedValue?: string;
  hasError: boolean;
  onChange: (optionName: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5" role="listbox" aria-label={optionName}>
      {values.map((val) => {
        const selected = selectedValue === val.value;
        const disabled = !val.available;
        return (
          <button
            key={`${optionName}-${val.value}`}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={val.value}
            title={val.value}
            disabled={disabled}
            onClick={() => onChange(optionName, val.value)}
            className={cn(
              "interactive relative h-10 w-10 shrink-0 rounded-full border transition-shadow md:h-11 md:w-11",
              selected
                ? "border-niti-charcoal shadow-[0_0_0_2px_var(--niti-cream),0_0_0_4px_var(--niti-charcoal)]"
                : "border-niti-charcoal/15 hover:border-niti-charcoal/40",
              disabled && "cursor-not-allowed opacity-40",
              hasError && !selected && "border-niti-sale"
            )}
            style={guessColorSwatchStyle(val.value)}
          />
        );
      })}
    </div>
  );
}

export function ProductOptionPicker({
  options,
  selections,
  onChange,
  errors = {},
  variants = [],
}: ProductOptionPickerProps) {
  const enriched = useMemo(() => {
    if (!variants.length) return options;
    return options.map((option) => ({
      ...option,
      values: option.values.map((val) => ({
        ...val,
        available: isOptionValueInStock(variants, option.name, val.value),
      })),
    }));
  }, [options, variants]);

  return (
    <div className="space-y-7 border-t border-niti-line pt-7">
      {enriched.map((option) => {
        const selectedValue = selections[option.name];
        const hasError = Boolean(errors[option.name]);
        const isColor =
          option.type === "color" && !isPatternOptionName(option.name);
        const isPattern = isPatternOptionName(option.name);

        return (
          <div key={option.name} className="min-w-0">
            <OptionHeading
              label={option.label}
              selected={selectedValue}
              hasError={hasError}
            />

            {isColor ? (
              <ColorSwatchRow
                optionName={option.name}
                values={option.values}
                selectedValue={selectedValue}
                hasError={hasError}
                onChange={onChange}
              />
            ) : (
              <div
                className={cn(
                  "flex flex-wrap gap-2",
                  isPattern && "gap-2"
                )}
              >
                {option.values.map((val) => (
                  <ChipButton
                    key={`${option.name}-${val.value}`}
                    value={val.value}
                    selected={selectedValue === val.value}
                    disabled={!val.available}
                    hasError={hasError}
                    onClick={() => onChange(option.name, val.value)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
