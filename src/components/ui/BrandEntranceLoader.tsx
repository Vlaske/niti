"use client";

import { cn } from "@/lib/utils";

type BrandEntranceLoaderProps = {
  phase: "loading" | "fade";
};

export function BrandEntranceLoader({ phase }: BrandEntranceLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Učitavanje"
      className={cn(
        "brand-entrance-loader fixed inset-0 z-[200] flex flex-col items-center justify-center bg-niti-cream transition-opacity duration-500 ease-out",
        phase === "fade" && "pointer-events-none opacity-0"
      )}
    >
      <p className="brand-entrance-loader__logo font-serif text-[2.75rem] font-bold tracking-[0.22em] text-niti-charcoal sm:text-5xl">
        NITI.
      </p>
      <div
        className="brand-entrance-loader__line mt-7 h-px w-20 bg-niti-sage-dark/70"
        aria-hidden
      />
    </div>
  );
}
