"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Thin top bar while client navigations wait on RSC/Shopify.
 * Feels instant even when the server still takes 1–3s.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);
  const keyRef = useRef(`${pathname}?${searchParams?.toString() ?? ""}`);

  useEffect(() => {
    const nextKey = `${pathname}?${searchParams?.toString() ?? ""}`;
    if (nextKey === keyRef.current) return;
    keyRef.current = nextKey;
    setDone(false);
    setActive(true);
    const settle = window.setTimeout(() => {
      setDone(true);
      window.setTimeout(() => setActive(false), 220);
    }, 280);
    return () => window.clearTimeout(settle);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        )
          return;
      } catch {
        return;
      }
      setDone(false);
      setActive(true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px]"
      role="progressbar"
      aria-hidden
    >
      <div
        className={cn(
          "h-full origin-left bg-niti-charcoal transition-transform duration-300 ease-out",
          done ? "scale-x-100 opacity-0" : "scale-x-[0.72]"
        )}
      />
    </div>
  );
}
