"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

let registered = false;

export function registerGsap() {
  if (typeof window === "undefined" || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** Kill all GSAP scroll animations — call on route change */
export function killAllScrollAnimations() {
  if (typeof window === "undefined") return;
  registerGsap();
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

export function resetRevealElements(root?: ParentNode | null) {
  if (typeof window === "undefined" || !root) return;
  const els = root.querySelectorAll(
    "[data-reveal], [data-section-reveal], [data-faq-reveal], [data-card], [data-hero-tag], [data-hero-headline], [data-hero-cta]"
  );
  gsap.killTweensOf(els);
  gsap.set(els, { clearProps: "all" });
}

export function useScrollReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options?: {
    selector?: string;
    stagger?: number;
    y?: number;
    trigger?: HTMLElement | null;
  }
) {
  const selector = options?.selector ?? "[data-reveal], [data-section-reveal], [data-faq-reveal], [data-card]";

  useLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll(selector);
    if (!targets.length) return;

    gsap.set(targets, { opacity: 0, y: options?.y ?? 36 });

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: options?.stagger ?? 0.1,
      scrollTrigger: {
        trigger: options?.trigger ?? root,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(targets, { clearProps: "all" });
    };
  }, [ref, selector, options?.stagger, options?.y, options?.trigger]);
}

export function runHeroEntrance(container: HTMLElement) {
  registerGsap();
  const tags = container.querySelectorAll("[data-hero-tag]");
  const headlines = container.querySelectorAll("[data-hero-headline]");
  const ctas = container.querySelectorAll("[data-hero-cta]");

  gsap.killTweensOf([...tags, ...headlines, ...ctas]);
  gsap.set([...tags, ...headlines, ...ctas], { clearProps: "all" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(tags, { opacity: 0, y: 20, duration: 0.7 })
    .from(headlines, { opacity: 0, y: 36, duration: 0.9 }, "-=0.4")
    .from(ctas, { opacity: 0, y: 24, duration: 0.7, stagger: 0.1 }, "-=0.5");

  return tl;
}

export function runHeroMediaZoom(mediaEl: Element | null) {
  if (!mediaEl) return;
  gsap.killTweensOf(mediaEl);
  return gsap.fromTo(
    mediaEl,
    { scale: 1.06 },
    { scale: 1, duration: 1.4, ease: "power2.out" }
  );
}
