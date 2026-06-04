"use client";

/**
 * Pomerajuća tekstualna traka — trenutno isključena na početnoj stranici.
 * Za uključivanje: odkomentariši <MarqueeBanner /> u src/app/page.tsx
 *
 * Podešavanja ispod: sporije, deblji tekst, veći padding.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { registerGsap } from "@/lib/animations";
import { useLanguage } from "@/context/LanguageContext";

const MARQUEE_DURATION = 48;

export function MarqueeBanner() {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const text = t("home.marquee");

  useEffect(() => {
    registerGsap();
    if (!trackRef.current) return;
    const track = trackRef.current;
    const tween = gsap.to(track, {
      x: () => -(track.scrollWidth / 2),
      duration: MARQUEE_DURATION,
      ease: "none",
      repeat: -1,
    });
    return () => {
      tween.kill();
      gsap.set(track, { clearProps: "x" });
    };
  }, [text]);

  return (
    <section className="overflow-hidden border-y-2 border-niti-line/80 bg-niti-sand/40 py-10 md:py-14">
      <div ref={trackRef} className="flex w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="px-6 font-serif text-5xl font-medium tracking-tight text-niti-marquee md:px-10 md:text-7xl lg:text-8xl"
            aria-hidden={copy === 1}
          >
            {text.repeat(2)}
          </span>
        ))}
      </div>
    </section>
  );
}
