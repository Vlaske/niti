import type { HeroSlide } from "@/types";

/**
 * Hero — room-focused (not a single SKU).
 * Visual rhythm matches the clean badge + uppercase sans headline look;
 * primary CTA still names the room (“Pogledaj Spavaću sobu”).
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    category: "Spavaća soba",
    headline: "Meka harmonija u svakoj",
    brandMark: true,
    productTag: "Premium tekstil — NITI.",
    description:
      "Posteljina, čaršavi i slojevi za miran san — tekstil biran za komfor i nežne tonove.",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85",
    ctaPrimary: {
      label: "Pogledaj Spavaću sobu",
      href: "/shop/spavaca-soba",
    },
    ctaSecondary: { label: "shop", href: "/shop" },
    mediaType: "video",
    mediaSrc: "/videos/bedding-video-hero.mp4",
    poster:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=85",
  },
  {
    id: "2",
    category: "Kupatilo",
    headline: "Svaka nežna linija",
    brandMark: true,
    productTag: "Premium tekstil — NITI.",
    description:
      "Peškiri, bade mantili i tekstil za kupatilo — mekan frotir za svakodnevni ritual.",
    image:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1920&q=85",
    ctaPrimary: { label: "Pogledaj Kupatilo", href: "/shop/kupatilo" },
    ctaSecondary: { label: "shop", href: "/shop" },
  },
  {
    id: "3",
    category: "Kuhinja",
    headline: "Trpeza u dobrom tonu",
    brandMark: true,
    productTag: "Premium tekstil — NITI.",
    description:
      "Stolnjaci, kuhinjske krpe i kecelje — tekstil za trpezu i radni deo kuhinje.",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1920&q=85",
    ctaPrimary: { label: "Pogledaj Kuhinju", href: "/shop/kuhinja" },
    ctaSecondary: { label: "shop", href: "/shop" },
  },
];
