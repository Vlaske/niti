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

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-niti-sand/60">
        <Image
          src={list[index]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
      </div>

      {list.length > 1 && (
        <>
          <div className="mt-4 hidden gap-3 sm:grid sm:grid-cols-4">
            {list.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg",
                  i === index && "ring-2 ring-niti-sage"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <CarouselControls
              onPrev={() =>
                setIndex((i) => (i - 1 + list.length) % list.length)
              }
              onNext={() => setIndex((i) => (i + 1) % list.length)}
            />
          </div>
        </>
      )}
    </div>
  );
}
