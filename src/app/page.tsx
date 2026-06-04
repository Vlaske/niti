import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { NewArrivals } from "@/components/home/NewArrivals";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { DesignCarousel } from "@/components/home/DesignCarousel";
import { FeaturedHero } from "@/components/home/FeaturedHero";
// import { MarqueeBanner } from "@/components/home/MarqueeBanner";
import { FaqSection } from "@/components/home/FaqSection";
import { getAllProducts } from "@/lib/catalog";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getAllProducts();
  return (
    <>
      <Header variant="transparent" />
      <main>
        <HeroCarousel />
        <NewArrivals products={products} />
        <CollectionsGrid />
        <FeaturedHero
          image="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85"
          ctaHref="/product/cloud-linen-sheet-set"
        />
        <DesignCarousel />
        {/* Pomerajuća traka — privremeno isključeno
        <MarqueeBanner />
        */}
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
