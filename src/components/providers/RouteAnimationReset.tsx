"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  killAllScrollAnimations,
  registerGsap,
  resetRevealElements,
} from "@/lib/animations";

export function RouteAnimationReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    registerGsap();
    killAllScrollAnimations();
    resetRevealElements(document.body);

    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });

    return () => {
      cancelAnimationFrame(id);
      killAllScrollAnimations();
    };
  }, [pathname]);

  return null;
}
