"use client";

import { ArrowUp } from "lucide-react";

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-4 z-40 md:right-8">
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
