"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CarouselControls } from "@/components/ui/CarouselControls";
import {
  runHeroEntrance,
  runHeroMediaZoom,
  registerGsap,
} from "@/lib/animations";
import { heroSlides } from "@/config/hero-slides";
import { heroConfig } from "@/config/hero";
import { useHomeLoader } from "@/context/HomeLoaderContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types";

function getSlideMedia(slide: HeroSlide) {
  const type = slide.mediaType ?? "image";
  const src = slide.mediaSrc ?? slide.image;
  return { type, src, poster: slide.poster ?? slide.image };
}

function HeroMedia({
  slide,
  onReady,
}: {
  slide: HeroSlide;
  onReady?: () => void;
}) {
  const { type, src, poster } = getSlideMedia(slide);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readySent = useRef(false);

  const notifyReady = useCallback(() => {
    if (readySent.current) return;
    readySent.current = true;
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    readySent.current = false;
  }, [src, type]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || type !== "video") return;

    const handleReady = () => notifyReady();

    if (v.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      handleReady();
    } else {
      v.addEventListener("canplay", handleReady, { once: true });
    }

    v.play().catch(() => {});

    return () => v.removeEventListener("canplay", handleReady);
  }, [src, type, notifyReady]);

  if (type === "video") {
    return (
      <video
        ref={videoRef}
        key={src}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  }

  return (
    <Image
      src={src}
      alt={slide.headline}
      fill
      priority
      sizes="100vw"
      className="object-cover"
      onLoad={notifyReady}
    />
  );
}

export function HeroCarousel({
  slides: slideSource = heroSlides,
}: {
  slides?: HeroSlide[];
}) {
  const { t } = useLanguage();
  const { markHeroReady } = useHomeLoader();
  const slides = heroConfig.singleVideoLoop
    ? slideSource.slice(0, 1)
    : slideSource;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLElement>(null);
  const slide = slides[index];
  const showControls = !heroConfig.singleVideoLoop && slides.length > 1;

  const goTo = useCallback(
    (i: number) => {
      setIndex((i + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    registerGsap();
    if (!containerRef.current) return;
    const tl = runHeroEntrance(containerRef.current);
    return () => {
      tl.kill();
    };
  }, [index]);

  useEffect(() => {
    if (!showControls || !playing) return;
    const id = setInterval(next, heroConfig.autoplayMs);
    return () => clearInterval(id);
  }, [playing, next, showControls]);

  useEffect(() => {
    const media = containerRef.current?.querySelector("[data-hero-media]");
    const tween = runHeroMediaZoom(media ?? null);
    return () => {
      tween?.kill();
    };
  }, [index]);

  return (
    <section
      ref={containerRef}
      className="relative h-[min(100svh,760px)] min-h-[480px] w-full overflow-hidden md:h-[100svh] md:min-h-[560px]"
    >
      <div className="absolute inset-0 overflow-hidden" data-hero-media>
        <HeroMedia slide={slide} onReady={markHeroReady} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-4 pb-24 pt-28 md:px-8 md:pb-28 md:pt-32 lg:px-12 lg:pb-36">
        <p
          data-hero-tag
          className="mb-3 w-fit border border-white/55 px-3 py-1.5 text-xs text-white/95 md:mb-5 md:text-sm"
        >
          {slide.productTag ?? "Premium tekstil - NITI."}
        </p>

        <p
          data-hero-tag
          className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/80 md:mb-3"
        >
          {slide.category}
        </p>

        <h1
          data-hero-headline
          className="max-w-3xl text-[1.65rem] font-semibold uppercase leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
        >
          {slide.headline}
          {slide.brandMark && (
            <span className="ml-3 inline-block tracking-[0.14em] sm:ml-4 md:ml-5">
              NITI.
            </span>
          )}
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 md:mt-5 md:text-base">
          {slide.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-3" data-hero-cta>
          <Button href={slide.ctaPrimary.href} variant="primary">
            {slide.ctaPrimary.label}
          </Button>
          {slide.ctaSecondary && (
            <Button href={slide.ctaSecondary.href} variant="ghost">
              {t("hero.shopAll")}
            </Button>
          )}
        </div>
      </div>

      {showControls && (
        <div className="absolute inset-x-3 bottom-6 flex justify-center sm:inset-x-4 sm:bottom-8">
          <div className="flex max-w-full items-center gap-2 overflow-hidden rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md sm:gap-4 sm:px-4 sm:py-2">
            <CarouselControls onPrev={prev} onNext={next} size="sm" />
            <div className="flex max-w-[40vw] gap-1.5 overflow-hidden sm:max-w-none sm:gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${t("hero.slide")} ${i + 1}`}
                  className={cn(
                    "interactive h-2 w-2 shrink-0 rounded-full transition-colors",
                    i === index ? "bg-white" : "bg-white/40"
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t("hero.pause") : t("hero.play")}
              className="interactive flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-white"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5" fill="currentColor" />
              ) : (
                <Play className="h-3.5 w-3.5" fill="currentColor" />
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
