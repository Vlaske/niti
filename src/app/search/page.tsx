import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  CATEGORY_GROUPS,
  STORE_CATEGORIES,
  getStoreCategoryBySlug,
} from "@/config/store-categories";
import { getAllProducts } from "@/lib/catalog";
import { toListingProduct } from "@/lib/catalog/listing";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ q?: string | string[] }>;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function queryValue(raw: string | string[] | undefined) {
  if (Array.isArray(raw)) return raw[0]?.trim() ?? "";
  return raw?.trim() ?? "";
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const q = queryValue(params.q);
  return buildPageMetadata({
    title: q ? `Pretraga: ${q}` : "Pretraga",
    description: q
      ? `Rezultati pretrage za „${q}“ u ponudi NITI.`
      : "Pretražite posteljine, peškire i kućni tekstil NITI.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = queryValue(params.q);
  const needle = normalize(q);

  const products = q.length > 0 ? await getAllProducts() : [];
  const matched =
    needle.length === 0
      ? []
      : products
          .filter((p) => {
            const hay = normalize(
              [
                p.title,
                p.brand,
                p.category,
                p.description,
                p.handle,
                ...(p.tags ?? []),
                getStoreCategoryBySlug(p.category)?.title ?? "",
              ].join(" ")
            );
            return hay.includes(needle);
          })
          .slice(0, 48);

  const categories =
    needle.length === 0
      ? []
      : STORE_CATEGORIES.filter((c) =>
          normalize(`${c.title} ${c.description} ${c.slug}`).includes(needle)
        ).slice(0, 8);

  const rooms =
    needle.length === 0
      ? []
      : CATEGORY_GROUPS.filter((g) =>
          normalize(`${g.title} ${g.description} ${g.id}`).includes(needle)
        ).slice(0, 6);

  return (
    <>
      <Header variant="solid" />
      <main className="pt-[var(--header-offset)]">
        <section className="mx-auto max-w-[1440px] px-4 pt-10 md:px-8 md:pt-14 lg:px-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-niti-muted">
            Pretraga
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-niti-charcoal sm:text-4xl">
            {q ? (
              <>
                Rezultati za{" "}
                <span className="italic">&ldquo;{q}&rdquo;</span>
              </>
            ) : (
              "Pretražite ponudu"
            )}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-niti-muted md:text-base">
            {q
              ? matched.length > 0
                ? `${matched.length} proizvoda`
                : "Nema proizvoda za ovaj upit - pokušajte drugačiji pojam ili pregledajte prostor."
              : "Koristite pretragu u zaglavlju ili unesite pojam u URL (?q=…)."}
          </p>
        </section>

        {(rooms.length > 0 || categories.length > 0) && (
          <section className="mx-auto max-w-[1440px] px-4 pt-8 md:px-8 lg:px-12">
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/shop/${room.id}`}
                  className="interactive rounded-md border border-niti-line bg-white px-3 py-2 text-sm text-niti-charcoal hover:border-niti-charcoal/30"
                >
                  {room.title}
                </Link>
              ))}
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  className="interactive rounded-md border border-niti-line bg-white px-3 py-2 text-sm text-niti-charcoal hover:border-niti-charcoal/30"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-8 md:pt-10 lg:px-12">
          {matched.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
              {matched.map((product) => (
                <ProductCard
                  key={product.id}
                  product={toListingProduct(product)}
                />
              ))}
            </div>
          ) : q ? (
            <div className="flex flex-wrap gap-3 py-8">
              <Link
                href="/shop"
                className="interactive rounded-md bg-niti-charcoal px-5 py-3 text-sm font-medium text-white"
              >
                Sva ponuda
              </Link>
              <Link
                href="/shop/spavaca-soba"
                className="interactive rounded-md border border-niti-line bg-white px-5 py-3 text-sm text-niti-charcoal"
              >
                Spavaća soba
              </Link>
              <Link
                href="/shop/kupatilo"
                className="interactive rounded-md border border-niti-line bg-white px-5 py-3 text-sm text-niti-charcoal"
              >
                Kupatilo
              </Link>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
