import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RoomNavStrip } from "@/components/shop/RoomNavStrip";
import { ShopPageClient } from "@/components/shop/ShopPageClient";
import { getAllProducts } from "@/lib/catalog";

export const metadata = {
  title: "Prodavnica",
};

export const revalidate = 60;

export default async function ShopPage() {
  const productList = await getAllProducts();

  return (
    <>
      <Header variant="solid" />
      <main className="pt-[var(--header-offset)]">
        <section className="px-4 pt-10 md:px-8 md:pt-14 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <h1 className="font-serif text-4xl font-semibold text-niti-charcoal md:text-5xl">
              Sva ponuda
            </h1>
          </div>
        </section>
        <RoomNavStrip activeId="all" />
        <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 md:px-8 md:pt-10 lg:px-12">
          <ShopPageClient hideHeader hideFilters productList={productList} />
        </div>
      </main>
      <Footer />
    </>
  );
}
