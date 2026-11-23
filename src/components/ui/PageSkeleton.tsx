/** Instant route feedback while the server finishes Shopify fetches. */
export function PageSkeleton({ variant = "shop" }: { variant?: "shop" | "product" | "simple" }) {
  if (variant === "product") {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:px-8 md:py-16 lg:px-12" aria-hidden>
        <div className="aspect-[4/5] animate-pulse bg-niti-sand" />
        <div className="space-y-4 pt-2">
          <div className="h-3 w-16 animate-pulse bg-niti-sand" />
          <div className="h-8 w-3/4 animate-pulse bg-niti-sand" />
          <div className="h-5 w-28 animate-pulse bg-niti-sand" />
          <div className="mt-8 h-11 w-full max-w-xs animate-pulse bg-niti-sand" />
          <div className="h-12 w-full max-w-sm animate-pulse bg-niti-sand" />
        </div>
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <div className="mx-auto max-w-[720px] space-y-4 px-4 py-16 md:px-8" aria-hidden>
        <div className="h-8 w-48 animate-pulse bg-niti-sand" />
        <div className="h-4 w-full animate-pulse bg-niti-sand" />
        <div className="h-4 w-5/6 animate-pulse bg-niti-sand" />
        <div className="h-4 w-4/6 animate-pulse bg-niti-sand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-8 md:py-14 lg:px-12" aria-hidden>
      <div className="mb-8 h-8 w-40 animate-pulse bg-niti-sand md:mb-10" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/5] animate-pulse bg-niti-sand" />
            <div className="h-4 w-4/5 animate-pulse bg-niti-sand" />
            <div className="h-3 w-1/3 animate-pulse bg-niti-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
