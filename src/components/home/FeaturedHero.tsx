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
      className="relative min-h-[70vh] overflow-hidden md:min-h-[85vh]"
    >
      <Image src={image} alt="" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-4 py-24 md:min-h-[85vh] md:px-8 lg:px-12">
        <p
          data-reveal
          className="mb-3 text-xs uppercase tracking-[0.25em] text-white/80"
        >
          {t("home.featuredCategory")}
        </p>
        <h2
          data-reveal
          className="max-w-xl text-3xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl"
        >
          {t("home.featuredTitle")}
        </h2>
        <p
          data-reveal
          className="mt-6 max-w-md text-sm leading-relaxed text-white/90 md:text-base"
        >
          {t("home.featuredDesc")}
        </p>
        <div data-reveal className="mt-8">
          <Button href={ctaHref} variant="primary">
            {t("hero.viewProduct")}
          </Button>
        </div>
      </div>
    </section>
  );
}
