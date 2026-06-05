"use client";

import Image from "next/image";
import { useState } from "react";
import { CarouselControls } from "@/components/ui/CarouselControls";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const list = images.length > 0 ? images : [];
  if (list.length === 0) return null;

  const hasMultiple = list.length > 1;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        hasMultiple && "sm:flex-row sm:items-start sm:gap-5"
      )}
    >
      {hasMultiple && (
        <div className="order-2 hidden max-h-[min(70vh,640px)] flex-col gap-2.5 overflow-y-auto sm:order-1 sm:flex sm:w-[4.5rem] md:w-20">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Slika ${i + 1} od ${list.length}`}
              aria-current={i === index}
              className={cn(
                "interactive relative aspect-square w-full shrink-0 overflow-hidden rounded-lg border-2 bg-niti-sand/40 transition-all",
                i === index
                  ? "border-niti-sage shadow-sm"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 min-w-0 flex-1 sm:order-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-niti-sand/60">
          <Image
            key={list[index]}
            src={list[index]}
            alt={title}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {hasMultiple && (
          <>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:hidden">
              {list.map((src, i) => (
                <button
                  key={`mobile-${src}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Slika ${i + 1}`}
                  className={cn(
                    "interactive relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                    i === index
                      ? "border-niti-sage"
                      : "border-niti-line opacity-75"
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center sm:hidden">
              <CarouselControls
                onPrev={() =>
                  setIndex((i) => (i - 1 + list.length) % list.length)
                }
                onNext={() => setIndex((i) => (i + 1) % list.length)}
                size="sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
