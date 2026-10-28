"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type ScrollableNavProps = {
  children: ReactNode;
  className?: string;
};

/** Horizontal link row. On small screens, edge fades show there is more to scroll. */
export function ScrollableNav({ children, className }: ScrollableNavProps) {
  const { t } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      left: el.scrollLeft > 8,
      right: max - el.scrollLeft > 8,
    });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update, children]);

  const nudge = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: direction * 160, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={cn(
          "flex gap-x-5 overflow-x-auto px-4 py-3 scrollbar-hide md:flex-wrap md:gap-x-8 md:overflow-visible md:px-8 md:py-5 lg:px-12",
          className
        )}
      >
        {children}
      </div>
      {edges.left ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center bg-gradient-to-r from-niti-cream from-45% to-transparent md:hidden">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={t("shop.previousCategories")}
            className="interactive pointer-events-auto flex h-full w-8 items-center justify-center text-niti-charcoal"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {edges.right ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end bg-gradient-to-l from-niti-cream from-45% to-transparent md:hidden">
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={t("shop.moreCategories")}
            className="interactive pointer-events-auto flex h-full w-8 items-center justify-center text-niti-charcoal"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
