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
import { getNewArrivalsProducts } from "@/lib/catalog";
import { getDesignShowcaseItems } from "@/lib/catalog/design-showcase";
import { heroSlides } from "@/config/hero-slides";
import { FAQ_SECTION_IMAGE } from "@/config/placeholders";
import { CATEGORY_GROUPS } from "@/config/store-categories";
import { preferSiteImage, resolveHeroSlides } from "@/lib/site-images";

export const revalidate = 60;

export default async function HomePage() {
  const [newArrivals, designShowcase] = await Promise.all([
    getNewArrivalsProducts(),
    getDesignShowcaseItems(),
  ]);
  const slides = resolveHeroSlides(heroSlides);
  const roomImages = Object.fromEntries(
    CATEGORY_GROUPS.map((room) => [
      room.id,
      preferSiteImage(`rooms/${room.id}`, room.image),
    ])
  );
  return (
    <HomeLoaderProvider>
      <HeroMediaPreload slides={slides} />
      <Header variant="transparent" />
      <main className="min-w-0 overflow-x-clip">
        <HeroCarousel slides={slides} />
        <NewArrivals products={newArrivals} />
        <CollectionsGrid images={roomImages} />
        <FeaturedHero
          image={preferSiteImage(
            "home/featured-spavaca-soba",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85"
          )}
          ctaHref="/shop/spavaca-soba"
        />
        <DesignCarousel items={designShowcase} />
        {/* Pomerajuća traka — privremeno isključeno
        <MarqueeBanner />
        */}
        <FaqSection image={preferSiteImage("home/faq", FAQ_SECTION_IMAGE)} />
      </main>
      <Footer />
    </HomeLoaderProvider>
  );
}
