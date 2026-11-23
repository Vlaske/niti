"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-niti-muted">
        NITI.
      </p>
      <h1 className="mt-3 font-serif text-3xl font-medium text-niti-charcoal md:text-4xl">
        Nešto nije u redu
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-niti-muted">
        Stranica trenutno nije dostupna. Pokušajte ponovo za trenutak.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="interactive border border-niti-charcoal/20 bg-niti-charcoal px-6 py-3 text-sm font-medium text-niti-cream"
        >
          Pokušaj ponovo
        </button>
        <Link
          href="/"
          className="interactive border border-niti-charcoal/20 px-6 py-3 text-sm font-medium text-niti-charcoal"
        >
          Početna
        </Link>
      </div>
    </main>
  );
}
