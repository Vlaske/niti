import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-niti-muted">
        NITI.
      </p>
      <h1 className="mt-3 font-serif text-3xl font-medium text-niti-charcoal md:text-4xl">
        Stranica nije pronađena
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-niti-muted">
        Proverite adresu ili se vratite u prodavnicu.
      </p>
      <Link
        href="/shop"
        className="interactive mt-8 border border-niti-charcoal/20 px-6 py-3 text-sm font-medium text-niti-charcoal"
      >
        Sva ponuda
      </Link>
    </main>
  );
}
