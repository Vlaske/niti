import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Search",
};

export default function SearchPage() {
  return (
    <PageShell mainClassName="pt-[var(--header-offset)]">
      <div className="mx-auto max-w-xl px-4 pb-20 md:px-8">
        <h1 className="text-3xl font-semibold">Search</h1>
        <p className="mt-4 text-niti-muted">
          Search will connect to Shopify once the storefront API is wired up.
        </p>
        <input
          type="search"
          placeholder="Search textiles..."
          className="mt-8 w-full rounded-md border border-niti-line bg-white px-4 py-3 text-sm outline-none focus:border-niti-sage"
          aria-label="Search products"
        />
      </div>
    </PageShell>
  );
}
