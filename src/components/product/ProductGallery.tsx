"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/shopify/color-images";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  title: string;
  /** Prefer this image when a color/variant is selected */
  preferredSrc?: string | null;
};

export function ProductGallery({
  images,
  title,
  preferredSrc,
}: ProductGalleryProps) {
  const list = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const preferredKey = preferredSrc ?? "";
  const selectionKey = `${title}::${preferredKey}`;
  const [seenSelection, setSeenSelection] = useState(selectionKey);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const mobileThumbsRef = useRef<HTMLDivElement>(null);

  if (selectionKey !== seenSelection) {
    setSeenSelection(selectionKey);
    const target = preferredKey ? normalizeImageUrl(preferredKey) : "";
    const next = target
      ? list.findIndex((src) => normalizeImageUrl(src) === target)
      : 0;
    if (next >= 0 && next !== index) setIndex(next);
  }

  const hasMultiple = list.length > 1;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + list.length) % list.length);
  }, [list.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % list.length);
  }, [list.length]);

  useEffect(() => {
    const scrollThumb = (
      container: HTMLDivElement | null,
      horizontal: boolean
    ) => {
      if (!container) return;
      const active = container.querySelector<HTMLElement>(
        `[data-thumb-index="${index}"]`
      );
      if (!active) return;
      if (horizontal) {
        const left =
          active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      } else {
        const top =
          active.offsetTop - container.clientHeight / 2 + active.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    };
    scrollThumb(thumbsRef.current, false);
    scrollThumb(mobileThumbsRef.current, true);
  }, [index]);

  if (list.length === 0) return null;

  const current = list[index]!;
  const compactThumbs = list.length > 6;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:gap-4",
        hasMultiple && "sm:flex-row sm:items-start sm:gap-5"
      )}
    >
      {hasMultiple && (
        <div
          ref={thumbsRef}
          onWheel={(e) => {
            e.stopPropagation();
          }}
          className={cn(
            "order-2 hidden max-h-[min(70vh,640px)] shrink-0 flex-col gap-2 overscroll-contain scroll-smooth sm:order-1 sm:flex [scrollbar-width:thin]",
            compactThumbs
              ? "grid w-[5.5rem] grid-cols-2 content-start gap-2 overflow-y-auto md:w-24"
              : "w-[4.5rem] overflow-y-auto md:w-20"
          )}
        >
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              data-thumb-index={i}
              onClick={() => setIndex(i)}
              aria-label={`Slika ${i + 1} od ${list.length}`}
              aria-current={i === index}
              className={cn(
                "interactive relative aspect-square w-full shrink-0 overflow-hidden border bg-niti-sand/40 transition-all",
                i === index
                  ? "border-niti-charcoal opacity-100"
                  : "border-transparent opacity-55 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="pointer-events-none object-cover"
                sizes="80px"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 min-w-0 flex-1 sm:order-2">
        {/* Shorter on mobile so product info isn’t dwarfed by a full-bleed square */}
        <div className="group relative aspect-[4/5] overflow-hidden bg-niti-sand/60 sm:aspect-square">
          <Image
            key={current}
            src={current}
            alt={title}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="pointer-events-none select-none object-cover"
            draggable={false}
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Prethodna slika"
                className="interactive absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-white/90 text-niti-charcoal shadow-sm backdrop-blur-sm sm:left-3 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.25} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Sledeća slika"
                className="interactive absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-white/90 text-niti-charcoal shadow-sm backdrop-blur-sm sm:right-3 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.25} />
              </button>
              <p className="pointer-events-none absolute bottom-3 right-3 z-10 bg-black/45 px-2 py-1 text-[10px] font-medium tracking-wider text-white backdrop-blur-sm">
                {index + 1} / {list.length}
              </p>
            </>
          )}
        </div>

        {hasMultiple && (
          <div
            ref={mobileThumbsRef}
            className="mt-3 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 scrollbar-hide sm:hidden"
          >
            {list.map((src, i) => (
              <button
                key={`mobile-${src}-${i}`}
                type="button"
                data-thumb-index={i}
                onClick={() => setIndex(i)}
                aria-label={`Slika ${i + 1}`}
                className={cn(
                  "interactive relative h-16 w-16 shrink-0 overflow-hidden border",
                  i === index
                    ? "border-niti-charcoal"
                    : "border-niti-line opacity-75"
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="pointer-events-none object-cover"
                  sizes="64px"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
