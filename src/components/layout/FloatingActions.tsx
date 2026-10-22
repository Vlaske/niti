"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function FloatingActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 md:right-8">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Na vrh"
        className="interactive flex h-11 w-11 items-center justify-center rounded-md bg-niti-sage text-white shadow-lg hover:scale-105"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
