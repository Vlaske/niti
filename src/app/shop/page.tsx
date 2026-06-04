import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryNavStrip } from "@/components/shop/CategoryNavStrip";
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
      <main className="pt-[4.5rem] md:pt-24">
        <section className="border-b border-niti-line bg-niti-sand/30 px-4 py-12 md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <h1 className="font-serif text-4xl font-semibold text-niti-charcoal md:text-5xl lg:text-6xl">
              Sva ponuda
            </h1>
          </div>
        </section>
        <CategoryNavStrip activeSlug="all" />
        <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-10 md:px-8 lg:px-12">
          <ShopPageClient hideHeader productList={productList} />
        </div>
      </main>
      <Footer />
    </>
  );
}
