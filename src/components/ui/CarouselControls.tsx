"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselControlsProps = {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
  size?: "sm" | "md";
};

export function CarouselControls({
  onPrev,
  onNext,
  className,
  size = "md",
}: CarouselControlsProps) {
  const btn =
    size === "sm"
      ? "h-10 w-10"
      : "h-11 w-11 md:h-12 md:w-12";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className={cn(
          btn,
          "interactive flex items-center justify-center rounded-md border border-niti-charcoal/15 text-niti-charcoal transition-colors hover:border-niti-charcoal/35 hover:bg-niti-sand/50"
        )}
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className={cn(
          btn,
          "interactive flex items-center justify-center rounded-md border border-niti-charcoal/15 text-niti-charcoal transition-colors hover:border-niti-charcoal/35 hover:bg-niti-sand/50"
        )}
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
