import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { HeroMediaPreload } from "@/components/home/HeroMediaPreload";
import { HomeLoaderProvider } from "@/context/HomeLoaderContext";
import { NewArrivals } from "@/components/home/NewArrivals";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { DesignCarousel } from "@/components/home/DesignCarousel";
import { FeaturedHero } from "@/components/home/FeaturedHero";
// import { MarqueeBanner } from "@/components/home/MarqueeBanner";
import { FaqSection } from "@/components/home/FaqSection";
import { getAllProducts, getNewArrivalsProducts } from "@/lib/catalog";
import { getDesignShowcaseItems } from "@/lib/catalog/design-showcase";

export const revalidate = 60;

export default async function HomePage() {
  const [products, designShowcase] = await Promise.all([
    getAllProducts(),
    getDesignShowcaseItems(),
  ]);
  const newArrivals = await getNewArrivalsProducts(products);
  return (
    <HomeLoaderProvider>
      <HeroMediaPreload />
      <Header variant="transparent" />
      <main className="min-w-0 overflow-x-clip">
        <HeroCarousel />
        <NewArrivals products={newArrivals} />
        <CollectionsGrid />
        <FeaturedHero
          image="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85"
          ctaHref="/shop/spavaca-soba"
        />
        <DesignCarousel items={designShowcase} />
        {/* Pomerajuća traka — privremeno isključeno
        <MarqueeBanner />
        */}
        <FaqSection />
      </main>
      <Footer />
    </HomeLoaderProvider>
  );
}
