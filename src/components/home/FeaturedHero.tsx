"use client";

import Image from "next/image";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useScrollReveal } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";

type FeaturedHeroProps = {
  image: string;
  ctaHref: string;
};

export function FeaturedHero({ image, ctaHref }: FeaturedHeroProps) {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);

  useScrollReveal(ref, { selector: "[data-reveal]" });

  return (
    <section
      ref={ref}
      className="relative min-h-[42vh] overflow-hidden sm:min-h-[60vh] md:min-h-[85vh]"
    >
      <Image
        src={image}
        alt=""
        fill
        className="pointer-events-none object-cover"
        sizes="100vw"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.4)_32%,rgba(0,0,0,0.14)_58%,transparent_78%)]" />
      <div className="relative mx-auto flex min-h-[42vh] max-w-[1440px] flex-col justify-center px-4 py-12 sm:min-h-[60vh] sm:py-20 md:min-h-[85vh] md:px-8 md:py-24 lg:px-12">
        <p
          data-reveal
          className="mb-3 text-xs uppercase tracking-[0.25em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]"
        >
          {t("home.featuredCategory")}
        </p>
        <h2
          data-reveal
          className="max-w-xl font-serif text-2xl font-medium leading-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] sm:text-3xl md:text-5xl lg:text-6xl"
        >
          {t("home.featuredTitle")}
        </h2>
        <p
          data-reveal
          className="mt-6 max-w-md text-sm leading-relaxed text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)] md:text-base"
        >
          {t("home.featuredDesc")}
        </p>
        <div data-reveal className="mt-8">
          <Button href={ctaHref} variant="primary">
            {t("nav.shopNow")}
          </Button>
        </div>
      </div>
    </section>
  );
}
