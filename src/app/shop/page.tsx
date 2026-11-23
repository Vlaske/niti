import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomNavStrip } from "@/components/shop/RoomNavStrip";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { getAllProducts } from "@/lib/catalog";
import { toListingProduct } from "@/lib/catalog/listing";
import { getPromoEdit } from "@/lib/promo";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

type ShopPageProps = {
  searchParams: Promise<{ snizeno?: string | string[] }>;
};

function isSaleView(value: string | string[] | undefined) {
  return value === "1" || (Array.isArray(value) && value.includes("1"));
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const params = await searchParams;
  if (isSaleView(params.snizeno)) {
    return buildPageMetadata({
      title: "Sniženo",
      description:
        "Artikli na sniženju - današnja cena niža od prethodne. Posteljine, peškiri i tekstil za dom. NITI.",
      path: "/shop?snizeno=1",
    });
  }
  return buildPageMetadata({
    title: "Prodavnica",
    description:
      "Cela ponuda NITI. - posteljine, peškiri, stolnjaci, dečiji i hotelski program. Filtrirajte po prostoru i sortirajte po ceni.",
    path: "/shop",
  });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const saleOnly = isSaleView(params.snizeno);
  const promo = saleOnly ? await getPromoEdit() : null;
  const productList =
    saleOnly && promo
      ? promo.allProducts.length > 0
        ? promo.allProducts
        : []
      : await getAllProducts();

  return (
    <>
      <Header variant="solid" />
      <main className="pt-[var(--header-offset)]">
        <section className="px-4 pt-10 md:px-8 md:pt-14 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <h1 className="font-serif text-3xl font-semibold text-niti-charcoal sm:text-4xl md:text-5xl">
              {saleOnly ? "Sniženo" : "Sva ponuda"}
            </h1>
            {saleOnly ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-niti-muted md:text-base">
                Komadi čija je današnja cena niža od prethodne - najveći popust
                prvi.{" "}
                <Link
                  href="/shop"
                  className="interactive text-niti-charcoal underline underline-offset-4"
                >
                  Sva ponuda
                </Link>
              </p>
            ) : null}
          </div>
        </section>
        {saleOnly ? null : <RoomNavStrip activeId="all" />}
        <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-8 md:pt-10 lg:px-12">
          <ShopPageClient
            hideHeader
            hideFilters
            saleOnly={saleOnly}
            productList={productList.map(toListingProduct)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
